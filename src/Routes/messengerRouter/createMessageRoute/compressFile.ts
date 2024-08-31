import sharp from "sharp";

export const compressFile = async (buffer: Buffer, contentType: string) => {
  let image = sharp(buffer);
  const meta = await image.metadata();

  if (["image/jpeg", "image/jpg", "image/png"].includes(contentType)) {
    image = image.jpeg({ quality: 70 });
  } else if (contentType === "image/webp") {
    image = image.webp({ quality: 70 });
  }

  let width = 720;
  let height = 480;
  if (meta.width && meta.height) {
    width = meta.width;
    height = meta.height;
  }

  let resizeOptions = {};
  const MAX_WIDTH = width > 720 ? 720 : width;
  const MAX_HEIGHT = height > 480 ? 480 : height;

  if (meta.width && meta.height) {
    const aspectRatio = meta.width / meta.height;
    if (aspectRatio > 1) {
      // Horizontal image
      resizeOptions = {
        width: MAX_WIDTH,
        fit: sharp.fit.inside,
        withoutEnlargement: true,
      };
    } else {
      // Vertical image
      resizeOptions = {
        height: MAX_HEIGHT,
        fit: sharp.fit.inside,
        withoutEnlargement: true,
      };
    }
  }

  image = image.resize(resizeOptions);

  const compressedBuffer = await image.toBuffer();
  return compressedBuffer;
};
