# Titan Fitness - Next.js Trainer Portfolio

A high-performance, energetic portfolio web application for personal trainers and gyms.

## Features

*   **Modern Design:** Built with Next.js, Tailwind CSS, and Shadcn UI.
*   **Dynamic Content:** Manage classes, profile, and certifications via an Admin Panel.
*   **Dual Data Modes:**
    *   **Mock Mode:** Zero-setup development using local storage.
    *   **Firebase Mode:** Production-ready real-time database with auto-seeding.
*   **Admin Panel:** Secure (mock) login to manage content.

## Quick Start

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Setup Environment:**
    ```bash
    cp .env.example .env.local
    ```
    *   Edit `.env.local` to add your Firebase keys (optional for Mock Mode).

    **Example `.env.local`:**
    ```env
    NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBOyAN3J8EoB9Na2K8EjyCYGF6qVg1sFxI
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=personal-trainer-mock.firebaseapp.com
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=personal-trainer-mock
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=personal-trainer-mock.firebasestorage.app
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=286632355028
    NEXT_PUBLIC_FIREBASE_APP_ID=1:286632355028:web:99877fc404366700950741
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-8QKJ11C3NL
    ```

3.  **Run Development Server:**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000).

## Documentation

*   [Deployment & CI/CD Guide](docs/DEPLOYMENT.md) - Learn how to deploy to Vercel and set up environment variables.

## Admin Access

*   URL: `/admin/login`
*   Default Password: `admin123`

## Tech Stack

*   **Framework:** Next.js 14 (App Router)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS, Framer Motion
*   **Database:** Firebase Firestore (or LocalStorage Mock)
*   **UI Components:** Shadcn UI
