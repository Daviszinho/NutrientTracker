import NutrientTracker from '@/components/nutrient-tracker';

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 lg:p-8">
      <NutrientTracker />
    </main>
  );
}
