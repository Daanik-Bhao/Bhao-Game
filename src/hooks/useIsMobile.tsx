import { useState, useEffect } from 'react';

function check(breakpoint: number, minHeight: number) {
  if (typeof window === 'undefined') return false;
  // Phones in landscape are wide but short, so also treat short viewports as mobile.
  return window.innerWidth < breakpoint || window.innerHeight < minHeight;
}

/**
 * True on narrow (portrait phone / small tablet) or short (landscape phone) viewports.
 * Updates on resize and orientation change.
 */
export function useIsMobile(breakpoint = 768, minHeight = 500) {
  const [isMobile, setIsMobile] = useState(() => check(breakpoint, minHeight));

  useEffect(() => {
    const handleResize = () => setIsMobile(check(breakpoint, minHeight));
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    // Initial check in case it changed between render and effect
    handleResize();
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [breakpoint, minHeight]);

  return isMobile;
}
