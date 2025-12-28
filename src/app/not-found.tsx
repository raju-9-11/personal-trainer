'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const SAFE_PATH_PREFIXES = ['admin', '_next', 'trainer', '404', 'favicon.ico', 'assets'];

export default function NotFound() {
  const [slug, setSlug] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const path = window.location.pathname.replace(/^\/+|\/+$/g, '');
    if (!path || SAFE_PATH_PREFIXES.some((prefix) => path.startsWith(prefix))) {
      return;
    }

    setSlug(path);
    const destination = `/trainer?slug=${encodeURIComponent(path)}`;
    window.location.replace(destination);
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-4 text-center">
      <div className="space-y-6 max-w-2xl">
        <p className="text-sm text-muted-foreground tracking-widest uppercase">404 – Page Not Found</p>
        <h1 className="text-4xl font-bold">We could not find that page.</h1>
        {slug ? (
          <p className="text-muted-foreground">
            Redirecting you to{' '}
            <strong className="text-foreground">/trainer?slug={slug}</strong>…
          </p>
        ) : (
          <p className="text-muted-foreground">
            Go back to the{' '}
            <Link href="/" className="text-primary underline">
              home page
            </Link>{' '}
            or select a trainer from the platform.
          </p>
        )}
      </div>
    </main>
  );
}
