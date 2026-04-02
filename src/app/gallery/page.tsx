export default function GalleryPage() {
  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold">Gallery</h1>
      <p className="text-slate-300">Photos from build nights, competitions, and community events.</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-48 rounded-xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900" />
        ))}
      </div>
    </section>
  );
}
