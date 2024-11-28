export class TimeUtils {
    static async timeout(ms: number): Promise<void> {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
  
    static async sleep(fn: Function, ...args: any[]): Promise<any> {
      await TimeUtils.timeout(3000);
      return fn(...args);
    }
  
    // Debounce function that delays the execution of a function until after wait ms have passed
    static debounce(fn: Function, wait: number) {
      let timeoutId: NodeJS.Timeout;
      return (...args: any[]) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), wait);
      };
    }
  
    // Throttle function that ensures the function is only called once every wait ms
    static throttle(fn: Function, wait: number) {
      let lastTime = 0;
      return (...args: any[]) => {
        const now = Date.now();
        if (now - lastTime >= wait) {
          fn(...args);
          lastTime = now;
        }
      };
    }
  
    // Formats a duration in milliseconds to a human-readable format (hh:mm:ss)
    static formatDuration(ms: number): string {
      const hours = Math.floor(ms / 3600000);
      const minutes = Math.floor((ms % 3600000) / 60000);
      const seconds = Math.floor((ms % 60000) / 1000);
  
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
  }
  