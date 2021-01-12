import { ArraySchema, ObjectSchema, Schema, ValidateOptions } from 'yup';
import 'reflect-metadata';
import * as yup from 'yup';
import { MetadataStorage } from './metadata/metadata-storage';
const metadataStorage = new MetadataStorage();

const schemas: { [key: string]: ObjectSchema } = {};
const allSchemas = new Map<Function, ObjectSchema>();

/**
 * Get the schema by name
 * @param name Name of the schema
 * @returns The yup schema
 */
export function getNamedSchema(name: string) {
    return schemas[name];
}

/**
 * Get the schema by type
 * @param target the object's type (class)
 * @returns The yup schema
 */
export function getSchemaByType(target: Object) {
    const constructor =
        target instanceof Function ? target : target.constructor;
    return allSchemas.get(constructor);
}

/**
 * Register a new named schema
 * @param name the schema name
 * @param objectSchema The initial schema
 */
export function namedSchema(
    name: string,
    objectSchema: ObjectSchema = yup.object()
): ClassDecorator {
    return target => {
        objectSchema = defineSchema(target, objectSchema);
        schemas[name] = objectSchema;
    };
}

/**
 * Register a schema
 * @param objectSchema The initial schema
 */
export function schema(
    objectSchema: ObjectSchema = yup.object()
): ClassDecorator {
    return target => {
        defineSchema(target, objectSchema);
    };
}

/**
 * Register a schema to the given property
 * @param schema the schema to register
 */
export function is(schema: Schema<any>): PropertyDecorator {
    return (target: Object, property: string | symbol) => {
        metadataStorage.addSchemaMetadata({
            target: target instanceof Function ? target : target.constructor,
            property,
            schema,
        });
    };
}

/**
 * Register an array property
 * @param typeFunction: a function that returns type of the element
 * @param arraySchema: the array schema
 * @param elementSchema: an optional object schema
 */
export function nestedArray(
    typeFunction: () => any,
    arraySchema: ArraySchema<any> = yup.array(),
    elementSchema?: ObjectSchema<any>
): PropertyDecorator {
    return (target: Object, property: string | symbol) => {
        const nestedType = typeFunction();
        const nestedElementSchema: Schema<any> = getObjectSchema(
            nestedType,
            elementSchema
        );

        metadataStorage.addSchemaMetadata({
            target: target instanceof Function ? target : target.constructor,
            property,
            schema: arraySchema.of(nestedElementSchema),
        });
    };
}

/**
 * Register an object schema to the given property. Use this when the property type is unknown
 * @param typeFunction:  a function that returns type of the element
 * @param objectSchema: an optional object schema
 */
export function nestedType(
    typeFunction: () => any,
    objectSchema?: ObjectSchema<any>
): PropertyDecorator {
    return (target: Object, property: string | symbol) => {
        const nestedType = typeFunction();

        const nestedSchema = getObjectSchema(nestedType, objectSchema);

        if (!nestedSchema) {
            return;
        }

        metadataStorage.addSchemaMetadata({
            target: target instanceof Function ? target : target.constructor,
            property,
            schema: nestedSchema,
        });
    };
}

/**
 * Register an object schema to the given property. Use this when the property type is known and can be extracted using reflect-metadata
 * @param objectSchema: an optional object schema
 *
 */
export function nested(objectSchema?: ObjectSchema<any>): PropertyDecorator {
    return (target: Object, property: string | symbol) => {
        const nestedType = (Reflect as any).getMetadata(
            'design:type',
            target,
            property
        );

        const nestedSchema = getObjectSchema(nestedType, objectSchema);

        if (!nestedSchema) {
            return;
        }

        metadataStorage.addSchemaMetadata({
            target: target instanceof Function ? target : target.constructor,
            property,
            schema: nestedSchema,
        });
    };
}

function getObjectSchema(
    type: any,
    predefinedObjectSchema?: ObjectSchema<any>
) {
    let nestedSchema: Schema<any>;
    if (predefinedObjectSchema) {
        nestedSchema = defineSchema(type, predefinedObjectSchema.clone());
    } else {
        // if there is no explicit object schema specified, try getting it from the type
        nestedSchema = getSchemaByType(type);
        if (!nestedSchema) {
            // if the schema was not registered via @schema, build one for it automatically
            nestedSchema = defineSchema(type, yup.object());
        }
    }
    return nestedSchema;
}

export interface IValidateArguments {
    object: object;
    options?: ValidateOptions;
    schemaName?: string | Function;
}

export interface IValidatePathArguments {
    object: object;
    options?: ValidateOptions;
    schemaName?: string | Function;
    path: string;
}

/**
 * Validate an object asynchronously
 * @param args the validate arguments
 * @param args.schemaName the name of the schema to use
 * @param args.object the object to validate
 * @param args.options validate options
 */
export function validate({ schemaName, object, options }: IValidateArguments) {
    const objectSchema = getSchema({ object, schemaName });
    return objectSchema.validate(object, options);
}

/**
 * Validate an object synchronously
 * @param args the validate arguments
 * @param args.schemaName the name of the schema to use
 * @param args.object the object to validate
 * @param args.options validate options
 */
export function validateSync({
    schemaName,
    object,
    options,
}: IValidateArguments) {
    const objectSchema = getSchema({ object, schemaName });
    return objectSchema.validateSync(object, options);
}

/**
 * Validate an object's property asynchronously
 * @param args the validate arguments
 * @param args.schemaName the name of the schema to use
 * @param args.path the property path
 * @param args.object the object to validate
 * @param args.options validate options
 */
export function validateAt({
    schemaName,
    path,
    object,
    options,
}: IValidatePathArguments) {
    const objectSchema = getSchema({ object, schemaName });
    return objectSchema.validateAt(path, object, options);
}

/**
 * Validate an object's property synchronously
 * @param args the validate arguments
 * @param args.schemaName the name of the schema to use
 * @param args.path the property path
 * @param args.object the object to validate
 * @param args.options validate options
 */
export function validateSyncAt({
    schemaName,
    path,
    object,
    options,
}: IValidatePathArguments) {
    const objectSchema = getSchema({ object, schemaName });
    return objectSchema.validateSyncAt(path, object, options);
}

/**
 * Check if an object is valid asynchronously
 * @param args the validate arguments
 * @param args.schemaName the name of the schema to use
 * @param args.object the object to validate
 * @param args.options validate options
 * @returns whether the object is valid
 */
export function isValid({ schemaName, object, options }: IValidateArguments) {
    const objectSchema = getSchema({ object, schemaName });
    return objectSchema.isValid(object, options);
}

/**
 * Check if an object is valid synchronously
 * @param args the validate arguments
 * @param args.schemaName the name of the schema to use
 * @param args.object the object to validate
 * @param args.options validate options
 * @returns whether the object is valid
 */
export function isValidSync({
    schemaName,
    object,
    options,
}: IValidateArguments) {
    const objectSchema = getSchema({ object, schemaName });
    return objectSchema.isValidSync(object, options);
}

/**
 * Coerce object's property according to the schema
 * @param args the validate arguments
 * @param args.schemaName the name of the schema to use
 * @param args.object the object to validate
 * @param args.options validate options
 * @returns the object that has been transformed
 */
export function cast({ schemaName, object, options }: IValidateArguments) {
    const objectSchema = getSchema({ object, schemaName });
    return objectSchema.cast(object, options);
}

function getSchema({ object, schemaName }) {
    if (object === null || typeof object !== 'object') {
        throw new Error('Cannot validate non object types');
    }
    if (typeof schemaName === 'string') {
        return getNamedSchema(schemaName);
    }

    return getSchemaByType(schemaName || object.constructor);
}

export const a = yup;
export const an = yup;

function defineSchema(target, objectSchema: ObjectSchema) {
    const schemaMap = metadataStorage.findSchemaMetadata(target);

    if (!schemaMap) {
        return;
    }
    const objectShape = Array.from(schemaMap.entries()).reduce(
        (currentShape, [property, schema]) => {
            currentShape[property] = schema;
            return currentShape;
        },
        {}
    );
    objectSchema = objectSchema.shape(objectShape);
    allSchemas.set(target, objectSchema);
    return objectSchema;
}
