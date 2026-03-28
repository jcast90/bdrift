"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export function PageTracker() {
  const pathname = usePathname();
  const lastTracked = useRef<string>("");

  useEffect(() => {
    if (pathname === lastTracked.current) return;
    lastTracked.current = pathname;

    const timer = setTimeout(() => {
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page: pathname,
          referrer: document.referrer || null,
          ua: navigator.userAgent,
        }),
        keepalive: true,
      }).catch(() => {
        // Silently ignore tracking failures
      });
    }, 50);

    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}
