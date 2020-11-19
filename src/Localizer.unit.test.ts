import { patch } from "./patch";
import { getLocales, locales, withLocales } from "./locales";
import { l, LocaleItem, t } from "./Localizer";
import { computed, reactive } from "@vue/reactivity";
import { formatDate, i18n, patchLocale } from "./index";
import { pluralAmount, plural } from "./utils/plural";
import { number } from "./utils/number";
import { dateTimeFormats } from "./utils/formatDate";

describe("Localizer", () => {
    const L = l({ nl: "nl", "nl-NL": "nl-NL", "de-DE": "de-DE", "de-DE-BY": "de-DE-BY", fallback: "fallback" });

    beforeEach(() => {
        locales.value = ["en"];
    });

    afterEach(() => {
        locales.value = undefined;
    });

    describe("locale", () => {
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

    describe("locale matching", () => {
        describe("locale matching", () => {
            test("empty locale", () => {
                locales.value = [];
                expect(t(L)).toBe("fallback");
            });

            test("unknown full locale", () => {
                locales.value = ["gr-GR-Cyrl"];
                expect(t(L)).toBe("fallback");
            });

            test("fallback locale", () => {
                locales.value = ["gr-GR-Cyrl", "nl"];
                expect(t(L)).toBe("nl");
            });

            describe("language", () => {
                test("language", () => {
                    locales.value = ["nl"];
                    expect(t(L)).toBe("nl");
                });

                test("[language]", () => {
                    locales.value = ["gr"];
                    expect(t(L)).toBe("fallback");
                });
            });

            describe("region", () => {
                test("language-region", () => {
                    locales.value = ["nl-NL"];
                    expect(t(L)).toBe("nl-NL");
                });

                test("language-[region]", () => {
                    locales.value = ["nl-BE"];
                    expect(t(L)).toBe("nl");
                });

                test("language-region", () => {
                    locales.value = ["de-DE"];
                    expect(t(L)).toBe("de-DE");
                });

                test("language-region-subregion", () => {
                    locales.value = ["de-DE-BY"];
                    expect(t(L)).toBe("de-DE-BY");
                });

                test("language-region-[subregion]", () => {
                    locales.value = ["de-DE-NW"];
                    expect(t(L)).toBe("de-DE");
                });
            });
        });
    });

    describe("localize", () => {
        const L = {
            main: {
                value: l({
                    en: "main en",
                    "en-GB": "main en GB",
                    fr: "main fr",
                    nl: "main nl",
                }),
                sub: {
                    a: l({ fallback: "sub a generic", en: "sub a en", nl: "sub a nl" }),
                },
            },
            all: l({ en: "all", fr: "tous", nl: "alle" }),
        };

        test("main locale", () => {
            locales.value = ["en"];
            expect(t(L.main.value)).toBe(L.main.value.locales["en"]);
        });

        test("sub locale, not existing", () => {
            locales.value = ["en-US"];
            expect(t(L.main.value)).toBe(L.main.value.locales["en"]);
        });

        test("sub locale, existing", () => {
            locales.value = ["en-GB"];
            expect(t(L.main.value)).toBe(L.main.value.locales["en-GB"]);
        });

        test("fallback locale", () => {
            locales.value = ["it"];
            expect(t(L.main.sub.a)).toBe(L.main.sub.a.locales.fallback);
        });

        test("first locale locale", () => {
            locales.value = ["it"];
            expect(t(L.main.value)).toBe(L.main.value.locales["en"]);
        });

        test("spread", () => {
            const setupVars = { ...i18n(L) };
            expect(setupVars.all).toBe("all");
            expect(setupVars.main.value).toBe("main en");
            locales.value = ["nl"];

            // First level will only be translated once.
            expect(setupVars.all).toBe("all");

            expect(setupVars.main.value).toBe("main nl");
        });
    });

    describe("patch", () => {
        test("basic", () => {
            const T = i18n({
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
            const T = i18n({
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

        test("partial", () => {
            locales.value = ["nl"];

            const T = i18n({
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

            patch(T, {
                main: l({
                    nl: "Nederlands 2",
                    "de-DE-NW": "Nordrhein Westfalen",
                }),
                hello: undefined,
                multi: undefined,
            });

            expect(T.main).toBe("Nederlands 2");
            expect(T.hello).toBe("Hallo");
            expect(T.multi.sub).toBe("Nederlands");
        });

        test("any", () => {
            locales.value = ["nl"];

            const T = i18n({
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

    describe("patchLocale", () => {
        test("basic", () => {
            const T = i18n({
                hello: l({} as LocaleItem<string>),
                sub: {
                    world: l({} as LocaleItem<string>),
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
            const T = i18n({
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
            const T = i18n({
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
            const proxy = i18n(Base);
            expect(proxy._raw).toBe(Base);
        });

        test("get locale", () => {
            const Base = getBase();
            const proxy = i18n(Base);
            withLocales(["de-DE-NW"], () => {
                expect(proxy.main).toBe("Deutsch");
            });
        });

        test("get deep locale", () => {
            const Base = getBase();
            const proxy = i18n(Base);
            withLocales(["nl-NL"], () => {
                expect(proxy.multi.level).toBe("Multi");
            });
        });

        test("get object value", () => {
            const Base = getBase();
            const proxy = i18n(Base);
            expect(Object.keys(proxy.multi)).toEqual(["level"]);
        });

        test("set locale", () => {
            const Base = getBase();
            const proxy = i18n(Base);
            expect(() => ((proxy as any).main = "ok")).toThrowError();
        });

        // top level translations?

        describe("reactivity", () => {
            test("wrap reactive proxy in locale proxy", () => {
                locales.value = ["nl-NL"];
                const Base = getBase();
                const base = reactive(Base);
                const proxy = i18n(base);
                expect(proxy.multi.level).toBe("Multi");
            });

            test("locale proxy should react to reactivity", () => {
                locales.value = ["nl-NL"];

                const reactiveTranslations = i18n(reactive({} as any)) as any;
                expect(reactiveTranslations.dynamic?.prop).toBe(undefined);
                reactiveTranslations._raw.dynamic = { prop: l({ en: "hello", nl: "hallo" }) };
                expect(reactiveTranslations.dynamic?.prop).toBe("hallo");
                console.log(reactiveTranslations.dynamic?.prop); // "hello"
            });
        });
    });

    test("patterns", () => {
        const translations = {
            dear: l({ en: "dear", nl: "beste" }),
            greetings: l({
                en: (name: string) => `Hello ${t.dear} ${name}`,
                nl: (name: string) => `Hallo ${t.dear} ${name}`,
            }),
        };

        const t = i18n(translations);

        locales.value = ["nl-NL"];
        expect(t.greetings("Evan")).toBe("Hallo beste Evan");

        locales.value = ["en"];
        expect(t.greetings("Evan")).toBe("Hello dear Evan");
    });

    describe("plural", () => {
        test("simple", () => {
            const t = i18n({
                banana: l({
                    en: plural("banana", "bananas"),
                }),
            });

            expect(t.banana(1)).toBe("banana");
            expect(t.banana(2)).toBe("bananas");
        });

        test("amount", () => {
            const t = i18n({
                bananas: l({
                    en: pluralAmount("no bananas", "one banana", "{n} bananas"),
                }),
            });

            expect(t.bananas(0)).toBe("no bananas");
            expect(t.bananas(1)).toBe("one banana");
            expect(t.bananas(10)).toBe("10 bananas");
        });
    });

    test("number", () => {
        locales.value = ["nl-NL"];
        const v = 99999.123;
        expect(number(v)).toBe(Intl.NumberFormat("nl-NL").format(v));
    });

    test("dateTimeFormat", () => {
        patch(dateTimeFormats, {
            long: l({
                "en-US": {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    weekday: "short",
                    hour: "numeric",
                    minute: "numeric",
                },
                "ja-JP": {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    weekday: "short",
                    hour: "numeric",
                    minute: "numeric",
                    hour12: true,
                },
            }),
        });

        patchLocale(dateTimeFormats, "en", {
            custom: { weekday: "long" },
        });

        const d = new Date(2020, 10, 20, 12, 41, 10);

        locales.value = ["en-US"];
        expect(formatDate(d, "unknown")).toBe("11/20/2020");
        expect(formatDate(d, "custom")).toBe("Friday");
        expect(formatDate(d, "long")).toBe("Fri, Nov 20, 2020, 12:41 PM");

        locales.value = ["ja-JP"];
        expect(formatDate(d, "long")).toBe("2020年11月20日(金) 午後0:41");

        const long = dateTimeFormats._raw["long"].locales;
        delete long["en-US"];
        delete long["ja-JP"];

        locales.value = ["en-US"];
        expect(formatDate(d, "long")).toBe("11/20/2020");
    });
});
