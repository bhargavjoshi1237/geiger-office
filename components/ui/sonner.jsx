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
            "group toast group-[.toaster]:rounded-xl group-[.toaster]:border group-[.toaster]:border-[#2a2a2a] group-[.toaster]:bg-[#202020] group-[.toaster]:text-[#e7e7e7] group-[.toaster]:shadow-xl group-[.toaster]:shadow-black/40",
          description: "group-[.toast]:text-[#a3a3a3]",
          actionButton:
            "group-[.toast]:bg-white group-[.toast]:text-[#161616] group-[.toast]:rounded-md",
          cancelButton:
            "group-[.toast]:bg-[#2a2a2a] group-[.toast]:text-[#a3a3a3] group-[.toast]:rounded-md",
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
