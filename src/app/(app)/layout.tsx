import { BottomNav } from "@/components/BottomNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col pb-[76px]">
      {children}
      <BottomNav />
    </div>
  );
}
