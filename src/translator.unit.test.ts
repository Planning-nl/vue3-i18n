import { l, TranslatableItem } from "./translation";
import { translate } from "./translator";
import { locales, withLocales } from "./locales";
import { reactive } from "vue";

describe("translator", () => {
    function getBase() {
        return {
            main: l({
                nl: "Nederlands",
                "de-DE-BY": "Bayern",
                "de-DE": "Deutsch",
                fallback: "-",
            }),
            multi: {
                level: l({
                    nl: "Multi",
                    fallback: "-",
                }),
            },
        };
    }

    test("raw property", () => {
        const Base = getBase();
        const proxy = translate(Base);
        expect(proxy._raw).toBe(Base);
    });

    test("get locale", () => {
        const Base = getBase();
        const proxy = translate(Base);
        withLocales(["de-DE-NW"], () => {
            expect(proxy.main).toBe("Deutsch");
        });
    });

    test("get deep locale", () => {
        const Base = getBase();
        const proxy = translate(Base);
        withLocales(["nl-NL"], () => {
            expect(proxy.multi.level).toBe("Multi");
        });
    });

    test("get object value", () => {
        const Base = getBase();
        const proxy = translate(Base);
        expect(Object.keys(proxy.multi)).toEqual(["level"]);
    });

    test("set locale", () => {
        const Base = getBase();
        const proxy = translate(Base);
        expect(() => ((proxy as any).main = "ok")).toThrowError();
    });

    describe("reactivity", () => {
        test("wrap reactive proxy in locale proxy", () => {
            locales.value = ["nl-NL"];
            const Base = getBase();
            const base = reactive(Base);
            const proxy = translate(base);
            expect(proxy.multi.level).toBe("Multi");
        });

        test("locale proxy should react to reactivity", () => {
            locales.value = ["nl-NL"];
            type ExpectedTranslations = {
                dynamic: {
                    prop: TranslatableItem<string>;
                };
            };

            const reactiveTranslations = translate(reactive({} as ExpectedTranslations));
            expect(reactiveTranslations.dynamic?.prop).toBe(undefined);
            reactiveTranslations._raw.dynamic = { prop: l({ en: "hello", nl: "hallo" }) };
            expect(reactiveTranslations.dynamic?.prop).toBe("hallo");
        });
    });
});
