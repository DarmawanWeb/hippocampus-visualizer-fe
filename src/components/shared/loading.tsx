import { Dog } from 'lucide-react';

export default function LoadingPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <section className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="-top-40 -right-40 absolute h-80 w-80 rounded-full bg-gradient-to-br from-cyan-500/10 to-blue-600/10 blur-3xl" />
        <div className="-bottom-40 -left-40 absolute h-80 w-80 rounded-full bg-gradient-to-br from-purple-500/10 to-pink-600/10 blur-3xl" />
      </section>

      <div className="relative text-center">
        <div className="relative mb-8 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg">
          <Dog size={28} className="text-white" />
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400/20 to-transparent" />
        </div>
        <div className="mb-6">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-cyan-500/20 border-t-cyan-500" />
        </div>

        <h1 className="mb-2 font-bold text-2xl text-white tracking-tight">
          Loading...
        </h1>
        <p className="max-w-md text-slate-400">
          Please wait while we prepare everything for you
        </p>
      </div>
    </main>
  );
}
