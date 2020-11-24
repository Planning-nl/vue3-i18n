import { number } from "./index";

export type Pluralizer = (n?: number) => string;

export function plural(singular: string, plural: string): Pluralizer {
    return (n = 1): string => {
        if (n > 1) {
            return plural;
        } else {
            return singular;
        }
    };
}

export function pluralAmount(none: string, one: string, multiple: string): Pluralizer {
    return (n = 1): string => {
        if (n === 0) {
            return none;
        } else if (n === 1) {
            return one;
        } else {
            return multiple.replace("{n}", number(n));
        }
    };
}
