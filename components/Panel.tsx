export default function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-2xl border border-emerald-900/80 bg-emerald-950/40 p-5 shadow-xl"><h2 className="mb-3 text-lg font-semibold text-amber-300">{title}</h2>{children}</section>;
}
