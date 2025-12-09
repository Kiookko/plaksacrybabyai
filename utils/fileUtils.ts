import { FileAttachment } from "../types";

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export const processFile = async (file: File): Promise<FileAttachment> => {
  const base64 = await fileToBase64(file);
  return {
    name: file.name,
    mimeType: file.type,
    data: base64
  };
};