import { randomUUID } from 'node:crypto';
import { BadRequestException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getEnv } from '../../config/env.js';
import { processStudioImage } from './studio-image.js';

@Injectable()
export class StudioUploadService {
  private readonly client: SupabaseClient | null;
  private readonly bucket: string;
  constructor() {
    const env = getEnv();
    this.bucket = env.SUPABASE_STORAGE_BUCKET;
    this.client = env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY
      ? createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } })
      : null;
  }

  async upload(file?: Express.Multer.File) {
    if (!this.client) throw new ServiceUnavailableException('Image storage is not configured');
    if (!file) throw new BadRequestException('Image file is required');
    let image: Awaited<ReturnType<typeof processStudioImage>>;
    try { image = await processStudioImage(file.buffer, file.mimetype); }
    catch (error) { throw new BadRequestException(error instanceof Error ? error.message : 'INVALID_IMAGE'); }
    const now = new Date();
    const objectPath = `${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, '0')}/${randomUUID()}.${image.extension}`;
    const { error } = await this.client.storage.from(this.bucket).upload(objectPath, image.body, {
      contentType: image.contentType, cacheControl: '31536000', upsert: false,
    });
    if (error) throw new ServiceUnavailableException('Image upload failed');
    const { data } = this.client.storage.from(this.bucket).getPublicUrl(objectPath);
    return { url: data.publicUrl, objectPath };
  }
}
