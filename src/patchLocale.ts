import { TranslatableItem, Translations } from "./translation";
import { Translator } from "./translator";
import { getPrimaryLocale, withLocales } from "./locales";

export function patchLocale<T extends Translations>(
    item: Translator<T>,
    locale: string | undefined,
    patches: PatchLocaleObject<T>,
): void {
    withLocales([locale || getPrimaryLocale()], () => {
        patchLocaleData(item._raw, patches);
    });
}

function patchLocaleData<T extends Translations>(item: T, patches: PatchLocaleObject<T>): void {
    for (const [key, value] of Object.entries(patches)) {
        if (value !== undefined) {
            const itemValue = item[key as keyof T];
            if (itemValue === undefined) {
                // New key.
                const localeItem = new TranslatableItem({});
                localeItem.locales[getPrimaryLocale()] = value;
                item[key as keyof T] = localeItem as any;
            } else if (typeof itemValue === "object") {
                if (itemValue instanceof TranslatableItem) {
                    itemValue.locales[getPrimaryLocale()] = value;
                } else {
                    patchLocaleData(itemValue as Translations, value as any);
                }
            }
        }
    }
}

export type PatchLocaleObject<T extends Translations> = {
    [P in keyof T]:
        | undefined
        | (T[P] extends TranslatableItem<infer LI> ? LI : T[P] extends Translations ? PatchLocaleObject<T[P]> : never);
};
