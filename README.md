# Vue3-i18n
 
This module offers lightweight and type safe i18n for [Vue 3](https://github.com/vuejs/vue-next) applications.

This module is meant to be a replacement for all those heavyweight i18n modules. 

Instead, this module:
* allows defining and changing a translations object
* selects the correct translation based on the active locale
* offers a resolver proxy to use translations in templates ergonomically

It does so in just **200 lines** of code.

At first glance it seems that some basic features are missing, such as pluralizations, 
numbers and dates. But this module utilizes the flexibility of ES6 code to allow these
features to be implemented in minimal code, so it's not necessary to ship these utility
functions. Examples are provided in this readme.

## Why Vue3-i18n?

* Simple, easy to understand
* Flexible enough to handle most use cases
* Ergonomic template syntax
* Reactive to updated locale and translations
* Fast (translates 3M items per second)
* Type safety (when using typescript)
* Supports IDE features such as 'find usages' and 'rename'

## Installation

`yarn install @planning/vue3-i18n`

`npm install --save @planning/vue3-i18n`

## Basic usage

```typescript
import { l, resolve, locale } from "@planning.nl/vue3-i18n";
export default defineComponent({
    setup() {
        return {
            locale,
            t: resolve({
                hello: l({
                    en: "hello",
                    nl: "hallo",
                    fallback: "👋",
                })
            })
        }
    }
})
```

```html
<template>
    <p v-text="t.hello"></p>
</template>
```

You could also define a shared set that can be imported and used throughout your app:

```typescript
import { l, resolve, locale } from "@planning.nl/vue3-i18n";

const translations = {
    hello: l({
        en: "hello",
        nl: "hallo",
        fallback: "👋",
    }),
    group: {
        world: l({
            en: "world",
            nl: "wereld",
            fallback: "🌐"
        })
    }
};

export const t = resolve(translations);

locales.value = ["nl-NL"];
console.log(`${t.hello} ${t.group.world}`); // "hallo wereld"

locales.value = ["fr"];
console.log(`${t.hello} ${t.group.world}`); // "👋 🌐"
```
## Features

### Translations object

You define a recursive object. Keys can either be objects, primitives or `LocaleItem`
instances. A `LocaleItem` defines a value (of any type) for various supported locales. 

These `LocaleItem` instances can be created using the `l` shortcut function. It accepts
a plain object with translated values, keyed by locale. Example:

```typescript
import { l } from "@planning.nl/vue3-i18n";

const translations = {
    hello: l({
        en: "hello",
        "en-US": "hi",
        nl: "hallo",
        fallback: "👋",
    }),
    main: {
        sub: l({ nl: "sub" })
    }
}
```

A locale key is a string that consists out of groups, separated by dash symbols.
The special key `fallback` provides the fallback value when no other locale matches. 

### Locales
Locales can be set using the exported `locales` ref. It accepts an array of 
strings or the default value `undefined` (in which case it uses `navigator.languages` instead).

The `getLocales()` function returns the array of currently used locales.

### Translating
Translating can be performed by the `t` function, which accepts a `LocaleItem` object and an optional specific locale.
Example:

```typescript
import { t } from "@planning.nl/vue3-i18n";
locales.value = ["nl"];
console.log(t(translations.hello)); // "hallo"
```

Usually it's more convenient to use a resolver proxy, as you do not need to manually invoke the t function.

### Translation rules

When fetching a translation, one of the keys will be selected for which to return
the value. The following rules apply:

1. The longest (most parts) key is used that matches the current locale. 
2. If no such key can be found at all, the next locale is checked. 
3. If no locale can be matched, the `fallback` key is used.
4. If `fallback` is not specified, the first specified key is used.

### Overriding the locale

The function `withLocales` can be used to fetch a translation for a specific
locale. It accepts a list of locales, and a callback that produces a value. 
Example:

### Resolver
The `resolve()` function produces a proxy-based structure that can be used to get translation values.

In practice it's a bit more ergonomic than having to call the `t` function manually. Especially within templates.

Example:
```typescript

console.log(t(translations.hello)); // "hallo"

const t = resolve(translations);
console.log(t.hello); // "hallo"

```

The resolver has the same structure as the translations object, though `LocalItem` instances are replaced by their 
translated value. 

If a non-existing path is traversed (which is possible in non-typescript contexts like
templates) an `UnknownPath` object is returned which has a `toString` which describes the key. Although this is a 
situation you should resolve, it's at least better than bailing out with a `Uncaught TypeError: Cannot read property 'X' 
of undefined`. 

```typescript
const hallo = withLocales(["nl"], () => t.hello);
```

### Patching

The `patch` function allows you to add/modify translations to an existing translation object.

> You should apply `patch` on the original translations object, not on a resolver (obtained by the `resolve` function).  

It iterates over all objects recursively, and merges the locales specified in LocaleItems.

Using the patch function ensures that all translation items have been specified. If some keys have not been specified a 
compilation error will occur.

There are two ways to ignore unspecified properties: 
1. By specifying the property value `undefined`, it will ignore it completely.
2. By overriding the type with any: `patch<any>(Base, obj)` 

Example:
```typescript

const Base = {
    multi: {
        main: l({
            "de-DE-BY": "Bayern",
            "de-DE": "Deutsch",
        }),
    },
};

locales.value = ["de-DE-NW"];
console.log(t.main); // Deutsch

patch(Base, {
    multi: {
        main: l({
            "de-DE-NW": "Nordrhein Westfalen",
        }),
    },
});

const t = resolve(Base);

locales.value = ["de-DE-NW"];
console.log(t.main); // Nordrhein Westfalen
```

## i18n for generic components

This lightweight module is perfect for providing i18n in generic components.

Just define your translations in a seperate file and export it (global). Then import
the translations into your component(s) and use them. Add translations for the locales
you wish to include by default.

That's all.

This enables applications using your component to `patch` the translation set with 
additional locales, or even to override the defaults that you have set.

Better still, `patch` enforces that all messages are translated. So if you add a new
message in an update, your users will receive a typescript error which notifies them
to provide translations for their own locales.

## Other features

This module doesn't ship with additional features.

Fortunately, you can still achieve these useful features (and more):
* String format patterns
* Pluralization
* Number formatting
* Date formatting
* Lazy loading

It's just up to you to implement them, though this is usually easy due to the 
flexibility of this module. Here are some suggestions.

### String format patterns

We don't support them as we don't need them. We recommend using functions, as it provides type safety. With
template literals the syntax is ergonomic enough. We can use it to back-reference other
translations (even functions), or use placeholders.

```typescript
import { l, resolve } from "@planning.nl/vue3-i18n";

const translations = {
    dear: l({ en: "dear", nl: "beste" }),
    greetings: l({
        en: (name: string) => `Hello ${t.dear} ${name}`,
        nl: (name: string) => `Hallo ${t.dear} ${name}`,
    }),
};

const t = resolve(translations);

locales.value = ["nl-NL"];
console.log(t.greetings("Evan")); // "Hallo beste Evan";

locales.value = ["en"];
console.log(t.greetings("Evan")); // "Hello dear Evan";
```

### Pluralization

We define a helper function that produces a count-to-string function. Notice how we could create a different
helper function if we'd need more complex pluralization rules, such as in Russian.

```typescript
import { l, resolve, locale } from "@planning.nl/vue3-i18n";

export function plural(none: string, one: string, multiple: string): (count: number) => string {
    return (count: number): string => {
        if (count === 0) {
            return none;
        } else if (count === 1) {
            return one;
        } else {
            return multiple.replace("{n}", "" + count);
        }
    };
}

const translations = {
    bananas: l({
        en: plural("no bananas", "one banana", "{n} bananas"),
        nl: plural("geen bananen", "één banaan", "{n} bananen"),
    }),
};

const t = resolve(translations);

console.log(t.bananas(10)); // 10 bananas
```

### Number formatting
Modern browsers can format numbers based on a locale. We simply must 'feed' it with our current locale:

```typescript
import { getLocale } from "@planning.nl/vue3-i18n";

export function number(v: number, options: NumberFormatOptions = {}): string {
    const formatter = Intl.NumberFormat(getLocale(), options);
    return formatter.format(v);
}
```

### Date formatting
Browser support locale date formatting using `DateTimeFormat`.

We could localize (https://kazupon.github.io/vue-i18n/guide/datetime.html)[custom definition formats] like this:

```typescript
import { l, resolve, locale } from "@planning.nl/vue3-i18n";

export function dtf(options: DateTimeFormatOptions): (date: Date) => string {
    return (date: Date = new Date()): string => (new Intl.DateTimeFormat('en-GB', options)).format(date)
}

const dateTimeFormats = {
    short: l({
        "en-US": dtf({year: "numeric", month: "short", day: "numeric"}),
        fallback: dtf({datestyle: "short"})
    }),
    long: l({
        "en-US": dtf({
            year: "numeric", month: "short", day: "numeric",
            weekday: "short", hour: "numeric", minute: "numeric"
        }),
        "ja-JP": dtf({
            year: "numeric", month: "short", day: "numeric",
            weekday: "short", hour: "numeric", minute: "numeric", hour12: true
        }),
        fallback: dtf({datestyle: "long"})
    }),
}
export const localDate = resolve(translations);

console.log(localDate.short());
```
Notice how it gracefully falls back to the browser-detected locale formats.

### Lazy loading

Frankly, I don't care much about lazy loading. We're dealing with text here which is easy to compress.

But if you really need this it's still possible. Simply load the data in a json and then run a `patch<any>`. 
The reactivity provided in this module would automatically update your site once the data is loaded.

## Browser support

Browser support for this module matches Vue3 browser support.

## License
[Apache](https://opensource.org/licenses/Apache-2.0)
