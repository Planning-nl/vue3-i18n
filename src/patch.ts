import { TranslatableItem, Translations } from "./translation";
import { Translator } from "./translator";

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
                    if (value instanceof TranslatableItem) {
                        item[key as keyof T] = value as any;
                    } else {
                        item[key as keyof T] = {} as any;
                        patchData(item[key as keyof T] as Translations, value);
                    }
                }
            } else if (typeof itemValue === "object") {
                if (itemValue instanceof TranslatableItem) {
                    if (value instanceof TranslatableItem) {
                        itemValue.patch(value as TranslatableItem<T>);
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
        | (T[P] extends TranslatableItem<infer LI>
              ? TranslatableItem<LI | undefined>
              : T[P] extends Translations
              ? PatchObject<T[P]>
              : never);
};
