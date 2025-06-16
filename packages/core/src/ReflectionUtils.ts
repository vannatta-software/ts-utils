import 'reflect-metadata';

export class ReflectionUtils {
  /**
   * Retrieves all metadata for a given key on a class.
   * This includes metadata from parent classes.
   * Returns as an array of T[].
   */
  public static getMetadata<T>(key: symbol, target: any): T[] {
    const metadata: T[] = [];
    let currentTarget = target;

    while (currentTarget && currentTarget.prototype) {
      const ownMetadata = Reflect.getOwnMetadata(key, currentTarget) || [];
      if (Array.isArray(ownMetadata)) {
        metadata.unshift(...ownMetadata); // Add parent metadata first
      }
      currentTarget = Object.getPrototypeOf(currentTarget);
    }

    // Deduplicate by propertyKey
    return metadata.filter(
      (item, index, self) =>
        self.findIndex((entry) => (entry as any).propertyKey === (item as any).propertyKey) === index
    );
  }

  /**
   * Retrieves metadata directly defined on the class (excluding parent metadata).
   * Returns as an array of T[].
   */
  public static getOwnMetadata<T>(key: symbol, target: any): T[] {
    return Reflect.getOwnMetadata(key, target) || [];
  }

  /**
   * Retrieves metadata for a specific property on a class.
   */
  public static getMetadataForProperty<T>(
    key: symbol,
    target: any,
    propertyKey: string
  ): T | undefined {
    const metadata = this.getOwnMetadata<T>(key, target);
    return metadata.find((field) => (field as any).propertyKey === propertyKey);
  }

  /**
   * Merges metadata from a parent class with the child class.
   */
  public static getMergedMetadata<T>(key: symbol, target: any): T[] {
    return this.getMetadata<T>(key, target);
  }

  /**
   * Sets metadata for a specific key on a class.
   */
  public static setMetadata<T>(key: symbol, target: any, data: T[]): void {
    Reflect.defineMetadata(key, data, target);
  }

  /**
   * Checks if metadata exists for a specific key on a class.
   */
  public static hasMetadata(key: symbol, target: any): boolean {
    return Reflect.hasMetadata(key, target);
  }

  /**
   * Retrieves all metadata keys defined on a target.
   */
  public static getAllMetadataKeys(target: any): symbol[] {
    return Reflect.getMetadataKeys(target) || [];
  }
}
