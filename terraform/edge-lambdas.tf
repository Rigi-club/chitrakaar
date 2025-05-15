locals {
  lambda_path  = "../functions/dist"
  archive_path = "${path.module}/.terraform/tmp"
  lambda_arn   = data.aws_lambda_function.existing_lambda.function_name != null ? data.aws_lambda_function.existing_lambda.qualified_arn : aws_lambda_function.origin_request_lambda[0].qualified_arn
}

data "archive_file" "origin_request_lambda" {
  type        = "zip"
  output_path = "${local.archive_path}/origin_request_lambda.zip"

  source_dir = "../functions/dist"
}

# Try to get existing IAM role
data "aws_iam_role" "existing_lambda" {
  name = "edge-lambda-chitrakaar-request"
}

# Try to get existing IAM policy
data "aws_iam_policy" "existing_s3_policy" {
  name = "s3-full-access-policy"
}

# Try to get existing Lambda function
data "aws_lambda_function" "existing_lambda" {
  function_name = "chitrakaar"
}

# Create IAM role only if it doesn't exist
resource "aws_iam_role" "lambda" {
  count              = data.aws_iam_role.existing_lambda.name == null ? 1 : 0
  name               = "edge-lambda-chitrakaar-request"
  assume_role_policy = data.aws_iam_policy_document.assume.json
}

resource "aws_iam_role_policy_attachment" "lambda" {
  role       = data.aws_iam_role.existing_lambda.name != null ? data.aws_iam_role.existing_lambda.name : aws_iam_role.lambda[0].name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Create IAM policy only if it doesn't exist
resource "aws_iam_policy" "s3_policy" {
  count  = data.aws_iam_policy.existing_s3_policy.name == null ? 1 : 0
  name   = "s3-full-access-policy"
  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "s3:*",
      "Resource": "*"
    }
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "lambda_s3_policy_attachment" {
  policy_arn = data.aws_iam_policy.existing_s3_policy.name != null ? data.aws_iam_policy.existing_s3_policy.arn : aws_iam_policy.s3_policy[0].arn
  role       = data.aws_iam_role.existing_lambda.name != null ? data.aws_iam_role.existing_lambda.name : aws_iam_role.lambda[0].name
}

data "aws_iam_policy_document" "assume" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type = "Service"

      identifiers = [
        "lambda.amazonaws.com",
        "edgelambda.amazonaws.com",
      ]
    }
  }
}

# Create Lambda function only if it doesn't exist
resource "aws_lambda_function" "origin_request_lambda" {
  count            = data.aws_lambda_function.existing_lambda.function_name == null ? 1 : 0
  filename         = data.archive_file.origin_request_lambda.output_path
  function_name    = "chitrakaar"
  role             = data.aws_iam_role.existing_lambda.name != null ? data.aws_iam_role.existing_lambda.arn : aws_iam_role.lambda[0].arn
  handler          = "origin-request.handler"
  source_code_hash = filebase64sha256(data.archive_file.origin_request_lambda.output_path)
  runtime          = "nodejs18.x"
  publish          = true
  timeout          = 30
  memory_size      = 512
}