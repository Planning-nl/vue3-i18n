import { l, t } from "../translation";
import { number } from "./number";

type Pluralizer = (n?: number) => string;

export const plural = l({
    fallback: (singular: string, plural: string): Pluralizer => {
        return (n = 1): string => {
            if (n > 1) {
                return plural;
            } else {
                return singular;
            }
        };
    },
});

export const pluralAmount = l({
    fallback: (none: string, one: string, multiple: string): Pluralizer => {
        return (n = 1): string => {
            if (n === 0) {
                return none;
            } else if (n === 1) {
                return one;
            } else {
                return multiple.replace("{n}", t(number)(n));
            }
        };
    },
});
