import { translate } from "./translator";
import { l, TranslatableItem } from "./translation";
import { patchLocale, patchLocaleStrict } from "./patchLocale";
import { locales, withLocales } from "./locales";

describe("patchLocale", () => {
    test("basic", () => {
        const T = translate({
            hello: l({} as TranslatableItem<string>),
            sub: {
                world: l({} as TranslatableItem<string>),
            },
        });

        patchLocaleStrict(T, "en", {
            hello: "hello",
            sub: {
                world: "world",
            },
        });

        locales.value = ["en"];
        expect(T.hello + " " + T.sub.world).toBe("hello world");
    });

    test("add key", () => {
        const T = translate({
            main: l({
                "de-DE": "Deutsch",
            }),
        });

        patchLocaleStrict(T, "fallback", {
            new: "new",
        } as any);

        expect((T as any).new).toBe("new");
    });

    test("empty locale patch", () => {
        const T = translate({
            main: l({
                "de-DE": "Deutsch",
            }),
        });

        patchLocaleStrict(T, "fallback", {
            main: "other",
        });

        expect(withLocales(["it"], () => T.main)).toBe("other");
    });

    test("partial", () => {
        const T = translate({
            one: l({
                "de-DE": "Deutsch",
            }),
            two: l({
                "de-DE": "Deutsch",
            }),
        });

        patchLocale(T, "fallback", {
            one: "other",
        });

        expect(withLocales(["it"], () => T.one)).toBe("other");
        expect(withLocales(["it"], () => T.two)).toBe("Deutsch");
    });
});
