'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { TrainerPageContent } from './content';

export default function TrainerPage() {
  const searchParams = useSearchParams();
  const slug = useMemo(() => searchParams.get('slug')?.trim(), [searchParams]);

  if (!slug) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background text-foreground px-4 text-center">
        <div className="space-y-4 max-w-xl">
          <h1 className="text-3xl font-semibold">Trainer Not Selected</h1>
          <p className="text-muted-foreground">
            Please open this page using a trainer link (e.g. <code>/trainer?slug=my-trainer</code>) so we can load the correct profile.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <TrainerPageContent slug={slug} />
    </main>
  );
}
