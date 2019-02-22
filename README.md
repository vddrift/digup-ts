# dig nested object selector

`digup-ts` handles nested objects and arrays,
without throwing error `Cannot read property 'x' of undefined`.

#### Features
- Typescript support, for proper code-completion while coding.
- Supported by all browsers 
- Light weight
- Supports arrays

If you need more features like setting, removing and transforming nested properties,
try [`dig-ts`](https://www.npmjs.com/package/dig-ts). 


#### Install

```bash
npm i --save digup-ts
```

#### Requirements

- TypeScript >= 2.9

## Example `digUp` Usage

```typescript
import { digUp } from 'digup-ts';

// Let's pretend abc is unpredictable and maybe incomplete.
const response = {a:
                    {b: [
                          {c: 'First'}, 
                          {c: 'Second'}
                        ]
                    }
                  };
let first = digUp(response, 'a', 'b', 0, 'c'); // 'First'
let maybe = digUp(response, 'a', 'b', 9, 'c'); // undefined
let str   = digUp(response, ['a', 'b', 9, 'c'], 'unknown'); // 'unknown'
```
As you can see, it accepts a default value, like 'unknown'. 
Just wrap the keys in an array.

## Typescript support

Typescript is fully supported, so your editor points out missing properties.
```
let X = digUp(response, 'X'); // typescript error 'X' doesn't exist...
```

## Array find

The examples below all use the following data:
```typescript
const response = {
    data: {
        customers: [
            {name: 'A', age:10}, // missing purchases
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
}
```
## Array.find among keys

Use a function to find a single item in an array.
```typescript
import { digUp, last } from 'digup-ts';

// Get customer C using a function
const customerC = digUp(response, 'data', 'customers', cust=>cust.name=='C');

// Get price of boots of customer C (or 0 if not found)
const price = digUp(response, 'data', 'customers', cust=>cust.name=='C', 'purchases', pur=>pur.name=='boots', 'price');

// 'last' function is included in digup-ts
const lastSale = digUp(response, 'data', 'customers', last, 'purchases', last); // boots object

```

## Alternatives

If you need more features like setting, removing and transforming nested properties, try [`dig-ts`](https://www.npmjs.com/package/dig-ts).
```typescript
import { dig, last } from 'dig-ts';

const summary = dig(response, 'data', 'customers')
    .return(customers => ({
        customerCount: customers.length,
        purchaseCount: customers.collect('purchases').length,
        biggestPurchase: customers.collect('purchases').max('price'),
        biggestPurchaseByLastOldCustomer: customers.filter(customer=>customer.age>=60)
            .dig(last, 'products').max('price')
        ,
        whoBoughtMost: customers.filter(cust => dig(cust).max('purchases', 'length') 
                                             == customers.max('purchases', 'length'))
                         .dig(last)
                         .return(cust=>({
                            customerName: cust.name,
                            ...dig(cust, 'purchases').return(purchases => ({
                                itemCount: purchases.length;
                                totalPrice: purchases.sum('price')
                            }))
                         })
        })
    );
// summary will be {
//    customerCount: 5,
//    purchaseCount: 4,
//    biggestPurchase: 20,
//    biggestPurchaseByLastOldCustomer: 20,
//    whoBoughtMost: {
//        customerName: 'C',
//        itemCount: 2,
//        totalPrice: 20
//        }
//    }
```
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

`digup-ts` preserves TypeScript typings and code-completion by IDEs like Visual Studio Code or WebStorm.

```typescript
const abc = {a: {b: {c: 'C'}}};

let b = digUp(_=> abc.a.b, {c:'C default'});

console.log(b.c) // When typing 'b' your code editor suggests '.c'
```

## License

`digup-ts` is MIT Licensed.
