// import { Entity as TypeOrmEntityDecorator, PrimaryColumn, Column, ObjectType } from 'typeorm';
// import { ReflectionUtils, SchemaMetadataKey } from '@vannatta-software/ts-utils-core';
// import { UniqueIdentifier, Entity } from '@vannatta-software/ts-utils-domain'; // Use UniqueIdentifier
// import 'reflect-metadata';

// interface IMetaprop {
//     propertyKey: string,
//     type: any,
//     ignore?: boolean,
//     embedded: boolean,
//     enumeration: boolean,
//     items: any,
//     enum: string[]
// }

// export class PostgresSchema {
//     public static getTypeOrmEntity<T extends Entity>(entityClass: new (...args: any[]) => T): ObjectType<any> {
//         const props = ReflectionUtils.getOwnMetadata(SchemaMetadataKey, entityClass);
//         const columns: { propertyKey: string, type: any, options?: any }[] = [];

//         props.forEach((options: IMetaprop) => {
//             const key = options.propertyKey;
//             if (options.ignore) return;

//             let columnType: any;
//             let columnOptions: any = {};

//             if (options.type === UniqueIdentifier) { // Use UniqueIdentifier
//                 columnType = String;
//                 columnOptions = { primary: true };
//             } else if (options.enumeration) {
//                 columnType = String;
//                 columnOptions = { enum: options.enum };
//             } else if (options.embedded) {
//                 columnType = 'jsonb';
//             } else {
//                 switch (options.type) {
//                     case String: columnType = String; break;
//                     case Number: columnType = Number; break;
//                     case Boolean: columnType = Boolean; break;
//                     case Date: columnType = Date; break;
//                     default: columnType = String;
//                 }
//             }
//             columns.push({ propertyKey: key, type: columnType, options: columnOptions });
//         });

//         const DynamicTypeOrmEntity = class {
//             constructor(data?: Partial<T>) {
//                 if (data) {
//                     for (const col of columns) {
//                         if (col.propertyKey === 'id' && (data as any).id?.value) {
//                             (this as any)[col.propertyKey] = (data as any).id.value;
//                         } else if (data[col.propertyKey as keyof T]) {
//                             (this as any)[col.propertyKey] = data[col.propertyKey as keyof T];
//                         }
//                     }
//                 }
//             }
//         };

//         Object.defineProperty(DynamicTypeOrmEntity, 'name', { value: entityClass.name });
//         TypeOrmEntityDecorator({ name: entityClass.name })(DynamicTypeOrmEntity);

//         columns.forEach(col => {
//             if (col.propertyKey === 'id') {
//                 PrimaryColumn()(DynamicTypeOrmEntity.prototype, col.propertyKey);
//             } else {
//                 Column(col.options)(DynamicTypeOrmEntity.prototype, col.propertyKey);
//             }
//         });

//         return DynamicTypeOrmEntity;
//     }
// }
