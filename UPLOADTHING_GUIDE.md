# Alternative Solution: Uploadthing

## Setup Steps:

1. Install package:
```bash
npm install uploadthing @uploadthing/react
```

2. Sign up at https://uploadthing.com

3. Add to `.env.local`:
```env
UPLOADTHING_SECRET=your_secret
UPLOADTHING_APP_ID=your_app_id
```

4. Create `app/api/uploadthing/core.ts`:
```typescript
import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata);
      console.log("file url", file.url);
      return { uploadedBy: metadata };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
```

5. Create `app/api/uploadthing/route.ts`:
```typescript
import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});
```

6. Use in your component:
```typescript
import { UploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "~/app/api/uploadthing/core";

<UploadButton<OurFileRouter>
  endpoint="imageUploader"
  onClientUploadComplete={(res) => {
    console.log("Files: ", res);
    // Save res[0].url to your database
  }}
  onUploadError={(error: Error) => {
    alert(`ERROR! ${error.message}`);
  }}
/>
```
