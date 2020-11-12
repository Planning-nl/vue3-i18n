import { getLocale } from "./locale";
import { ref } from "@vue/reactivity";

/**
 * Returns the local value for the item.
 */
export function local<T extends LocalValue>(item: LocaleItem<T>, locale = getLocale()): T {
    let result = getLocal(item, locale);

    if (result === undefined) {
        const fallback = fallbackLocale.value;
        if (fallback) {
            result = getLocal(item, fallback);
        }
    }

    if (result === undefined) {
        // Use first item.
        result = getFirstLocaleValue(item)!;
    }

    return result;
}

function getLocal<T extends LocalValue>(item: LocaleItem<T>, locale: string): T | undefined {
    const match = item[locale];
    if (match !== undefined) {
        // Quick path: perfect match.
        return match;
    } else {
        // Part-by-part lookup.
        let index;
        let partialLocale = locale;
        while ((index = partialLocale.lastIndexOf("-")) > 0) {
            partialLocale = partialLocale.substr(0, index);
            const partialMatch = item[partialLocale];
            if (partialMatch !== undefined) return partialMatch;
        }

        const fallback = item.fallback;
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
    return item[firstKey];
}

export type LocalValue = any | LocalFunction;
export type LocalFunction = (...args: any[]) => any;

export type LocaleItem<T extends LocalValue> = Record<string, T> & {
    fallback?: T;
};

/**
 * Creates an Item for the specified ItemLocales.
 * Notice that this only ensures that the typescript type is correct.
 */
export function l<T extends LocalValue = LocalValue>(l: LocaleItem<T>): LocaleItem<T> {
    return l;
}
