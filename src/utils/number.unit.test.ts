import { locales } from "../locales";
import { number, numberParts } from "./number";

describe("number", () => {
    test("simple", () => {
        locales.value = ["nl-NL"];
        const v = 99999.123;
        expect(number(v)).toBe("99.999,123");
    });

    test("parts", () => {
        locales.value = ["nl-NL"];
        const v = 99999.123;
        expect(numberParts(v)).toEqual([
            { type: "integer", value: "99" },
            { type: "group", value: "." },
            { type: "integer", value: "999" },
            { type: "decimal", value: "," },
            { type: "fraction", value: "123" },
        ]);
    });
});
