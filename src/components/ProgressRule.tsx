export function ProgressRule({ completed, total }: { completed: number; total: number }) {
  const ratio = total > 0 ? Math.min(1, completed / total) : 0;

  return (
    <div className="h-[3px] w-full bg-line">
      <div
        className="h-full bg-ember"
        style={{ width: `${Math.max(ratio * 100, ratio > 0 ? 2 : 0)}%` }}
      />
    </div>
  );
}
