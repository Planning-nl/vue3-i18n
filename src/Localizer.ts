import { getLocales } from "./locales";
import { shallowReactive } from "@vue/reactivity";

/**
 * Returns the item's translation for the current locale.
 */
export function t<T extends LocalValue>(item: LocaleItem<T>, locales = getLocales()): T {
    for (let i = 0; i < locales.length; i++) {
        const result = getTranslation(item, locales[i]);
        if (result) return result;
    }

    if (item.locales.fallback) {
        return item.locales.fallback;
    } else {
        return getFirstLocaleValue(item)!;
    }
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
        return undefined;
    }
}

function getFirstLocaleValue<T>(item: LocaleItem<T>): T | undefined {
    const firstKey = Object.keys(item.locales)[0];
    return item.locales[firstKey];
}

export type LocalValue = any | LocalFunction;
export type LocalFunction = (...args: any[]) => any;

type Locales<T extends LocalValue = LocalValue> = Record<string, T> & {
    fallback?: T;
};

export class LocaleItem<T extends LocalValue = LocalValue> {
    public readonly locales: Locales;

    constructor(locales: Locales) {
        this.locales = shallowReactive(locales);
    }

    patch(other: LocaleItem<T>): void {
        Object.assign(this.locales, other.locales);
    }

    // Skip reactivity for item, because we don't want the values to become reactive.
    get __v_skip(): boolean {
        return true;
    }
}

/**
 * Creates an Item for the specified ItemLocales.
 * Notice that this only ensures that the typescript type is correct.
 */
export function l<T extends LocalValue = LocalValue>(locales: Locales<T>): LocaleItem<T> {
    return new LocaleItem<T>(locales);
}
