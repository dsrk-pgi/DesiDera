export default function ShimmerCard() {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-card">
      <div className="h-44 w-full shimmer-bg" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-3/4 rounded-lg shimmer-bg" />
        <div className="h-3 w-1/2 rounded-lg shimmer-bg" />
        <div className="mt-5 flex items-center gap-2">
          <div className="h-9 w-24 rounded-xl shimmer-bg" />
          <div className="h-9 w-14 rounded-xl shimmer-bg" />
          <div className="ml-auto h-9 w-16 rounded-xl shimmer-bg" />
        </div>
      </div>
    </div>
  );
}
