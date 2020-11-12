import { patch } from "./patch";
import { getLocale, locale, withLocale } from "./locale";
import { l, local } from "./Localizer";
import { number } from "./number";

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
                expect(local(L)).toBe("fallback");
            });

            test("unknown full locale", () => {
                locale.value = "gr-GR-Cyrl";
                expect(local(L)).toBe("fallback");
            });

            describe("language", () => {
                test("language", () => {
                    locale.value = "nl";
                    expect(local(L)).toBe("nl");
                });

                test("[language]", () => {
                    locale.value = "gr";
                    expect(local(L)).toBe("fallback");
                });
            });

            describe("region", () => {
                test("language-region", () => {
                    locale.value = "nl-NL";
                    expect(local(L)).toBe("nl-NL");
                });

                test("language-[region]", () => {
                    locale.value = "nl-BE";
                    expect(local(L)).toBe("nl");
                });

                test("language-region", () => {
                    locale.value = "de-DE";
                    expect(local(L)).toBe("de-DE");
                });

                test("language-region-subregion", () => {
                    locale.value = "de-DE-BY";
                    expect(local(L)).toBe("de-DE-BY");
                });

                test("language-region-[subregion]", () => {
                    locale.value = "de-DE-NW";
                    expect(local(L)).toBe("de-DE");
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
                expect(local(L.main.value)).toBe(L.main.value["en"]);
            });
            test("sub locale, not existing", () => {
                locale.value = "en-US";
                expect(local(L.main.value)).toBe(L.main.value["en"]);
            });
            test("sub locale, existing", () => {
                locale.value = "en-GB";
                expect(local(L.main.value)).toBe(L.main.value["en-GB"]);
            });
            test("fallback to generic locale", () => {
                locale.value = "it";

                // Use first specified value.
                expect(local(L.main.sub.a)).toBe(L.main.sub.a.fallback);
            });
        });

        describe("number", () => {
            test("response", () => {
                locale.value = "nl-NL";
                const v = 99999.123;
                expect(number(v)).toBe(Intl.NumberFormat("nl-NL").format(v));
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

        expect(withLocale("nl", () => local(Base.multi.main))).toBe("Nederlands");
        expect(withLocale("de-DE-BY", () => local(Base.multi.main))).toBe("Bayern");
        expect(withLocale("de-DE-NW", () => local(Base.multi.main))).toBe("Deutsch");
        expect(withLocale("fr-BE", () => local(Base.multi.main))).toBe("-");

        expect(withLocale("nl", () => local(Base.multi.sub))).toBe("Nederlands");

        patch(Base, {
            multi: {
                main: l({
                    nl: "Nederlands 2",
                    "de-DE-NW": "Nordrhein Westfalen",
                }),
                sub: undefined,
            },
        });

        expect(withLocale("nl", () => local(Base.multi.main))).toBe("Nederlands 2");
        expect(withLocale("de-DE", () => local(Base.multi.main))).toBe("Deutsch");
        expect(withLocale("de-DE-NW", () => local(Base.multi.main))).toBe("Nordrhein Westfalen");
        expect(withLocale("nl", () => local(Base.multi.sub))).toBe("Nederlands");
    });
});
