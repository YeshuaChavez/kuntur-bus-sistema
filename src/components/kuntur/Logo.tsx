export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[image:var(--gradient-primary)] shadow-[var(--shadow-soft)]">
        <span
          aria-hidden="true"
          className="h-5 w-5 bg-primary-foreground [mask:url('/condor.svg')_center/contain_no-repeat] [-webkit-mask:url('/condor.svg')_center/contain_no-repeat]"
        />
      </div>
      <div className="leading-none">
        <div className="text-lg font-bold tracking-tight text-foreground">KUNTUR</div>
        <div className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Transit OS</div>
      </div>
    </div>
  );
}
