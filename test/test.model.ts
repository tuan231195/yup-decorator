import { a, is, namedSchema, nested } from '@src/index';
import { NestedModel } from './nested.model';

@namedSchema('model')
export class Model {
    @is(a.string().email('Not a valid email'))
    email: string;

    @is(
        a
            .number()
            .lessThan(5)
            .moreThan(0)
    )
    num: number;

    @nested()
    nested: NestedModel;
}
