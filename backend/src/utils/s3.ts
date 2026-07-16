import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
  },
  forcePathStyle: true, // Required for self-hosted S3 like Garage
});

export const uploadToGarage = async (file: Express.Multer.File): Promise<string> => {
  const fileKey = `avatars/${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
  const bucket = process.env.S3_BUCKET_NAME || 'poin-anak-avatars';

  await s3Client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
    })
  );

  const endpoint = process.env.S3_ENDPOINT?.replace(/\/$/, '') || '';
  return `${endpoint}/${bucket}/${fileKey}`;
};

export default s3Client;
