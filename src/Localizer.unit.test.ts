import { patch } from "./patch";
import { getLocale, locale, withLocale } from "./locale";
import { l, t } from "./Localizer";

describe("Localizer", () => {
    const L = l({ nl: "nl", "nl-NL": "nl-NL", "de-DE": "de-DE", "de-DE-BY": "de-DE-BY", fallback: "fallback" });

    afterEach(() => {
        locale.value = undefined;
    });

    describe("locale", () => {
        test("fallback to navigator locale", () => {
            expect(getLocale()).toBe(navigator.language);
        });
        test("set/get locale", () => {
            locale.value = "nl-NL";
            expect(getLocale()).toBe("nl-NL");
            locale.value = "en-US";
            expect(getLocale()).toBe("en-US");
        });
        test("withLocale", () => {
            expect(withLocale("de-DE", getLocale)).toBe("de-DE");
        });
    });

    describe("locale matching", () => {
        describe("locale matching", () => {
            test("empty locale", () => {
                locale.value = "";
                expect(t(L)).toBe("fallback");
            });

            test("unknown full locale", () => {
                locale.value = "gr-GR-Cyrl";
                expect(t(L)).toBe("fallback");
            });

            describe("language", () => {
                test("language", () => {
                    locale.value = "nl";
                    expect(t(L)).toBe("nl");
                });

                test("[language]", () => {
                    locale.value = "gr";
                    expect(t(L)).toBe("fallback");
                });
            });

            describe("region", () => {
                test("language-region", () => {
                    locale.value = "nl-NL";
                    expect(t(L)).toBe("nl-NL");
                });

                test("language-[region]", () => {
                    locale.value = "nl-BE";
                    expect(t(L)).toBe("nl");
                });

                test("language-region", () => {
                    locale.value = "de-DE";
                    expect(t(L)).toBe("de-DE");
                });

                test("language-region-subregion", () => {
                    locale.value = "de-DE-BY";
                    expect(t(L)).toBe("de-DE-BY");
                });

                test("language-region-[subregion]", () => {
                    locale.value = "de-DE-NW";
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

        describe("local", () => {
            test("main locale", () => {
                locale.value = "en";
                expect(t(L.main.value)).toBe(L.main.value["en"]);
            });
            test("sub locale, not existing", () => {
                locale.value = "en-US";
                expect(t(L.main.value)).toBe(L.main.value["en"]);
            });
            test("sub locale, existing", () => {
                locale.value = "en-GB";
                expect(t(L.main.value)).toBe(L.main.value["en-GB"]);
            });
            test("fallback to generic locale", () => {
                locale.value = "it";

                // Use first specified value.
                expect(t(L.main.sub.a)).toBe(L.main.sub.a.fallback);
            });
        });
    });

    test("patch", () => {
        const Base = {
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
        };

        expect(withLocale("nl", () => t(Base.multi.main))).toBe("Nederlands");
        expect(withLocale("de-DE-BY", () => t(Base.multi.main))).toBe("Bayern");
        expect(withLocale("de-DE-NW", () => t(Base.multi.main))).toBe("Deutsch");
        expect(withLocale("fr-BE", () => t(Base.multi.main))).toBe("-");

        expect(withLocale("nl", () => t(Base.multi.sub))).toBe("Nederlands");

        patch(Base, {
            multi: {
                main: l({
                    nl: "Nederlands 2",
                    "de-DE-NW": "Nordrhein Westfalen",
                }),
                sub: undefined,
            },
        });

        expect(withLocale("nl", () => t(Base.multi.main))).toBe("Nederlands 2");
        expect(withLocale("de-DE", () => t(Base.multi.main))).toBe("Deutsch");
        expect(withLocale("de-DE-NW", () => t(Base.multi.main))).toBe("Nordrhein Westfalen");
        expect(withLocale("nl", () => t(Base.multi.sub))).toBe("Nederlands");
    });
});
