import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { extname, join } from 'path';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import sharp from 'sharp';

@Controller('upload')
export class UploadController {
  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      fileFilter: (req, file, cb) => {
        const mime = (file.mimetype || '').toLowerCase();
        const ext = extname(file.originalname).toLowerCase();
        const isAllowedMime = mime.startsWith('image/') || mime === 'application/pdf';
        const isAllowedExt = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.pdf'].includes(ext);

        if (!isAllowedMime && !isAllowedExt) {
          return cb(
            new BadRequestException(
              'Apenas imagens (JPG, PNG, WEBP, GIF) ou documentos PDF são permitidos.',
            ),
            false,
          );
        }
        cb(null, true);
      },
      limits: {
        fileSize: 15 * 1024 * 1024, // 15MB
      },
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado.');
    }

    const uploadDir = './uploads';
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = extname(file.originalname).toLowerCase();
    const isPdf = file.mimetype === 'application/pdf' || ext === '.pdf';

    if (isPdf) {
      const filename = `file-${uniqueSuffix}.pdf`;
      const targetPath = join(uploadDir, filename);
      writeFileSync(targetPath, file.buffer);
      return {
        filename,
        originalName: file.originalname,
        url: `/uploads/${filename}`,
        size: file.size,
      };
    }

    // Se for imagem, converter automaticamente para WebP otimizado
    const filename = `file-${uniqueSuffix}.webp`;
    const targetPath = join(uploadDir, filename);

    try {
      const info = await sharp(file.buffer)
        .webp({ quality: 82, effort: 4 })
        .toFile(targetPath);

      return {
        filename,
        originalName: file.originalname,
        url: `/uploads/${filename}`,
        size: info.size,
      };
    } catch (err) {
      // Fallback de segurança se sharp não puder processar
      const fallbackFilename = `file-${uniqueSuffix}${ext}`;
      const fallbackPath = join(uploadDir, fallbackFilename);
      writeFileSync(fallbackPath, file.buffer);
      return {
        filename: fallbackFilename,
        originalName: file.originalname,
        url: `/uploads/${fallbackFilename}`,
        size: file.size,
      };
    }
  }
}
