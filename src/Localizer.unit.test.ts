import { patch } from "./patch";
import { getLocales, locales, withLocales } from "./locales";
import { l, LocaleItem, t } from "./Localizer";
import { computed, reactive } from "@vue/reactivity";
import { i18n } from "./index";

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

        test("data property", () => {
            const Base = getBase();
            const proxy = i18n(Base);
            expect(proxy.data).toBe(Base);
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
                const Base = getBase();
                const base = reactive(Base);
                const proxy = i18n(base);

                const c = computed(() => proxy.multi.level);
                expect(c.value).toBe("Multi");

                base.multi.level.patch(
                    new LocaleItem<string>({ nl: "Multi 2" }),
                );

                expect(c.value).toBe("Multi 2");
            });

            test("reactive prop defined later", () => {
                locales.value = ["nl-NL"];
                const Base = getBase();
                const base = reactive(Base);
                const proxy = i18n(base);

                const c = computed(() => (proxy.multi as any).unknown);
                expect(c.value).toBe(undefined);

                (base.multi as any).unknown = l({ nl: "onbekend", en: "unknown" });
                expect(c.value).toBe("onbekend");
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
});
