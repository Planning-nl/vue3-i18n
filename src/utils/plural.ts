import { number } from "./number";

export function plural(singular: string, plural: string): (n: number) => string {
    return (n: number = 1): string => {
        if (n > 1) {
            return plural;
        } else {
            return singular;
        }
    };
}

export function pluralAmount(none: string, one: string, multiple: string): (n: number) => string {
    return (n: number): string => {
        if (n === 0) {
            return none;
        } else if (n <= 1) {
            return one;
        } else {
            return multiple.replace("{n}", number(n));
        }
    };
}
