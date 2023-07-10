import transformQueryString from "../utils/transformations";
import { S3 } from "aws-sdk";
import { extractKeyAndBucket, getMimeType } from "../utils/helpers";
import sharp from "sharp";

const s3 = new S3();

export const handler: AWSLambda.CloudFrontRequestHandler = async (event) => {
  const request = event.Records[0].cf.request;
  try {
    if (request.querystring === "") {
      return request;
    }

    const { bucket: Bucket, key: Key } = extractKeyAndBucket(request);

    if (!Bucket || !Key) {
      console.error("No bucket or key");
      return request;
    }

    const params = transformQueryString(request.querystring);

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
      params.background
    ) {
      sharpImage.resize({
        width: params.width,
        height: params.height,
        fit: params.fit,
        position: params.gravity,
        background: params.background,
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

    sharpImage.toFormat(format, { quality: params.quality });

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
