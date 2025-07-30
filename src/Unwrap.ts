import { Either } from "@sweet-monads/either";
import { Maybe } from "@sweet-monads/maybe";

export type Unwrap<T> = T extends Promise<infer T1> ? Promise<Unwrap.Monads<T1>> : Unwrap.Monads<T>;
export namespace Unwrap {
    export type ErrorValidationMonad<T> = T extends Either<infer TInner, any> ? TInner : Error;
    export type Monads<T> =
        T extends Maybe<infer TInner>
            ? TInner
            : T extends Either<any, infer TInner>
              ? NonNullable<TInner>
              : NonNullable<T>;
    export type ErrorType<T> =
        T extends Promise<infer T1> ? ErrorValidationMonad<T1> : ErrorValidationMonad<T>;
}
