// export function digUp (object:any, ...keys:any[]): any {
export const digUp:DigupFunction = (object:any, ...keys:any[]): any =>{
    let result;
    let key = keys.shift();
    if (key instanceof Array) {
        let Default = keys.shift();
        result =  digUp.apply(null, [object, ...key]);
        return result === undefined ? Default : result;
    }
    if (object instanceof Array) {
        if (typeof(key)==='function') {
            result = object.find(key);
        } else {
            result = object[key];
        }
    } else {
        result = object[key];
    }
    if (keys.length===0 || result===undefined || result===null) {
        return result;
    } else {
        return digUp.apply(null, [result, ...keys]);
    }
};

interface FirstObjectResponse<T>  {
    get():T|undefined;
    get(Default?: T):T;
    merge<Other extends object>(object:Other):T&Other;
    return(func:(dig:Digger<T>)=>any):any // tweak result. For branching etc.
    min: DigNumber<T>;
    max: DigNumber<T>;
    avg: DigNumber<T>;
}
interface ObjectResponse<T> {
    get():T|undefined;
    get(Default?: any):any;
    delete(uncreate?:boolean):T;
    exists():boolean;
    set(value, create?:boolean):T;
    merge<Other extends object>(object:Other):T&Other;
    return(func:(dig:Digger<T>)=>any):any // tweak result. For branching etc.
    min: DigNumber<T>;
    max: DigNumber<T>;
    avg: DigNumber<T>;
}
interface ArrayResponse<Arr, Item> extends Array<Item> {
    get():Arr|undefined;
    get(Default?: Arr):Arr;
    set(value:Arr, create?:boolean):Arr;
    exists():boolean;
    return(func: (dig: Digger<Item>)=>any):any // tweak result. For branching etc.
    // digOn:DigOnFunction<Arr>
    // delete():Arr|undefined;
    //  map<U>(callbackfn: (value: Item, index: number, array: Item[]) => U, thisArg?: any): U[];
    // push(value: Item, create?:boolean): number; // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/push
    // concat(value: Item[], create?:boolean): Item[];
    // forEach(func: (value: Item) => void): void;
    // eachDig(func: (value: Item) => void): void;
    filter(callbackfn: (value: Item, index: number, array: Item[]) => boolean): FilteredArray<Item>
    // filter<S extends Item>(callbackfn: (value: Item, index: number, array: Arr) => value is S, thisArg?: any): FilteredArray<Item>;
    // find(func: (value: Item) => boolean): Item|undefined;
    min: DigNumber<Item>;
    max: DigNumber<Item>;
    avg: DigNumber<Item>;
}
// interface ArrayResponse<Arr, Item> extends Array<Item>, ArrayDigger<Arr, Item> {
//
// }
interface ArrayDigger<Arr, Item> {
    get():Arr|undefined;
    get(Default?: Arr):Arr;
    set(value:Arr, create?:boolean):Arr;
    exists():boolean;
    return(func: (dig: Digger<Item>)=>any):any // tweak result. For branching etc.
    // digOn:DigOnFunction<Arr>
    // delete():Arr|undefined;
    //  map<U>(callbackfn: (value: Item, index: number, array: Item[]) => U, thisArg?: any): U[];
    // push(value: Item, create?:boolean): number; // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/push
    // concat(value: Item[], create?:boolean): Item[];
    // forEach(func: (value: Item) => void): void;
    // eachDig(func: (value: Item) => void): void;
    filter(callbackfn: (value: Item, index: number, array: Item[]) => boolean): FilteredArray<Item>
    // filter<S extends Item>(callbackfn: (value: Item, index: number, array: Arr) => value is S, thisArg?: any): FilteredArray<Item>;
    // find(func: (value: Item) => boolean): Item|undefined;
    min: DigNumber<Item>;
    max: DigNumber<Item>;
    avg: DigNumber<Item>;
}


// function isNumber(key:number|string) {
//     return typeof key === 'number' || !isNaN(parseInt(key));
// }
// @ts-ignore: 'value' is never read but it's the first argument of Array.find
export const last = (value, index, array) => index==array.length-1;

// Types that might be useful outside dig.ts
export type ItemOf<T>     = T extends Array<infer U> ? U      : never
export type ValueOf<T, K> = K extends keyof T ? T[K] : never;
export type IndexOf<T>    = T extends Array<any>     ? number|'length' : keyof T;
export type NoArray<A> =
    A extends Array<infer B> ?
        B extends Array<infer C> ?
            C extends Array<infer D> ?
                D extends Array<infer E> ?
                    Required<E>:
                    Required<D>:
                Required<C>:
            Required<B>:
        Required<A>;

// Internal types.
export type Key       = string|number;
export type Find<T>        = T extends object ? (value: ItemOf<T>, index?:number, array?:T) => boolean : never;
// type Find<T>        = T extends object ? FindFunction<T> : never;
export type MustBeNumber<T> = T extends number ? string : 'Last property should be a number'

/**
 * Below you'll find a similar pattern, where each type reuses the previous one.
 * This allows recursion, limited to 5 or 6 steps.
 */

type NoArrayA<T,a>         = NoArray<ValueOf<NoArray <T>,a>>
type NoArrayB<T,a,b>       = NoArray<ValueOf<NoArrayA<T,a>,b>>;
type NoArrayC<T,a,b,c>     = NoArray<ValueOf<NoArrayB<T,a,b>,c>>;
type NoArrayD<T,a,b,c,d>   = NoArray<ValueOf<NoArrayC<T,a,b,c>,d>>;
type NoArrayE<T,a,b,c,d,e> = NoArray<ValueOf<NoArrayD<T,a,b,c,d>,e>>;

// Arguments.
// `dig` and `digUp` use max 6 arguments for nested keys.
// That should be plenty. The default max arguments for eslint is 3. See https://eslint.org/docs/rules/max-params
type A<T,a>                 = T                extends Array<infer U> ? U : a extends keyof T                ? Required<T>[a] : any
type B<T,a,b>               = A<T,a>           extends Array<infer U> ? U : b extends keyof A<T,a>           ? Required<A<T,a>>[b] : any;
type C<T,a,b,c>             = B<T,a,b>         extends Array<infer U> ? U : c extends keyof B<T,a,b>         ? Required<B<T,a,b>>[c] : any;
type D<T,a,b,c,d>           = C<T,a,b,c>       extends Array<infer U> ? U : d extends keyof C<T,a,b,c>       ? Required<C<T,a,b,c>>[d] : any;
type E<T,a,b,c,d,e>         = D<T,a,b,c,d>     extends Array<infer U> ? U : e extends keyof D<T,a,b,c,d>     ? Required<D<T,a,b,c,d>>[e] : any;

// Results for each set of arguments
type ResultA<T,a>           = T                extends Array<infer U> ? U : a extends keyof T                ? T[a] : any
type ResultB<T,a,b>         = A<T,a>           extends Array<infer U> ? U : b extends keyof A<T,a>           ? A<T,a>[b] : any;
type ResultC<T,a,b,c>       = B<T,a,b>         extends Array<infer U> ? U : c extends keyof B<T,a,b>         ? B<T,a,b>[c] : any;
type ResultD<T,a,b,c,d>     = C<T,a,b,c>       extends Array<infer U> ? U : d extends keyof C<T,a,b,c>       ? C<T,a,b,c>[d] : any;
type ResultE<T,a,b,c,d,e>   = D<T,a,b,c,d>     extends Array<infer U> ? U : e extends keyof D<T,a,b,c,d>     ? D<T,a,b,c,d>[e] : any;
type ResultF<T,a,b,c,d,e,f> = E<T,a,b,c,d,e>   extends Array<infer U> ? U : f extends keyof E<T,a,b,c,d,e>   ? E<T,a,b,c,d,e>[f] : any;



// WARNING! Insane typescript below! It works though...


// See https://github.com/Microsoft/TypeScript/issues/12290
// type IsDefined<T> = Exclude<T, undefined>;
// type Defined = Exclude<any, undefined>;


export interface DigupFunction {
    // 'a', 'b'
    <T, a extends Key,
        b extends Key> (object:T,
        a:a&IndexOf<T>        |Find<T>,
        b:b&IndexOf<A<T,a>>   |Find<A<T,a>>)
        :ResultB<T,a,b>|undefined


    // 'a' OR
    // ['a', 'b'?, 'c'?, ...etc]
    <T, Arr extends {0:Key},
        a extends Key,
        b extends Key,
        c extends Key,
        d extends Key,
        e extends Key,
        f extends Key> (object:T,
                        // a:Arr&{0:a&IndexOf<T>        |Find<T>}|{0:a&IndexOf<T>        |Find<T>,1:b&IndexOf<A<T,a>>   |Find<A<T,a>>}
                        a:
                            Arr&{0:a&IndexOf<T>              |Find<T>,
                            1?:b&IndexOf<A<T,a>>         |Find<A<T,a>>
                            2?:c&IndexOf<B<T,a,b>>       |Find<B<T,a,b>>
                            3?:d&IndexOf<C<T,a,b,c>>     |Find<C<T,a,b,c>>
                            4?:e&IndexOf<D<T,a,b,c,d>>   |Find<D<T,a,b,c,d>>
                            5?:f&IndexOf<E<T,a,b,c,d,e>> |Find<E<T,a,b,c,d,e>>
                        }
                            |a&IndexOf<T>|Find<T>
    )
        : Arr extends {0:any, 1:any, 2:any, 3:any, 4:any, 5:any} ? ResultF<T,a,b,c,d,e,f>
        : Arr extends {0:any, 1:any, 2:any, 3:any, 4:any}        ? ResultE<T,a,b,c,d,e>
        : Arr extends {0:any, 1:any, 2:any, 3:any}               ? ResultD<T,a,b,c,d>
        : Arr extends {0:any, 1:any, 2:any}                      ? ResultC<T,a,b,c>
        : Arr extends {0:any, 1:any}                             ? ResultB<T,a,b>
        : Arr extends {0:any}                                    ? ResultA<T,a>
        : any;

    // 'a', 'b' OR
    // ['a', 'b'?, 'c'?, ...etc], Default
    <T, Arr extends Array<any>|string, //Default extends Arr|Key,
        a extends Key,
        b extends Key, //BB extends Key,
        c extends Key,
        d extends Key,
        e extends Key,
        f extends Key> (object:T,
        // a:Arr&{0:a&IndexOf<T>        |Find<T>}|{0:a&IndexOf<T>        |Find<T>,1:b&IndexOf<A<T,a>>   |Find<A<T,a>>}
        a:
            Arr&{0:a&IndexOf<T>              |Find<T>,
                1?:b&IndexOf<A<T,a>>         |Find<A<T,a>>
                2?:c&IndexOf<B<T,a,b>>       |Find<B<T,a,b>>
                3?:d&IndexOf<C<T,a,b,c>>     |Find<C<T,a,b,c>>
                4?:e&IndexOf<D<T,a,b,c,d>>   |Find<D<T,a,b,c,d>>
                5?:f&IndexOf<E<T,a,b,c,d,e>> |Find<E<T,a,b,c,d,e>>
                }
               |a&IndexOf<T>|Find<T>,
        Default
            : Arr extends IndexOf<T> |Find<T>                        ? IndexOf<A<T,a>>|Find<A<T,a>> // 'a', 'b'
            : Arr extends {0:any, 1:any, 2:any, 3:any, 4:any, 5:any} ? ResultF<T,a,b,c,d,e,f>
            : Arr extends {0:any, 1:any, 2:any, 3:any, 4:any}        ? ResultE<T,a,b,c,d,e>
            : Arr extends {0:any, 1:any, 2:any, 3:any}               ? ResultD<T,a,b,c,d>
            : Arr extends {0:any, 1:any, 2:any}                      ? ResultC<T,a,b,c>
            : Arr extends {0:any, 1:any}                             ? ResultB<T,a,b>
            : Arr extends {0:any}                                    ? ResultA<T,a>
            : never
            // : any

    )
        // : BB extends IndexOf<A<T,a>> |Find<A<T,a>>                ? ResultB<T,a,BB>
        : Arr extends IndexOf<T> |Find<T>                        ? {c:{d:1}}
        : Arr extends {0:any, 1:any, 2:any, 3:any, 4:any, 5:any} ? ResultF<T,a,b,c,d,e,f>
        : Arr extends {0:any, 1:any, 2:any, 3:any, 4:any}        ? ResultE<T,a,b,c,d,e>
        : Arr extends {0:any, 1:any, 2:any, 3:any}               ? ResultD<T,a,b,c,d>
        : Arr extends {0:any, 1:any, 2:any}                      ? ResultC<T,a,b,c>
        : Arr extends {0:any, 1:any}                             ? ResultB<T,a,b>
        : Arr extends {0:any}                                    ? ResultA<T,a>
        : any;

   // 'a'
   //  <T, a extends Key> (object:T,
   //                      a:a&IndexOf<T>        |Find<T>)
   //      :ResultA<T,a>|undefined

    // ['a'], Default
    // <T, a extends Key> (Object:T, Array:{0:a&keyof T})
    //     : a extends keyof T ? T[a]: any;

    // ['a'], Default
    // <T, a extends Key> (Object:T, Array:{0:a&keyof T}, Default: a extends keyof T ? T[a]: never)
    //     : a extends keyof T ? T[a]: any;

    // 'a', 'b', 'c'
    <T, a extends Key,
        b extends Key,
        c extends Key> (object:T,
                        a:a&IndexOf<T>        |Find<T>,
                        b:b&IndexOf<A<T,a>>   |Find<A<T,a>>,
                        c:c&IndexOf<B<T,a,b>> |Find<B<T,a,b>>)
        :ResultC<T,a,b,c>|undefined
    // 'a', 'b', 'c', 'd'
    <T, a extends Key,
        b extends Key,
        c extends Key,
        d extends Key> (object:T,
                        a:a&IndexOf<T>          |Find<T>,
                        b:b&IndexOf<A<T,a>>     |Find<A<T,a>>,
                        c:c&IndexOf<B<T,a,b>>   |Find<B<T,a,b>>,
                        d:d&IndexOf<C<T,a,b,c>> |Find<C<T,a,b,c>>)
        :ResultD<T,a,b,c,d>|undefined
    // 'a', 'b', 'c', 'd', 'e'
    <T, a extends Key,
        b extends Key,
        c extends Key,
        d extends Key,
        e extends Key> (object:T,
                        a:a&IndexOf<T>            |Find<T>,
                        b:b&IndexOf<A<T,a>>       |Find<A<T,a>>,
                        c:c&IndexOf<B<T,a,b>>     |Find<B<T,a,b>>,
                        d:d&IndexOf<C<T,a,b,c>>   |Find<C<T,a,b,c>>,
                        e:e&IndexOf<D<T,a,b,c,d>> |Find<D<T,a,b,c,d>>)
        :ResultE<T,a,b,c,d,e>|undefined
    // 'a', 'b', 'c', 'd', 'e', 'f'
    <T, a extends Key,
        b extends Key,
        c extends Key,
        d extends Key,
        e extends Key,
        f extends Key> (object:T,
                        a:a&IndexOf<T>              |Find<T>,
                        b:b&IndexOf<A<T,a>>         |Find<A<T,a>>,
                        c:c&IndexOf<B<T,a,b>>       |Find<B<T,a,b>>,
                        d:d&IndexOf<C<T,a,b,c>>     |Find<C<T,a,b,c>>,
                        e:e&IndexOf<D<T,a,b,c,d>>   |Find<D<T,a,b,c,d>>,
                        f:f&IndexOf<E<T,a,b,c,d,e>> |Find<E<T,a,b,c,d,e>>)
        :ResultF<T,a,b,c,d,e,f>|undefined

    // 'a', 'b', 'c', 'd', 'e', 'f', etc...
    <T, a extends Key,
        b extends Key,
        c extends Key,
        d extends Key,
        e extends Key,
        f extends Key> (object:T,
                        a:a&IndexOf<T>              |Find<T>,
                        b:b&IndexOf<A<T,a>>         |Find<A<T,a>>,
                        c:c&IndexOf<B<T,a,b>>       |Find<B<T,a,b>>,
                        d:d&IndexOf<C<T,a,b,c>>     |Find<C<T,a,b,c>>,
                        e:e&IndexOf<D<T,a,b,c,d>>   |Find<D<T,a,b,c,d>>,
                        f:f&IndexOf<E<T,a,b,c,d,e>> |Find<E<T,a,b,c,d,e>>,
                        ...etc:any[])
        :any|undefined

}

interface DigNumber<T> {
    <a extends string>
    (a:a&keyof NoArray<T>&MustBeNumber<NoArrayA<T,a>>):number
    <a extends string,
        b extends string>
    (a:a&keyof NoArray<T>,
     b:b&keyof NoArrayA<T,a>&MustBeNumber<NoArrayB<T,a,b>>):number;
    <a extends string,
        b extends string,
        c extends string>
    (a:a&keyof NoArray<T>,
     b:b&keyof NoArrayA<T,a>,
     c:c&keyof NoArrayB<T,a,b>&MustBeNumber<NoArrayC<T,a,b,c>>):number;
    <a extends string,
        b extends string,
        c extends string,
        d extends string>
    (a:a&keyof NoArray<T>,
     b:b&keyof NoArrayA<T,a>,
     c:c&keyof NoArrayB<T,a,b>,
     d:d&keyof NoArrayC<T,a,b,c>&MustBeNumber<NoArrayD<T,a,b,c,d>>):number;
    <a extends string,
        b extends string,
        c extends string,
        d extends string,
        e extends string>
    (a:a&keyof NoArray<T>,
     b:b&keyof NoArrayA<T,a>,
     c:c&keyof NoArrayB<T,a,b>,
     d:d&keyof NoArrayC<T,a,b,c>,
     e:e&keyof NoArrayD<T,a,b,c,d>&MustBeNumber<NoArrayE<T,a,b,c,d,e>>):number;
}


export function isEmpty(obj) {
    for (let i in obj) {
        if (obj.hasOwnProperty(i)) {
            return false;
        }
    }
    return true;
}