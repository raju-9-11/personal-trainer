import { Navbar } from '@/components/layout/navbar';
import { Hero } from '@/components/sections/hero';
import { About } from '@/components/sections/about';
import { Transformations } from '@/components/sections/transformations';
import { Classes } from '@/components/sections/classes';
import { SocialFeed } from '@/components/sections/social-feed';
import { Contact } from '@/components/sections/contact';
import { Metadata } from 'next';
import { FirebaseDataService } from '@/lib/services/firebase-service';
import { MockDataService } from '@/lib/services/mock-service';

type Props = {
  params: { slug: string }; // Changed Promise<{ slug: string }> to { slug: string } as generateStaticParams makes it synchronous
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateStaticParams() {
  const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';
  const service = useMock ? new MockDataService() : new FirebaseDataService();
  const trainers = await service.getTrainers();

  return trainers.map(trainer => ({
    slug: trainer.slug,
  }));
}

export async function generateMetadata(
  { params, searchParams }: Props
): Promise<Metadata> {
  const slug = params.slug;
  return {
    title: `Titan Fitness | ${slug}`,
  };
}

export default async function TrainerPage({ params }: Props) {
  const { slug } = params;

  return (
    <main className="min-h-screen">
      {/*
        We pass the slug down to components via a Context or Prop drilling.
        Currently the components (Hero, etc.) use `useData()`.
        We need to ensure `useData` calls in these components know WHICH slug to fetch.

        Refactoring approach:
        1. Either we refactor all components to accept `slug` as a prop.
        2. Or we wrap this page in a "TrainerContext" that `useData` reads from?
           But `useData` is just a service wrapper.

        The cleanest way for existing components is to wrap them in a Context Provider that holds the current view slug.
        Let's create a Client Component wrapper that sets a "ViewContext".
      */}
      <TrainerPageContent slug={slug} />
    </main>
  );
}

import { TrainerPageContent } from './content';
