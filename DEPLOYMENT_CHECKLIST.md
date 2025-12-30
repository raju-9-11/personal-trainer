# Deployment Checklist for Vite Migration

## ✅ Completed

- [x] Installed Vite and React Router
- [x] Created Vite configuration files
- [x] Migrated pages to SPA structure
- [x] Updated Firebase initialization for Vite
- [x] Updated build scripts in package.json
- [x] Updated CI/CD workflow
- [x] Updated .env.local with VITE_ prefix
- [x] Tested build successfully
- [x] Created migration documentation

## 🔄 Next Steps (Action Required)

### 1. Update GitHub Secrets
Go to GitHub repository → Settings → Secrets and update:

```
NEXT_PUBLIC_FIREBASE_API_KEY → VITE_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN → VITE_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID → VITE_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET → VITE_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID → VITE_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID → VITE_FIREBASE_APP_ID
```

**Note**: The CI/CD workflow has been updated to use the new variable names.

### 2. Test Locally

```bash
# Start dev server
npm run dev

# Open http://localhost:5173
# Verify:
# - Homepage loads
# - Trainer pages load via /trainer?slug=trainer-name
# - Firebase data loads correctly
# - No console errors
```

### 3. Build and Preview

```bash
# Build production version
npm run build

# Preview production build locally
npm run preview

# Verify same functionality as dev server
```

### 4. Deploy to Firebase

```bash
# Deploy to Firebase Hosting
firebase deploy --only hosting

# Or let GitHub Actions handle it:
git add .
git commit -m "Migrate to Vite SPA with working Firebase from main"
git push origin feature/firebase-static-hosting-8258233763790025156
```

### 5. Merge to Main (After Testing)

Once you've verified everything works:

```bash
# Switch to main and merge
git checkout main
git merge feature/firebase-static-hosting-8258233763790025156
git push origin main
```

## 🧪 Testing Checklist

Test these features after deployment:

- [ ] Homepage loads and displays trainers from Firebase
- [ ] Clicking a trainer navigates to their page
- [ ] Trainer page loads all sections (hero, about, classes, etc.)
- [ ] Firebase Authentication works (admin login)
- [ ] Admin dashboard accessible for authenticated users
- [ ] Images load correctly
- [ ] Tailwind styles render properly
- [ ] Mobile responsive design works
- [ ] No 404 errors on refresh (SPA routing works)

## 📊 Performance Improvements

Expected improvements with Vite:

- **Dev Server**: Instant HMR (vs 1-2s with Next.js)
- **Build Time**: ~3-4s (vs 10-15s with Next.js)
- **Bundle Size**: Similar or smaller with better tree-shaking
- **Load Time**: Faster initial load with optimized chunks

## 🔧 Troubleshooting

### If Firebase doesn't connect:
1. Check .env.local has correct VITE_* variables
2. Verify Firebase config in browser console
3. Check Firestore rules allow read access

### If routing doesn't work:
1. Verify firebase.json has SPA rewrite rule
2. Check React Router setup in App.tsx
3. Ensure all links use React Router's Link or navigate

### If build fails:
1. Run `npm run build` and check error messages
2. Verify all imports use correct paths
3. Check TypeScript errors with `tsc --noEmit`

## 📚 Documentation

- `MIGRATION.md` - Detailed migration guide
- `SUMMARY.md` - Quick summary of changes
- `DEPLOYMENT_CHECKLIST.md` - This file

## 🎉 Success Criteria

Migration is complete when:
- ✅ Build completes without errors
- ✅ Dev server runs without warnings
- ✅ Firebase data loads correctly
- ✅ All pages are accessible
- ✅ UI matches main branch design
- ✅ CI/CD deploys successfully
