import { reactive } from "@vue/reactivity";
import { LocaleItem, l, local } from "./Localizer";
import { getLocale } from "./locale";

export function message(item: LocaleItem<MessageValue>, ucfirst: boolean = false, locale = getLocale()): string {
    let value = local<string | MessageObject>(item, locale);
    value = getUcfirst(value, ucfirst, locale);
    return messageToString(value);
}

export const MULTIPLE = -1;

export function noun(
    item: LocaleItem<MessageValue>,
    count: number = 1,
    ucfirst: boolean = false,
    locale = getLocale(),
): string {
    let value = local<string | MessageObject>(item, locale);
    value = getPlural(value, count, locale);
    value = getUcfirst(value, ucfirst, locale);
    return messageToString(value);
}

function getPlural(value: MessageValue, count: number, locale: string): MessageValue {
    if (isMessageObject(value)) {
        return local(rules.pluralization, locale)(value, count);
    } else {
        return value;
    }
}

function getUcfirst(value: MessageValue, ucfirst: boolean, locale: string): MessageValue {
    if (ucfirst) {
        value = local(rules.ucfirst, locale)(value);
    }
    return value;
}

function messageToString(message: MessageValue) {
    return isMessageObject(message) ? message.v : message;
}

// Describes which ucfirst strategy is applied. May be localized.
export const rules = reactive({
    ucfirst: l({
        fallback: (v) => {
            return messageToString(v)
                .split(" ")
                .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
                .join(" ");
        },
    }) as LocaleItem<(v: MessageValue) => MessageValue>,
    pluralization: l({
        fallback: (message, count) => {
            let value = message.v;
            // Simple pluralization.
            if (count === 0 && message.n) {
                value = message.n;
            }
            if (count === MULTIPLE && message.p) {
                value = message.p;
            }
            if (count > 1) {
                if (message.pc) {
                    value = message.pc;
                } else if (message.p) {
                    value = message.p;
                }
            }
            value = value.replace("{n}", "" + count);
            return value;
        },
    }) as LocaleItem<(message: MessageObject, count: number) => MessageValue>,
});

export type MessageValue = string | MessageObject;

export type MessageObject = {
    v: string;
} & Record<any, any>;

export function isMessageObject(v: any): v is MessageObject {
    return v && typeof v === "object";
}
