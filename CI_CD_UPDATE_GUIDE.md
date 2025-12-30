# CI/CD Configuration Update Guide

## Current Status

✅ **CI/CD workflow has been updated for Vite**
- Changed from `next build` to `npm run build` (Vite)
- Removed `FIREBASE_CLI_EXPERIMENTS: webframeworks` flag
- Uses Vite environment variables

## ⚠️ Important: GitHub Secrets Need Update

The current workflow (`deploy.yml`) is configured to work with **either** old or new secret names:

### Current Workflow (Compatible Mode)
```yaml
# Works with existing NEXT_PUBLIC_* secrets
echo "VITE_FIREBASE_API_KEY=${{ secrets.NEXT_PUBLIC_FIREBASE_API_KEY }}" >> .env.local
```

This will work immediately without changing secrets, but maps old names to new variable names.

### Recommended: Update to New Secret Names

For clarity and future maintenance, update your GitHub secrets:

#### Step 1: Add New Secrets
Go to: **Repository Settings → Secrets and variables → Actions**

Add these new secrets (copy values from existing ones):

| New Secret Name | Copy From Existing |
|----------------|-------------------|
| `VITE_FIREBASE_API_KEY` | `NEXT_PUBLIC_FIREBASE_API_KEY` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` |
| `VITE_FIREBASE_PROJECT_ID` | `NEXT_PUBLIC_FIREBASE_PROJECT_ID` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` |
| `VITE_FIREBASE_APP_ID` | `NEXT_PUBLIC_FIREBASE_APP_ID` |

#### Step 2: Update Workflow File

Replace `.github/workflows/deploy.yml` with the new version that uses `VITE_*` secrets:

```bash
mv .github/workflows/deploy-updated.yml .github/workflows/deploy.yml
git add .github/workflows/deploy.yml
git commit -m "Update CI/CD to use VITE_* secret names"
git push
```

#### Step 3: Clean Up (Optional)
After confirming the new workflow works, you can delete the old `NEXT_PUBLIC_*` secrets.

## Current Workflow Changes Summary

### What Was Changed
✅ Build command: `next build` → `npm run build` (Vite)
✅ Environment variables output to `.env.local`
✅ Removed Next.js framework experiments flag
✅ Firebase deployment action remains the same

### What Works Now
✅ Automatic deployment on push to `main` branch
✅ Vite build with TypeScript compilation
✅ Environment variables injected from secrets
✅ Firebase Hosting deployment

## Testing CI/CD

After updating secrets, test the workflow:

1. Make a small change (e.g., update README)
2. Commit and push to `main` branch
3. Go to: **Actions** tab in GitHub
4. Watch the workflow run
5. Verify deployment succeeds

## Quick Reference

### Current Working Setup (No Changes Needed)
```yaml
# Uses existing NEXT_PUBLIC_* secrets
# Maps to VITE_* variables automatically
```

### Recommended Updated Setup
```yaml
# Uses new VITE_* secrets directly
# Cleaner and more maintainable
```

Both will work! The current setup is backward compatible.

## Files Involved

- `.github/workflows/deploy.yml` - Current workflow (compatible mode)
- `.github/workflows/deploy-updated.yml` - Updated workflow (new secret names)
- `CI_CD_UPDATE_GUIDE.md` - This guide

## Support

If workflow fails:
1. Check GitHub Actions logs
2. Verify all secrets are set
3. Ensure `FIREBASE_SERVICE_ACCOUNT` secret exists
4. Check build succeeds locally with `npm run build`
