import { getLocales } from "../locales";
import { l } from "../translation";

function getNumberFormat(options: Intl.NumberFormatOptions = {}) {
    return Intl.NumberFormat(getLocales() as string[], options);
}

export const number = l({
    fallback: (v: number, options: Intl.NumberFormatOptions = {}): string => {
        return getNumberFormat(options).format(v);
    },
});

export const numberParts = l({
    fallback: (v: number, options: Intl.NumberFormatOptions = {}): Intl.NumberFormatPart[] => {
        return getNumberFormat(options).formatToParts(v);
    },
});
