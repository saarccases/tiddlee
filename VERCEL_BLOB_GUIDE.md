# Alternative Solution: Vercel Blob Storage

## Why Vercel Blob?
- ✅ Native Vercel integration
- ✅ Simple API
- ✅ Fast CDN delivery
- ⚠️ **Paid only** - $0.15/GB storage + $0.30/GB bandwidth

## Setup Steps:

1. Install package:
```bash
npm install @vercel/blob
```

2. Enable Blob storage in Vercel dashboard

3. Create upload API route `app/api/upload-blob/route.ts`:
```typescript
import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');

  if (!filename || !request.body) {
    return NextResponse.json({ error: 'Missing filename or file' }, { status: 400 });
  }

  const blob = await put(filename, request.body, {
    access: 'public',
  });

  return NextResponse.json(blob);
}
```

4. Use in your component:
```typescript
const handleUpload = async (file: File) => {
  const response = await fetch(
    `/api/upload-blob?filename=${file.name}`,
    {
      method: 'POST',
      body: file,
    }
  );

  const blob = await response.json();
  console.log(blob.url); // Save this URL to database
};
```

## Pricing:
- Storage: $0.15/GB/month
- Bandwidth: $0.30/GB
- Example: 1000 photos (500MB) + 10GB traffic = ~$3.50/month
