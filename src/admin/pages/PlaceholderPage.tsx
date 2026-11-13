export default function PlaceholderPage({ title }: { title: string }) {
  return (
    <div>
      <h1 className="text-3xl font-bold text-ink">{title}</h1>
      <p className="mt-2 text-ink/60">Coming next.</p>
    </div>
  );
}