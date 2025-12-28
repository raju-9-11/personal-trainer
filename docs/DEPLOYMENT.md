# Deployment & CI/CD Guide

This guide covers how to deploy the Titan Fitness portfolio and set up Continuous Integration/Continuous Deployment (CI/CD).

## Environment Variables

The application requires specific environment variables to function, especially when using Firebase.

1.  Copy `.env.example` to `.env.local` for local development.
2.  Fill in your Firebase configuration keys.

| Variable | Description |
| :--- | :--- |
| `NEXT_PUBLIC_USE_FIREBASE` | Set to `true` to use Firebase, `false` to use local mock data. |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API Key |
| ... | (See `.env.example` for full list) |

## Deployment to Vercel (Recommended)

The easiest way to deploy this Next.js app is using [Vercel](https://vercel.com).

1.  **Push your code** to a Git repository (GitHub, GitLab, Bitbucket).
2.  **Import the project** into Vercel.
3.  **Configure Environment Variables**:
    *   In the Vercel Project Settings > Environment Variables, add all the keys from your `.env.local`.
4.  **Deploy**: Vercel will automatically build and deploy your application.

### Automatic Deployments

Vercel automatically sets up CI/CD. Every time you push to the `main` branch, Vercel will:
1.  Detect the change.
2.  Run the build command (`npm run build`).
3.  Deploy the new version if the build succeeds.

## GitHub Actions (Optional Custom CI/CD)

If you prefer to manage your own pipeline or deploy to a custom VPS, you can use GitHub Actions.

Create a file `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Use Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18.x'
    - run: npm ci
    - run: npm run build
      env:
        NEXT_PUBLIC_USE_FIREBASE: true
        NEXT_PUBLIC_FIREBASE_API_KEY: ${{ secrets.FIREBASE_API_KEY }}
        # Add other secrets here
```

**Note:** You must add the corresponding secrets in your GitHub Repository Settings > Secrets and Variables > Actions.
