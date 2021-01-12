import { a, is, namedSchema, nested } from '@src/index';
import { House } from './house';

@namedSchema('person')
export class Person {
    @is(a.string().email('Not a valid email'))
    email: string;

    @is(
        a
            .number()
            .lessThan(100)
            .moreThan(0)
    )
    age: number;

    @nested()
    house: House;
}
