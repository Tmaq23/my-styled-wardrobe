// Performance monitoring utility for the styled wardrobe app

export interface PerformanceMetrics {
  pageLoadTime: number;
  apiResponseTime: number;
  imageLoadTime: number;
  componentRenderTime: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    pageLoadTime: 0,
    apiResponseTime: 0,
    imageLoadTime: 0,
    componentRenderTime: 0,
  };

  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initializeObservers();
  }

  private initializeObservers() {
    // Monitor navigation timing
    if ('PerformanceObserver' in window) {
      try {
        const navigationObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.entryType === 'navigation') {
              const navEntry = entry as PerformanceNavigationTiming;
              this.metrics.pageLoadTime = navEntry.loadEventEnd - navEntry.loadEventStart;
              this.logMetric('Page Load Time', this.metrics.pageLoadTime);
            }
          });
        });
        navigationObserver.observe({ entryTypes: ['navigation'] });
        this.observers.push(navigationObserver);
      } catch (error) {
        console.warn('Navigation timing observer not supported:', error);
      }

      // Monitor resource timing
      try {
        const resourceObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.entryType === 'resource') {
              const resourceEntry = entry as PerformanceResourceTiming;
              if (resourceEntry.name.includes('/api/')) {
                this.metrics.apiResponseTime = resourceEntry.responseEnd - resourceEntry.requestStart;
                this.logMetric('API Response Time', this.metrics.apiResponseTime);
              } else if (resourceEntry.name.match(/\.(jpg|jpeg|png|webp|avif)$/i)) {
                this.metrics.imageLoadTime = resourceEntry.responseEnd - resourceEntry.requestStart;
                this.logMetric('Image Load Time', this.metrics.imageLoadTime);
              }
            }
          });
        });
        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.push(resourceObserver);
      } catch (error) {
        console.warn('Resource timing observer not supported:', error);
      }
    }
  }

  // Measure component render time
  measureComponentRender(componentName: string, startTime: number) {
    const renderTime = performance.now() - startTime;
    this.metrics.componentRenderTime = renderTime;
    this.logMetric(`${componentName} Render Time`, renderTime);
    return renderTime;
  }

  // Measure API call performance
  async measureApiCall<T>(apiCall: () => Promise<T>, endpoint: string): Promise<T> {
    const startTime = performance.now();
    try {
      const result = await apiCall();
      const responseTime = performance.now() - startTime;
      this.metrics.apiResponseTime = responseTime;
      this.logMetric(`${endpoint} API Call`, responseTime);
      return result;
    } catch (error) {
      const responseTime = performance.now() - startTime;
      this.logMetric(`${endpoint} API Error`, responseTime);
      throw error;
    }
  }

  // Measure image load performance
  measureImageLoad(imageUrl: string): Promise<void> {
    return new Promise((resolve) => {
      const startTime = performance.now();
      const img = new Image();
      
      img.onload = () => {
        const loadTime = performance.now() - startTime;
        this.metrics.imageLoadTime = loadTime;
        this.logMetric(`Image Load: ${imageUrl}`, loadTime);
        resolve();
      };
      
      img.onerror = () => {
        const loadTime = performance.now() - startTime;
        this.logMetric(`Image Load Error: ${imageUrl}`, loadTime);
        resolve();
      };
      
      img.src = imageUrl;
    });
  }

  // Get current performance metrics
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  // Log performance metrics
  private logMetric(name: string, value: number) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 Performance: ${name}`, `${value.toFixed(2)}ms`);
    }
    
    // Send to analytics in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalytics(name, value);
    }
  }

  // Send metrics to analytics service
  private sendToAnalytics(metricName: string, value: number) {
    // Implement your analytics service here
    // Example: Google Analytics, Mixpanel, etc.
    try {
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'performance_metric', {
          metric_name: metricName,
          value: Math.round(value),
          custom_parameter: 'styled_wardrobe_app'
        });
      }
    } catch (error) {
      console.warn('Failed to send performance metric to analytics:', error);
    }
  }

  // Get performance recommendations
  getRecommendations(): string[] {
    const recommendations: string[] = [];
    
    if (this.metrics.pageLoadTime > 3000) {
      recommendations.push('Page load time is slow. Consider code splitting and lazy loading.');
    }
    
    if (this.metrics.apiResponseTime > 1000) {
      recommendations.push('API response time is slow. Consider implementing caching.');
    }
    
    if (this.metrics.imageLoadTime > 500) {
      recommendations.push('Image loading is slow. Consider using WebP format and lazy loading.');
    }
    
    if (this.metrics.componentRenderTime > 100) {
      recommendations.push('Component rendering is slow. Consider using React.memo and useMemo.');
    }
    
    return recommendations;
  }

  // Cleanup observers
  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Performance measurement decorator for components
export function measurePerformance(componentName: string) {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    return class extends constructor {
      constructor(...args: any[]) {
        super(...args);
        const startTime = performance.now();
        
        // Measure initial render
        setTimeout(() => {
          performanceMonitor.measureComponentRender(componentName, startTime);
        }, 0);
      }
    };
  };
}

// Hook for measuring component performance
export function usePerformanceMeasurement(componentName: string) {
  const startTime = performance.now();
  
  React.useEffect(() => {
    performanceMonitor.measureComponentRender(componentName, startTime);
  }, [componentName]);
}

// Utility for measuring async operations
export async function measureAsyncOperation<T>(
  operationName: string,
  operation: () => Promise<T>
): Promise<T> {
  return performanceMonitor.measureApiCall(operation, operationName);
}

// Export default instance
export default performanceMonitor;


