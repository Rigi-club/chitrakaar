provider "aws" {
  region = "us-east-1"
}
provider "aws" {
  alias  = "ap-south-1"
  region = "ap-south-1"
}