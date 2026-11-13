// Shrinks a photo to max 1600px and converts it to WebP, in the browser.
export async function prepareImage(file: File, slug: string, maxSize = 1600) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    throw new Error('Please choose a JPG, PNG or WebP image.');
  }
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('This image is bigger than 10 MB. Please choose a smaller one.');
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not convert the image.'))), 'image/webp', 0.82),
  );

  return {
    blob,
    url: URL.createObjectURL(blob), // preview only
    fileName: `${slug || 'product'}.webp`,
    width,
    height,
  };
}