'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface PhotoUploadProps {
    onPhotoUploaded: (url: string) => void;
    currentPhotoUrl?: string;
}

export default function PhotoUpload({ onPhotoUploaded, currentPhotoUrl }: PhotoUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(currentPhotoUrl || null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Update preview when currentPhotoUrl changes (e.g., when data is loaded from database)
    useEffect(() => {
        if (currentPhotoUrl) {
            setPreview(currentPhotoUrl);
        }
    }, [currentPhotoUrl]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('Image must be less than 5MB');
            return;
        }

        setError(null);
        setUploading(true);

        try {
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);

            // Upload to Cloudinary
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                onPhotoUploaded(data.url);
            } else {
                setError('Upload failed. Please try again.');
                setPreview(null);
            }
        } catch (err) {
            console.error('Upload error:', err);
            setError('Upload failed. Please try again.');
            setPreview(null);
        } finally {
            setUploading(false);
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="photo-upload-container">
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="photo-upload"
            />

            <div
                onClick={handleClick}
                className="relative w-40 h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500 transition-colors flex items-center justify-center overflow-hidden bg-gray-50"
            >
                {preview ? (
                    <div className="relative w-full h-full">
                        <Image
                            src={preview}
                            alt="Child photo preview"
                            fill
                            className="object-cover"
                        />
                        {uploading && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center p-4">
                        <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 48 48"
                        >
                            <path
                                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                        <p className="mt-2 text-sm text-gray-600">
                            {uploading ? 'Uploading...' : 'Click to upload photo'}
                        </p>
                    </div>
                )}
            </div>

            {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
            )}

            <p className="mt-1 text-xs text-gray-500">
                PNG, JPG, GIF up to 5MB
            </p>
        </div>
    );
}
