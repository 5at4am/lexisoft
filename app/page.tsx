import DictionarySearch from "@/components/DictionarySearch";

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden mesh-gradient noise">
      <div className="relative z-10 flex flex-col min-h-screen">
        <DictionarySearch />

        <footer className="mt-auto pb-8 w-full text-center">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-border/40 bg-white/40 backdrop-blur-sm text-[10px] tracking-[0.2em] uppercase text-muted/60 pointer-events-none">
            <span className="w-1 h-1 rounded-full bg-accent animate-pulse" />
            LexiSoft Core &bull; Edition 2026
          </div>
        </footer>
      </div>
    </main>
  );
}