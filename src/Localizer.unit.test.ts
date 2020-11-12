import { patch } from "./patch";
import { getLocale, locale, withLocale } from "./locale";
import { l, local, LocaleItem } from "./Localizer";
import { message, MULTIPLE, noun } from "./message";
import { number } from "./number";

describe("Localizer", () => {
    const L = l(createMap(["nl", "nl-NL", "de-DE", "de-DE-BY"], "fallback"));

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
                    en: { v: "main en", n: "no main en", p: "Mains En Custom", pc: "{n} main ens" },
                    "en-GB": "main en GB",
                    fr: "main fr",
                    nl: { v: "main nl", p: "mains nl" },
                }),
                sub: {
                    a: l({ "": "sub a generic", en: "sub a en", nl: "sub a nl" }),
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
                expect(local(L.main.sub.a)).toBe(L.main.sub.a[""]);
            });
        });

        describe("message", () => {
            test("ucfirst", () => {
                locale.value = "en";
                expect(message(L.main.sub.a, true)).toBe("Sub A En");
            });
            test("ucfirst, default impl", () => {
                locale.value = "en";
                expect(message(L.main.value, true)).toBe("Main En");
            });

            describe("noun", () => {
                test("basic", () => {
                    locale.value = "en";
                    expect(noun(L.main.value)).toBe("main en");
                });

                describe("noun", () => {
                    test("plural", () => {
                        locale.value = "en";
                        expect(noun(L.main.value, MULTIPLE)).toBe("Mains En Custom");
                    });

                    test("none", () => {
                        locale.value = "en";
                        expect(noun(L.main.value, 0)).toBe("no main en");
                    });

                    test("count", () => {
                        locale.value = "en";
                        expect(noun(L.main.value, 3)).toBe("3 main ens");
                    });

                    test("plural, not existing", () => {
                        locale.value = "en";

                        // Fallback to single value.
                        expect(noun(L.main.sub.a, MULTIPLE)).toBe("sub a en");
                    });

                    test("plural, locale not having plural", () => {
                        locale.value = "fr";

                        // Use fallback language.
                        expect(noun(L.main.value, MULTIPLE)).toBe("main fr");
                    });

                    test("ucfirst and plural", () => {
                        locale.value = "en";
                        expect(noun(L.main.value, MULTIPLE, true)).toBe("Mains En Custom");
                    });
                });
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

function createMap(patterns: string[], fallback?: string) {
    const results: LocaleItem<string> = {};
    patterns.forEach((pattern) => {
        results[pattern] = pattern;
    });
    results.fallback = fallback;
    return results;
}
