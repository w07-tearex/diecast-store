"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Component to ensure that the window scrolls to the top on every route change.
 * Useful when using a persistent layout with fixed headers.
 */
export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}
