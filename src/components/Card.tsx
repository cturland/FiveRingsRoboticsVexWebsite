import { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export default function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`card panel-grid rounded-[1.6rem] p-6 md:p-7 ${className}`}>
      {children}
    </div>
  );
}
