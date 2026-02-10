# 🚀 Quick Start: Parent Photo Uploads

## ✅ What's Done

✓ Mother photo upload added to Parent Info page
✓ Father photo upload added to Guardian Info page
✓ Database schema updated (schema.sql)
✓ PhotoUpload component integrated
✓ Cloudinary configuration ready

## 🔧 What You Need to Do

### 1. Update Database (REQUIRED)

Run this SQL script on your database:

```bash
# File location: scripts/add_parent_photos.sql
```

Or manually run:
```sql
ALTER TABLE admissions ADD COLUMN mother_photo VARCHAR(500);
ALTER TABLE admissions ADD COLUMN father_photo VARCHAR(500);
```

### 2. Refresh Browser

```
Press: Ctrl + Shift + R
```

### 3. Test It!

**Mother Photo:**
- Go to: http://localhost:3000
- Navigate to: Parent Info page (Section 2)
- Look for: Upload box on the right side
- Click and upload a photo

**Father Photo:**
- Continue to: Guardian Info page (Section 3)
- Scroll to: Bottom of form
- Look for: "Father's Photo:" label
- Click and upload a photo

## 📍 Where to Find Uploads

| Photo | Page | Location |
|-------|------|----------|
| Child | Home (Section 1) | Right side, next to address |
| Mother | Parent Info (Section 2) | Right side, next to avatars |
| Father | Guardian Info (Section 3) | Bottom of form |

## 🎯 Expected Behavior

1. **Click upload box** → File picker opens
2. **Select image** → Preview appears immediately
3. **Wait 1-2 seconds** → Upload completes
4. **Photo stays visible** → URL saved to state
5. **Submit form** → URL saved to database

## 🐛 Quick Fixes

**Upload box not showing?**
→ Hard refresh: Ctrl + Shift + R

**Upload fails?**
→ Check .env.local has Cloudinary credentials

**Photo doesn't save?**
→ Run database migration (Step 1 above)

## 📊 Database Fields

```
admissions table:
├── child_photo (VARCHAR 500)  ← Already exists
├── mother_photo (VARCHAR 500) ← NEW
└── father_photo (VARCHAR 500) ← NEW
```

## ✨ Features

✓ Click to upload
✓ Image preview
✓ File validation (images only, max 5MB)
✓ Loading indicator
✓ Error messages
✓ Automatic optimization (WebP, 400x400)
✓ Face-centered cropping
✓ CDN delivery (ultra-fast)

## 📝 Files Changed

```
scripts/schema.sql              ← Database schema
scripts/add_parent_photos.sql   ← Migration script
app/parent-info/page.tsx        ← Mother photo upload
app/guardian-info/page.tsx      ← Father photo upload
```

## 🚀 Ready to Deploy?

1. Update production database (run migration)
2. Commit and push changes
3. Verify Cloudinary env vars in Vercel
4. Deploy!

---

**Need detailed help?** See: `PARENT_PHOTOS_IMPLEMENTATION.md`
