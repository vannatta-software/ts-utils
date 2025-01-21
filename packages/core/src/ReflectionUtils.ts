import 'reflect-metadata';

export enum FieldType {
  Text = "Text",
  Date = "Date",
  DateRange = "DateRange",
  Blob = "Blob",
  Boolean = "Boolean",
  List = "List",
  Object = "Object",
  ObjectList = "ObjectList",
  TextArea = "TextArea",
  Number = "Number",
  Select = "Select",
}

export enum ViewType {
  Text = "Text",
  Paragraph = "Paragraph",
  Number = "Number",
  Embedded = "Embedded",
  Date = "Date",
  DateRange = "DateRange",
  Tag = "Tag",
  Enumeration = "Enumeration",
  List = "List",
}

type Prop = { propertyKey: string };

export const FormFieldMetadataKey = Symbol("FormField");
export const ViewFieldMetadataKey = Symbol("ViewField");
export const SchemaMetadataKey = Symbol("Schema");

export interface FieldMetadata extends Prop {
  label: string;
  type: FieldType;
  options?: object;
}

export interface ViewMetadata extends Prop {
  label: string;
  type: ViewType;
}

export interface SchemaMetadata {
  [key: string]: any;
}

/**
 * Field decorator.
 */
export function Field(
  label: string,
  type: FieldType = FieldType.Text,
  options?: object
) {
  return function (target: any, propertyKey: string) {
    const fields: FieldMetadata[] =
      ReflectionUtils.getOwnMetadata<FieldMetadata>(FormFieldMetadataKey, target.constructor) || [];
    fields.push({ label, type, propertyKey, options });
    ReflectionUtils.setMetadata(FormFieldMetadataKey, target.constructor, fields);
  };
}

/**
 * View decorator.
 */
export function View(label: string, type: ViewType = ViewType.Text) {
  return function (target: any, propertyKey: string) {
    const fields =
      ReflectionUtils.getOwnMetadata<ViewMetadata>(ViewFieldMetadataKey, target.constructor) || [];
      
    fields.push({ label, type, propertyKey });
    ReflectionUtils.setMetadata(ViewFieldMetadataKey, target.constructor, fields);
  };
}

export function Schema(options: any) {
  return function (target: any, propertyKey: string) {
    const fields: SchemaMetadata[] =
      ReflectionUtils.getMetadata(SchemaMetadataKey, target.constructor) || [];
    const existingFieldIndex = fields.findIndex((field) => field.propertyKey === propertyKey);

    if (existingFieldIndex !== -1) {
      // Update existing field
      fields[existingFieldIndex] = { ...fields[existingFieldIndex], ...options };
    } else {
      // Add new field
      fields.push({ propertyKey, ...options });
    }

    ReflectionUtils.setMetadata(SchemaMetadataKey, target.constructor, fields);
  };
}

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
