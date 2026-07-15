import type { ElementType, ReactNode } from "react";

type SurfaceProps = {
  children: ReactNode;
  className?: string;
  as?: ElementType;
};

export default function Surface({ children, className = "", as: Component = "section" }: SurfaceProps) {
  return (
    <Component className={`rounded-[22px] border border-black/[0.07] bg-[#f7f7f4] ${className}`}>
      {children}
    </Component>
  );
}
