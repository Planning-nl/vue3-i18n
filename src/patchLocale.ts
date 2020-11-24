import { l, TranslatableItem, Translations } from "./translation";
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

export function patchLocaleStrict<T extends Translations>(
    item: Translator<T>,
    locale: string | undefined,
    patches: StrictPatchLocaleObject<T>,
): void {
    withLocales([locale || getPrimaryLocale()], () => {
        patchLocaleData(item._raw, patches);
    });
}

function patchLocaleData<T extends Translations>(item: T, patches: PatchLocaleObject<T>): void {
    for (const [key, newValue] of Object.entries(patches)) {
        if (newValue !== undefined) {
            const currValue = item[key as keyof T];
            if (currValue === undefined) {
                // New key.
                const localeItem = new TranslatableItem({});
                localeItem.locales[getPrimaryLocale()] = newValue;
                item[key as keyof T] = localeItem as any;
            } else if (typeof currValue === "object") {
                if (currValue instanceof TranslatableItem) {
                    currValue.locales[getPrimaryLocale()] = newValue;
                } else {
                    patchLocaleData(currValue as Translations, newValue as any);
                }
            }
        }
    }
}

export type PatchLocaleObject<T extends Translations> = {
    [P in keyof T]?: T[P] extends TranslatableItem<infer LI>
        ? LI
        : T[P] extends Translations
        ? PatchLocaleObject<T[P]>
        : never;
};

export type StrictPatchLocaleObject<T extends Translations> = {
    [P in keyof T]:
        | undefined
        | (T[P] extends TranslatableItem<infer LI>
              ? LI
              : T[P] extends Translations
              ? StrictPatchLocaleObject<T[P]>
              : never);
};
