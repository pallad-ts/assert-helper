import { Either, isEither, left, right } from "@sweet-monads/either";
import { fromNullable, isMaybe, Maybe } from "@sweet-monads/maybe";
import * as is from "predicates";

import { Unwrap } from "./Unwrap";

export interface Assert<TFactory extends (...args: any[]) => any, TError = Error> {
    (
        ...args: Parameters<TFactory>
    ): Unwrap<ReturnType<TFactory>> extends Promise<infer TPromiseResult>
        ? Promise<TPromiseResult>
        : Unwrap<ReturnType<TFactory>>;

    maybe(
        ...args: Parameters<TFactory>
    ): Unwrap<ReturnType<TFactory>> extends Promise<infer TPromiseResult>
        ? Promise<Maybe<TPromiseResult>>
        : Maybe<Unwrap<ReturnType<TFactory>>>;

    either(
        ...args: Parameters<TFactory>
    ): Unwrap<ReturnType<TFactory>> extends Promise<infer TPromiseResult>
        ? Promise<Either<TError, TPromiseResult>>
        : Either<TError, Unwrap<ReturnType<TFactory>>>;

    implementation: TFactory;
}

export function defaultErrorFactory(..._args: any[]) {
    return new Error("Assertion failed");
}

export function createAssertion<TFactory extends (...args: any[]) => any, TError = Error>(
    func: TFactory,
    errorFactory?: (...args: Parameters<TFactory>) => TError
) {
    const result = function (...args: Parameters<TFactory>) {
        return onOptionalPromise(result.either(...args), (x: Either<any, any>) => {
            return x.mapLeft(e => {
                throw e;
            }).value;
        });
    };

    result.implementation = func;

    result.maybe = function (...args: Parameters<TFactory>) {
        return onOptionalPromise(func(...args), (x: any) => {
            if (isMaybe(x)) {
                return x;
            }
            if (isEither(x)) {
                return fromNullable(x.isRight() ? x.value : undefined);
            }
            return fromNullable(x);
        });
    };

    result.either = function (...args: Parameters<TFactory>) {
        const finalErrorFactory = errorFactory || defaultErrorFactory;
        return onOptionalPromise(result.implementation(...args), (x: any) => {
            if (x === undefined || x === null) {
                return left(finalErrorFactory(...args));
            }
            if (isMaybe(x)) {
                return x.isNone() ? left(finalErrorFactory(...args)) : right(x.value);
            }
            if (isEither(x)) {
                return x;
            }
            return right(x);
        });
    };

    return result as Assert<
        TFactory,
        TError extends never ? Error : Unwrap.ErrorType<ReturnType<TFactory>>
    >;
}

function onOptionalPromise(result: any, func: (value: any) => any) {
    if (is.promiseLike(result)) {
        return result.then(func);
    }
    return func(result);
}
