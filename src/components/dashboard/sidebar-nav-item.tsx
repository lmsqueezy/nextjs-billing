"use client";

import { ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import {
  type ComponentPropsWithoutRef,
  type ElementRef,
  type ReactElement,
  type ReactSVGElement,
  forwardRef,
} from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type SidebarNavItemElement = ElementRef<typeof Link>;
type SidebarNavItemProps = ComponentPropsWithoutRef<typeof Link> & {
  icon?: ReactElement<ReactSVGElement>;
};

export const SidebarNavItem = forwardRef<
  SidebarNavItemElement,
  SidebarNavItemProps
>((props, ref) => {
  const { icon, className, children, href, ...otherProps } = props;
  const pathname = usePathname();
  const isCurrentPage = pathname === href;

  return (
    <li>
      <Link
        ref={ref}
        href={href}
        className={cn(
          "group flex w-full items-center gap-3 rounded-md px-4 py-2 transition-colors focus:outline-none focus-visible:bg-surface-700/5 focus-visible:text-surface-900 [&_svg]:shrink-0",
          isCurrentPage &&
            "bg-surface-700/5 font-medium text-primary [&_svg]:text-primary",

          !isCurrentPage &&
            "text-surface-700 hover:bg-surface-700/5 hover:text-surface-900 [&_svg]:text-surface-500",
          className,
        )}
        {...otherProps}
      >
        {icon}
        {children ? <span>{children}</span> : null}
        <ChevronRightIcon
          className="ml-auto opacity-60"
          aria-hidden
          size="16"
        />
      </Link>
    </li>
  );
});
