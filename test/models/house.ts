import { is, a, nested, namedSchema, nestedType } from '@src/index';

export class Address {
    @is(a.string().required('House address is required'))
    location: string;
}

@namedSchema('house')
export class House {
    @nestedType(() => Address)
    address: Address;

    @is(
        a
            .string()
            .uppercase('House type must be uppercase')
            .oneOf(
                ['UNIT', 'TOWNHOUSE', 'VILLA'],
                'House type must be one of the following values: UNIT, TOWNHOUSE, VILLA'
            )
            .required('House type is required')
    )
    type: string;
}
