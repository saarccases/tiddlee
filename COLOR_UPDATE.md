# Color Update - Primary Color Change

## Updated Primary Color
**New Color**: `#37b24a` (Green)
**Previous Color**: `#A4C615` (Lime Green)

## Changes Made

### 1. Tailwind Configuration (`tailwind.config.ts`)
- Updated primary color definition to `#37b24a`

### 2. Landing Page (`app/page.tsx`)
- Updated hardcoded RGBA value in doodle background pattern
- Changed from `rgba(19, 236, 91, 0.05)` to `rgba(55, 178, 74, 0.05)`

## Color Usage Throughout Application

The primary color (`#37b24a`) is now used via the `bg-primary`, `text-primary`, `border-primary` Tailwind classes throughout the application.

### Hover States
Several components use `hover:bg-lime-600` for hover effects. These can be updated to a darker shade of the new primary color if needed:
- Suggested hover color: `#2d9a3d` (darker shade of #37b24a)

### Files with Hover States
- `app/admission-form/page.tsx`
- `app/components/home/Header.tsx`
- `app/parent-info/page.tsx`
- `app/immunization-records/page.tsx`
- `app/child-health/page.tsx`
- `app/care-routines/page.tsx`
- `app/admin/*` pages

## Recommendation
For a more polished look, consider adding a custom hover color to `tailwind.config.ts`:

```typescript
colors: {
    primary: "#37b24a",
    "primary-dark": "#2d9a3d", // For hover states
    secondary: "#f9ed32",
    // ... rest of colors
}
```

Then replace `hover:bg-lime-600` with `hover:bg-primary-dark` throughout the application.

## Current Status
✅ Primary color updated in Tailwind config
✅ Hardcoded color values updated in landing page
⚠️ Hover states still using `lime-600` (functional but not perfectly matched)
