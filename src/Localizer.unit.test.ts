import { patch } from "./patch";
import { getLocales, locales, withLocales } from "./locales";
import { l, LocaleItem, t } from "./Localizer";
import { computed, reactive } from "@vue/reactivity";
import { useI18n } from "./index";

describe("Localizer", () => {
    const L = l({ nl: "nl", "nl-NL": "nl-NL", "de-DE": "de-DE", "de-DE-BY": "de-DE-BY", fallback: "fallback" });

    afterEach(() => {
        locales.value = undefined;
    });

    describe("locale", () => {
        test("fallback to navigator locale", () => {
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
    });

    test("patch", () => {
        const T = useI18n({
            multi: {
                main: l({
                    nl: "Nederlands",
                    "de-DE-BY": "Bayern",
                    "de-DE": "Deutsch",
                    fallback: "-",
                }),
                sub: l({
                    nl: "Nederlands",
                }),
            },
        });

        expect(withLocales(["nl"], () => T.multi.main)).toBe("Nederlands");
        expect(withLocales(["de-DE-BY"], () => T.multi.main)).toBe("Bayern");
        expect(withLocales(["de-DE-NW"], () => T.multi.main)).toBe("Deutsch");
        expect(withLocales(["fr-BE"], () => T.multi.main)).toBe("-");

        expect(withLocales(["nl"], () => T.multi.sub)).toBe("Nederlands");

        patch(T, {
            multi: {
                main: l({
                    nl: "Nederlands 2",
                    "de-DE-NW": "Nordrhein Westfalen",
                }),
                sub: undefined,
            },
        });

        expect(withLocales(["nl"], () => T.multi.main)).toBe("Nederlands 2");
        expect(withLocales(["de-DE"], () => T.multi.main)).toBe("Deutsch");
        expect(withLocales(["de-DE-NW"], () => T.multi.main)).toBe("Nordrhein Westfalen");
        expect(withLocales(["nl"], () => T.multi.sub)).toBe("Nederlands");
    });

    describe("translator", () => {
        const Base = {
            main: l({
                nl: "Nederlands",
                "de-DE-BY": "Bayern",
                "de-DE": "Deutsch",
                fallback: "-",
            }),
            primitive: 2,
            multi: {
                level: l({
                    nl: "Multi",
                    fallback: "-",
                }),
            },
        };

        test("data property", () => {
            const proxy = useI18n(Base);
            expect(proxy.data).toBe(Base);
        });

        test("get locale", () => {
            const proxy = useI18n(Base);
            withLocales(["de-DE-NW"], () => {
                expect(proxy.main).toBe("Deutsch");
            });
        });

        test("get deep locale", () => {
            const proxy = useI18n(Base);
            withLocales(["nl-NL"], () => {
                expect(proxy.multi.level).toBe("Multi");
            });
        });

        test("get primitive value", () => {
            const proxy = useI18n(Base);
            expect(proxy.primitive).toBe(2);
        });

        test("get object value", () => {
            const proxy = useI18n(Base);
            expect(Object.keys(proxy.multi)).toEqual(["level"]);
        });

        describe("reactivity", () => {
            test("wrap reactive proxy in locale proxy", () => {
                locales.value = ["nl-NL"];
                const base = reactive(Base);
                const proxy = useI18n(base);
                expect(proxy.multi.level).toBe("Multi");
            });

            test("locale proxy should react to reactivity", () => {
                locales.value = ["nl-NL"];
                const base = reactive(Base);
                const proxy = useI18n(base);

                const c = computed(() => proxy.multi.level);
                expect(c.value).toBe("Multi");

                base.multi.level.patch(
                    new LocaleItem<string>({ nl: "Multi 2" }),
                );

                expect(c.value).toBe("Multi 2");
            });

            test("reactive prop defined later", () => {
                locales.value = ["nl-NL"];
                const base = reactive(Base);
                const proxy = useI18n(base);

                const c = computed(() => (proxy.multi as any).unknown);
                expect(() => c.value).toThrowError("Key 'unknown' not found!");

                (base.multi as any).unknown = l({ nl: "onbekend", en: "unknown" });
                expect(c.value).toBe("onbekend");
            });

            //@todo: test setting reactive unknown prop on translator.
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

        const t = useI18n(translations);

        locales.value = ["nl-NL"];
        expect(t.greetings("Evan")).toBe("Hallo beste Evan");

        locales.value = ["en"];
        expect(t.greetings("Evan")).toBe("Hello dear Evan");
    });
});
