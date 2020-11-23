import { useI18n } from "../translator";
import { l } from "../translation";
import { plural, pluralAmount } from "./plural";

describe("plural", () => {
    test("simple", () => {
        const t = useI18n({
            banana: l({
                en: plural("banana", "bananas"),
            }),
        });

        expect(t.banana(1)).toBe("banana");
        expect(t.banana(2)).toBe("bananas");
    });

    test("amount", () => {
        const t = useI18n({
            bananas: l({
                en: pluralAmount("no bananas", "one banana", "{n} bananas"),
            }),
        });

        expect(t.bananas(0)).toBe("no bananas");
        expect(t.bananas(1)).toBe("one banana");
        expect(t.bananas(10)).toBe("10 bananas");
    });
});
