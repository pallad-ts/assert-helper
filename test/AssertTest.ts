import {Assert, createAssertion} from "@src/Assert";
import {Maybe, Validation} from "monet";
import {assert as TypeAssert, IsExact} from 'conditional-type-checks';

describe('Assert', () => {

    class CustomError extends Error {
        readonly extraProperty: string;

        constructor(message: string) {
            super(message);
            this.message = message;
            this.name = 'CustomError';
            this.extraProperty = ':)';
        }
    }

    const ID_EXISTING = 1;
    const ID_NOT_EXISTING = 2;
    const RESULT = {foo: 'bar'};
    type ResultType = typeof RESULT;

    const DEFAULT_ERROR_MESSAGE = 'Assertion failed';
    const CUSTOM_ERROR = new CustomError('Failure');
    const ERROR_FACTORY = () => {
        return CUSTOM_ERROR;
    };
    const VALIDATION_ERROR = new CustomError('Validation error');

    describe('on sync function returning', () => {
        function assertMainFunction(assert: Assert<any, any, any>, error?: Error) {
            expect(assert(ID_EXISTING))
                .toEqual(RESULT);

            expect(() => {
                assert(ID_NOT_EXISTING)
            })
                .toThrowError(error ? error.message : DEFAULT_ERROR_MESSAGE)
        }

        function assertMaybe(assert: Assert<any, any, any>) {
            expect(assert.maybe(ID_EXISTING))
                .toEqual(Maybe.Some(RESULT));

            expect(assert.maybe(ID_NOT_EXISTING))
                .toEqual(Maybe.None());
        }

        function assertValidation(assert: Assert<any, any, any>, error?: Error) {
            expect(assert.validation(ID_EXISTING))
                .toEqual(Validation.Success(RESULT));

            const failResult = assert.validation(ID_NOT_EXISTING) as Validation<any, any>;
            expect(failResult.fail())
                .toHaveProperty('message', error ? error.message : DEFAULT_ERROR_MESSAGE);
        }


        it('simple result', () => {
            const func = (x: number) => {
                return x === ID_EXISTING ? RESULT : undefined;
            };
            const assert = createAssertion(func);

            assertMainFunction(assert);
            assertMaybe(assert);
            assertValidation(assert);

            const customAssert = createAssertion(func, ERROR_FACTORY);
            assertMainFunction(customAssert, CUSTOM_ERROR);
            assertMaybe(customAssert);
            assertValidation(customAssert, CUSTOM_ERROR);

            TypeAssert<IsExact<ReturnType<typeof assert>, ResultType>>(true);
            TypeAssert<IsExact<Parameters<typeof assert>, [number]>>(true);

            TypeAssert<IsExact<ReturnType<typeof assert.maybe>, Maybe<ResultType>>>(true);
            TypeAssert<IsExact<Parameters<typeof assert.maybe>, [number]>>(true);

            TypeAssert<IsExact<ReturnType<typeof assert.validation>, Validation<Error, ResultType>>>(true);
            TypeAssert<IsExact<Parameters<typeof assert.validation>, [number]>>(true);

            TypeAssert<IsExact<ReturnType<typeof customAssert>, ResultType>>(true);
            TypeAssert<IsExact<Parameters<typeof customAssert>, [number]>>(true);

            TypeAssert<IsExact<ReturnType<typeof customAssert.maybe>, Maybe<ResultType>>>(true);
            TypeAssert<IsExact<Parameters<typeof customAssert.maybe>, [number]>>(true);

            TypeAssert<IsExact<ReturnType<typeof customAssert.validation>, Validation<CustomError | Error, ResultType>>>(true);
            TypeAssert<IsExact<Parameters<typeof customAssert.validation>, [number]>>(true);
        });

        it('Maybe', () => {
            const func = (x: number) => {
                return Maybe.fromFalsy<ResultType>(x === ID_EXISTING ? RESULT : undefined)
            };
            const assert = createAssertion(func);

            assertMainFunction(assert);
            assertMaybe(assert);
            assertValidation(assert);

            const customAssert = createAssertion(func, ERROR_FACTORY);
            assertMainFunction(customAssert, CUSTOM_ERROR);
            assertMaybe(customAssert);
            assertValidation(customAssert, CUSTOM_ERROR);

            TypeAssert<IsExact<ReturnType<typeof assert>, ResultType>>(true);
            TypeAssert<IsExact<Parameters<typeof assert>, [number]>>(true);

            TypeAssert<IsExact<ReturnType<typeof assert.maybe>, Maybe<ResultType>>>(true);
            TypeAssert<IsExact<Parameters<typeof assert.maybe>, [number]>>(true);

            TypeAssert<IsExact<ReturnType<typeof assert.validation>, Validation<Error, ResultType>>>(true);
            TypeAssert<IsExact<Parameters<typeof assert.validation>, [number]>>(true);

            TypeAssert<IsExact<ReturnType<typeof customAssert>, ResultType>>(true);
            TypeAssert<IsExact<Parameters<typeof customAssert>, [number]>>(true);

            TypeAssert<IsExact<ReturnType<typeof customAssert.maybe>, Maybe<ResultType>>>(true);
            TypeAssert<IsExact<Parameters<typeof customAssert.maybe>, [number]>>(true);

            TypeAssert<IsExact<ReturnType<typeof customAssert.validation>, Validation<CustomError | Error, ResultType>>>(true);
            TypeAssert<IsExact<Parameters<typeof customAssert.validation>, [number]>>(true);
        });

        it('Validation', () => {
            const func = (x: number): Validation<Error, ResultType> => {
                return x === ID_EXISTING ? Validation.Success(RESULT) : Validation.Fail(VALIDATION_ERROR);
            };
            const assert = createAssertion(func);

            assertMainFunction(assert, VALIDATION_ERROR);
            assertMaybe(assert);
            assertValidation(assert, VALIDATION_ERROR);

            const customAssert = createAssertion(func, ERROR_FACTORY);
            assertMainFunction(customAssert, VALIDATION_ERROR);
            assertMaybe(customAssert);
            assertValidation(customAssert, VALIDATION_ERROR);

            TypeAssert<IsExact<ReturnType<typeof assert>, ResultType>>(true);
            TypeAssert<IsExact<Parameters<typeof assert>, [number]>>(true);

            TypeAssert<IsExact<ReturnType<typeof assert.maybe>, Maybe<ResultType>>>(true);
            TypeAssert<IsExact<Parameters<typeof assert.maybe>, [number]>>(true);

            TypeAssert<IsExact<ReturnType<typeof assert.validation>, Validation<Error, ResultType>>>(true);
            TypeAssert<IsExact<Parameters<typeof assert.validation>, [number]>>(true);

            TypeAssert<IsExact<ReturnType<typeof customAssert>, ResultType>>(true);
            TypeAssert<IsExact<Parameters<typeof customAssert>, [number]>>(true);

            TypeAssert<IsExact<ReturnType<typeof customAssert.maybe>, Maybe<ResultType>>>(true);
            TypeAssert<IsExact<Parameters<typeof customAssert.maybe>, [number]>>(true);

            TypeAssert<IsExact<ReturnType<typeof customAssert.validation>, Validation<CustomError | Error, ResultType>>>(true);
            TypeAssert<IsExact<Parameters<typeof customAssert.validation>, [number]>>(true);
        });
    });

    describe('on async function returning', () => {
        async function assertMainFunction(assert: Assert<any, any, any>, error?: Error) {
            await expect(assert(ID_EXISTING))
                .resolves
                .toEqual(RESULT);

            await expect(assert(ID_NOT_EXISTING))
                .rejects
                .toThrowError(error ? error.message : DEFAULT_ERROR_MESSAGE)
        }

        async function assertMaybe(assert: Assert<any, any, any>) {
            await expect(assert.maybe(ID_EXISTING))
                .resolves
                .toEqual(Maybe.Some(RESULT));

            await expect(assert.maybe(ID_NOT_EXISTING))
                .resolves
                .toEqual(Maybe.None());
        }

        async function assertValidation(assert: Assert<any, any, any>, error?: Error) {
            await expect(assert.validation(ID_EXISTING))
                .resolves
                .toEqual(Validation.Success(RESULT));

            const failResult = await assert.validation(ID_NOT_EXISTING) as Validation<any, any>;
            expect(failResult.fail())
                .toHaveProperty('message', error ? error.message : DEFAULT_ERROR_MESSAGE);
        }


        it('simple result', async () => {
            const func = async (x: number) => {
                return x === ID_EXISTING ? RESULT : undefined;
            };
            const assert = createAssertion(func);

            await assertMainFunction(assert);
            await assertMaybe(assert);
            await assertValidation(assert);

            const customAssert = createAssertion(func, ERROR_FACTORY);
            await assertMainFunction(customAssert, CUSTOM_ERROR);
            await assertMaybe(customAssert);
            await assertValidation(customAssert, CUSTOM_ERROR);

            TypeAssert<IsExact<ReturnType<typeof assert>, Promise<ResultType>>>(true);
            TypeAssert<IsExact<Parameters<typeof assert>, [number]>>(true);

            TypeAssert<IsExact<ReturnType<typeof assert.maybe>, Promise<Maybe<ResultType>>>>(true);
            TypeAssert<IsExact<Parameters<typeof assert.maybe>, [number]>>(true);

            TypeAssert<IsExact<ReturnType<typeof assert.validation>, Promise<Validation<Error, ResultType>>>>(true);
            TypeAssert<IsExact<Parameters<typeof assert.validation>, [number]>>(true);

            TypeAssert<IsExact<ReturnType<typeof customAssert>, Promise<ResultType>>>(true);
            TypeAssert<IsExact<Parameters<typeof customAssert>, [number]>>(true);

            TypeAssert<IsExact<ReturnType<typeof customAssert.maybe>, Promise<Maybe<ResultType>>>>(true);
            TypeAssert<IsExact<Parameters<typeof customAssert.maybe>, [number]>>(true);

            TypeAssert<IsExact<ReturnType<typeof customAssert.validation>, Promise<Validation<CustomError | Error, ResultType>>>>(true);
            TypeAssert<IsExact<Parameters<typeof customAssert.validation>, [number]>>(true);
        });

        it('Maybe', async () => {
            const func = async (x: number) => {
                return Maybe.fromFalsy(x === ID_EXISTING ? RESULT : undefined)
            };
            const assert = createAssertion(func);

            await assertMainFunction(assert);
            await assertMaybe(assert);
            await assertValidation(assert);

            const customAssert = createAssertion(func, ERROR_FACTORY);
            await assertMainFunction(customAssert, CUSTOM_ERROR);
            await assertMaybe(customAssert);
            await assertValidation(customAssert, CUSTOM_ERROR);

            TypeAssert<IsExact<ReturnType<typeof assert>, Promise<ResultType>>>(true);
            TypeAssert<IsExact<Parameters<typeof assert>, [number]>>(true);

            TypeAssert<IsExact<ReturnType<typeof assert.maybe>, Promise<Maybe<ResultType>>>>(true);
            TypeAssert<IsExact<Parameters<typeof assert.maybe>, [number]>>(true);

            TypeAssert<IsExact<ReturnType<typeof assert.validation>, Promise<Validation<Error, ResultType>>>>(true);
            TypeAssert<IsExact<Parameters<typeof assert.validation>, [number]>>(true);

            TypeAssert<IsExact<ReturnType<typeof customAssert>, Promise<ResultType>>>(true);
            TypeAssert<IsExact<Parameters<typeof customAssert>, [number]>>(true);

            TypeAssert<IsExact<ReturnType<typeof customAssert.maybe>, Promise<Maybe<ResultType>>>>(true);
            TypeAssert<IsExact<Parameters<typeof customAssert.maybe>, [number]>>(true);

            TypeAssert<IsExact<ReturnType<typeof customAssert.validation>, Promise<Validation<CustomError | Error, ResultType>>>>(true);
            TypeAssert<IsExact<Parameters<typeof customAssert.validation>, [number]>>(true);
        });

        it('Validation', async () => {
            const func = async (x: number): Promise<Validation<CustomError, ResultType>> => {
                return x === ID_EXISTING ? Validation.Success(RESULT) : Validation.Fail(VALIDATION_ERROR);
            };
            const assert = createAssertion(func);

            await assertMainFunction(assert, VALIDATION_ERROR);
            await assertMaybe(assert);
            await assertValidation(assert, VALIDATION_ERROR);

            const customAssert = createAssertion(func, ERROR_FACTORY);
            await assertMainFunction(customAssert, VALIDATION_ERROR);
            await assertMaybe(customAssert);
            await assertValidation(customAssert, VALIDATION_ERROR);

            TypeAssert<IsExact<ReturnType<typeof assert>, Promise<ResultType>>>(true);
            TypeAssert<IsExact<Parameters<typeof assert>, [number]>>(true);

            TypeAssert<IsExact<ReturnType<typeof assert.maybe>, Promise<Maybe<ResultType>>>>(true);
            TypeAssert<IsExact<Parameters<typeof assert.maybe>, [number]>>(true);

            TypeAssert<IsExact<ReturnType<typeof assert.validation>, Promise<Validation<Error, ResultType>>>>(true);
            TypeAssert<IsExact<Parameters<typeof assert.validation>, [number]>>(true);

            TypeAssert<IsExact<ReturnType<typeof customAssert>, Promise<ResultType>>>(true);
            TypeAssert<IsExact<Parameters<typeof customAssert>, [number]>>(true);

            TypeAssert<IsExact<ReturnType<typeof customAssert.maybe>, Promise<Maybe<ResultType>>>>(true);
            TypeAssert<IsExact<Parameters<typeof customAssert.maybe>, [number]>>(true);

            TypeAssert<IsExact<ReturnType<typeof customAssert.validation>, Promise<Validation<CustomError, ResultType>>>>(true);
            TypeAssert<IsExact<Parameters<typeof customAssert.validation>, [number]>>(true);
        });
    });
});
