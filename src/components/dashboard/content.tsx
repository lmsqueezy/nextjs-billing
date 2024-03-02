import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { PageTitle } from "./page-title";

export function DashboardContent(
  props: Readonly<{
    action?: ReactNode;
    children: ReactNode;
    className?: string;
    subtitle?: ReactNode;
    title?: ReactNode;
  }>,
) {
  const { action, className, subtitle, children, title } = props;

  return (
    <div className="size-full overflow-y-auto py-10">
      <main className={cn("container mx-auto w-full max-w-4xl", className)}>
        {title ? (
          <PageTitle subtitle={subtitle} action={action}>
            {title}
          </PageTitle>
        ) : null}

        <div className="prose prose-sm max-w-full text-inherit prose-headings:text-balance prose-headings:font-normal prose-p:max-w-prose prose-p:text-pretty prose-a:font-normal prose-a:text-primary prose-code:rounded prose-code:bg-primary-50 prose-code:px-1 prose-code:text-sm prose-code:font-normal prose-code:text-primary-600 prose-code:before:content-none prose-code:after:content-none">
          {children}
        </div>
      </main>
    </div>
  );
}
