import { getNamedSchema, getSchemaByType, validate } from '@src/index';
import { expect } from 'chai';
import { Employee } from './models/employee';
import { House } from './models/house';
import { Job } from './models/job';

describe('validate complex object', function() {
    describe('test validate', function() {
        it('should allow valid objects', async () => {
            const object = getValidObject();
            const actual = await validate({ object, schemaName: Employee });
            expect(actual).to.eql(object);
        });

        it('should reject invalid objects', async () => {
            try {
                const object = getInvalidObject();
                await validate({ object, schemaName: Employee });
            } catch (e) {
                expect(e.errors).to.deep.eq(['Employee ID is required']);
            }
        });

        it('should accept validate options', async () => {
            try {
                const object = getInvalidObject();
                await validate({
                    object,
                    schemaName: Employee,
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
                    'Job title must be upper case',
                    'Office name is required',
                    'Office location is required',
                    'Employee ID is required',
                ]);
            }

            try {
                const object = getInvalidObject({ includesJob: false });
                await validate({
                    object,
                    schemaName: Employee,
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
                    'Job is required',
                    'Employee ID is required',
                ]);
            }

            try {
                const object = getInvalidObject({ includesOffice: false });
                await validate({
                    object,
                    schemaName: Employee,
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
                    'Job title is required and must be upper case',
                    'Employee ID is required',
                ]);
            }

            try {
                const object = getInvalidObject({ includesHouse: false });
                await validate({
                    object,
                    schemaName: Employee,
                    options: {
                        strict: true,
                        abortEarly: false,
                    },
                });
            } catch (e) {
                expect(e.errors).to.deep.eq([
                    'Not a valid email',
                    'age must be greater than 0',
                    'Job title must be upper case',
                    'Office name is required',
                    'Office location is required',
                    'Employee ID is required',
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
                    'Job title must be upper case',
                    'Office name is required',
                    'Office location is required',
                    'Employee ID is required',
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
        const person = new Employee();
        person.employeeId = '123';
        person.age = ifNullOrUndefined(age, 20);
        person.email = email || 'vdtn359@gmail.com';
        person.house = new House();
        person.house.address = {
            location: address || 'Australia',
        };
        person.house.type = houseType || 'VILLA';
        person.job = new Job();
        person.job.office = [
            {
                location: 'Wynyard',
                name: 'South Office',
            },
            {
                location: 'North Sydney',
                name: 'North Office',
            },
        ];
        person.job.jobTitle = 'DEVELOPER';
        return person;
    }

    function getInvalidObject({
        email,
        age,
        houseType,
        includesHouse = true,
        includesJob = true,
        includesOffice = true,
    }: {
        email?: any;
        age?: any;
        houseType?: string;
        includesHouse?: boolean;
        includesJob?: boolean;
        includesOffice?: boolean;
    } = {}) {
        const person = new Employee();
        person.age = ifNullOrUndefined(age, -1);
        person.email = email || 'vdtn359';
        if (includesHouse) {
            person.house = new House();
            person.house.type = houseType || 'HOUSE';
        }
        if (includesJob) {
            person.job = new Job();
            if (includesOffice) {
                person.job.office = [{} as any];
                person.job.jobTitle = 'dev';
            }
        }
        return person;
    }
});

describe('Testing getSchema', function() {
    it('should get schema by name', () => {
        expect(
            Object.keys(getNamedSchema('employee').describe().fields)
        ).to.deep.equal(['email', 'age', 'house', 'job', 'employeeId']);
    });

    it('should get schema by type', () => {
        expect(
            Object.keys(getSchemaByType(Employee).describe().fields)
        ).to.deep.equal(['email', 'age', 'house', 'job', 'employeeId']);
    });
});

function ifNullOrUndefined(value, fallback) {
    return value === undefined || value === null ? fallback : value;
}
