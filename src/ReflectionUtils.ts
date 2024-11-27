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

export function Field(label: string, type: FieldType = FieldType.Text, options?: object) {
    return function (target: any, propertyKey: string) {
        const fields = Reflect.get(target.constructor, FormFieldMetadataKey) || [];

        fields.push({ label, type, propertyKey, options });

        Reflect.defineProperty(target.constructor, FormFieldMetadataKey, fields);
    };

}

export const ViewFieldMetadataKey = Symbol('ViewField');

export function View(label: string, type: ViewType = ViewType.Text) {
    return function (target: any, propertyKey: string) {
        const fields = Reflect.get(target.constructor, ViewFieldMetadataKey) || [];
        
        fields.push({ label, type, propertyKey });

        Reflect.defineProperty(target.constructor, ViewFieldMetadataKey, fields);
    };
}

export const SchemaMetadataKey = Symbol('Schema');

export function Schema(options: any) {
    return function (target: any, propertyKey: string) {
        const parentFields = Reflect.get(Object.getPrototypeOf(target).constructor, SchemaMetadataKey) || {};
        const ownFields = Reflect.get(target.constructor, SchemaMetadataKey) || {};

        const fields = { ...parentFields, ...ownFields };
        fields[propertyKey] = options;
        Reflect.defineProperty(target.constructor, SchemaMetadataKey, fields);
    };
}