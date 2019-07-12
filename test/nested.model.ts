import { is, a, an, nested, schema } from '@src/index';

@schema(an.object().required())
export class NestedChildModel {
    @is(a.string().uppercase())
    uppercase: string;
}

export class NestedModel {
    @is(
        an
            .array()
            .of(a.number())
            .min(2)
            .max(3)
    )
    array: number[];

    @nested()
    child: NestedChildModel;
}
