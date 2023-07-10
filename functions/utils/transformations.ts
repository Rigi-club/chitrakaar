import qs from "query-string";
import { FormatEnum, FitEnum, GravityEnum } from "sharp";

export type Format = keyof FormatEnum;
type Fit = keyof FitEnum;
type Gravity = keyof GravityEnum;

const castAndValidateInt = (value: string, errorPrefix: string): number => {
  const integer = parseInt(value, 10);

  if (!Number.isSafeInteger(integer) || Number(value) !== integer) {
    throw new Error(`${errorPrefix} must be an integer`);
  }

  return integer;
};

const validateBoolean = (value: string, errorPrefix: string): boolean => {
  if (value === "true" || value === "1") {
    return true;
  } else if (value === "false" || value === "0") {
    return false;
  } else throw new Error(`${errorPrefix} must be true or false`);
};

const oneOf = (
  value: string,
  options: string[],
  errorPrefix: string
): string => {
  if (!options.includes(value)) {
    throw new Error(`${errorPrefix} must be one of ${options.join(", ")}`);
  }

  return value;
};

type Transformations = {
  background?: string;
  blur?: number;
  fit?: Fit;
  format?: Format;
  gravity?: Gravity;
  grayscale?: boolean;
  height?: number;
  quality?: number;
  rotate?: number;
  sharpen?: number;
  width?: number;
};

type QueryParams = {
  [K in keyof Transformations]: string;
};

const validateParams = (params: QueryParams) => {
  const _params: Transformations = {};

  if (params.background) {
    _params.background = params.background;
  }

  if (params.blur) {
    _params.blur = castAndValidateInt(params.blur, "blur");
  }

  if (params.fit) {
    _params.fit = oneOf(
      params.fit,
      ["contain", "cover", "fill", "inside", "outside"] as Fit[],
      "Fit"
    ) as Fit;
  }

  if (params.format) {
    _params.format = oneOf(
      params.format,
      [
        "avif",
        "dz",
        "fits",
        "gif",
        "heif",
        "input",
        "jp2",
        "jpeg",
        "jpg",
        "jxl",
        "magick",
        "openslide",
        "pdf",
        "png",
        "ppm",
        "raw",
        "svg",
        "tif",
        "tiff",
        "v",
        "webp",
      ] as Format[],
      "Format"
    ) as Format;
  }

  if (params.grayscale) {
    _params.grayscale = validateBoolean(params.grayscale, "grayscale");
  }

  if (params.gravity) {
    _params.gravity = oneOf(
      params.gravity,
      [
        "center",
        "centre",
        "east",
        "north",
        "northeast",
        "northwest",
        "south",
        "southeast",
        "southwest",
        "west",
      ] as Gravity[],
      "Gravity"
    ) as Gravity;
  }

  if (params.height) {
    _params.height = castAndValidateInt(params.height, "height");
  }

  if (params.quality) {
    _params.quality = castAndValidateInt(params.quality, "quality");
  }

  if (params.rotate) {
    _params.rotate = castAndValidateInt(params.rotate, "rotate");
  }

  if (params.sharpen) {
    _params.sharpen = castAndValidateInt(params.sharpen, "sharpen");
  }

  if (params.width) {
    _params.width = castAndValidateInt(params.width, "width");
  }

  return _params;
};

export const transformQueryString = (querystring: string): Transformations => {
  const params = qs.parse(querystring);
  return validateParams(params);
};

export default transformQueryString;
