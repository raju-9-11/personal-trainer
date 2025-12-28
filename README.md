# Titan Fitness - Next.js Trainer Portfolio

A high-performance, energetic portfolio web application for personal trainers and gyms.

## Features

*   **Modern Design:** Built with Next.js, Tailwind CSS, and Shadcn UI.
*   **Dynamic Content:** Manage classes, profile, and certifications via an Admin Panel.
*   **Mock/Live Data Modes:**
    *   **Mock Mode (Default):** Uses local storage to simulate a database. Great for demos and development.
    *   **Firebase Mode:** Ready to connect to Google Firebase for real-time production data.
*   **Admin Panel:** Secure (mock) login to manage content.

## Getting Started

1.  Install dependencies:
    ```bash
    npm install
    ```

2.  Run the development server:
    ```bash
    npm run dev
    ```

3.  Open [http://localhost:3000](http://localhost:3000) with your browser.

## Admin Access

To access the admin panel:
1.  Go to `/admin/login`.
2.  Password: `admin123`.

## Switching to Firebase (Production)

To enable real-time data persistence:

1.  Create a project on [Firebase Console](https://console.firebase.google.com/).
2.  Enable **Firestore Database** and **Authentication**.
3.  Copy your Firebase configuration keys.
4.  Create a `.env.local` file in the root directory:

    ```env
    NEXT_PUBLIC_USE_FIREBASE=true
    NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
    ```

5.  Update `src/lib/services/firebase-service.ts` to initialize the Firebase app using these environment variables.

## Tech Stack

*   **Framework:** Next.js 14 (App Router)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS, Framer Motion
*   **UI Components:** Shadcn UI
*   **Icons:** Lucide React
