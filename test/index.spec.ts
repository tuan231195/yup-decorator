import { Model } from './test.model';
import { NestedChildModel, NestedModel } from './nested.model';
import {
    cast,
    getNamedSchema,
    getSchemaByType,
    isValid,
    isValidSync,
    validate,
    validateAt,
    validateSync,
    validateSyncAt,
} from '@src/index';
import { expect } from 'chai';

describe('validate object', function() {
    describe('test validate', function() {
        it('should allow valid objects', async () => {
            const object = getValidObject();
            const actual = await validate({ object, schemaName: Model });
            expect(actual).to.eql(object);
        });

        it('should reject invalid objects', async () => {
            try {
                const object = getInvalidObject();
                await validate({ object, schemaName: Model });
            } catch (e) {
                expect(e.errors).to.deep.eq(['num must be less than 5']);
            }
        });

        it('should accept validate options', async () => {
            try {
                const object = getInvalidObject();
                await validate({
                    object,
                    schemaName: Model,
                    options: {
                        strict: true,
                        abortEarly: false,
                    },
                });
            } catch (e) {
                expect(e.errors).to.deep.eq([
                    'Not a valid email',
                    'num must be less than 5',
                    'nested.array field must have less than or equal to 3 items',
                    'nested.child.uppercase must be a upper case string',
                ]);
            }
        });

        it('should infer object type', async () => {
            try {
                const object = getInvalidObject();
                await validate({
                    object,
                    options: {
                        strict: true,
                        abortEarly: false,
                    },
                });
            } catch (e) {
                expect(e.errors).to.deep.eq([
                    'Not a valid email',
                    'num must be less than 5',
                    'nested.array field must have less than or equal to 3 items',
                    'nested.child.uppercase must be a upper case string',
                ]);
            }
        });

        it('should use schema name', async () => {
            try {
                const object = getInvalidObject();
                await validate({
                    object,
                    schemaName: 'model',
                    options: {
                        strict: true,
                        abortEarly: false,
                    },
                });
            } catch (e) {
                expect(e.errors).to.deep.eq([
                    'Not a valid email',
                    'num must be less than 5',
                    'nested.array field must have less than or equal to 3 items',
                    'nested.child.uppercase must be a upper case string',
                ]);
            }
        });
    });

    describe('test validate sync', function() {
        it('should allow valid objects', async () => {
            const object = getValidObject();
            const actual = validateSync({ object, schemaName: Model });
            expect(actual).to.eql(object);
        });

        it('should reject invalid objects', async () => {
            try {
                const object = getInvalidObject();
                validateSync({ object, schemaName: Model });
            } catch (e) {
                expect(e.errors).to.deep.eq([
                    'nested.array field must have less than or equal to 3 items',
                ]);
            }
        });
    });
});

describe('validate object path', function() {
    describe('test validateAt', function() {
        it('should allow valid objects', async () => {
            const object = getValidObject();
            const actual = await validateAt({
                object,
                schemaName: Model,
                path: 'email',
            });
            expect(actual).to.eql(object.email);
        });

        it('should reject invalid objects', async () => {
            try {
                const object = getInvalidObject();
                await validateAt({ object, schemaName: Model, path: 'email' });
            } catch (e) {
                expect(e.errors).to.deep.eq(['Not a valid email']);
            }
        });

        it('should accept validate options', async () => {
            try {
                const object = getInvalidObject({ email: 1 });
                await validateAt({
                    path: 'email',
                    object,
                    schemaName: Model,
                    options: {
                        strict: true,
                    },
                });
            } catch (e) {
                expect(e.errors).to.deep.eq([
                    'email must be a `string` type, but the final value was: `1`.',
                ]);
            }
        });
    });

    describe('test validateAtSync', function() {
        it('should allow valid objects', async () => {
            const object = getValidObject();
            const actual = validateSyncAt({
                object,
                schemaName: Model,
                path: 'email',
            });
            expect(actual).to.eql(object.email);
        });

        it('should reject invalid objects', async () => {
            try {
                const object = getInvalidObject();
                validateSyncAt({ object, schemaName: Model, path: 'email' });
            } catch (e) {
                expect(e.errors).to.deep.eq(['Not a valid email']);
            }
        });
    });
});

describe('Testing isValid', function() {
    describe('test isValid', function() {
        it('should allow valid objects', async () => {
            const object = getValidObject();
            const result = await isValid({
                object,
                schemaName: Model,
            });
            expect(result).to.be.true;
        });

        it('should reject invalid objects', async () => {
            const object = getInvalidObject();
            const result = await isValid({ object, schemaName: Model });
            expect(result).to.be.false;
        });
    });

    describe('test isValidSync', function() {
        it('should allow valid objects', async () => {
            const object = getValidObject();
            const actual = isValidSync({
                object,
                schemaName: Model,
            });
            expect(actual).to.be.true;
        });

        it('should reject invalid objects', async () => {
            const object = getInvalidObject();
            const actual = isValidSync({
                object,
                schemaName: Model,
            });
            expect(actual).to.be.false;
        });
    });
});

describe('Testing cast', function() {
    describe('test cast', function() {
        it('should coerce values', async () => {
            const object = getInvalidObject({
                num: '1',
                uppercase: 'lowercase',
            });
            const actual = cast({ object, schemaName: Model });
            expect(actual).to.deep.equal({
                ...object,
                num: 1,
                nested: {
                    ...object.nested,
                    child: {
                        ...object.nested.child,
                        uppercase: 'LOWERCASE',
                    },
                },
            });
        });
    });
});

describe('Testing getSchema', function() {
    it('should get schema by name', () => {
        expect(
            Object.keys(getNamedSchema('model').describe().fields)
        ).to.deep.equal(['email', 'num', 'nested']);
    });

    it('should get schema by type', () => {
        expect(
            Object.keys(getSchemaByType(NestedModel).describe().fields)
        ).to.deep.equal(['array', 'child']);
    });
});

function getValidObject({
    email,
    array,
    num,
    uppercase,
}: { email?: any; array?: any; num?: any; uppercase?: any } = {}) {
    const model = new Model();
    model.num = ifNullOrUndefined(num, 3);
    model.email = email || 'vdtn359@gmail.com';
    model.nested = new NestedModel();
    model.nested.array = array || [1, 2, 3];
    model.nested.child = new NestedChildModel();
    model.nested.child.uppercase = uppercase || 'UPPERCASE';
    return model;
}

function getInvalidObject({
    email,
    array,
    num,
    uppercase,
}: { email?: any; array?: any; num?: any; uppercase?: any } = {}) {
    const model = new Model();
    model.num = ifNullOrUndefined(num, 5);
    model.email = email || 'vdtn359';
    model.nested = new NestedModel();
    model.nested.array = array || [1, 2, 3, 4, 5];
    model.nested.child = new NestedChildModel();
    model.nested.child.uppercase = uppercase || 'lowercase';
    return model;
}

function ifNullOrUndefined(value, fallback) {
    return value === undefined || value === null ? fallback : value;
}
