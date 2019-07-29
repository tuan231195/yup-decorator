[![Greenkeeper badge](https://badges.greenkeeper.io/vdtn359/yup-decorator.svg)](https://greenkeeper.io/)
[![Build Status](https://travis-ci.org/vdtn359/yup-decorator.svg?branch=master)](https://travis-ci.org/vdtn359/yup-decorator)
[![codecov](https://codecov.io/gh/vdtn359/yup-decorator/branch/master/graph/badge.svg)](https://codecov.io/gh/vdtn359/yup-decorator)

## Yup Decorators
Added TypeScript decorators support for [yup](https://github.com/jquense/yup)

### Usage
* Named schema

```typescript
import { a, is, namedSchema, getNamedSchema } from 'yup-decorator';

@namedSchema('user')
class User {
	constructor({ email, age }) {
		this.email = email;
		this.age = age;
	}
	@is(a.string().email('Not a valid email'))
	email: string;

	@is(a.number().lessThan(80).moreThan(10))
	age: number;
}

// you can get the yup schema with
const userSchema = getNamedSchema('user');
```

* Unnamed schema

```typescript
import { schema, getSchemaByType } from 'yup-decorator';

@schema()
class User {
	...
}

// you can get the yup schema with
const userSchema = getSchemaByType(User);
```

* Nested validation
```typescript

import { is, a, an, nested, schema } from 'yup-decorator';

@schema(an.object().required())
export class NestedChildModel {
    @is(a.string().uppercase())
    uppercase: string;
}

@schema()
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
```

* Validate:
```typescript
import { validate } from 'yup-decorator';

const user = new User({ email: 'vdtn359', age: 23 });

validate({ object: user, options: {
    strict: true,
    abortEarly: false,
}}).then(err => {
    // err.name; // => 'ValidationError'
    // err.errors; // => ['Not a valid email']
});

// you can also pass in the schema name as a string or a constructor
validate({ object: user, schemaName: 'user' });
validate({ object: user, schemaName: User });
```
The sync version is `validateSync`

* Check if object is valid or not

```typescript
import { isValid } from 'yup-decorator';
isValid({ object: user }).then(isValid => console.log(isValid));
```
The sync version is `isValidSync`

* Validate property at path

```typescript
import { validateAt } from 'yup-decorator';
validateAt({ object: user, path: 'email' }).then(e => console.error(e));
```
The sync version is `validateSyncAt`


* Cast object. 

This will coerce the property's value according to its type

```typescript
import { cast } from 'yup-decorator';
const user = new User({ email: 'vdtn359', age: '18' });
const result = cast({ object: user });
result // {email: 'vdtn359@gmail.com', age: 18 }
```
The sync version is `isValidSync`

### API usage

The API documentation is available at http://luxuriant-sneeze.surge.sh/


