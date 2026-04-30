import { Leaf } from "lucide-react";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[image:var(--gradient-primary)] shadow-[var(--shadow-soft)]">
        <Leaf className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
      </div>
      <div className="leading-none">
        <div className="text-lg font-bold tracking-tight text-foreground">JAYSI</div>
        <div className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Transit OS</div>
      </div>
    </div>
  );
}