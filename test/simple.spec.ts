import {
    cast,
    getNamedSchema,
    isValid,
    isValidSync,
    validate,
    validateAt,
    validateSync,
    validateSyncAt,
    getSchemaByType,
} from '@src/index';
import { expect } from 'chai';
import { Person } from './models/person';
import { House } from './models/house';

describe('validate simple object', function() {
    describe('test validate', function() {
        it('should allow valid objects', async () => {
            const object = getValidObject();
            const actual = await validate({ object, schemaName: Person });
            expect(actual).to.eql(object);
        });

        it('should reject invalid objects', async () => {
            try {
                const object = getInvalidObject();
                await validate({ object, schemaName: Person });
            } catch (e) {
                expect(e.errors).to.deep.eq(['age must be greater than 0']);
            }
        });

        it('should accept validate options', async () => {
            try {
                const object = getInvalidObject();
                await validate({
                    object,
                    schemaName: Person,
                    options: {
                        strict: true,
                        abortEarly: false,
                    },
                });
            } catch (e) {
                expect(e.errors).to.deep.eq([
                    'Not a valid email',
                    'age must be greater than 0',
                    'House type must be one of the following values: UNIT, TOWNHOUSE, VILLA',
                ]);
            }
        });

        it('should infer object type', async () => {
            try {
                const object = getInvalidObject({ includesHouse: false });
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
                    'age must be greater than 0',
                ]);
            }
        });

        it('should use schema name', async () => {
            try {
                const object = getInvalidObject();
                await validate({
                    object,
                    schemaName: 'person',
                    options: {
                        strict: true,
                        abortEarly: false,
                    },
                });
            } catch (e) {
                expect(e.errors).to.deep.eq([
                    'Not a valid email',
                    'age must be greater than 0',
                    'House type must be one of the following values: UNIT, TOWNHOUSE, VILLA',
                ]);
            }
        });
    });

    describe('test validate sync', function() {
        it('should allow valid objects', async () => {
            const object = getValidObject();
            const actual = validateSync({ object, schemaName: Person });
            expect(actual).to.eql(object);
        });

        it('should reject invalid objects', async () => {
            try {
                const object = getInvalidObject();
                validateSync({ object, schemaName: Person });
            } catch (e) {
                expect(e.errors).to.deep.eq([
                    'House type must be one of the following values: UNIT, TOWNHOUSE, VILLA',
                ]);
            }
        });
    });

    describe('validate object path', function() {
        describe('test validateAt', function() {
            it('should allow valid objects', async () => {
                const object = getValidObject();
                const actual = await validateAt({
                    object,
                    schemaName: Person,
                    path: 'email',
                });
                expect(actual).to.eql(object.email);
            });

            it('should reject invalid objects', async () => {
                try {
                    const object = getInvalidObject();
                    await validateAt({
                        object,
                        schemaName: Person,
                        path: 'email',
                    });
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
                        schemaName: Person,
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
                    schemaName: Person,
                    path: 'email',
                });
                expect(actual).to.eql(object.email);
            });

            it('should reject invalid objects', async () => {
                try {
                    const object = getInvalidObject();
                    validateSyncAt({
                        object,
                        schemaName: Person,
                        path: 'email',
                    });
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
                    schemaName: Person,
                });
                expect(result).to.be.true;
            });

            it('should reject invalid objects', async () => {
                const object = getInvalidObject();
                const result = await isValid({ object, schemaName: Person });
                expect(result).to.be.false;
            });
        });

        describe('test isValidSync', function() {
            it('should allow valid objects', async () => {
                const object = getValidObject();
                const actual = isValidSync({
                    object,
                    schemaName: Person,
                });
                expect(actual).to.be.true;
            });

            it('should reject invalid objects', async () => {
                const object = getInvalidObject();
                const actual = isValidSync({
                    object,
                    schemaName: Person,
                });
                expect(actual).to.be.false;
            });
        });
    });

    describe('Testing cast', function() {
        describe('test cast', function() {
            it('should coerce values', async () => {
                const object = getInvalidObject({
                    age: '1',
                    houseType: 'house',
                });
                const actual = cast({ object, schemaName: Person });
                expect(actual).to.deep.equal({
                    ...object,
                    age: 1,
                    house: {
                        ...object.house,
                        address: {
                            location: undefined,
                        },
                        type: 'HOUSE',
                    },
                });
            });
        });
    });

    function getValidObject({
        email,
        age,
        address,
        houseType,
    }: {
        email?: any;
        array?: any;
        age?: any;
        address?: string;
        houseType?: string;
    } = {}) {
        const person = new Person();
        person.age = ifNullOrUndefined(age, 20);
        person.email = email || 'vdtn359@gmail.com';
        person.house = new House();
        person.house.address = {
            location: address || 'Australia',
        };
        person.house.type = houseType || 'VILLA';
        return person;
    }

    function getInvalidObject({
        email,
        age,
        houseType,
        includesHouse = true,
    }: {
        email?: any;
        age?: any;
        houseType?: string;
        includesHouse?: boolean;
    } = {}) {
        const person = new Person();
        person.age = ifNullOrUndefined(age, -1);
        person.email = email || 'vdtn359';
        if (includesHouse) {
            person.house = new House();
            person.house.type = houseType || 'HOUSE';
        }
        return person;
    }
});

describe('Testing getSchema', function() {
    it('should get schema by name', () => {
        expect(
            Object.keys(getNamedSchema('person').describe().fields)
        ).to.deep.equal(['email', 'age', 'house']);
    });

    it('should get schema by type', () => {
        expect(
            Object.keys(getSchemaByType(House).describe().fields)
        ).to.deep.equal(['address', 'type']);
    });
});

function ifNullOrUndefined(value, fallback) {
    return value === undefined || value === null ? fallback : value;
}
