'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { IconUpload, IconPhoto, IconX } from '@tabler/icons-react';
import Image from 'next/image';

interface StaticSizesUploaderProps {
  onImageUpload: (imageUrl: string) => void;
  uploadedImage: string | null;
}

export function StaticSizesUploader({ onImageUpload, uploadedImage }: StaticSizesUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Convert file to base64 for preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        onImageUpload(base64String);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setIsUploading(false);
    }
  }, [onImageUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    maxFiles: 1,
    disabled: isUploading
  });

  const handleRemoveImage = () => {
    onImageUpload('');
  };

  if (uploadedImage) {
    return (
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Uploaded Image
        </h3>
        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
          <img
            src={uploadedImage}
            alt="Uploaded"
            className="h-full w-full object-contain"
          />
          <button
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
          >
            <IconX className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Upload Base Image
      </h3>
      <div
        {...getRootProps()}
        className={`
          relative rounded-lg border-2 border-dashed p-8 text-center cursor-pointer
          transition-colors duration-200
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }
          ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center">
          {isUploading ? (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                Uploading...
              </p>
            </>
          ) : (
            <>
              <IconUpload className="h-12 w-12 text-gray-400 dark:text-gray-500" />
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                {isDragActive
                  ? 'Drop the image here'
                  : 'Drag & drop an image here, or click to select'}
              </p>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                PNG, JPG, JPEG, WEBP up to 10MB
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}