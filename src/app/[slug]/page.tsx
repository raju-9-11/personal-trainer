import { Navbar } from '@/components/layout/navbar';
import { Hero } from '@/components/sections/hero';
import { About } from '@/components/sections/about';
import { Transformations } from '@/components/sections/transformations';
import { Classes } from '@/components/sections/classes';
import { SocialFeed } from '@/components/sections/social-feed';
import { Contact } from '@/components/sections/contact';
import { Metadata } from 'next';
import { FirebaseDataService } from '@/lib/services/firebase-service';
import { TrainerPageContent } from './content';
import { TrainerSummary } from '@/lib/types';

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateStaticParams() {
  // We don't use Mock anymore.
  // We pass null for user as we only need read access for getTrainers.
  let trainers: TrainerSummary[] = [];
  try {
      const service = new FirebaseDataService(null);
      trainers = await service.getTrainers();
  } catch (e) {
      console.warn("Could not fetch trainers for static params (likely missing env vars or empty db)", e);
  }

  return trainers.map(trainer => ({
    slug: trainer.slug,
  }));
}

export async function generateMetadata(
  props: Props
): Promise<Metadata> {
  const params = await props.params;
  const slug = params.slug;
  return {
    title: `Titan Fitness | ${slug}`,
  };
}

export default async function TrainerPage(props: Props) {
  const params = await props.params;
  const { slug } = params;

  return (
    <main className="min-h-screen">
      <TrainerPageContent slug={slug} />
    </main>
  );
}
