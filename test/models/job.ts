import { is, a, an, nested, namedSchema, nestedArray } from '@src/index';

export class Office {
    @is(a.string().required('Office name is required'))
    name: string;

    @is(a.string().required('Office location is required'))
    location: string;
}

@namedSchema('job')
export class Job {
    @is(
        a
            .string()
            .uppercase('Job title must be upper case')
            .required('Job title is required and must be upper case')
    )
    jobTitle: string;

    @nestedArray(() => Office, an.array().min(1, 'Office is required'))
    office: Office[];
}
