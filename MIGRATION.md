# Migration to Vite + SPA

## Overview
This project has been migrated from Next.js (SSR) to Vite (SPA) while preserving the working Firebase implementation from the main branch.

## Key Changes

### Build System
- **From**: Next.js 16.1.1 with SSR/SSG
- **To**: Vite 7.3.0 with React SPA

### Routing
- **From**: Next.js App Router (`app/` directory)
- **To**: React Router v7 with browser routing

### Environment Variables
- **From**: `NEXT_PUBLIC_*` prefix
- **To**: `VITE_*` prefix

Required environment variables:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

### Project Structure

```
src/
├── main.tsx           # Vite entry point
├── App.tsx            # Main app with routing
├── pages/             # Page components
│   ├── HomePage.tsx
│   ├── TrainerPage.tsx
│   └── AdminPage.tsx
├── components/        # Reusable components (preserved from main)
│   ├── TrainerPageContent.tsx
│   ├── TrainerContext.tsx
│   └── ui/
├── lib/               # Firebase & data layer (preserved from main)
│   ├── firebase.ts    # Updated for Vite env vars
│   ├── auth-context.tsx
│   ├── data-provider.tsx
│   └── services/
└── app/
    └── globals.css    # Global styles (preserved)
```

### Scripts

```json
{
  "dev": "vite",              // Development server
  "build": "tsc && vite build", // Production build
  "preview": "vite preview"    // Preview production build
}
```

### Firebase Hosting

The `firebase.json` configuration has been updated to support SPA routing:

```json
{
  "hosting": {
    "public": "out",
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

### CI/CD

The GitHub Actions workflow (`.github/workflows/deploy.yml`) has been updated to:
1. Use Vite environment variables (VITE_* instead of NEXT_PUBLIC_*)
2. Run `npm run build` which executes the Vite build
3. Remove the `FIREBASE_CLI_EXPERIMENTS: webframeworks` flag (no longer needed)

## Benefits

1. **Faster Development**: Vite's HMR is significantly faster than Next.js
2. **Smaller Bundle Size**: More efficient tree-shaking and code splitting
3. **Simpler Architecture**: Pure SPA eliminates SSR complexity
4. **Firebase Compatibility**: Preserves working Firebase implementation from main branch
5. **Better Performance**: Optimized build output with minimal overhead

## Migration Notes

- All Firebase functionality from the main branch has been preserved
- UI components and sections remain unchanged
- Authentication and data layer work identically
- Admin dashboard structure is preserved (though not fully implemented in this initial migration)

## Next Steps

1. Test the application locally with `npm run dev`
2. Verify Firebase integration with your credentials
3. Deploy to Firebase Hosting with `npm run build && firebase deploy`
4. Update GitHub secrets to use `VITE_*` prefixed variables
