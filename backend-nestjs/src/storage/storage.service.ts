import { Injectable, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const accessKeyId = process.env.S3_ACCESS_KEY_ID || process.env.GARAGE_ACCESS_KEY_ID;
    const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY || process.env.GARAGE_SECRET_ACCESS_KEY;
    const s3Endpoint = process.env.GARAGE_ENDPOINT || process.env.S3_ENDPOINT || '';

    const fileKey = `avatars/${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;

    // If S3 credentials are missing or commented out in .env, return a local fallback avatar URL
    if (!accessKeyId || !secretAccessKey) {
      this.logger.warn(
        'S3/Garage credentials (S3_ACCESS_KEY_ID & S3_SECRET_ACCESS_KEY) not set in .env. Using fallback URL path.',
      );
      return `/uploads/${fileKey}`;
    }

    const s3Client = new S3Client({
      endpoint: s3Endpoint || undefined,
      region: process.env.S3_REGION || 'us-east-1',
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: true,
    });

    const bucket = process.env.S3_BUCKET_NAME || 'poin-anak-avatars';

    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: fileKey,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    const publicUrl = process.env.GARAGE_URL || process.env.S3_PUBLIC_URL || process.env.GARAGE_PUBLIC_URL;
    if (publicUrl) {
      const formattedUrl = publicUrl.replace(/\/$/, '');
      return `${formattedUrl}/${fileKey}`;
    }

    const endpoint = s3Endpoint.replace(/\/$/, '') || '';
    return `${endpoint}/${bucket}/${fileKey}`;
  }
}
