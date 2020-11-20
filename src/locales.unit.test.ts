import { getLocales, locales, withLocales } from "./locales";

describe("locales", () => {
    test("fallback to navigator locale", () => {
        locales.value = undefined;
        expect(getLocales()).toEqual(navigator.languages);
    });
    test("set/get locale", () => {
        locales.value = ["nl-NL"];
        expect(getLocales()).toEqual(["nl-NL"]);
        locales.value = ["en-US"];
        expect(getLocales()).toEqual(["en-US"]);
    });
    test("withLocale", () => {
        expect(withLocales(["de-DE"], getLocales)).toEqual(["de-DE"]);
    });
});
