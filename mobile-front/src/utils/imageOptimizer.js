import imageCompression from 'browser-image-compression';

export const optimizeImage = async (file, maxSizeMB = 1) => {
  const options = {
    maxSizeMB,
    maxWidthOrHeight: 1920,
    useWebWorker: true
  };

  try {
    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch (error) {
    console.error('Error compressing image:', error);
    return file;
  }
};