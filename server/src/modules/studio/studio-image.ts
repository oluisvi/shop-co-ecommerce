import sharp from 'sharp';

const MAX_BYTES = 8 * 1024 * 1024;
const MAX_SOURCE_DIMENSION = 12_000;
const allowed = new Map([
  ['image/jpeg', 'jpeg'], ['image/png', 'png'], ['image/webp', 'webp'], ['image/avif', 'heif'],
]);

export async function processStudioImage(body: Buffer, reportedMime: string) {
  if (!allowed.has(reportedMime)) throw new Error('UNSUPPORTED_IMAGE');
  if (!body.length || body.length > MAX_BYTES) throw new Error('IMAGE_TOO_LARGE');
  try {
    const pipeline = sharp(body, { failOn: 'error', limitInputPixels: 40_000_000 });
    const metadata = await pipeline.metadata();
    if (!metadata.format || metadata.format !== allowed.get(reportedMime)) throw new Error('INVALID_IMAGE');
    if (!metadata.width || !metadata.height) throw new Error('INVALID_IMAGE');
    if (metadata.width > MAX_SOURCE_DIMENSION || metadata.height > MAX_SOURCE_DIMENSION) {
      throw new Error('IMAGE_DIMENSIONS_TOO_LARGE');
    }
    const normalized = await pipeline.rotate().resize({ width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true }).webp({ quality: 84 }).toBuffer();
    return { body: normalized, contentType: 'image/webp' as const, extension: 'webp' as const };
  } catch (error) {
    if (error instanceof Error && ['INVALID_IMAGE', 'IMAGE_DIMENSIONS_TOO_LARGE'].includes(error.message)) throw error;
    throw new Error('INVALID_IMAGE');
  }
}
