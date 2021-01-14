import {Maybe, Validation} from "monet";

export type Unwrap<T> = T extends Promise<infer T1> ? Promise<Unwrap.Monads<T1>> : Unwrap.Monads<T>
export namespace Unwrap {
    export type ErrorValidationMonad<T> = T extends Validation<infer TInner, any> ? TInner : Error;
    export type Monads<T> = T extends Maybe<infer TInner> ? TInner : (T extends Validation<any, infer TInner> ? NonNullable<TInner> : NonNullable<T>);
    export type ErrorType<T> = T extends Promise<infer T1> ? ErrorValidationMonad<T1> : ErrorValidationMonad<T>;
}
