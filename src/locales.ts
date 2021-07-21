import { computed, ref } from "vue";

export const locales = ref<string[]>([]);
export const fallbackLocales = ref<string[]>(["en"]);
const forceLocales = ref<string[] | undefined>();

const orderedLocales = computed(() => {
    return locales.value.concat(getNavigatorLanguages()).concat(fallbackLocales.value);
});

export function getNavigatorLanguages(): readonly string[] {
    return typeof navigator !== "undefined" ? navigator.languages : [];
}

export function getLocales(): Readonly<string[]> {
    return forceLocales.value ?? orderedLocales.value;
}

export function getPrimaryLocale(): string {
    const locales = getLocales();
    return locales.length ? locales[0] : "fallback";
}

/**
 * Can be used to override the locales temporarily.
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
