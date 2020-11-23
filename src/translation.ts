import { getLocales } from "./locales";
import { shallowReactive } from "@vue/reactivity";

export type Translations = { [key: string]: TranslatableItem<any> | Translations };

/**
 * Returns the item's translation for the current locale.
 */
export function t<T>(item: TranslatableItem<T>, locales = getLocales()): T {
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

function getTranslation<T>(item: TranslatableItem<T>, locale: string): T | undefined {
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

function getFirstLocaleValue<T>(item: TranslatableItem<T>): T | undefined {
    const firstKey = Object.keys(item.locales)[0];
    return item.locales[firstKey];
}

export type LocaleValues<T> = Record<string, T> & {
    fallback?: T;
};

export class TranslatableItem<T> {
    public readonly locales: LocaleValues<T | undefined>;

    constructor(locales: LocaleValues<T | undefined>) {
        this.locales = shallowReactive(locales);
    }

    patch(other: TranslatableItem<T | undefined>): void {
        Object.assign(this.locales, other.locales);
    }

    get __v_skip(): boolean {
        // Skip reactivity for item, because we don't want the values to become reactive.
        return true;
    }
}

/**
 * Creates an Item for the specified ItemLocales.
 * Notice that this only ensures that the typescript type is correct.
 */
export function l<T>(locales: LocaleValues<T | undefined>): TranslatableItem<T> {
    return new TranslatableItem<T>(locales);
}
