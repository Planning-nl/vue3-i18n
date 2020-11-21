import { locales } from "../locales";
import { number, numberHtml, numberParts } from "./number";

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

    test("numberHtml", () => {
        locales.value = ["nl-NL"];
        expect(numberHtml(99999.123, {})).toBe(
            `<span class="i18n-number"><span class="i18n-number-integer">99</span><span class="i18n-number-group">.</span><span class="i18n-number-integer">999</span><span class="i18n-number-decimal">,</span><span class="i18n-number-fraction">123</span></span>`,
        );
    });
});
