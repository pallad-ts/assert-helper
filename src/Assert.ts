import {Maybe, Validation} from "monet";
import * as is from 'predicates';

export interface Assert<TFunc extends ((...args: any[]) => any), TError = any, TResult = ReturnType<TFunc>> {
    (...args: Parameters<TFunc>): TResult extends Promise<infer TPromiseResult> ? Promise<NonNullable<TPromiseResult>> : NonNullable<TResult>;

    maybe(...args: Parameters<TFunc>): TResult extends Promise<infer TPromiseResult> ? Promise<Maybe<UnwrapMaybe<TPromiseResult>>> : Maybe<UnwrapMaybe<TResult>>;

    validation(...args: Parameters<TFunc>): TResult extends Promise<infer TPromiseResult> ? Promise<Validation<TError, TPromiseResult>> : Validation<TError, TResult>;
}

export function defaultErrorFactory() {
    return new Error('Assertion failed');
}

// Temporary fix - remove once PR https://github.com/monet/monet.js/issues/220 gets merged and published
function isMaybe(value: any): value is Maybe<any> {
    if (value === undefined || value === null) {
        return false;
    }
    const result = Maybe.isInstance(value);
    //tslint:disable-next-line: no-boolean-literal-compare
    return result === true || (result as any) === 'monet.js/Maybe';
}

function isValidation(value: any): value is Validation<any, any> {
    if (value === undefined || value === null) {
        return false;
    }
    const result = Validation.isInstance(value);
    //tslint:disable-next-line: no-boolean-literal-compare
    return result === true || (result as any) === 'monet.js/Validation';
}

export function createAssertion<TResult, TFunc extends ((...args: any[]) => TResult), TError = any>(
    func: TFunc,
    errorFactory?: (...args: Parameters<TFunc>) => TError
): Assert<TFunc, TError, TResult> {
    const result = function (...args: Parameters<TFunc>) {
        return onOptionalPromise(result.validation(...args), (x: Validation<any, any>) => {
            return x.catchMap(e => {
                throw e
            })
                .success()
        })
    } as any as Assert<TFunc, TError, TResult>;

    result.maybe = function (...args: Parameters<TFunc>) {
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

    result.validation = function (...args: Parameters<TFunc>) {
        const finalErrorFactory = errorFactory || defaultErrorFactory;
        return onOptionalPromise(func(...args), (x: any) => {
            if (x === undefined || x === null) {
                return Validation.Fail(finalErrorFactory(...args));
            }
            if (isMaybe(x)) {
                return x.toValidation(finalErrorFactory(...args));
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

export type UnwrapMaybe<T> = T extends Maybe<infer TResult> ? TResult : T;
