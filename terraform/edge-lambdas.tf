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
  name               = "edge-lambda-media-origin-request"
  assume_role_policy = data.aws_iam_policy_document.assume.json
}

resource "aws_iam_role_policy_attachment" "lambda" {
  role       = aws_iam_role.lambda.id
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
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
  function_name    = "media-origin-request"
  role             = aws_iam_role.lambda.arn
  handler          = "index.handler"
  source_code_hash = filebase64sha256(data.archive_file.origin_request_lambda.output_path)
  runtime          = "nodejs14.x"
  publish          = true
}