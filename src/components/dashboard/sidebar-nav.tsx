import { type ComponentPropsWithRef } from "react";
import { SidebarNavItem } from "./sidebar-nav-item";

type SidebarNavWrapperProps = ComponentPropsWithRef<"nav">;

export const SidebarNavWrapper = (props: SidebarNavWrapperProps) => {
  const { children, ...otherProps } = props;

  if (!children) return null;

  return (
    <nav aria-label="Primary navigation" {...otherProps}>
      <ul className="flex flex-col items-stretch gap-0.5">{children}</ul>
    </nav>
  );
};

export const SidebarNav = Object.assign(SidebarNavWrapper, {
  Item: SidebarNavItem,
});
