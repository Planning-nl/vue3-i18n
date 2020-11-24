import { locales, withLocales } from "../locales";
import { i18n } from "./i18n";
import { number, numberParts } from "./number";
import { patchLocale } from "../patchLocale";

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

    test("customize", () => {
        const wrapped = withLocales(["nl"], () => i18n.numberParts);
        patchLocale(i18n, "nl", {
            numberParts: (v, o) => {
                const parts = wrapped(v, o);
                return parts.filter((p) => p.type !== "group");
            },
        });

        withLocales(["nl"], () => {
            const v = 99999.123;
            expect(numberParts(v)).toEqual([
                { type: "integer", value: "99" },
                { type: "integer", value: "999" },
                { type: "decimal", value: "," },
                { type: "fraction", value: "123" },
            ]);

            expect(number(v)).toEqual("99999,123");
        });
    });
});
