import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

const SectionRoot = ({
  children,
  className,
}: {
  className?: string;
  children?: ReactNode;
}) => {
  return (
    <div
      className={cn(
        "flex flex-col divide-y divide-surface-100 rounded-lg border border-surface-100 px-4 py-2.5 text-sm shadow-wg-xs",
        className,
      )}
    >
      {children}
    </div>
  );
};

const SectionItem = ({
  children,
  className,
}: {
  className?: string;
  children: ReactNode;
}) => {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-4 px-2 py-3 text-sm lg:flex-nowrap",
        className,
      )}
    >
      {children}
    </div>
  );
};

export const Section = Object.assign(SectionRoot, {
  Root: SectionRoot,
  Item: SectionItem,
});
