import { useI18n } from "../translator";
import { l } from "../translation";
import { i18n } from "./index";
import { patchLocale } from "../patchLocale";
import { locales } from "../locales";

describe("plural", () => {
    test("simple", () => {
        const t = useI18n({
            banana: l({
                en: i18n.plural("banana", "bananas"),
            }),
        });

        expect(t.banana(1)).toBe("banana");
        expect(t.banana(2)).toBe("bananas");
    });

    test("amount", () => {
        const t = useI18n({
            bananas: l({
                en: i18n.pluralAmount("no bananas", "one banana", "{n} bananas"),
            }),
        });

        expect(t.bananas(0)).toBe("no bananas");
        expect(t.bananas(1)).toBe("one banana");
        expect(t.bananas(10)).toBe("10 bananas");
    });

    test("patching", () => {
        patchLocale(i18n, "nl", {
            plural: (singular, plural) => {
                return (n) => {
                    return `${n} ${plural}`;
                };
            },
        });

        locales.value = ["nl"];
        expect(i18n.plural("a", "b")(0)).toBe("0 b");
    });
});
