"use client";

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:py-3.5 group-[.toaster]:rounded-md group-[.toaster]:bg-wg-gray-900 group-[.toaster]:text-sm group-[.toaster]:text-white group-[.toaster]:border-surface-100 group-[.toaster]:shadow-wg-lg",
          description: "group-[.toast]:text-surface-600",
          title: "group-[.toast]:font-normal",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-surface-50 group-[.toast]:text-surface-500",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
