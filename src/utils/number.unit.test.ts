import { locales } from "../locales";
import { i18n } from "./index";

describe("number", () => {
    test("simple", () => {
        locales.value = ["nl-NL"];
        const v = 99999.123;
        expect(i18n.number(v)).toBe("99.999,123");
    });

    test("parts", () => {
        locales.value = ["nl-NL"];
        const v = 99999.123;
        expect(i18n.numberParts(v)).toEqual([
            { type: "integer", value: "99" },
            { type: "group", value: "." },
            { type: "integer", value: "999" },
            { type: "decimal", value: "," },
            { type: "fraction", value: "123" },
        ]);
    });
});
