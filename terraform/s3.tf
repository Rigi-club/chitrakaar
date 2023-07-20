data "aws_s3_bucket" "media_bucket" {
  bucket = var.bucket_name
  provider = aws.ap-south-1

  count = var.create_bucket ? 0 : 1
}

resource "aws_s3_bucket" "media_bucket" {
  bucket = var.bucket_name
  acl    = "private"

  versioning {
    enabled = true
  }

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "HEAD"]
    allowed_origins = ["*"]
    max_age_seconds = 86400
  }

  count = var.create_bucket ? 1 : 0
}

resource "aws_s3_bucket_public_access_block" "media_bucket_public_access_block" {
  bucket                  = var.create_bucket ? one(resource.aws_s3_bucket.media_bucket).id : one(data.aws_s3_bucket.media_bucket).id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true

  count = var.create_bucket ? 1 : 0
}

data "aws_iam_policy_document" "s3_oai_read_policy" {
  statement {
    actions   = ["s3:GetObject"]
    resources = [var.create_bucket ? "${one(resource.aws_s3_bucket.media_bucket).arn}/*" :  "${one(data.aws_s3_bucket.media_bucket).arn}/*"]

    principals {
      type        = "AWS"
      identifiers = [aws_cloudfront_origin_access_identity.media_oai.iam_arn]
    }
  }
}

resource "aws_s3_bucket_policy" "s3_oai_asset_bucket_policy" {
  bucket = var.create_bucket ? one(resource.aws_s3_bucket.media_bucket).id : one(data.aws_s3_bucket.media_bucket).id
  policy = data.aws_iam_policy_document.s3_oai_read_policy.json

  count = var.create_bucket ? 1 : 0
}