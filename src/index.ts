import { ObjectSchema, Schema, ValidateOptions } from 'yup';
import 'reflect-metadata';
import * as yup from 'yup';
import { MetadataStorage } from './metadata/metadata-storage';
const metadataStorage = new MetadataStorage();

const schemas = {};
const allSchemas = new Map<Function, ObjectSchema>();

export function getNamedSchema(name: string) {
    return schemas[name];
}

export function getSchemaByType(target: Object) {
    const constructor =
        target instanceof Function ? target : target.constructor;
    return allSchemas.get(constructor);
}

export function namedSchema(
    name: string,
    objectSchema: ObjectSchema = yup.object()
): ClassDecorator {
    return target => {
        objectSchema = defineSchema(target, objectSchema);
        schemas[name] = objectSchema;
        allSchemas.set(target, objectSchema);
    };
}

export function schema(
    objectSchema: ObjectSchema = yup.object()
): ClassDecorator {
    return target => {
        objectSchema = defineSchema(target, objectSchema);
        allSchemas.set(target, objectSchema);
    };
}

function defineSchema(target, objectSchema: ObjectSchema) {
    const schemaMap = metadataStorage.findSchemaMetadata(target);

    const objectShape = Array.from(schemaMap.entries()).reduce(
        (currentShape, [property, schema]) => {
            currentShape[property] = schema;
            return currentShape;
        },
        {}
    );
    return objectSchema.shape(objectShape);
}

export function is<T>(schema: Schema<T>): PropertyDecorator {
    return (target: Object, property: string | symbol) => {
        metadataStorage.addSchemaMetadata({
            target: target instanceof Function ? target : target.constructor,
            property,
            schema,
        });
    };
}

export function nested<T>(): PropertyDecorator {
    return (target: Object, property: string | symbol) => {
        const nestedType = (Reflect as any).getMetadata(
            'design:type',
            target,
            property
        );
        let registeredSchema = getSchemaByType(nestedType);
        if (!registeredSchema) {
            const savedSchema = metadataStorage.findSchemaMetadata(nestedType);
            if (!savedSchema) {
                return;
            }
            // if the schema was not registered via @schema, build one for it automatically
            registeredSchema = yup.object();
            const objectShape = Array.from(savedSchema.entries()).reduce(
                (currentShape, [property, schema]) => {
                    currentShape[property] = schema;
                    return currentShape;
                },
                {}
            );
            registeredSchema = registeredSchema.shape(objectShape);
        }
        metadataStorage.addSchemaMetadata({
            target: target instanceof Function ? target : target.constructor,
            property,
            schema: registeredSchema,
        });
    };
}

export interface IValidateArguments {
    object: object;
    options: ValidateOptions;
    schemaName?: string;
}

export interface IValidatePathArguments {
    object: object;
    options: ValidateOptions;
    schemaName?: string;
    path: string;
}

export function validate({ schemaName, object, options }: IValidateArguments) {
    const objectSchema = getSchema({ object, schemaName });
    return objectSchema.validate(object, options);
}

export function validateSync({
    schemaName,
    object,
    options,
}: IValidateArguments) {
    const objectSchema = getSchema({ object, schemaName });
    return objectSchema.validateSync(object, options);
}

export function validateAt({
    schemaName,
    path,
    object,
    options,
}: IValidatePathArguments) {
    const objectSchema = getSchema({ object, schemaName });
    return objectSchema.validateAt(path, object, options);
}

export function validateSyncAt({
    schemaName,
    path,
    object,
    options,
}: IValidatePathArguments) {
    const objectSchema = getSchema({ object, schemaName });
    return objectSchema.validateSyncAt(path, object, options);
}

export function isValid({ schemaName, object, options }: IValidateArguments) {
    const objectSchema = getSchema({ object, schemaName });
    return objectSchema.isValid(object, options);
}

export function isValidSync({
    schemaName,
    object,
    options,
}: IValidateArguments) {
    const objectSchema = getSchema({ object, schemaName });
    return objectSchema.isValidSync(object, options);
}

function getSchema({ object, schemaName }) {
    if (object === null || typeof object !== 'object') {
        throw new Error('Cannot validate non object types');
    }
    if (schemaName) {
        return getNamedSchema(schemaName);
    }
    return getSchemaByType(object.constructor);
}

export const a = yup;
