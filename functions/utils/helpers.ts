import { CloudFrontRequest } from "aws-lambda";
import { Format } from "./transformations";

function extractKeyAndBucket(
  data: CloudFrontRequest,
  enableSyntacticSugar: boolean
) {
  const { uri, origin } = data;

  const bucket = origin?.s3?.domainName.split(".")[0];
  let key = uri.replace(/^\/\+/, " ").replace(/^\//, "");

  // decode uri key
  key = decodeURIComponent(key);

  if (enableSyntacticSugar) {
    const { format, keyName } = getPossibleExtensionFromKey(key);

    return {
      key: keyName,
      bucket,
      format,
    };
  }

  return { key, bucket };
}

const getPossibleExtensionFromKey = (key: string) => {
  const splitKey = key.split(".");
  const format = splitKey.length > 1 ? splitKey.pop() : undefined;
  const keyName = splitKey.join(".");
  return { format, keyName };
};

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
