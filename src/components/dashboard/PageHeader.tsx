import type { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
};

export default function PageHeader({ eyebrow, title, description, action }: PageHeaderProps) {
  return (
    <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.17em] text-black/30">{eyebrow}</p>
        <h1 className="mt-2 text-[36px] font-medium leading-none tracking-[-0.05em] sm:text-[44px]">{title}</h1>
        <p className="mt-3 max-w-[620px] text-sm font-medium leading-relaxed text-black/40 sm:text-base">
          {description}
        </p>
      </div>
      {action}
    </header>
  );
}
