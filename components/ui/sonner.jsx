"use client";

import { Toaster as Sonner } from "sonner";

// App-wide toast surface. The suite renders dark-only (see <html class="dark">),
// so we pin the theme and style toasts to the Office palette instead of pulling
// in next-themes. Use via `import { toast } from "sonner"`.
function Toaster(props) {
  return (
    <Sonner
      theme="dark"
      position="bottom-right"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:rounded-xl group-[.toaster]:border group-[.toaster]:border-border group-[.toaster]:bg-surface-card group-[.toaster]:text-foreground group-[.toaster]:shadow-xl group-[.toaster]:shadow-black/40",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-white group-[.toast]:text-[#161616] group-[.toast]:rounded-md",
          cancelButton:
            "group-[.toast]:bg-surface-hover group-[.toast]:text-muted-foreground group-[.toast]:rounded-md",
          error: "group-[.toaster]:!text-red-300",
          success: "group-[.toaster]:!text-emerald-300",
          icon: "group-[.toast]:shrink-0",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
