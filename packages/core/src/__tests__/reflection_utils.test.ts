import 'reflect-metadata';
import {
  Field,
  View,
  Schema,
  FieldType,
  ViewType,
  FormFieldMetadataKey,
  ViewFieldMetadataKey,
  SchemaMetadataKey,
  ReflectionUtils,
} from '../ReflectionUtils';

class ParentClass {
  @Field('Parent Name', FieldType.Text)
  public parentName!: string;

  @Schema({ required: true })
  public parentField!: string;
}

class ChildClass extends ParentClass {
  @Field('Child Name', FieldType.TextArea)
  public childName!: string;

  @View('Child View', ViewType.Paragraph)
  public childView!: string;

  @Schema({ required: false })
  public childField!: string;
}

describe('Decorators and ReflectionUtils', () => {
  describe('Field decorator', () => {
    test('should add field metadata to the class', () => {
      const metadata = ReflectionUtils.getOwnMetadata(FormFieldMetadataKey, ChildClass);

      expect(metadata).toEqual([
        { label: 'Child Name', type: FieldType.TextArea, propertyKey: 'childName', options: undefined },
      ]);
    });

    test('should work for multiple classes', () => {
      const parentMetadata = ReflectionUtils.getOwnMetadata(FormFieldMetadataKey, ParentClass);
      expect(parentMetadata).toEqual([
        { label: 'Parent Name', type: FieldType.Text, propertyKey: 'parentName', options: undefined },
      ]);

      const mergedMetadata = ReflectionUtils.getMergedMetadata(FormFieldMetadataKey, ChildClass);
      expect(mergedMetadata).toEqual([
        { label: 'Parent Name', type: FieldType.Text, propertyKey: 'parentName', options: undefined },
        { label: 'Child Name', type: FieldType.TextArea, propertyKey: 'childName', options: undefined },
      ]);
    });
  });

  describe('View decorator', () => {
    test('should add view metadata to the class', () => {
      const metadata = ReflectionUtils.getOwnMetadata(ViewFieldMetadataKey, ChildClass);

      expect(metadata).toEqual([
        { label: 'Child View', type: ViewType.Paragraph, propertyKey: 'childView' },
      ]);
    });

    test('should isolate view metadata for multiple classes', () => {
      const childViewMetadata = ReflectionUtils.getOwnMetadata(ViewFieldMetadataKey, ChildClass);
      expect(childViewMetadata).toEqual([
        { label: 'Child View', type: ViewType.Paragraph, propertyKey: 'childView' },
      ]);
    });
  });

  describe('Schema decorator', () => {
    test('should add schema metadata to the class', () => {
      const metadata = ReflectionUtils.getOwnMetadata(SchemaMetadataKey, ChildClass);

      expect(metadata).toEqual([
        {"propertyKey": "parentField", "required": true}, 
        {"propertyKey": "childField", "required": false}
      ]);
    });

    test('should merge schema metadata from parent and child classes', () => {
      const mergedMetadata = ReflectionUtils.getMergedMetadata(SchemaMetadataKey, ChildClass);

      expect(mergedMetadata).toEqual([
        { required: true, propertyKey: 'parentField' },
        { required: false, propertyKey: 'childField' },
      ]);
    });
  });

  describe('ReflectionUtils', () => {
    test('should retrieve metadata for a specific property', () => {
      const metadata = ReflectionUtils.getMetadataForProperty(
        SchemaMetadataKey,
        ChildClass,
        'childField'
      );

      expect(metadata).toEqual({ propertyKey: "childField", required: false });
    });

    test('should check if metadata exists', () => {
      expect(ReflectionUtils.hasMetadata(SchemaMetadataKey, ChildClass)).toBe(true);
      expect(ReflectionUtils.hasMetadata(SchemaMetadataKey, ParentClass)).toBe(true);
    });

    test('should retrieve all metadata keys defined on a class', () => {
      const keys = ReflectionUtils.getAllMetadataKeys(ChildClass);
      expect(keys).toContain(FormFieldMetadataKey);
      expect(keys).toContain(ViewFieldMetadataKey);
      expect(keys).toContain(SchemaMetadataKey);
    });

    test('should merge metadata across inheritance chain', () => {
      const mergedMetadata = ReflectionUtils.getMergedMetadata(FormFieldMetadataKey, ChildClass);

      expect(mergedMetadata).toEqual([
        { label: 'Parent Name', type: FieldType.Text, propertyKey: 'parentName', options: undefined },
        { label: 'Child Name', type: FieldType.TextArea, propertyKey: 'childName', options: undefined },
      ]);
    });
  });
});
