import { is, a, nested, schema } from '@src/index';

@schema(a.object().required())
export class NestedChildModel {
    @is(a.string().uppercase())
    childString: string;
}

export class NestedModel {
    @is(
        a
            .array()
            .of(a.number())
            .min(2)
            .max(3)
    )
    array: number[];

    @nested()
    child: NestedChildModel;
}
