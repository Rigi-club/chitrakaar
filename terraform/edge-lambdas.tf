locals {
  lambda_path  = "../functions/dist"
  archive_path = "${path.module}/.terraform/tmp"
}

data "archive_file" "origin_request_lambda" {
  type        = "zip"
  output_path = "${local.archive_path}/origin_request_lambda.zip"

  source_dir = "../functions/dist"
}

resource "aws_iam_role" "lambda" {
  name               = "edge-lambda-chitrakaar-request"
  assume_role_policy = data.aws_iam_policy_document.assume.json
}

resource "aws_iam_role_policy_attachment" "lambda" {
  role       = aws_iam_role.lambda.id
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_policy" "s3_policy" {
  name = "s3-full-access-policy"

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
  policy_arn = aws_iam_policy.s3_policy.arn
  role       = aws_iam_role.lambda.id
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

resource "aws_lambda_function" "origin_request_lambda" {
  filename         = data.archive_file.origin_request_lambda.output_path
  function_name    = "chitrakaar"
  role             = aws_iam_role.lambda.arn
  handler          = "origin-request.handler"
  source_code_hash = filebase64sha256(data.archive_file.origin_request_lambda.output_path)
  runtime          = "nodejs14.x"
  publish          = true
}