// components/ImageCropper.tsx
'use client';

import { getCroppedImg } from '@/lib/cropImage';
import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';

export default function ImageCropper() {
  const [image, setImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);

  // Handle local image file selection
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImage(reader.result as string);
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // Cut the image based on coordinates
  const showCroppedImage = async () => {
    try {
      if (image && croppedAreaPixels) {
        const cropped = await getCroppedImg(image, croppedAreaPixels);
        // setCroppedImage(cropped);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6">
      <input type="file" accept="image/*" onChange={onFileChange} className="mb-4" />
      
      {image && (
        <div className="relative w-full h-64 bg-neutral-800">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={4 / 3} // Change to your desired ratio (e.g. 1 for square)
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
          />
        </div>
      )}

      {image && (
        <div className="flex flex-col gap-2 w-full max-w-xs">
          <label>Zoom</label>
          <input
            type="range"
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            aria-labelledby="Zoom"
            onChange={(e) => setZoom(Number(e.target.value))}
          />
          <button 
            onClick={showCroppedImage}
            className="mt-2 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Cut Image
          </button>
        </div>
      )}

      {croppedImage && (
        <div className="mt-4">
          <h3>Result:</h3>
          <img src={croppedImage} alt="Cropped Result" className="max-w-full h-auto rounded border" />
        </div>
      )}
    </div>
  );
}