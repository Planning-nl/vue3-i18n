import { getLocales } from "../locales";
import { l, t } from "../translation";

function getNumberFormat(options: Intl.NumberFormatOptions = {}) {
    return Intl.NumberFormat(getLocales() as string[], options);
}

export const numberPartsItem = l({
    fallback: (v: number, options: Intl.NumberFormatOptions = {}): Intl.NumberFormatPart[] => {
        return getNumberFormat(options).formatToParts(v);
    },
});

export function number(v: number, options: Intl.NumberFormatOptions = {}): string {
    return t(numberPartsItem)(v, options)
        .map((item) => item.value)
        .join("");
}

export function numberParts(v: number, options: Intl.NumberFormatOptions = {}): Intl.NumberFormatPart[] {
    return t(numberPartsItem)(v, options);
}
