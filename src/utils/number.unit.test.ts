import { locales } from "../locales";
import { i18n } from "./index";
import { patchLocalePartial } from "../patchLocale";

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

    test("customize", () => {
        locales.value = ["nl-NL"];

        patchLocalePartial(i18n, "nl-NL", {
            number: (v, options) => {
                return `MY NUMBER ${v}`;
            },
        });

        expect(i18n.number(1)).toEqual("MY NUMBER 1");
    });
});
