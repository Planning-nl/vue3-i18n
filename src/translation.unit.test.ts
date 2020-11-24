import { locales } from "./locales";
import { l, t } from "./translation";
import { translate } from "./index";

describe("Localizer", () => {
    const L = l({ nl: "nl", "nl-NL": "nl-NL", "de-DE": "de-DE", "de-DE-BY": "de-DE-BY", fallback: "fallback" });

    beforeEach(() => {
        locales.value = ["en"];
    });

    afterEach(() => {
        locales.value = [];
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
                    b: l({ fallback: "fallback b" }),
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
            expect(t(L.main.sub.b)).toBe(L.main.sub.b.locales.fallback);
        });

        test("first locale locale", () => {
            locales.value = ["it"];
            expect(t(L.main.value)).toBe(L.main.value.locales["en"]);
        });

        test("spread", () => {
            const setupVars = { ...translate(L) };
            expect(setupVars.all).toBe("all");
            expect(setupVars.main.value).toBe("main en");
            locales.value = ["nl"];

            // First level will only be translated once.
            expect(setupVars.all).toBe("all");

            expect(setupVars.main.value).toBe("main nl");
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

        const t = translate(translations);

        locales.value = ["nl-NL"];
        expect(t.greetings("Evan")).toBe("Hallo beste Evan");

        locales.value = ["en"];
        expect(t.greetings("Evan")).toBe("Hello dear Evan");
    });
});
