import * as is from 'predicates';
import {Unwrap} from "./Unwrap";
import {fromNullable, isMaybe, Maybe} from "@sweet-monads/maybe";
import {Either, isEither, left, right} from "@sweet-monads/either";

export interface Assert<TResult extends NonNullable<{}>,
    TArgs extends any[] = unknown[],
    TError = Error,
    TOptionalError = Error> {
    (...args: TArgs): TResult extends Promise<infer TPromiseResult> ?
        Promise<TPromiseResult> :
        TResult;

    maybe(...args: TArgs): TResult extends Promise<infer TPromiseResult> ?
        Promise<Maybe<TPromiseResult>> :
        Maybe<TResult>;

    either(...args: TArgs): TResult extends Promise<infer TPromiseResult> ?
        Promise<Either<TError | TOptionalError, TPromiseResult>> :
        Either<TError | TOptionalError, TResult>;
}

export function defaultErrorFactory(..._args: any[]) {
    return new Error('Assertion failed');
}

export function createAssertion<TFactory extends (...args: any[]) => any, TError = Error>(
    func: TFactory,
    errorFactory ?: (...args: Parameters<TFactory>) => TError
): Assert<Unwrap<ReturnType<TFactory>>,
    Parameters<TFactory>,
    TError,
    Unwrap.ErrorType<ReturnType<TFactory>>> {
    const result = function (...args: Parameters<TFactory>) {
        return onOptionalPromise(result.either(...args), (x: Either<any, any>) => {
            return x.mapLeft(e => {
                throw e
            })
                .value;
        })
    };

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
        return onOptionalPromise(func(...args), (x: any) => {
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
        })
    };

    return result;
}

function onOptionalPromise(result: any, func: (value: any) => any) {
    if (is.promiseLike(result)) {
        return result.then(func);
    }
    return func(result);
}
