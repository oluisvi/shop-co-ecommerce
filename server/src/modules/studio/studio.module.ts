import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { StudioController } from './studio.controller.js';
import { StudioService } from './studio.service.js';
import { StudioUploadService } from './studio-upload.service.js';
@Module({ imports: [AuthModule], controllers: [StudioController], providers: [StudioService, StudioUploadService] })
export class StudioModule {}
