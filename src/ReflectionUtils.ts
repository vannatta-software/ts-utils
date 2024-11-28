import 'reflect-metadata';

export enum FieldType {
  Text = "Text",
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
  Tag = "Tag",
  Enumeration = "Enumeration",
  List = "List",
}

export const FormFieldMetadataKey = Symbol('FormField');
export const ViewFieldMetadataKey = Symbol('ViewField');
export const SchemaMetadataKey = Symbol('Schema');

export interface FieldMetadata {
  label: string;
  type: FieldType;
  propertyKey: string;
  options?: object;
}

export interface ViewMetadata {
  label: string;
  type: ViewType;
  propertyKey: string;
}

export interface SchemaMetadata {
  [key: string]: any;
}

/**
 * Decorator for defining a form field.
 */
export function Field(
  label: string,
  type: FieldType = FieldType.Text,
  options?: object
) {
  return function (target: any, propertyKey: string) {
    const fields: FieldMetadata[] =
      Reflect.getMetadata(FormFieldMetadataKey, target.constructor) || [];
    fields.push({ label, type, propertyKey, options });
    Reflect.defineMetadata(FormFieldMetadataKey, fields, target.constructor);
  };
}

/**
 * Decorator for defining a view field.
 */
export function View(label: string, type: ViewType = ViewType.Text) {
  return function (target: any, propertyKey: string) {
    const fields: ViewMetadata[] =
      Reflect.getMetadata(ViewFieldMetadataKey, target.constructor) || [];
    fields.push({ label, type, propertyKey });
    Reflect.defineMetadata(ViewFieldMetadataKey, fields, target.constructor);
  };
}

/**
 * Decorator for defining schema metadata.
 */
export function Schema(options: any) {
  return function (target: any, propertyKey: string) {
    const parentFields: SchemaMetadata =
      Reflect.getMetadata(SchemaMetadataKey, Object.getPrototypeOf(target).constructor) || {};
    const ownFields: SchemaMetadata =
      Reflect.getMetadata(SchemaMetadataKey, target.constructor) || {};

    const fields = { ...parentFields, ...ownFields, [propertyKey]: options };
    Reflect.defineMetadata(SchemaMetadataKey, fields, target.constructor);
  };
}

/**
 * Reflection utilities for managing metadata.
 */
export class ReflectionUtils {
  /**
   * Retrieves all metadata for a given key on a class.
   */
  public static getMetadata<T>(key: symbol, target: any): T[] | undefined {
    return Reflect.getMetadata(key, target) || [];
  }

  /**
   * Retrieves metadata for a specific property on a class.
   */
  public static getMetadataForProperty<T>(
    key: symbol,
    target: any,
    propertyKey: string
  ): T | undefined {
    const metadata = Reflect.getMetadata(key, target) || [];
    return metadata.find((field: any) => field.propertyKey === propertyKey);
  }

  /**
   * Merges metadata from a parent class with the child class.
   */
  public static getMergedMetadata<T>(key: symbol, target: any): T[] {
    const parentMetadata: T[] =
      Reflect.getMetadata(key, Object.getPrototypeOf(target).constructor) || [];
    const ownMetadata: T[] = Reflect.getMetadata(key, target.constructor) || [];
    return [...parentMetadata, ...ownMetadata];
  }

  /**
   * Sets metadata for a specific key on a class.
   */
  public static setMetadata<T>(key: symbol, target: any, data: T): void {
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
