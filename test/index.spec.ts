import { Model } from './test.model';
import { NestedChildModel, NestedModel } from './nested.model';
import { validateSync } from '@src/index';

const model = new Model();
model.num = 6;
model.email = 'test';
model.nested = new NestedModel();
model.nested.array = [1, 2, 3, 4, 5, 6];
model.nested.child = new NestedChildModel();
model.nested.child.childString = 'hii';

describe('test here', function() {
    it('test validate', function() {
        try {
            validateSync({
                object: model,
                options: {
                    abortEarly: false,
                    stripUnknown: true,
                    strict: true,
                },
            });
        } catch (e) {
            console.log(e.errors);
        }
    });
});
