import { TranslatableItem, Translations } from "./translation";
import { Translator } from "./translator";

export function patch<T extends Translations>(item: Translator<T>, patches: PatchObject<T>): void {
    patchData(item._raw, patches);
}

function patchData<T extends Translations>(item: T, patches: PatchObject<T>): void {
    for (const [key, newValue] of Object.entries(patches)) {
        if (newValue !== undefined) {
            const currValue = item[key as keyof T];
            if (currValue === undefined) {
                // New key.
                if (typeof newValue === "object") {
                    if (newValue instanceof TranslatableItem) {
                        item[key as keyof T] = newValue as any;
                    } else {
                        item[key as keyof T] = {} as any;
                        patchData(item[key as keyof T] as Translations, newValue);
                    }
                }
            } else if (typeof currValue === "object") {
                if (currValue instanceof TranslatableItem) {
                    if (newValue instanceof TranslatableItem) {
                        currValue.patch(newValue as TranslatableItem<T>);
                    }
                } else {
                    patchData(currValue as Translations, newValue as any);
                }
            }
        }
    }
}

export type PatchObject<T extends Translations> = {
    [P in keyof T]?: T[P] extends TranslatableItem<infer LI>
        ? TranslatableItem<LI | undefined>
        : T[P] extends Translations
        ? PatchObject<T[P]>
        : never;
};
