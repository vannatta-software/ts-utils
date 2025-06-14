import { ReflectionUtils, SchemaMetadataKey } from '@vannatta-software/ts-utils-core';
import { Entity, UniqueIdentifier } from '@vannatta-software/ts-utils-domain'; // Use UniqueIdentifier
import 'reflect-metadata';

interface IMetaprop {
    propertyKey: string,
    type: any,
    ignore?: boolean,
    embedded: boolean,
    enumeration: boolean,
    items: any,
    enum: string[]
}

export class Neo4jSchema {
    public static extractProperties(entity: Entity): Record<string, any> {
        const properties: Record<string, any> = {};
        const props = ReflectionUtils.getOwnMetadata(SchemaMetadataKey, entity.constructor);

        props.forEach((options: IMetaprop) => {
            const key = options.propertyKey;

            if (options.ignore) return;

            if (options.type === UniqueIdentifier) { // Use UniqueIdentifier
                properties[key] = entity[key as keyof Entity].value;
            } else if (options.embedded || options.enumeration) {
                // For embedded objects, recursively extract properties
                properties[key] = entity[key as keyof Entity];
            } else {
                properties[key] = entity[key as keyof Entity];
            }
        });

        // Ensure the 'id' property is always included for matching
        if (entity.id && entity.id.value) {
            properties['id'] = entity.id.value;
        }

        return properties;
    }
}
