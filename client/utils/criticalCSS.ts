// Critical CSS that should be inlined for above-the-fold content
export const criticalCSS = `
  /* Reset and base styles */
  *, *::before, *::after {
    box-sizing: border-box;
  }
  
  html {
    font-size: 16px;
    overflow-x: hidden;
  }
  
  body {
    margin: 0;
    padding: 0;
    background-color: #000000;
    color: #ffffff;
    font-family: Inter, system-ui, -apple-system, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow-x: hidden;
    min-height: 100vh;
    min-height: 100dvh;
  }
  
  /* Critical layout classes */
  .min-h-screen {
    min-height: 100vh;
    min-height: 100dvh;
  }
  
  .flex {
    display: flex;
  }
  
  .flex-col {
    flex-direction: column;
  }
  
  .flex-1 {
    flex: 1 1 0%;
  }
  
  .items-center {
    align-items: center;
  }
  
  .justify-center {
    justify-content: center;
  }
  
  .relative {
    position: relative;
  }
  
  .absolute {
    position: absolute;
  }
  
  .fixed {
    position: fixed;
  }
  
  .sticky {
    position: sticky;
  }
  
  .top-0 {
    top: 0;
  }
  
  .inset-0 {
    inset: 0;
  }
  
  .z-50 {
    z-index: 50;
  }
  
  .w-full {
    width: 100%;
  }
  
  .h-full {
    height: 100%;
  }
  
  .overflow-hidden {
    overflow: hidden;
  }
  
  .bg-black {
    background-color: #000000;
  }
  
  .text-white {
    color: #ffffff;
  }
  
  /* Container */
  .container {
    width: 100%;
    margin-left: auto;
    margin-right: auto;
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  @media (min-width: 640px) {
    .container {
      max-width: 640px;
    }
  }
  
  @media (min-width: 768px) {
    .container {
      max-width: 768px;
    }
  }
  
  @media (min-width: 1024px) {
    .container {
      max-width: 1024px;
    }
  }
  
  @media (min-width: 1280px) {
    .container {
      max-width: 1280px;
    }
  }
  
  @media (min-width: 1536px) {
    .container {
      max-width: 1400px;
    }
  }
  
  /* Critical header styles */
  .backdrop-blur-xl {
    backdrop-filter: blur(24px);
  }
  
  .bg-black\\/80 {
    background-color: rgba(0, 0, 0, 0.8);
  }
  
  .transition-all {
    transition-property: all;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 150ms;
  }
  
  /* Touch optimization */
  .touch-manipulation {
    touch-action: manipulation;
  }
  
  /* Performance optimizations */
  img {
    max-width: 100%;
    height: auto;
    display: block;
  }
  
  /* Critical animations */
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-fadeInUp {
    animation: fadeInUp 0.6s ease-out forwards;
  }
`;

// Function to inject critical CSS
export function injectCriticalCSS() {
  if (typeof document !== "undefined") {
    const style = document.createElement("style");
    style.textContent = criticalCSS;
    style.setAttribute("data-critical", "true");
    document.head.insertBefore(style, document.head.firstChild);
  }
}

// Function to detect if device supports hover (performance optimization)
export function supportsHover(): boolean {
  return window.matchMedia("(hover: hover)").matches;
}

// Function to detect if user prefers reduced motion
export function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// Function to get device type for optimization
export function getDeviceType(): "mobile" | "tablet" | "desktop" {
  const width = window.innerWidth;
  if (width < 768) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}

// Function to optimize images based on device
export function getOptimalImageSize(
  originalWidth: number,
  deviceType: string,
): number {
  switch (deviceType) {
    case "mobile":
      return Math.min(originalWidth, 800);
    case "tablet":
      return Math.min(originalWidth, 1200);
    default:
      return originalWidth;
  }
}

// Intersection Observer for lazy loading optimization
export function createOptimizedIntersectionObserver(
  callback: IntersectionObserverCallback,
  options: IntersectionObserverInit = {},
): IntersectionObserver {
  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: "50px",
    threshold: 0.1,
    ...options,
  };

  return new IntersectionObserver(callback, defaultOptions);
}
