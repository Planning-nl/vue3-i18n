import { fallbackLocales, getLocales, locales, withLocales } from "./locales";

describe("locales", () => {
    afterAll(() => {
        locales.value = [];
        fallbackLocales.value = ["en"];
    });

    test("fallback to navigator locale", () => {
        locales.value = [];
        expect(getLocales()).toEqual(navigator.languages.concat(fallbackLocales.value));
    });
    describe("getLocales", () => {
        test("order", () => {
            locales.value = ["nl"];
            fallbackLocales.value = ["en-US"];
            expect(getLocales()).toEqual(locales.value.concat(navigator.languages).concat(fallbackLocales.value));
        });

        test("return same array when there are no changes", () => {
            locales.value = ["nl"];
            fallbackLocales.value = ["en-US"];
            const arr = getLocales();
            expect(getLocales()).toBe(arr);
        });

        test("returns changes after change", () => {
            locales.value = ["nl"];
            fallbackLocales.value = ["en-US"];
            expect(getLocales()).toEqual(["nl"].concat(navigator.languages).concat(["en-US"]));

            locales.value.push("fr");
            expect(getLocales()).toEqual(["nl", "fr"].concat(navigator.languages).concat(["en-US"]));
        });
    });
    test("set/get locale", () => {
        fallbackLocales.value = [];
        locales.value = ["nl-NL"];
        expect(getLocales()).toEqual(["nl-NL"].concat(navigator.languages));
        locales.value = ["en-US"];
        expect(getLocales()).toEqual(["en-US"].concat(navigator.languages));
    });
    test("withLocale", () => {
        expect(withLocales(["de-DE"], getLocales)).toEqual(["de-DE"]);
    });
});
