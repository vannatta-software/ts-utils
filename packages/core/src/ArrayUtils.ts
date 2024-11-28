export class ArrayUtils {
    /**
     * Flattens an array of items or arrays of items into a single array.
     */
    public static flatten<T>(connections: (T | T[])[]): T[] {
      return connections.reduce<T[]>((out, conn) => {
        if (Array.isArray(conn)) {
          return out.concat(conn);
        }
        out.push(conn);
        return out;
      }, []);
    }
  
    /**
     * Filters an array to contain only unique elements.
     */
    public static unique<T>(array: T[]): T[] {
      return [...new Set(array)];
    }
  
    /**
     * Combines two sets into the first set.
     */
    public static combine<T>(set: Set<T>, other: Set<T>): void {
      other.forEach((item) => {
        set.add(item);
      });
    }
  
    /**
     * Iterates through an array in random order.
     */
    public static forEachRandom<T>(
      array: T[],
      callback: (item: T, index: number) => void
    ): void {
      const shuffled = [...array].sort(() => Math.random() - 0.5);
      shuffled.forEach((item, index) => callback(item, index));
    }
  
    /**
     * Groups an array into a Map using a specified property as the key.
     */
    public static arrayToMap<T>(array: T[], keyProperty: keyof T): Map<string, T[]> {
      const map = new Map<string, T[]>();
      array.forEach((item) => {
        const key = String(item[keyProperty]);
        if (!map.has(key)) {
          map.set(key, []);
        }
        map.get(key)?.push(item);
      });
      return map;
    }
  
    /**
     * Splits an array into chunks of a specified size.
     */
    public static chunk<T>(array: T[], size: number): T[][] {
      if (size <= 0) throw new Error('Chunk size must be greater than 0.');
      const chunks: T[][] = [];
      for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
      }
      return chunks;
    }
  
    /**
     * Returns the elements in `array` that are not in `other`.
     */
    public static difference<T>(array: T[], other: T[]): T[] {
      const otherSet = new Set(other);
      return array.filter((item) => !otherSet.has(item));
    }
  
    /**
     * Returns the common elements between two arrays.
     */
    public static intersection<T>(array: T[], other: T[]): T[] {
      const otherSet = new Set(other);
      return array.filter((item) => otherSet.has(item));
    }
  
    /**
     * Shuffles the elements of an array.
     */
    public static shuffle<T>(array: T[]): T[] {
      return [...array].sort(() => Math.random() - 0.5);
    }
  
    /**
     * Removes `null` and `undefined` values from an array.
     */
    public static compact<T>(array: (T | null | undefined)[]): T[] {
      return array.filter((item): item is T => item != null);
    }
  
    /**
     * Groups an array into an object based on a callback function.
     */
    public static groupBy<T>(array: T[], callback: (item: T) => string): Record<string, T[]> {
      return array.reduce<Record<string, T[]>>((acc, item) => {
        const key = callback(item);
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
      }, {});
    }
  }
  