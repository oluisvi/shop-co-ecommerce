import sharp from 'sharp';
import { processStudioImage } from './studio-image.js';

describe('Seller Studio image processing', () => {
  it('normalizes a real image to stripped WebP within storefront dimensions', async () => {
    const input = await sharp({ create: { width: 3200, height: 2400, channels: 3, background: '#ccc' } }).jpeg().toBuffer();
    const result = await processStudioImage(input, 'image/jpeg');
    const metadata = await sharp(result.body).metadata();
    expect(result.contentType).toBe('image/webp');
    expect(metadata.width).toBeLessThanOrEqual(2400);
    expect(metadata.height).toBeLessThanOrEqual(2400);
    expect(metadata.format).toBe('webp');
  });

  it('rejects SVG, renamed executables, excessive bytes, and extreme dimensions', async () => {
    await expect(processStudioImage(Buffer.from('<svg><script>alert(1)</script></svg>'), 'image/svg+xml')).rejects.toThrow('UNSUPPORTED_IMAGE');
    await expect(processStudioImage(Buffer.from('MZ executable'), 'image/jpeg')).rejects.toThrow('INVALID_IMAGE');
    await expect(processStudioImage(Buffer.alloc(8 * 1024 * 1024 + 1), 'image/png')).rejects.toThrow('IMAGE_TOO_LARGE');
    const wide = await sharp({ create: { width: 12001, height: 1, channels: 3, background: '#fff' } }).png().toBuffer();
    await expect(processStudioImage(wide, 'image/png')).rejects.toThrow('IMAGE_DIMENSIONS_TOO_LARGE');
  });
});
