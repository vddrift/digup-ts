import {digUp, last} from './index';
import {families} from './sample-data/families';

describe('digUp', () => {
    const abc = {
        a: {
            b: {
                c: 'C',
            },
        }
    };
    const abc_untyped = <any>abc; // used to avoid typescript errors below.
    let a, b, c, d;

    it('should recieve keys as an array.', () => {
        b = digUp(abc, ['a', 'b']);
        // console.log(b.c); // uncomment for typescript error: Object possibly undefined
        if (b) { // let typescript exclude 'undefined', because there's no default.
            // console.log(b.d); // uncomment for typescript error: Property 'd' does not exist
            expect(b.c).toEqual('C'); // type digUp. c is suggested by IDE.
        } else {
            fail('b not set')
        }
    });
    it('should get nested property.', () => {
        b = digUp(abc, 'a', 'b');
        // console.log(b.c); // uncomment for typescript error: Object possibly undefined
        if (b) { // let typescript exclude 'undefined', because there's no default.
            // console.log(b.d); // uncomment for typescript error: Property 'd' does not exist
            expect(b.c).toEqual('C'); // type digUp. c is suggested by IDE.
        } else {
            fail('b not set')
        }
    });
    it('should handle arrays', () => {
        let c;
        type ABC_arr = {
            a: {
                b_arr: [
                    {c: string}
                ]
            }
        };
        let abc_arr:ABC_arr = {a:{b_arr:[{c:'C'}]}};
        c = digUp(abc_arr, 'a', 'b_arr', 0, 'c');
        expect(c).toEqual('C');
    });
    it('should use undefined when propery not found and default missing.', () => {
        d = digUp(abc_untyped, 'a', 'b', 'c', 'd');
        expect(d).toBeUndefined();
    });
    it('should make discriminated unions', () => {
        // About discriminated unions: https://basarat.gitbooks.io/typescript/docs/types/discriminated-unions.html
        const abcExtra = {
            a: {
                b: {
                    c: 'C',
                    cExtra: 'Only in abcExtra', // not available when combined with abc.
                },
            }
        };

        const single = digUp(abcExtra, 'a');
        // expect(single.b.c).toEqual('C from abcExtra'); // uncomment for typescript error: Object is possibly 'undefined'
        if (single) { // avoid typescript error
            expect(single.b.cExtra).toEqual('Only in abcExtra');
        } else {
            fail('single not set')
        }
    });
    it('should handle optional properties', () => {
        interface AbcOptional {
            a?:{b?:{c?:{d?:string}}}
        }
        const maybeAbc: AbcOptional = {
            a: {
                b: { // optional
                    c: {
                        d:'D'
                    },
                },
            }
        };
        // c = digUp(_ => maybeAbc.a.b.c); // uncomment for typescript error: object is possibly 'undefined'

        // Make all (nested) properties required
        c = digUp(maybeAbc, 'a', 'b', 'c');
        if (c) { // avoid typescript error
            expect(c.d).toEqual('D');
        } else {
            fail('c not set')
        }
    });
   it('unfortunately fails to check optional properties, as a result of all()', () => {

       type ABCDE = {a?: {b?: {c?: {d?: {e?: string}}}}}
       const abcde:ABCDE = {
           a: {
               b: {
                   c: {}
               }
           }
       };

       c = digUp(abcde, 'a', 'b', 'c');
       if (c) {
           // console.log(c.d.e); // uncomment for ts error: Object is possibly 'undefined'
       } else {
           fail('c not set')
       }
    });
   it('should work', () => {
        // type C = {d?: {e?: string}};
        // type B = {c?: C};
        // type ABCDE = {a?: {b?: B}};
        type ABCDE = {a?: {b?: {c?: {d?: {e?: {f?: {}}}}}}};
        const abcde:ABCDE = {
        // const abcde = {
            a: {
                b: {
                    c: {}
                }
            }
        };
        // abcde.a.b;
        if(abcde.a) {
            // abcde.a.b.c; // uncomment for ts error: Object is possibly 'undefined'
            if (abcde.a.b) {
                // abcde.a.b.c.d;
                if (abcde.a.b.c) {
                    // abcde.a.b.c.d.e;
                }
            }
        }

        a = digUp(abcde, 'a');
        // a = abcde.a;
        if (a) {
            if (a.b) {
                if (a.b.c) {
                    a.b.c.d;
                    if (a.b.c.d) {
                        a.b.c.d.e;
                    }
                }
            }
        }
        b = digUp(abcde, 'a', 'b');
        if (b!==undefined) {
            if (b.c) {
                if (b.c.d) {
                    if(b.c.d.e) {}
                }
            }
        }
        c = digUp(abcde, 'a', 'b', 'c');
        if (c) {
            if (c.d) {
                c.d.e;
                if (c.d.e) {}
            }
        }
        d = digUp(abcde, 'a', 'b', 'c', 'd'); // pathFind / pathFind / digUp / deepProp
        if (d) {
            // d.e.f; //
            if (d.e) {
                d.e.f;
                if (d.e) {
                    d.e.f;
                }
            }
        }
        let cc2 = digUp(abcde, 'a', 'b', 'c');
        if (cc2!==undefined) {
            expect(cc2.d).toBeUndefined();
            cc2.d;
            if (cc2.d) {
                cc2.d.e;
            }
        } else {
            fail('c2 not set')
        }
    });
    it('should use digUp-ts', () => {
        interface Money {
            amount: number;
            currency: string;
        }
        interface PricePerPax {
            travelerId?: string;
            price?: Money;
        }
        interface OfferPriceBreakdown {
            totalPricePerPax?: PricePerPax[];
        }
        interface OrderItem {
            // orderItemPriceBreakdown?: OfferPriceBreakdown;
            orderItemPriceBreakdown: OfferPriceBreakdown;
        }
        const OI: OrderItem = //JSON.parse(`
            {orderItemPriceBreakdown: {
              totalPricePerPax: [
                  {
                      travelerId: 'AA',
                      price: {
                          amount: 105.8,
                          currency: 'EUR'
                      }
                  }
              ]
          }
        };
        // `);
        // const def = [{
        //     travelerId: 'AA',
        //     price: {
        //         amount: 105.8,
        //         currency: 'EUR'
        //     }
        // }];
        // const tppp: PricePerPax[] = digUp(_ => all(OI).orderItemPriceBreakdown.totalPricePerPax, def);
        const tppp: PricePerPax[] = digUp(OI, 'orderItemPriceBreakdown', 'totalPricePerPax') || [];
        if (tppp) {
            // const pricePerPax: PricePerPax = tppp.find(
            //     ppp => ppp.travelerId === 'AA'
            // ) || {};
            const pricePerPax:PricePerPax = {
                travelerId: 'a',
                price: {
                    amount: 105.8,
                    currency: 'EUR'
                }
            };

            // const price:Money|undefined = digUp(pricePerPax, 'price');
            const price:Money = digUp(pricePerPax, 'price') || {amount:1, currency:'EUR'};
            // const price:Money = dig(pricePerPax, 'price').get({amount:1, currency:'EUR'});
            // const price = pricePerPax.price;
            if (price) {
                price.amount
            }
        } else {
            fail('tppp not set')
        }
        return;
        // const e = digUp(_ => abc.a.b.c.d.e);
        // expect(e).toBeUndefined();
    });

    it('should get length from array', () => {
        expect(digUp([], 'length')).toEqual(0);
    });
});


