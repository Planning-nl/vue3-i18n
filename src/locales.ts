import { ref } from "@vue/reactivity";

export const locales = ref<string[] | undefined>();
export const forceLocales = ref<string[] | undefined>();

export function getLocales(): Readonly<string[]> {
    return forceLocales.value ?? locales.value ?? navigator.languages;
}

export function getPrimaryLocale(): string {
    const locales = getLocales();
    return locales.length ? locales[0] : "fallback";
}

/**
 * Can be used to override the current locale temporarily.
 * Example usage: `const c = withLocale(["en-GB"], () => local(LocalizationSettings.currency))` ('GBP')
 */
export function withLocales<T>(locales: string[], callback: () => T): T {
    forceLocales.value = locales;
    let result: T;
    try {
        result = callback();
    } finally {
        forceLocales.value = undefined;
    }
    return result;
}
