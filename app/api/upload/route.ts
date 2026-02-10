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

        // Determine if it's a signature or photo
        const isSignature = file.name.includes('signature') || formData.get('type') === 'signature';

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(dataURI, {
            folder: isSignature ? 'tiddlee/signatures' : 'tiddlee/child-photos',
            transformation: isSignature
                ? [
                    { width: 800, crop: 'limit' }, // Just limit width, no aggressive cropping
                    { quality: 'auto', fetch_format: 'auto' }
                ]
                : [
                    { width: 400, height: 400, crop: 'fill', gravity: 'face' },
                    { quality: 'auto', fetch_format: 'auto' }
                ]
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
