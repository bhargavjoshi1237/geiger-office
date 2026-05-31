"use client";

import { useEffect, useState } from "react";

/**
 * SSR-safe media query hook. Returns false on the server and during the first
 * client render, then syncs to the real match after mount (avoids hydration
 * mismatches).
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

// Tailwind's `md` breakpoint is 768px; "mobile" is anything below it.
export function useIsMobile() {
  return useMediaQuery("(max-width: 767px)");
}
