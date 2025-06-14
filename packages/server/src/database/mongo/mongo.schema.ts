import { ReflectionUtils, SchemaMetadataKey } from '@vannatta-software/ts-utils-core';
import { UniqueIdentifier } from '@vannatta-software/ts-utils-domain'; // Use UniqueIdentifier
import { Schema } from 'mongoose';
import 'reflect-metadata';
import { v4 as uuid } from "uuid";

interface IMetaprop {
    propertyKey: string,
    type: any,
    ignore?: boolean,
    embedded: boolean,
    enumeration: boolean,
    items: any,
    enum: string[]
}

type ISchema = Record<string, any>

function isSchema(obj: any): obj is Schema {
    return obj.obj != undefined;
}

export class Mongo {
    public static Schema(targetClass: any, depth = 0): Schema {
        if (!targetClass || depth > 5) return new Schema({}, { _id: false });
    
        const props = ReflectionUtils.getOwnMetadata(SchemaMetadataKey, targetClass);
        const schema: ISchema = {};
    
        props.forEach((options: IMetaprop) => {
            const key = options.propertyKey;
    
            if (options.ignore) return;
    
            if (options.type === UniqueIdentifier) { // Use UniqueIdentifier
                schema[key === "id" ? "_id" : key] = {
                    type: String,
                    default: key === "id" ? uuid : undefined,
                };
            } else if (Array.isArray(options.type)) {
                if (options.embedded)
                    schema[key] = { type: [Mongo.Schema(options.type[0])] };
                else
                    schema[key] = { type: options.type };
            } else if (options.embedded || options.enumeration) {
                schema[key] = Mongo.Schema(options.type, depth + 1);
            } else if (options.enum) {
                schema[key] = { type: String, enum: options.enum };
            } else {
                schema[key] = { type: options.type.name || options.type };
            }
        });
    
        return new Schema(schema, { _id: depth === 0 });
    }

    public static extractSchema(schema: Schema): ISchema {
        if (!schema || !schema.obj) return {};
    
        let result: ISchema = {};
    
        Object.entries(schema.obj).forEach((entry) => {
            const key = entry[0];
            const value = entry[1];
    
            if (isSchema(value)) {
                result[key] = Mongo.extractSchema(value as Schema);
                return;
            }
    
            result[key] = value;
        })
    
        return result;
    }
}
