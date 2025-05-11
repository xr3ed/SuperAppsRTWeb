import { useState, useEffect } from 'react';

const getViewportDetails = () => {
  const width = window.innerWidth;
  let device = 'desktop';
  // Tailwind CSS breakpoints:
  // sm: 640px
  // md: 768px
  // lg: 1024px
  // xl: 1280px
  // 2xl: 1536px
  // We'll use md (768px) as the threshold for 'mobile' for simplicity in this hook,
  // and lg (1024px) as the threshold for 'tablet'.
  // Adjust these thresholds as needed for your specific design.
  if (width < 768) { // Corresponds to Tailwind's 'md' breakpoint
    device = 'mobile';
  } else if (width < 1024) { // Corresponds to Tailwind's 'lg' breakpoint
    device = 'tablet';
  }
  return { width, height: window.innerHeight, device };
};

const useViewport = () => {
  const [viewport, setViewport] = useState(getViewportDetails());

  useEffect(() => {
    const handleResize = () => {
      setViewport(getViewportDetails());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return viewport;
};

export default useViewport; 