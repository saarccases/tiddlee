import { v2 as cloudinary } from 'cloudinary';
import { NextRequest, NextResponse } from 'next/server';

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Convert file to base64
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64 = buffer.toString('base64');
        const dataURI = `data:${file.type};base64,${base64}`;

        // Get upload type and folder from request
        const uploadType = formData.get('type') as string || 'photo';
        const customFolder = formData.get('folder') as string;

        // Determine folder path
        let folderPath = 'tiddlee/child-photos';
        let transformations: any = [
            { width: 400, height: 400, crop: 'fill', gravity: 'face' },
            { quality: 'auto', fetch_format: 'auto' }
        ];

        if (uploadType === 'signature' || file.name.includes('signature')) {
            folderPath = 'tiddlee/signatures';
            transformations = [
                { width: 800, crop: 'limit' },
                { quality: 'auto', fetch_format: 'auto' }
            ];
        } else if (uploadType === 'document' || customFolder) {
            // Use custom folder for documents (parent Aadhaar, address proof, etc.)
            folderPath = customFolder || 'tiddlee/documents';
            transformations = [
                { width: 1200, crop: 'limit' },
                { quality: 'auto', fetch_format: 'auto' }
            ];
        }

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(dataURI, {
            folder: folderPath,
            transformation: transformations
        });

        return NextResponse.json({
            success: true,
            url: result.secure_url,
            publicId: result.public_id
        });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: 'Upload failed' },
            { status: 500 }
        );
    }
}
