/**
 * Patch a localization object.
 * When the source object will change type later, typescript will warn about non-localized keys.
 */
import { LocaleItem } from "./Localizer";
import { Translations, Translator } from "./Translator";
import { getPrimaryLocale, withLocales } from "./locales";

export function patch<T extends Translations>(item: Translator<T>, patches: PatchObject<T>): void {
    patchData(item._raw, patches);
}

export function patchLocale<T extends Translations>(
    item: Translator<T>,
    locale: string | null,
    patches: PatchObject<T>,
): void {
    withLocales(locale !== null ? [locale] : [], () => {
        patchData(item._raw, patches);
    });
}

function patchData<T extends Translations>(item: T, patches: PatchObject<T>): void {
    for (const [key, value] of Object.entries(patches)) {
        if (value !== undefined) {
            const itemValue = item[key as keyof T];
            if (typeof itemValue === "object") {
                if (itemValue instanceof LocaleItem) {
                    if (value instanceof LocaleItem) {
                        itemValue.patch(value as LocaleItem<T>);
                    } else {
                        itemValue.locales[getPrimaryLocale()] = value;
                    }
                } else {
                    patchData(itemValue as Translations, value as any);
                }
            } else {
                item[key as keyof T] = value as any;
            }
        }
    }
}

/**
 * Keys can be ignored by setting the undefined value.
 */
export type PatchObject<T extends Translations> = {
    [P in keyof T]:
        | undefined
        | (T[P] extends LocaleItem<infer LI>
              ? LocaleItem<LI> | LI
              : T[P] extends Translations
              ? PatchObject<T[P]>
              : never);
};
