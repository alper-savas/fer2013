import prisma from '@fer-app/db/prisma';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

// Validate environment variables
const requiredEnvVars = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_S3_BUCKET', 'AWS_REGION'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing environment variable: ${envVar}`);
  }
}

const s3Client = new S3Client({
  region: 'eu-north-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true
});

async function seedImages() {
  try {
    const labels = ['HAPPY', 'SAD', 'ANGRY', 'DISGUST', 'FEAR', 'NEUTRAL', 'SURPRISE'] as const;
    for (const label of labels) {
      console.log(`Listing objects for label: ${label.toLowerCase()}`);
      const command = new ListObjectsV2Command({
        Bucket: process.env.AWS_S3_BUCKET,
        Prefix: `fer2013/${label.toLowerCase()}/`,
      });
      const { Contents } = await s3Client.send(command);
      if (Contents) {
        console.log(`Found ${Contents.length} images for ${label}`);
        for (const obj of Contents) {
          if (obj.Key) {
            const url = process.env.AWS_S3_ENDPOINT
              ? `${process.env.AWS_S3_ENDPOINT}/${process.env.AWS_S3_BUCKET}/${obj.Key}`
              : `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${obj.Key}`;
            await prisma.image.upsert({
              where: { url },
              update: {},
              create: { url, label },
            });
            console.log(`Seeded: ${url} (${label})`);
          }
        }
      } else {
        console.log(`No images found for ${label}`);
      }
    }
    console.log('Image metadata seeded successfully');
  } catch (error) {
    console.error('Error seeding images:', error);
    throw error;
  }
}

