import transformQueryString from "../utils/transformations";
import { S3 } from "aws-sdk";
import { extractKeyAndBucket, getMimeType } from "../utils/helpers";
import sharp from "sharp";

const s3 = new S3();

const enableSyntacticSugar = process.env.ENABLE_SYNTACTIC_SUGAR === "true";
const withoutEnlargement = process.env.WITHOUT_ENLARGEMENT === "true";

export const handler: AWSLambda.CloudFrontRequestHandler = async (event) => {
  const request = event.Records[0].cf.request;
  try {
    if (request.querystring === "") {
      return request;
    }

    const {
      bucket: Bucket,
      key: Key,
      format: Format,
    } = extractKeyAndBucket(request, enableSyntacticSugar);

    if (!Bucket || !Key) {
      console.error("No bucket or key");
      return request;
    }

    let params = transformQueryString(request.querystring, {
      format: Format,
      fit: "contain",
      background: "#00000000",
    });

    const { Body } = await s3.getObject({ Bucket, Key }).promise();

    const originalImageBuffer = Body as Buffer;

    if (!originalImageBuffer) {
      console.error("No original image buffer");
      return request;
    }

    const sharpImage = sharp(originalImageBuffer);

    const metadata = await sharpImage.metadata();

    if (
      params.width ||
      params.height ||
      params.fit ||
      params.gravity ||
      params.background ||
      params.scale
    ) {
      const scale = params.scale ?? 1;

      const _width = params.width ?? metadata.width;
      const _height = params.height ?? metadata.height;

      sharpImage.resize({
        width: _width ? _width * scale : undefined,
        height: _height ? _height * scale : undefined,
        fit: params.fit,
        position: params.gravity,
        background: params.background,
        withoutEnlargement,
      });
    }

    if (params.blur) {
      sharpImage.blur(params.blur);
    }

    if (params.rotate) {
      sharpImage.rotate(params.rotate);
    }

    if (params.sharpen) {
      sharpImage.sharpen({ sigma: params.sharpen });
    }

    if (params.grayscale) {
      sharpImage.grayscale();
    }

    const format = params.format || metadata.format;

    if (!format) {
      throw new Error("No format in metadata.");
    }

    if (params.format || typeof params.quality !== "undefined") {
      sharpImage.toFormat(format, { quality: params.quality });
    }

    if (process.env.DEV) {
      const ext = params.format || metadata.format;
      await sharpImage.toFile(`temp.${ext}`);

      return;
    }

    const sharpImageBuffer = await sharpImage.toBuffer();

    const responseBody = sharpImageBuffer.toString("base64");

    /**
     * If the image is too large (>1.33 MB) for Lambda@Edge responses, we'll return the original image.
     * Otherwise, we'll return the new image.
     */

    if (1330000 < Buffer.byteLength(responseBody)) {
      return request;
    }

    return {
      status: "200",
      body: responseBody,
      bodyEncoding: "base64",
      headers: {
        "Content-Type": [
          {
            key: "Content-Type",
            value: getMimeType(format),
          },
        ],
      } as any,
    };
  } catch (error: any) {
    console.error(error);
    return {
      status: "400",
      body: error.message,
      bodyEncoding: "text",
      headers: {
        "content-type": [
          {
            key: "Content-Type",
            value: "text/html",
          },
        ],
      },
    };
  }
};
