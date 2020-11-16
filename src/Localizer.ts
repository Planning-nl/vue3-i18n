import { getLocale } from "./locale";
import { ref } from "@vue/reactivity";

/**
 * Returns the item's translation for the current locale.
 */
export function t<T extends LocalValue>(item: LocaleItem<T>, locale = getLocale()): T {
    let result = getTranslation(item, locale);

    if (result === undefined) {
        const fallback = fallbackLocale.value;
        if (fallback) {
            result = getTranslation(item, fallback);
        }

        if (result === undefined) {
            // Use first item.
            result = getFirstLocaleValue(item)!;
        }
    }

    return result;
}

function getTranslation<T extends LocalValue>(item: LocaleItem<T>, locale: string): T | undefined {
    const match = item.locales[locale];
    if (match !== undefined) {
        // Quick path: perfect match.
        return match;
    } else {
        // Part-by-part lookup.
        let index;
        let partialLocale = locale;
        while ((index = partialLocale.lastIndexOf("-")) > 0) {
            partialLocale = partialLocale.substr(0, index);
            const partialMatch = item.locales[partialLocale];
            if (partialMatch !== undefined) return partialMatch;
        }

        const fallback = item.locales.fallback;
        if (fallback !== undefined) {
            return fallback;
        } else {
            return undefined!;
        }
    }
}

export const fallbackLocale = ref("en");

function getFirstLocaleValue<T>(item: LocaleItem<T>): T | undefined {
    const firstKey = Object.keys(item)[0];
    return item.locales[firstKey];
}

export type LocalValue = any | LocalFunction;
export type LocalFunction = (...args: any[]) => any;

export class LocaleItem<T extends LocalValue = LocalValue> {
    constructor(public readonly locales: Record<string, T>) {}

    patch(other: LocaleItem<T>): void {
        Object.assign(this.locales, other.locales);
    }

    get __v_skip(): boolean {
        return true;
    }
}

/**
 * Creates an Item for the specified ItemLocales.
 * Notice that this only ensures that the typescript type is correct.
 */
export function l<T extends LocalValue = LocalValue>(locales: Record<string, T>): LocaleItem<T> {
    return new LocaleItem<T>(locales);
}
