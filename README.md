# digup nested object selector

`digup-ts` handles nested objects and arrays,
without throwing error `Cannot read property 'x' of undefined`.

#### Features
- Typescript support, for proper code-completion while coding.
- Supported by all browsers 
- Light weight
- Supports arrays

#### Install

```bash
npm i --save digup-ts
```

#### Requirements

- TypeScript >= 2.9

## Example `dig` Usage

```typescript
import { digup } from 'digup-ts';

// Let's pretend abc is unpredictable and maybe incomplete.
const response = {a:
                    {b: [
                          {c: 'First'}, 
                          {c: 'Second'}
                        ]
                    }
                  };
let first = digup(response, 'a', 'b', 0, 'c'); // 'First'
let maybe = digup(response, 'a', 'b', 9, 'c'); // undefined
let str   = digup(response, ['a', 'b', 9, 'c'], 'unknown'); // 'unknown'
```
As you can see, it accepts a default value, like 'unknown'. 
Just wrap the keys in an array.

## Typescript support

Typescript is fully supported, so your editor points out missing properties.
```
let X = digup(response, 'X'); // typescript error 'X' doesn't exist...
```

## Array find

The examples below all use the following data:
```typescript
const store = {
    customers: [
        {name: 'A', age:20}, // missing purchases
        {name: 'B', // missing age
            purchases: [
                {name: 'shoes', price:10}
            ]
        },
        {name: 'C', age:60,
            purchases: [
                {name: 'flipflops'}, // missing price
                {name: 'boots', price:20}
            ]
        },
        {}, // missing name + purchases
        {purchases: [{name: 'boots', price:20}]} // missing name
    ]
}
```
## Array.find among keys

Use a function to find a single item in an array.
```typescript
import { dig, last } from 'dig-ts';

// Get customer C using a function
const customerC = digup(store, 'customers', cust=>cust.name=='C');

// Get price of boots of customer C (or 0 if not found)
const price = digup(store, 'customers', cust=>cust.name=='C', 'purchases', pur=>pur.name=='boots', 'price');

// 'last' function is included in dig-ts
const lastSale = digup(store, 'customers', last, 'purchases', last); // boots object

```

## Alternatives
Logical expressions are very verbose for long paths.
```
let c2 = (abc.a && abc.a.b && abc.a.b[9] && abc.a.b[9].c) || 'C-9'
```
[`Lodash`](https://lodash.com/) `get(...)` is more compact, 
but removes typescript support.

```typescript
import { get } from 'lodash';

let c9 = get(abc, 'a.b[1].c', 'C-1');
```

[`ts-optchain`](https://www.npmjs.com/package/ts-optchain) preserves typescript typings and has an elegant syntax. 
Unfortunately it requires Proxy. 
Please consider this option if the [browser support](https://caniuse.com/#search=proxy) suits your project.

```typescript
import { oc } from 'ts-optchain';

let c1 = oc(abc).b.c('C-1');
```
With [`ts-safe`](https://www.npmjs.com/package/ts-save) you provide an anonymous function and optional default value. Any runtime errors are caught and ignored. However, optional properties might be a problem. Full disclosure: I wrote ts-safe.
```typescript
import { safe } from 'ts-safe';

let abc = {a:{b:{c:'C'}}}; // Let's pretend abc isn't so predictable.

let c = safe(_=>a.b.c, 'C-default');
```
More alternatives:

- https://github.com/facebookincubator/idx
- https://github.com/yayoc/optional-chain

### Type Preservation

`dig-ts` preserves TypeScript typings and code-completion by IDEs like Visual Studio Code or WebStorm.

```typescript
const abc = {a: {b: {c: 'C'}}};

let b = digup(_=> abc.a.b, {c:'C default'});

console.log(b.c) // When typing 'b' your code editor suggests '.c'
```


### Optional properties

To traverse optional properties, wrap your object in the `all` function, included in `ts-digup`. 
```typescript
import { digup } from 'dig-ts';

// Everything is optional.
type ABCDE = {a?: {b?: {c?: {d?: {e?: string}}}}}
const abc:ABCDE = {
    a:{
        b: {
            c: {} // incomplete.
        }
    }
};

let e1 = digup(abc, 'a', 'b', 'c', 'd');
```

Note: the `all` function tells typescript all (nested) properties exits. 
This affects the return value. For instance, using `abc` from before: 
```typescript
// 'all' tells typescript not to worry whether anything exists.
let c = digup(_=> all(abc).a.b.c);

if (c) {
    // When c exists, typescript falsely assumes d and e exist.
    console.log(c.d.e); // RUNTIME error: Cannot read property
    
    // This works. Typscript normally enforces this. Now it's up to you. 
    if (c.d) {
        console.log(c.d.e);
    }
}
```
Please keep this in mind when using optional properties.

## License

`dig-ts` is MIT Licensed.
