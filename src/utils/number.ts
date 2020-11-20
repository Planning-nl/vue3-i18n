import { getLocales } from "../locales";

function getNumberFormat(options: Intl.NumberFormatOptions = {}) {
    return Intl.NumberFormat(getLocales() as string[], options);
}

export function number(v: number, options: Intl.NumberFormatOptions = {}): string {
    return getNumberFormat(options).format(v);
}

export function numberParts(v: number, options: Intl.NumberFormatOptions = {}): Intl.NumberFormatPart[] {
    return getNumberFormat(options).formatToParts(v);
}
