import { getLocales } from "../locales";
import { escapeHtml } from "./escapeHtml";

function getNumberFormat(options: Intl.NumberFormatOptions = {}) {
    return Intl.NumberFormat(getLocales() as string[], options);
}

export function number(v: number, options: Intl.NumberFormatOptions = {}): string {
    return getNumberFormat(options).format(v);
}

export function numberParts(v: number, options: Intl.NumberFormatOptions = {}): Intl.NumberFormatPart[] {
    return getNumberFormat(options).formatToParts(v);
}

export function numberHtml(v: number, options: Intl.NumberFormatOptions = {}): string {
    const parts = numberParts(v, options);
    const partsHtml = parts
        .map((part) => `<span class="i18n-number-${part.type}">${escapeHtml(part.value)}</span>`)
        .join("");
    return `<span class="i18n-number">${partsHtml}</span>`;
}
