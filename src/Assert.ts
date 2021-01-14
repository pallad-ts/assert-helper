import {Maybe, Validation} from "monet";
import * as is from 'predicates';
import {Unwrap} from "./Unwrap";

export interface Assert<TResult extends NonNullable<{}>,
    TArgs extends any[] = any[],
    TError = Error,
    TOptionalError = Error> {
    (...args: TArgs): TResult extends Promise<infer TPromiseResult> ?
        Promise<TPromiseResult> :
        TResult;

    maybe(...args: TArgs): TResult extends Promise<infer TPromiseResult> ?
        Promise<Maybe<TPromiseResult>> :
        Maybe<TResult>;

    validation(...args: TArgs): TResult extends Promise<infer TPromiseResult> ?
        Promise<Validation<TError | TOptionalError, TPromiseResult>> :
        Validation<TError | TOptionalError, TResult>;
}

export function defaultErrorFactory(..._args: any[]) {
    return new Error('Assertion failed');
}

function isMaybe(value: any): value is Maybe<any> {
    if (value === undefined || value === null) {
        return false;
    }
    return Maybe.isInstance(value);
}

function isValidation(value: any): value is Validation<any, any> {
    if (value === undefined || value === null) {
        return false;
    }
    return Validation.isInstance(value);
}

export function createAssertion<TFactory extends (...args: any[]) => any, TError = Error>(
    func: TFactory,
    errorFactory ?: (...args: Parameters<TFactory>) => TError
): Assert<Unwrap<ReturnType<TFactory>>,
    Parameters<TFactory>,
    TError,
    Unwrap.ErrorType<ReturnType<TFactory>>> {
    const result = function (...args: Parameters<TFactory>) {
        return onOptionalPromise(result.validation(...args), (x: Validation<any, any>) => {
            return x.catchMap(e => {
                throw e
            })
                .success()
        })
    };

    result.maybe = function (...args: Parameters<TFactory>) {
        return onOptionalPromise(func(...args), (x: any) => {
            if (isMaybe(x)) {
                return x;
            }
            if (isValidation(x)) {
                return x.toMaybe();
            }
            return Maybe.fromFalsy(x);
        });
    };

    result.validation = function (...args: Parameters<TFactory>) {
        const finalErrorFactory = errorFactory || defaultErrorFactory;
        return onOptionalPromise(func(...args), (x: any) => {
            if (x === undefined || x === null) {
                return Validation.Fail(finalErrorFactory(...args));
            }
            if (isMaybe(x)) {
                return x.toValidation(x.isNone() ? finalErrorFactory(...args) : undefined);
            }
            if (isValidation(x)) {
                return x;
            }
            return Validation.Success(x);
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
