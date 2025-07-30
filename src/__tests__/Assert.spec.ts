import { Either, left, right } from "@sweet-monads/either";
import { fromNullable, just, Maybe, none } from "@sweet-monads/maybe";
import { assert as TypeAssert, IsExact } from "conditional-type-checks";

import { Assert, createAssertion } from "../Assert";

describe("Assert", () => {
    class CustomError extends Error {
        readonly extraProperty: string;

        constructor(message: string) {
            super(message);
            this.message = message;
            this.name = "CustomError";
            this.extraProperty = ":)";
        }
    }

    const ID_EXISTING = 1;
    const ID_NOT_EXISTING = 2;
    const RESULT = { foo: "bar" } as const;
    type ResultType = typeof RESULT;

    const DEFAULT_ERROR_MESSAGE = "Assertion failed";
    const CUSTOM_ERROR = new CustomError("Failure");
    const ERROR_FACTORY = () => {
        return CUSTOM_ERROR;
    };
    const VALIDATION_ERROR = new CustomError("Validation error");

    describe("on sync function returning", () => {
        function assertMainFunction(assert: Assert<any, any>, error?: Error) {
            expect(assert(ID_EXISTING)).toEqual(RESULT);

            expect(() => {
                assert(ID_NOT_EXISTING);
            }).toThrowError(error ? error.message : DEFAULT_ERROR_MESSAGE);
        }

        function assertMaybe(assert: Assert<any, any>) {
            expect(assert.maybe(ID_EXISTING)).toEqual(just(RESULT));

            expect(assert.maybe(ID_NOT_EXISTING)).toEqual(none());
        }

        function assertEither(assert: Assert<any, any>, error?: Error) {
            expect(assert.either(ID_EXISTING)).toEqual(right(RESULT));

            const failResult = assert.either(ID_NOT_EXISTING) as Either<any, any>;
            expect(failResult.value).toHaveProperty(
                "message",
                error ? error.message : DEFAULT_ERROR_MESSAGE
            );
        }

        it("simple result", () => {
            const func = (x: number) => {
                return x === ID_EXISTING ? RESULT : undefined;
            };
            const assert = createAssertion(func);

            assertMainFunction(assert);
            assertMaybe(assert);
            assertEither(assert);

            const customAssert = createAssertion(func, ERROR_FACTORY);
            assertMainFunction(customAssert, CUSTOM_ERROR);
            assertMaybe(customAssert);
            assertEither(customAssert, CUSTOM_ERROR);

            TypeAssert<IsExact<ReturnType<typeof assert>, ResultType>>(true);
            TypeAssert<IsExact<Parameters<typeof assert>, [number]>>(true);

            TypeAssert<IsExact<ReturnType<typeof assert.maybe>, Maybe<ResultType>>>(true);
            TypeAssert<IsExact<Parameters<typeof assert.maybe>, [number]>>(true);

            TypeAssert<IsExact<ReturnType<typeof assert.either>, Either<Error, ResultType>>>(true);
            TypeAssert<IsExact<Parameters<typeof assert.either>, [number]>>(true);

            TypeAssert<IsExact<ReturnType<typeof customAssert>, ResultType>>(true);
            TypeAssert<IsExact<Parameters<typeof customAssert>, [number]>>(true);

            TypeAssert<IsExact<ReturnType<typeof customAssert.maybe>, Maybe<ResultType>>>(true);
            TypeAssert<IsExact<Parameters<typeof customAssert.maybe>, [number]>>(true);

            TypeAssert<
                IsExact<
                    ReturnType<typeof customAssert.either>,
                    Either<CustomError | Error, ResultType>
                >
            >(true);
            TypeAssert<IsExact<Parameters<typeof customAssert.either>, [number]>>(true);
        });

        it("Maybe", () => {
            const func = (x: number) => {
                return fromNullable<ResultType | undefined>(x === ID_EXISTING ? RESULT : undefined);
            };
            const assert = createAssertion(func);

            assertMainFunction(assert);
            assertMaybe(assert);
            assertEither(assert);

            const customAssert = createAssertion(func, ERROR_FACTORY);
            assertMainFunction(customAssert, CUSTOM_ERROR);
            assertMaybe(customAssert);
            assertEither(customAssert, CUSTOM_ERROR);

            TypeAssert<IsExact<ReturnType<typeof assert>, ResultType>>(true);
            TypeAssert<IsExact<Parameters<typeof assert>, [number]>>(true);

            TypeAssert<IsExact<ReturnType<typeof assert.maybe>, Maybe<ResultType>>>(true);
            TypeAssert<IsExact<Parameters<typeof assert.maybe>, [number]>>(true);

            TypeAssert<IsExact<ReturnType<typeof assert.either>, Either<Error, ResultType>>>(true);
            TypeAssert<IsExact<Parameters<typeof assert.either>, [number]>>(true);

            TypeAssert<IsExact<ReturnType<typeof customAssert>, ResultType>>(true);
            TypeAssert<IsExact<Parameters<typeof customAssert>, [number]>>(true);

            TypeAssert<IsExact<ReturnType<typeof customAssert.maybe>, Maybe<ResultType>>>(true);
            TypeAssert<IsExact<Parameters<typeof customAssert.maybe>, [number]>>(true);

            TypeAssert<
                IsExact<
                    ReturnType<typeof customAssert.either>,
                    Either<CustomError | Error, ResultType>
                >
            >(true);
            TypeAssert<IsExact<Parameters<typeof customAssert.either>, [number]>>(true);
        });

        it("Either", () => {
            const func = (x: number): Either<Error, ResultType> => {
                return x === ID_EXISTING ? right(RESULT) : left(VALIDATION_ERROR);
            };
            const assert = createAssertion(func);

            assertMainFunction(assert, VALIDATION_ERROR);
            assertMaybe(assert);
            assertEither(assert, VALIDATION_ERROR);

            const customAssert = createAssertion(func, ERROR_FACTORY);
            assertMainFunction(customAssert, VALIDATION_ERROR);
            assertMaybe(customAssert);
            assertEither(customAssert, VALIDATION_ERROR);

            TypeAssert<IsExact<ReturnType<typeof assert>, ResultType>>(true);
            TypeAssert<IsExact<Parameters<typeof assert>, [number]>>(true);

            TypeAssert<IsExact<ReturnType<typeof assert.maybe>, Maybe<ResultType>>>(true);
            TypeAssert<IsExact<Parameters<typeof assert.maybe>, [number]>>(true);

            TypeAssert<IsExact<ReturnType<typeof assert.either>, Either<Error, ResultType>>>(true);
            TypeAssert<IsExact<Parameters<typeof assert.either>, [number]>>(true);

            TypeAssert<IsExact<ReturnType<typeof customAssert>, ResultType>>(true);
            TypeAssert<IsExact<Parameters<typeof customAssert>, [number]>>(true);

            TypeAssert<IsExact<ReturnType<typeof customAssert.maybe>, Maybe<ResultType>>>(true);
            TypeAssert<IsExact<Parameters<typeof customAssert.maybe>, [number]>>(true);

            TypeAssert<
                IsExact<
                    ReturnType<typeof customAssert.either>,
                    Either<CustomError | Error, ResultType>
                >
            >(true);
            TypeAssert<IsExact<Parameters<typeof customAssert.either>, [number]>>(true);
        });
    });

    describe("on async function returning", () => {
        async function assertMainFunction(assert: Assert<any, any>, error?: Error) {
            await expect(assert(ID_EXISTING)).resolves.toEqual(RESULT);

            await expect(assert(ID_NOT_EXISTING)).rejects.toThrowError(
                error ? error.message : DEFAULT_ERROR_MESSAGE
            );
        }

        async function assertMaybe(assert: Assert<any, any>) {
            await expect(assert.maybe(ID_EXISTING)).resolves.toEqual(just(RESULT));

            await expect(assert.maybe(ID_NOT_EXISTING)).resolves.toEqual(none());
        }

        async function assertEither(assert: Assert<any, any>, error?: Error) {
            await expect(assert.either(ID_EXISTING)).resolves.toEqual(right(RESULT));

            const failResult = (await assert.either(ID_NOT_EXISTING)) as Either<any, any>;
            expect(failResult.value).toHaveProperty(
                "message",
                error ? error.message : DEFAULT_ERROR_MESSAGE
            );
        }

        it("simple result", async () => {
            // eslint-disable-next-line @typescript-eslint/require-await
            const func = async (x: number) => {
                return x === ID_EXISTING ? RESULT : undefined;
            };
            const assert = createAssertion(func);

            await assertMainFunction(assert);
            await assertMaybe(assert);
            await assertEither(assert);

            const customAssert = createAssertion(func, ERROR_FACTORY);
            await assertMainFunction(customAssert, CUSTOM_ERROR);
            await assertMaybe(customAssert);
            await assertEither(customAssert, CUSTOM_ERROR);

            TypeAssert<IsExact<ReturnType<typeof assert>, Promise<ResultType>>>(true);
            TypeAssert<IsExact<Parameters<typeof assert>, [number]>>(true);

            TypeAssert<IsExact<ReturnType<typeof assert.maybe>, Promise<Maybe<ResultType>>>>(true);
            TypeAssert<IsExact<Parameters<typeof assert.maybe>, [number]>>(true);

            TypeAssert<
                IsExact<ReturnType<typeof assert.either>, Promise<Either<Error, ResultType>>>
            >(true);
            TypeAssert<IsExact<Parameters<typeof assert.either>, [number]>>(true);

            TypeAssert<IsExact<ReturnType<typeof customAssert>, Promise<ResultType>>>(true);
            TypeAssert<IsExact<Parameters<typeof customAssert>, [number]>>(true);

            TypeAssert<IsExact<ReturnType<typeof customAssert.maybe>, Promise<Maybe<ResultType>>>>(
                true
            );
            TypeAssert<IsExact<Parameters<typeof customAssert.maybe>, [number]>>(true);

            TypeAssert<
                IsExact<
                    ReturnType<typeof customAssert.either>,
                    Promise<Either<CustomError | Error, ResultType>>
                >
            >(true);
            TypeAssert<IsExact<Parameters<typeof customAssert.either>, [number]>>(true);
        });

        it("Maybe", async () => {
            // eslint-disable-next-line @typescript-eslint/require-await
            const func = async (x: number) => {
                return fromNullable(x === ID_EXISTING ? RESULT : undefined);
            };
            const assert = createAssertion(func);

            await assertMainFunction(assert);
            await assertMaybe(assert);
            await assertEither(assert);

            const customAssert = createAssertion(func, ERROR_FACTORY);
            await assertMainFunction(customAssert, CUSTOM_ERROR);
            await assertMaybe(customAssert);
            await assertEither(customAssert, CUSTOM_ERROR);

            TypeAssert<IsExact<ReturnType<typeof assert>, Promise<ResultType>>>(true);
            TypeAssert<IsExact<Parameters<typeof assert>, [number]>>(true);

            TypeAssert<IsExact<ReturnType<typeof assert.maybe>, Promise<Maybe<ResultType>>>>(true);
            TypeAssert<IsExact<Parameters<typeof assert.maybe>, [number]>>(true);

            TypeAssert<
                IsExact<ReturnType<typeof assert.either>, Promise<Either<Error, ResultType>>>
            >(true);
            TypeAssert<IsExact<Parameters<typeof assert.either>, [number]>>(true);

            TypeAssert<IsExact<ReturnType<typeof customAssert>, Promise<ResultType>>>(true);
            TypeAssert<IsExact<Parameters<typeof customAssert>, [number]>>(true);

            TypeAssert<IsExact<ReturnType<typeof customAssert.maybe>, Promise<Maybe<ResultType>>>>(
                true
            );
            TypeAssert<IsExact<Parameters<typeof customAssert.maybe>, [number]>>(true);

            TypeAssert<
                IsExact<
                    ReturnType<typeof customAssert.either>,
                    Promise<Either<CustomError | Error, ResultType>>
                >
            >(true);
            TypeAssert<IsExact<Parameters<typeof customAssert.either>, [number]>>(true);
        });

        it("Either", async () => {
            // eslint-disable-next-line @typescript-eslint/require-await
            const func = async (x: number): Promise<Either<CustomError, ResultType>> => {
                return x === ID_EXISTING ? right(RESULT) : left(VALIDATION_ERROR);
            };
            const assert = createAssertion(func);

            await assertMainFunction(assert, VALIDATION_ERROR);
            await assertMaybe(assert);
            await assertEither(assert, VALIDATION_ERROR);

            const customAssert = createAssertion(func, ERROR_FACTORY);
            await assertMainFunction(customAssert, VALIDATION_ERROR);
            await assertMaybe(customAssert);
            await assertEither(customAssert, VALIDATION_ERROR);

            type Test = ReturnType<typeof assert.either>;

            TypeAssert<IsExact<ReturnType<typeof assert>, Promise<ResultType>>>(true);
            TypeAssert<IsExact<Parameters<typeof assert>, [number]>>(true);

            TypeAssert<IsExact<ReturnType<typeof assert.maybe>, Promise<Maybe<ResultType>>>>(true);
            TypeAssert<IsExact<Parameters<typeof assert.maybe>, [number]>>(true);

            TypeAssert<
                IsExact<ReturnType<typeof assert.either>, Promise<Either<CustomError, ResultType>>>
            >(true);
            TypeAssert<IsExact<Parameters<typeof assert.either>, [number]>>(true);

            TypeAssert<IsExact<ReturnType<typeof customAssert>, Promise<ResultType>>>(true);
            TypeAssert<IsExact<Parameters<typeof customAssert>, [number]>>(true);

            TypeAssert<IsExact<ReturnType<typeof customAssert.maybe>, Promise<Maybe<ResultType>>>>(
                true
            );
            TypeAssert<IsExact<Parameters<typeof customAssert.maybe>, [number]>>(true);

            TypeAssert<
                IsExact<
                    ReturnType<typeof customAssert.either>,
                    Promise<Either<CustomError, ResultType>>
                >
            >(true);
            TypeAssert<IsExact<Parameters<typeof customAssert.either>, [number]>>(true);
        });
    });
});
