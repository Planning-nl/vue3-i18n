# Vue3-i18n
 
This is a lightweight and type safe i18n library for [Vue 3](https://github.com/vuejs/vue-next) applications.

## Basic Features
* define **translation objects**
* get and set the **active locale(s)** 
* use these translations using compact syntax
* mutate existing translation objects

## Why Vue3-i18n?
* Simple, easy to understand
* Flexible enough to handle even complex i18n use cases
* Ergonomic syntax
* Locales and translations are reactive (@vue/reactivity)
* Small in size
* Fast (translates 3M items per second)
* Type safety
* IDE features such as *find usages* and *rename*

## Installation

`yarn install @planning/vue3-i18n`

`npm install --save @planning/vue3-i18n`

## Basic usage

```typescript
import { l, i18n, locale } from "@planning.nl/vue3-i18n";
export default defineComponent({
    setup() {
        return {
            t: i18n({
                hello: l({
                    en: "hello",
                    nl: "hallo",
                    fallback: "👋",
                })
            }),
        }
    }
})
```

```html
<template>
    <p v-text="t.hello"></p>
</template>
```

> Notice that you shouldn't *spread* your i18n proxy in the setup (`{...i18n({..})`) 
> If it contains translatable items on the root level, those will only be translated once initially.

```typescript
import { l, i18n, locale } from "@planning.nl/vue3-i18n";

export const t = i18n({
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
});

locales.value = ["nl-NL"];
console.log(`${t.hello} ${t.group.world}`); // "hallo wereld"

locales.value = ["fr"];
console.log(`${t.hello} ${t.group.world}`); // "👋 🌐"
```

## API

### Translation Set

The `i18n` does all the translation magic and produces a *translator*. It expects a nested object that contains all your 
translations. This entries in this object should either be plain objects (translation groups) or translatable items.

Translatable items can be created using the `l` function. It accepts a plain object with translations, keyed by locales.
The translations can be of any type, not just strings. This gives this library a lot of flexibility. 
 
```typescript
import { l, i18n } from "@planning.nl/vue3-i18n";

const translations = i18n({
    hello: l({
        en: "hello",
        "en-US": "hi",
        nl: "hallo",
        fallback: "👋",
    }),
    main: {
        sub: l({ nl: "sub" })
    }
})
```

A locale key is a string. It can contain a multiple parts, separated by `-` symbols. The first group represents the 
language, the second group the region and the third group a possible variant. 

The `fallback` can be used to define the translation to be used when no locale matches. 

> Locale formats are defined in the [BCP 47](https://en.wikipedia.org/wiki/IETF_language_tag) locale code.

### Locales
Locales can be set using the exported `locales` ref. It accepts an array of strings or the default value `undefined` 
(in which case it uses `navigator.languages` instead).

The first locale is the primary one. Only if no translation can be found for it, the next locale in the list will be
checked (and so on).

The `getLocales()` function returns the array of currently active locales.

### Locale overriding

The function `withLocales` can be used to fetch a translation for a specific locale. It accepts a list of locales, and 
a callback that produces a value:

```typescript
const hallo = withLocales(["nl", "en-US"], () => t.hello);
```

> `withLocales` is especially handy when a value needs to be fetched for another locale than the current one. For
> example, consider the language selector widget which usually contains a description in the target language itself.

### Translation

When fetching a translation, one of the keys will be selected for which to return the value. The following rules apply:

1. The longest (most parts) key is used that matches the current primary locale. 
2. If no such key can be found at all, the secondary, third, ... locale is checked. 
3. If no locale can be matched, the `fallback` key is used.
4. If `fallback` is not specified, the first specified key is used.

> Locale matching in this module doesn't exactly follow BCP 47. It is simplified for simplicity and performance.
> This is usually not important unless you want to distinguish between multiple scripts (for example `sr-Latn-SR` and 
> `sr-Cyrl-SR`). 

### Patching
The `patch` function allows you to conveniently change translations of an existing translator object.

It iterates over both the translations object recursively, and merges the locales for the translatable items.

Using the patch function ensures that all translation items have been specified. If some keys have not been specified a 
typescript error will occur. This makes sure you didn't forget one. 

> Although patching is the advised method of changing a translations set, it's also possible to change the translations 
> object directly. Use the `_raw` property to obtain a reference to it.

There are two ways to ignore unspecified properties: 
1. By specifying the property value `undefined`, it will ignore it completely.
2. By overriding the type with any: `patch(Base, obj as any)`.

```typescript
const t = i18n({
    multi: {
        main: l({
            "de-DE-BY": "Bayern",
            "de-DE": "Deutsch",
        }),
    },
});

locales.value = ["de-DE-NW"];
console.log(t.main); // Deutsch

patch(t, {
    multi: {
        main: l({
            "de-DE-NW": "Nordrhein Westfalen",
        }),
    },
});

locales.value = ["de-DE-NW"];
console.log(t.main); // Nordrhein Westfalen
```

When changing a single locale, `patchLocale` provides a cleaner syntax:

```typescript
patchLocale(t, "nl", { 
    multi: { 
        main: "Nederlands" 
    }
});
```

### String format patterns
Most i18n frameworks allow special patterns in translation strings as *placeholders* or *references* to other translations.
 
This library doesn't post-process strings at all, and it doesn't have any such patterns. You can use normal functions, 
as they provide flexibility as well as type safety:

```typescript
const t = i18n({
    dear: l({ en: "dear", nl: "beste" }),
    greetings: l({
        en: (name: string) => `Hello ${t.dear} ${name}`,
        nl: (name: string) => `Hallo ${t.dear} ${name}`,
    }),
});

locales.value = ["nl-NL"];
console.log(t.greetings("Evan")); // "Hallo beste Evan";

locales.value = ["en"];
console.log(t.greetings("Evan")); // "Hello dear Evan";
```

### Pluralization

Most used languages have the same basic pluralization rules. Nouns come in two forms: singular and plural nouns.

This modules ships with some helper functions specifically for this pluralization rule:
* `i18n.plural` defines nouns with a singular and plural form
* `i18n.pluralAmount` defines nouns along with an 'amount' quantifier

Both produce a `(n?: number) => string` converter which can be used directly from the translator.

> You can also patch these utility functions to extend them for languages that don't follow these patterns.

```typescript
const t = i18n({
    banana: l({
        en: i18n.plural("banana", "bananas"),
    }),
    cost: l({
        en: i18n.pluralAmount("free", "one euro", "{n} euros"),
    }),
});

console.log(t.bananas(2)); // bananas
console.log(t.cost()); // one euro
console.log(t.cost(10.55)); // 10.55 euros
```

> You may prefer another method of pluralization, or you may need another plural rules for a specific locale. In that 
> case you can add and use your own pluralization functions.

### Number

You can use the `i18n.number` function to format a number. This library relies on the `Intl.NumberFormat` browser 
functionality for locale-aware number formatting.
 
The `i18n.number` function accepts a number and additional [Intl.NumberFormatOptions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat) number format options. 

```typescript
console.log(i18n.number(10, { style: 'currency', currency: 'EUR' }));
```

The `i18n.numberParts` returns the result in a `Intl.NumberFormatPart` array.

> You can also patch these utility functions to extend them for languages that don't follow these patterns.
 
### Datetime

You can use the `i18n.datetime` function to format a date. This library relies on the `Intl.DateTimeFormat` browser 
functionality.

This module allows a way to override/add custom datetime *formats*:

```typescript
patchLocale(dateTimeFormats, "en-US", {
    long: {
        year: "numeric",
        month: "short",
        day: "numeric",
        weekday: "short",
        hour: "numeric",
        minute: "numeric",
    },        
    custom: { weekday: "long" },
});

locales.value = ["en-US"];
console.log(datetime(new Date(), "long"));
console.log(datetime(new Date(), "custom", { weekday: "long" }));
```

The `i18n.datetimeParts` function will return the result in a `Intl.DateTimeFormatPart` array.

> You can also patch these utility functions to extend them for languages that don't follow these patterns.

## i18n for generic components

This lightweight module is perfect for providing i18n in generic component modules.

Define your translations in a seperate file and export it as part of your module. Then import the translations into your 
component(s) and use them where you need them. Add translations for the locales that you wish to ship with your module.

Add a `peerDependency` and `devDependency` towards `@planning/vue3-i18n` to ensure that module is installed (only once).

This enables applications using your component to `patch` the translation set with additional locales, or even to 
override the defaults that you have set.

Better still, `patch` enforces that *all messages* are translated. If you add a new message in an update, your users 
will receive a typescript error which forces them to provide translations for their own locales.

## Advanced use cases

### Reactive translation objects
If you have a dynmically changing translations object and need it to be reactive, wrap the object into `reactive` before 
passing it to `i18n`:

```typescript
const reactiveTranslations = i18n(reactive({} as any));
console.log(reactiveTranslations.dynamic?.prop); // undefined
reactiveTranslations._raw.dynamic = { prop: l({ en: "hello", nl: "hallo" }) };
console.log(reactiveTranslations.dynamic?.prop); // "hello"
```

You *don't* need this when you're only adding/changing translations for existing items, as they are reactive by default. 

You *do* need this when parts of your set may be added, removed or reassigned dynamically.

### Translation Keys
When you'd like to get the translatable keys (type) of a translator object, be aware that the `_raw` key is included. 
This is probably not what you want. 

You can can use `keyof typeof translations["_raw"]` to get to the 'real' keys.

## Browser support

Browser support for this module matches Vue3 browser support.

> This module relies on `Proxy`, which means that IE11 is not supported.

## License
[Apache](https://opensource.org/licenses/Apache-2.0)
