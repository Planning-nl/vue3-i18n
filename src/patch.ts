/**
 * Patch a localization object.
 * When the source object will change type later, typescript will warn about non-localized keys.
 */
import { LocaleItem } from "./Localizer";
import { AnyObject, Translator } from "./Translator";

export function patch<T extends AnyObject>(item: Translator<T>, patches: PatchObject<T>): void {
    patchData(item.data, patches);
}

function patchData<T extends AnyObject>(item: T, patches: PatchObject<T>): void {
    for (const [key, value] of Object.entries(patches)) {
        if (value !== undefined) {
            const itemValue = item[key as keyof T];
            if (typeof itemValue === "object") {
                if (itemValue instanceof LocaleItem) {
                    itemValue.patch(value as LocaleItem<T>);
                } else {
                    patchData(itemValue as AnyObject, value as any);
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
export type PatchObject<T extends AnyObject> = {
    [P in keyof T]: undefined | (T[P] extends AnyObject ? PatchObject<T[P]> : T[P]);
};
