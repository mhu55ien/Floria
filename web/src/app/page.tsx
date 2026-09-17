import { BlueprintVisualizer } from '@/components/BlueprintVisualizer';

export default function Home() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-5xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-primary mb-3">
            Floria Botanical Blueprint
          </h1>
          <p className="text-secondary max-w-2xl mx-auto">
            Interactive botanical layout visualizer. Select a zone from the palette below and click on the grid slots to map out the environment.
          </p>
        </div>
        
        <BlueprintVisualizer />
      </div>
    </main>
  );
}
