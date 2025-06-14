import 'reflect-metadata';

const UNIQUE_PROPERTIES_METADATA_KEY = Symbol('uniqueProperties');

export function UniqueProperty(): PropertyDecorator {
    return (target: Object, propertyKey: string | symbol) => {
        const constructor = target.constructor;
        const uniqueProperties: string[] = Reflect.getMetadata(UNIQUE_PROPERTIES_METADATA_KEY, constructor) || [];
        uniqueProperties.push(propertyKey.toString());
        Reflect.defineMetadata(UNIQUE_PROPERTIES_METADATA_KEY, uniqueProperties, constructor);
    };
}

export function getUniqueProperties(target: Function): string[] {
    return Reflect.getMetadata(UNIQUE_PROPERTIES_METADATA_KEY, target) || [];
}
