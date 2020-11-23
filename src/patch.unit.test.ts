import { translate } from "./translator";
import { l } from "./translation";
import { locales, withLocales } from "./locales";
import { patch, patchPartial } from "./patch";

describe("patch", () => {
    test("basic", () => {
        const T = translate({
            main: l({
                nl: "Nederlands",
                "de-DE-BY": "Bayern",
                "de-DE": "Deutsch",
                fallback: "-",
            }),
        });

        expect(withLocales(["nl"], () => T.main)).toBe("Nederlands");
        expect(withLocales(["de-DE-BY"], () => T.main)).toBe("Bayern");
        expect(withLocales(["de-DE-NW"], () => T.main)).toBe("Deutsch");
        expect(withLocales(["fr-BE"], () => T.main)).toBe("-");

        patch(T, {
            main: l({
                nl: "Nederlands 2",
                "de-DE-NW": "Nordrhein Westfalen",
            }),
        });

        expect(withLocales(["nl"], () => T.main)).toBe("Nederlands 2");
        expect(withLocales(["de-DE"], () => T.main)).toBe("Deutsch");
        expect(withLocales(["de-DE-NW"], () => T.main)).toBe("Nordrhein Westfalen");
    });

    test("recursive", () => {
        const T = translate({
            multi: {
                sub: l({
                    nl: "Nederlands",
                    fallback: "?",
                }),
            },
        });

        expect(withLocales(["nl"], () => T.multi.sub)).toBe("Nederlands");
        expect(withLocales(["de"], () => T.multi.sub)).toBe("?");

        patch(T, {
            multi: {
                sub: l({ de: "Deutsch" }),
            },
        });

        expect(withLocales(["nl"], () => T.multi.sub)).toBe("Nederlands");
        expect(withLocales(["de"], () => T.multi.sub)).toBe("Deutsch");
    });

    test("delete locale", () => {
        const T = translate({
            main: l({
                nl: "Nederlands",
                "de-DE-BY": "Bayern",
                "de-DE": "Deutsch",
                fallback: "-",
            }),
        });

        expect(withLocales(["de-DE-BY"], () => T.main)).toBe("Bayern");
        patch(T, { main: l({ "de-DE-BY": undefined }) });
        expect(withLocales(["de-DE-BY"], () => T.main)).toBe("Deutsch");
    });

    test("partial", () => {
        locales.value = ["nl"];

        const T = translate({
            main: l({
                nl: "Nederlands",
                fallback: "-",
            }),
            hello: l({
                en: "Hello",
                nl: "Hallo",
            }),
            multi: {
                sub: l({
                    nl: "Nederlands",
                    fallback: "?",
                }),
            },
        });

        expect(T.main).toBe("Nederlands");
        expect(T.hello).toBe("Hallo");
        expect(T.multi.sub).toBe("Nederlands");

        patchPartial(T, {
            main: l({
                nl: "Nederlands 2",
                "de-DE-NW": "Nordrhein Westfalen",
            }),
        });

        expect(T.main).toBe("Nederlands 2");
        expect(T.hello).toBe("Hallo");
        expect(T.multi.sub).toBe("Nederlands");
    });

    test("any", () => {
        locales.value = ["nl"];

        const T = translate({
            main: l({
                nl: "Nederlands",
                fallback: "-",
            }),
        });

        patch<any>(T, {
            main: l({
                nl: "Nederlands 2",
            }),
            newKey: l({
                en: "new key",
                nl: "nieuwe key",
            }),
            newBranch: {
                subKey: l({
                    en: "sub key",
                    nl: "sub key nl",
                }),
            },
        });

        expect(T.main).toBe("Nederlands 2");
        expect((T as any).newKey).toBe("nieuwe key");
        expect((T as any).newBranch.subKey).toBe("sub key nl");
    });
});
