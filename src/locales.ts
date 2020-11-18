import { ref } from "@vue/reactivity";

export const locales = ref<string[] | undefined>();
let forceLocales: string[] | undefined;

export function getLocales(): Readonly<string[]> {
    if (forceLocales) return forceLocales;
    return locales.value ?? navigator.languages;
}

/**
 * Can be used to override the current locale temporarily.
 * Example usage: `const c = withLocale(["en-GB"], () => local(LocalizationSettings.currency))` ('GBP')
 */
export function withLocales<T>(locales: string[], callback: () => T): T {
    forceLocales = locales;
    let result: T;
    try {
        result = callback();
    } finally {
        forceLocales = undefined;
    }
    return result;
}
