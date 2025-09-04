import { useEffect } from "react";

interface PerformanceMetrics {
  FCP?: number; // First Contentful Paint
  LCP?: number; // Largest Contentful Paint
  FID?: number; // First Input Delay
  CLS?: number; // Cumulative Layout Shift
  TTFB?: number; // Time to First Byte
}

export function PerformanceMonitor() {
  useEffect(() => {
    // Performance observer for Core Web Vitals
    const observePerformance = () => {
      const metrics: PerformanceMetrics = {};

      // Observe LCP
      if ("PerformanceObserver" in window) {
        try {
          const lcpObserver = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            metrics.LCP = lastEntry.startTime;
            console.log("LCP:", lastEntry.startTime);
          });
          lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });

          // Observe FID
          const fidObserver = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            entries.forEach((entry) => {
              metrics.FID = entry.processingStart - entry.startTime;
              console.log("FID:", entry.processingStart - entry.startTime);
            });
          });
          fidObserver.observe({ entryTypes: ["first-input"] });

          // Observe CLS
          const clsObserver = new PerformanceObserver((entryList) => {
            let clsValue = 0;
            const entries = entryList.getEntries();
            entries.forEach((entry: any) => {
              if (!entry.hadRecentInput) {
                clsValue += entry.value;
              }
            });
            metrics.CLS = clsValue;
            console.log("CLS:", clsValue);
          });
          clsObserver.observe({ entryTypes: ["layout-shift"] });
        } catch (error) {
          console.warn("Performance Observer not supported", error);
        }
      }

      // Navigation Timing API for additional metrics
      window.addEventListener("load", () => {
        setTimeout(() => {
          const navigation = performance.getEntriesByType(
            "navigation",
          )[0] as PerformanceNavigationTiming;
          const paint = performance.getEntriesByType("paint");

          if (navigation) {
            metrics.TTFB = navigation.responseStart - navigation.requestStart;
            console.log("TTFB:", metrics.TTFB);
          }

          const fcp = paint.find(
            (entry) => entry.name === "first-contentful-paint",
          );
          if (fcp) {
            metrics.FCP = fcp.startTime;
            console.log("FCP:", fcp.startTime);
          }

          // Log all metrics
          console.group("🚀 Performance Metrics");
          console.table(metrics);
          console.groupEnd();

          // Send to analytics (implement your analytics here)
          sendPerformanceMetrics(metrics);
        }, 0);
      });
    };

    observePerformance();
  }, []);

  return null;
}

// Function to send metrics to analytics
function sendPerformanceMetrics(metrics: PerformanceMetrics) {
  // Implement your analytics tracking here
  // Example: Google Analytics, custom analytics endpoint, etc.
  if (process.env.NODE_ENV === "production") {
    // gtag('event', 'performance_metrics', metrics);
    console.log("Performance metrics ready for analytics:", metrics);
  }
}

// Utility function to check if performance is good
export function getPerformanceGrade(metrics: PerformanceMetrics): string {
  const { LCP = 0, FID = 0, CLS = 0 } = metrics;

  let score = 0;

  // LCP scoring (Good: <2.5s, Needs Improvement: 2.5-4s, Poor: >4s)
  if (LCP < 2500) score += 3;
  else if (LCP < 4000) score += 2;
  else score += 1;

  // FID scoring (Good: <100ms, Needs Improvement: 100-300ms, Poor: >300ms)
  if (FID < 100) score += 3;
  else if (FID < 300) score += 2;
  else score += 1;

  // CLS scoring (Good: <0.1, Needs Improvement: 0.1-0.25, Poor: >0.25)
  if (CLS < 0.1) score += 3;
  else if (CLS < 0.25) score += 2;
  else score += 1;

  if (score >= 8) return "A";
  if (score >= 6) return "B";
  if (score >= 4) return "C";
  return "D";
}
