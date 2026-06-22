export default function App() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto flex min-h-screen max-w-4xl items-center px-6 py-16">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-10 shadow-2xl shadow-black/20 backdrop-blur">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.3em] text-emerald-300">
            Milestone 1
          </p>
          <h1 className="max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl">
          StoreFront-Management-System setup is ready for the next milestone.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
            The Django backend, React frontend, shared API response pattern, and
            folder structure are now in place. Next we can add authentication
            with a custom user model and JWT flow.
          </p>
        </div>
      </section>
    </main>
  );
}
