import { ref } from "@vue/reactivity";

export const locales = ref<string[] | undefined>();
let forceLocale: string[] | undefined;

export function getLocales(): Readonly<string[]> {
    if (forceLocale) return forceLocale;
    return locales.value ?? navigator.languages;
}

/**
 * Can be used to override the current locale temporarily.
 * Example usage: `const c = withLocale(["en-GB"], () => local(LocalizationSettings.currency))` ('GBP')
 */
export function withLocales<T>(locale: string[], callback: () => T): T {
    forceLocale = locale;
    let result: T;
    try {
        result = callback();
    } finally {
        forceLocale = undefined;
    }
    return result;
}
