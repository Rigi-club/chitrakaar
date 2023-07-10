import { CloudFrontRequest } from "aws-lambda";
import { Format } from "./transformations";

function extractKeyAndBucket(data: CloudFrontRequest) {
  const { uri, origin } = data;

  const bucket = origin?.s3?.domainName.split(".")[0];
  const key = uri.substring(1);

  return { key, bucket };
}

function getMimeType(format: Format) {
  switch (format) {
    case "avif":
      return "image/avif";
    case "dz":
      return "image/dz";
    case "fits":
      return "image/fits";
    case "gif":
      return "image/gif";
    case "heif":
      return "image/heif";
    case "input":
      return "image/input";
    case "jpeg":
      return "image/jpeg";
    case "jpg":
      return "image/jpg";
    case "jp2":
      return "image/jp2";
    case "jxl":
      return "image/jxl";
    case "magick":
      return "image/magick";
    case "openslide":
      return "image/openslide";
    case "pdf":
      return "image/pdf";
    case "png":
      return "image/png";
    case "ppm":
      return "image/ppm";
    case "raw":
      return "image/raw";
    case "svg":
      return "image/svg";
    case "tiff":
      return "image/tiff";
    case "tif":
      return "image/tif";
    case "v":
      return "image/v";
    case "webp":
      return "image/webp";
  }
}

export { extractKeyAndBucket, getMimeType };
