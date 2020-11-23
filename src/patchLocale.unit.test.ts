import { useI18n } from "./translator";
import { l, TranslatableItem } from "./translation";
import { patchLocale } from "./patchLocale";
import { locales, withLocales } from "./locales";

describe("patchLocale", () => {
    test("basic", () => {
        const T = useI18n({
            hello: l({} as TranslatableItem<string>),
            sub: {
                world: l({} as TranslatableItem<string>),
            },
        });

        patchLocale(T, "en", {
            hello: "hello",
            sub: {
                world: "world",
            },
        });

        locales.value = ["en"];
        expect(T.hello + " " + T.sub.world).toBe("hello world");
    });

    test("add key", () => {
        const T = useI18n({
            main: l({
                "de-DE": "Deutsch",
            }),
        });

        patchLocale(T, "fallback", {
            new: "new",
        } as any);

        expect((T as any).new).toBe("new");
    });

    test("empty locale patch", () => {
        const T = useI18n({
            main: l({
                "de-DE": "Deutsch",
            }),
        });

        patchLocale(T, "fallback", {
            main: "other",
        });

        expect(withLocales(["it"], () => T.main)).toBe("other");
    });
});
