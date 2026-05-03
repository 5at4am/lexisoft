"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function Template({ children }: { children: React.ReactNode }) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline();

    // Entrance Animation (mimicking Barba.js transition)
    tl.to(overlayRef.current, {
      scaleY: 0,
      duration: 1.2,
      ease: "expo.inOut",
      transformOrigin: "top",
    });

    return () => {
      // You could handle exit animations here if needed, 
      // but 'template' handles the mount animation automatically on navigation.
    };
  }, []);

  return (
    <>
      {/* Transition Overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-[100] bg-accent pointer-events-none origin-top scale-y-100"
      />
      {children}
    </>
  );
}
