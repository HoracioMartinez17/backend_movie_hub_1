import { v2 as cloudinary } from 'cloudinary';
import config from '../config/config';


cloudinary.config({
    cloud_name: config.cloudinary.cloud_name,
    api_key: config.cloudinary.api_key,
    api_secret: config.cloudinary.api_secret,
    secure: true
});


export async function uploadImage(filePath: string) {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: 'movieImage'
      });

      return result;
    } catch (error) {
      console.error('Error uploading image to Cloudinary:', error);
      throw error;
    }
  }
  

