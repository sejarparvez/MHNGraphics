export interface ImageDimensions {
  width: number;
  height: number;
}

/**
 * The function `getDynamicDimensions` calculates the width and height of an image based on a target
 * height while maintaining the original aspect ratio.
 * @param {number} originalWidth - The `originalWidth` parameter represents the width of the original
 * image in pixels.
 * @param {number} originalHeight - The `originalHeight` parameter represents the original height of an
 * image.
 * @param {number} targetHeight - The `targetHeight` parameter represents the desired height that you
 * want the image to be resized to while maintaining the original aspect ratio.
 * @returns An object containing the calculated width and the target height is being returned.
 */
export function getDynamicDimensions(
  originalWidth: number,
  originalHeight: number,
  targetHeight: number,
): ImageDimensions {
  if (targetHeight > originalHeight) {
    return { width: originalWidth, height: originalHeight };
  }
  const aspectRatio = originalWidth / originalHeight;
  const width = Math.round(targetHeight * aspectRatio);
  return { width, height: targetHeight };
}

/**
 * The function `getTransformedImageUrl` takes an original image URL, width, height, and target height,
 * and returns a transformed image URL with specified dimensions and watermark.
 * @param {string} originalUrl - The `originalUrl` parameter is the URL of the original image that you
 * want to transform.
 * @param {number} originalWidth - The `originalWidth` parameter represents the width of the original
 * image before transformation.
 * @param {number} originalHeight - The `originalHeight` parameter represents the height of the
 * original image before any transformations are applied.
 * @param {number} targetHeight - The `targetHeight` parameter in the `getTransformedImageUrl` function
 * represents the desired height of the transformed image. This parameter is used to calculate the
 * width and height of the image based on the original dimensions and the target height before
 * generating the transformed image URL.
 * @returns The function `getTransformedImageUrl` returns a modified URL for an image with specified
 * dimensions and transformations applied.
 */
export function getTransformedImageUrl(
  originalUrl: string,
  originalWidth: number,
  originalHeight: number,
  targetHeight: number,
): string {
  const { width, height } = getDynamicDimensions(
    originalWidth,
    originalHeight,
    targetHeight,
  );
  return originalUrl.replace(
    '/upload/',
    `/upload/h_${height},w_${width},c_limit,fl_attachment/w_180,o_30,l_watermark,g_center/`,
  );
}
