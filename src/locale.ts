import { ref } from "@vue/reactivity";

export const locale = ref<string | undefined>();
export const navLocale = navigator.language;
let forceLocale: string | undefined;

export function getLocale(): string {
    if (forceLocale) return forceLocale;
    return locale.value ?? navLocale;
}

/**
 * Can be used to override the current locale temporarily.
 * Example usage: `const c = withLocale("en-GB", () => local(LocalizationSettings.currency))` ('GBP')
 */
export function withLocale<T>(locale: string, callback: () => T): T {
    forceLocale = locale;
    let result: T;
    try {
        result = callback();
    } finally {
        forceLocale = undefined;
    }
    return result;
}
