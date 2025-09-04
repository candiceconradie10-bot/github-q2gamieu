// Viewport utilities for perfect screen fitting and performance

export interface ViewportInfo {
  width: number;
  height: number;
  devicePixelRatio: number;
  orientation: "portrait" | "landscape";
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  hasNotch: boolean;
  safeAreaInsets: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

// Get comprehensive viewport information
export function getViewportInfo(): ViewportInfo {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const devicePixelRatio = window.devicePixelRatio || 1;
  const orientation = width > height ? "landscape" : "portrait";

  // Device type detection
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;

  // Safe area insets (for devices with notches/rounded corners)
  const safeAreaInsets = getSafeAreaInsets();

  // Detect notch (iPhone X and newer)
  const hasNotch = detectNotch();

  return {
    width,
    height,
    devicePixelRatio,
    orientation,
    isMobile,
    isTablet,
    isDesktop,
    hasNotch,
    safeAreaInsets,
  };
}

// Get safe area insets for devices with notches
function getSafeAreaInsets() {
  const style = getComputedStyle(document.documentElement);

  return {
    top: parseInt(
      style.getPropertyValue("env(safe-area-inset-top)") || "0",
      10,
    ),
    right: parseInt(
      style.getPropertyValue("env(safe-area-inset-right)") || "0",
      10,
    ),
    bottom: parseInt(
      style.getPropertyValue("env(safe-area-inset-bottom)") || "0",
      10,
    ),
    left: parseInt(
      style.getPropertyValue("env(safe-area-inset-left)") || "0",
      10,
    ),
  };
}

// Detect if device has a notch
function detectNotch(): boolean {
  // Check for iPhone X and newer
  const isIPhoneX =
    /iPhone.*OS 1[1-9]/.test(navigator.userAgent) &&
    window.screen.height === 812 &&
    window.screen.width === 375;

  // Check for other devices with notches
  const hasDisplayCutout =
    "CSS" in window && CSS.supports("top: env(safe-area-inset-top)");

  return isIPhoneX || hasDisplayCutout;
}

// Set viewport meta tag dynamically for optimal mobile experience
export function setOptimalViewport(): void {
  let viewport = document.querySelector(
    'meta[name="viewport"]',
  ) as HTMLMetaElement;

  if (!viewport) {
    viewport = document.createElement("meta");
    viewport.name = "viewport";
    document.head.appendChild(viewport);
  }

  const viewportInfo = getViewportInfo();

  // Optimal viewport settings based on device
  let viewportContent =
    "width=device-width, initial-scale=1.0, minimum-scale=1.0";

  if (viewportInfo.isMobile) {
    // Mobile optimizations
    viewportContent += ", maximum-scale=5.0, user-scalable=yes";
  } else {
    // Desktop/tablet optimizations
    viewportContent += ", maximum-scale=2.0, user-scalable=yes";
  }

  // Add viewport-fit for devices with notches
  if (viewportInfo.hasNotch) {
    viewportContent += ", viewport-fit=cover";
  }

  viewport.content = viewportContent;
}

// Handle dynamic viewport height (for mobile browsers with dynamic UI)
export function setDynamicViewportHeight(): void {
  const setVH = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty("--vh", `${vh}px`);

    // Also set dvh units for better support
    document.documentElement.style.setProperty(
      "--dvh",
      `${window.innerHeight}px`,
    );
  };

  setVH();

  // Update on resize with debouncing for performance
  let resizeTimer: NodeJS.Timeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(setVH, 100);
  });

  // Update on orientation change
  window.addEventListener("orientationchange", () => {
    setTimeout(setVH, 100); // Delay to ensure accurate measurement
  });
}

// Apply safe area insets to CSS custom properties
export function applySafeAreaInsets(): void {
  const insets = getSafeAreaInsets();
  const root = document.documentElement;

  root.style.setProperty("--safe-area-top", `${insets.top}px`);
  root.style.setProperty("--safe-area-right", `${insets.right}px`);
  root.style.setProperty("--safe-area-bottom", `${insets.bottom}px`);
  root.style.setProperty("--safe-area-left", `${insets.left}px`);
}

// Prevent zoom on input focus (iOS Safari)
export function preventInputZoom(): void {
  const inputs = document.querySelectorAll("input, select, textarea");

  inputs.forEach((input) => {
    input.addEventListener("focus", () => {
      if (getViewportInfo().isMobile) {
        const viewport = document.querySelector(
          'meta[name="viewport"]',
        ) as HTMLMetaElement;
        const originalContent = viewport.content;
        viewport.content = originalContent.replace(
          /maximum-scale=[^,]*/,
          "maximum-scale=1.0",
        );

        input.addEventListener(
          "blur",
          () => {
            viewport.content = originalContent;
          },
          { once: true },
        );
      }
    });
  });
}

// Optimize scroll performance
export function optimizeScrollPerformance(): void {
  // Add passive scroll listeners where possible
  let scrolling = false;

  window.addEventListener(
    "scroll",
    () => {
      if (!scrolling) {
        requestAnimationFrame(() => {
          // Scroll optimizations here
          scrolling = false;
        });
        scrolling = true;
      }
    },
    { passive: true },
  );
}

// Initialize all viewport optimizations
export function initializeViewportOptimizations(): void {
  setOptimalViewport();
  setDynamicViewportHeight();
  applySafeAreaInsets();
  preventInputZoom();
  optimizeScrollPerformance();

  // Apply CSS custom properties for device-specific optimizations
  const viewportInfo = getViewportInfo();
  const root = document.documentElement;

  root.style.setProperty("--device-width", `${viewportInfo.width}px`);
  root.style.setProperty("--device-height", `${viewportInfo.height}px`);
  root.style.setProperty(
    "--device-pixel-ratio",
    viewportInfo.devicePixelRatio.toString(),
  );

  // Add device type classes
  document.body.classList.add(
    viewportInfo.isMobile
      ? "device-mobile"
      : viewportInfo.isTablet
        ? "device-tablet"
        : "device-desktop",
  );

  if (viewportInfo.hasNotch) {
    document.body.classList.add("device-notch");
  }
}

// Responsive image sizing utility
export function getResponsiveImageSize(baseWidth: number): {
  width: number;
  sizes: string;
} {
  const viewportInfo = getViewportInfo();

  let width = baseWidth;
  let sizes = "";

  if (viewportInfo.isMobile) {
    width = Math.min(
      baseWidth,
      viewportInfo.width * viewportInfo.devicePixelRatio,
    );
    sizes = "100vw";
  } else if (viewportInfo.isTablet) {
    width = Math.min(
      baseWidth,
      viewportInfo.width * 0.8 * viewportInfo.devicePixelRatio,
    );
    sizes = "80vw";
  } else {
    width = Math.min(
      baseWidth,
      viewportInfo.width * 0.5 * viewportInfo.devicePixelRatio,
    );
    sizes = "50vw";
  }

  return { width: Math.round(width), sizes };
}
