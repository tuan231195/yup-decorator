import { a, an, is, namedSchema, nested } from '@src/index';
import { Job } from './job';
import { Person } from './person';

@namedSchema('employee')
export class Employee extends Person {
    @nested(an.object().required('Job is required'))
    job: Job;

    @is(a.string().required('Employee ID is required'))
    employeeId: string;
}
