import { LocaleItem } from "./Localizer";
import { Translations, Translator } from "./Translator";

export function patch<T extends Translations>(item: Translator<T>, patches: PatchObject<T>): void {
    patchData(item._raw, patches);
}

function patchData<T extends Translations>(item: T, patches: PatchObject<T>): void {
    for (const [key, value] of Object.entries(patches)) {
        if (value !== undefined) {
            const itemValue = item[key as keyof T];
            if (itemValue === undefined) {
                // New key.
                if (typeof value === "object") {
                    if (value instanceof LocaleItem) {
                        item[key as keyof T] = value as any;
                    } else {
                        item[key as keyof T] = {} as any;
                        patchData(item[key as keyof T] as Translations, value);
                    }
                }
            } else if (typeof itemValue === "object") {
                if (itemValue instanceof LocaleItem) {
                    if (value instanceof LocaleItem) {
                        itemValue.patch(value as LocaleItem<T>);
                    }
                } else {
                    patchData(itemValue as Translations, value as any);
                }
            }
        }
    }
}

export type PatchObject<T extends Translations> = {
    [P in keyof T]:
        | undefined
        | (T[P] extends LocaleItem<infer LI> ? LocaleItem<LI> : T[P] extends Translations ? PatchObject<T[P]> : never);
};
