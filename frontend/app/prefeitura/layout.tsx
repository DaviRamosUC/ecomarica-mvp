import PrefeituraSidebar from "@/components/PrefeituraSidebar";

export default function PrefeituraLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gov-bg">
      <PrefeituraSidebar />
      <div className="min-w-0 flex-1 overflow-x-auto">{children}</div>
    </div>
  );
}
