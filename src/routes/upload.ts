import express, { Request, Response } from 'express'
import S3 from 'aws-sdk/clients/s3'

const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION,
  signatureVersion: 'v4',
})

const router = express.Router()

router.get('/profile-image-url/:filename', async (req: Request, res: Response) => {
  const { filename } = req.params
  const url = await s3.getSignedUrlPromise('putObject', {
    Bucket: 'goochoori',
    Key: `profile-images/${filename}`,
    Expires: 15,
  })
  return res.json({ url })
})

export default router
