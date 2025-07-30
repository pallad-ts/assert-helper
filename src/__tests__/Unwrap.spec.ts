import { Maybe } from "@sweet-monads/maybe";
import { assert, IsExact } from "conditional-type-checks";

import { Unwrap } from "../Unwrap";

describe("Unwrap", () => {
    interface Foo {
        bar: string;
    }

    describe("Maybe", () => {
        it("simple", () => {
            assert<IsExact<Unwrap<Maybe<string>>, string>>(true);
        });

        it("promisified", () => {
            assert<IsExact<Unwrap<Promise<Maybe<string>>>, Promise<string>>>(true);
        });
    });

    describe("any value", () => {
        it("simple", () => {
            assert<IsExact<Unwrap<Foo>, Foo>>(true);
        });

        it("promisified", () => {
            assert<IsExact<Unwrap<Promise<Foo>>, Promise<Foo>>>(true);
        });
    });

    describe("ignores nullables", () => {
        it("simple", () => {
            type Result = Unwrap<Foo | undefined | null>;
            type Expected = Foo;
            assert<IsExact<Result, Expected>>(true);
        });
        it("promisified", () => {
            type Result = Unwrap<Promise<Foo | undefined | null>>;
            type Expected = Promise<Foo>;
            assert<IsExact<Result, Expected>>(true);
        });
    });
});
