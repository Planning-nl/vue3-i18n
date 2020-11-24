# Vue3-i18n
 
This is a lightweight and type safe i18n library for [Vue 3](https://github.com/vuejs/vue-next) applications.

## Basic Features
* define **translation objects**
* get and set the **active locale(s)** 
* use these translations using compact syntax
* mutate existing translation objects

## Why Vue3-i18n?
* Simple, easy to understand
* Small in size
* Ergonomic syntax
* Fast (translates 3M items per second)
* Flexible and extensible
* Type safe
* IDE features such as *find usages* and *rename*
* Locales and translations are reactive (@vue/reactivity)
* Provides extensible translations for modules and libraries

## Installation

`yarn install @planning/vue3-i18n`

`npm install --save @planning/vue3-i18n`

## Basic usage

```typescript
import { l, translate } from "@planning.nl/vue3-i18n";

export const t = translate({
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

Component usage:
```typescript
import { l, translate, number } from "@planning.nl/vue3-i18n";
export default defineComponent({
    setup() {
        return {
            t: translate({
                hello: l({
                    en: "hello",
                    nl: "hallo",
                    fallback: "👋",
                })
            }),
            number
        }
    }
})
```

```html
<template>
    <p v-text="t.hello"></p>
    <p>{{ t.hello }} <span>{{ number(10.23) }}</p>
</template>
```

> You should never *spread* a translator object (`{...translate({})}`) because it is a proxy. 

## API

### Translation Set

The `translate` function does all the translation magic and produces a **translator**. 

It expects a nested object that contains your translation items and translations. The entries in this object should 
either be plain objects (translation groups) or **translation items**.

Translatable items can be created using the `l` function. It accepts a plain object with translations, keyed by locales.
The translation values can be of any type, not just strings. 
 
```typescript
import { l, translate } from "@planning.nl/vue3-i18n";

const translations = translate({
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

A locale key is a string. It is made up of parts, separated by `-` symbols. The first part represents the language, the 
second group the region and the third group a possible variant. 

The `fallback` can be used to define the translation to be used when no locale matches. 

> Locale formats are defined in the [BCP 47](https://en.wikipedia.org/wiki/IETF_language_tag) locale code.

### Translation

Fetching a translation can be done by simply traversing the translator object:

```typescript
locales.value = ["nl"];
console.log(translations.main.sub); // "sub"
console.log(translations.hello); // "hallo"
```

When fetching a translation, one of the locale keys will be selected based on the active locales. The associated value 
will be returned.

The following rules apply:

1. The key is used that has the most parts and matches the primary locale (`getLocales()[0]`). 
2. If no such key can be found at all, the secondary, third, ... entry in `getLocales()` is checked. 
3. If no locale can be matched, the `fallback` locale key is used.
4. If `fallback` is not specified, the first specified locale key is used.

> Locale matching in this module doesn't *exactly* follow BCP 47. It was simplified for simplicity and performance.

### Locales

The `getLocales()` function returns the array of currently active locales. It returns a concatenated array of:
- `locales`
- `navigator.languages`
- `fallbackLocales`

The `locales` ref allows you to overrule the browser's locale (a custom language selector).

The `fallbackLocales` ref can be handy if you wish to use the browser's locale. If the visitor doesn't have a supported 
locale, you can provide a fallback. This has been set to `["en"]` by default.

### Locale overriding

The function `withLocales` can be used to fetch a translation for a specific locale. It accepts a list of locales, and 
a callback that produces a value:

```typescript
const hallo = withLocales(["nl", "en-US"], () => t.hello);
```

> `withLocales` is especially handy when a value needs to be fetched for another locale than the current one. For
> example a language selector widget usually contains a description in the target language itself.

### String format patterns
Most i18n frameworks allow special patterns in translation strings as *placeholders* or *references* to other translations.
 
This library doesn't post-process strings at all, and it doesn't have any such patterns. You can use normal functions, 
as they provide flexibility as well as type safety:

```typescript
const t = translate({
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

Most used languages have the same basic pluralization rules: *nouns* come in two forms (singular and plural).

For this form of pluralization some helper functions are available:
* `plural` defines nouns with a singular and plural form
* `pluralAmount` defines nouns along with an 'amount' quantifier

Both produce a `(n?: number) => string` converter which can be used directly from the translator.

> You can also patch these utility functions to extend them for languages that don't follow these patterns.

```typescript
const t = translate({
    banana: l({
        en: plural("banana", "bananas"),
    }),
    cost: l({
        en: pluralAmount("free", "one euro", "{n} euros"),
    }),
});

console.log(t.bananas(2)); // bananas
console.log(t.cost()); // one euro
console.log(t.cost(10.55)); // 10.55 euros
```

> You may prefer another method of pluralization, or you may need another plural rules for a specific locale. In that 
> case you can create and use your own pluralization functions.

### Number

You can use the `number` function to format a number. This library relies on the `Intl.NumberFormat` browser 
feature for locale-aware number formatting.
 
The `number` function accepts a number and additional [Intl.NumberFormatOptions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat) number format options. 

```typescript
console.log(number(10, { style: 'currency', currency: 'EUR' }));
```

The `numberParts` returns the result in a `Intl.NumberFormatPart` array.

### Datetime

You can use the `datetime` function to format a date. This library relies on the `Intl.DateTimeFormat` browser 
feature.

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

The `datetimeParts` function will return the result in a `Intl.DateTimeFormatPart` array.

### ucFirst

The `ucFirst` function accepts a string and returns the same string with the first character capitalized:

```typescript
console.log(ucFirst("hello")); // "Hello"
```

> As simple as capitalization seems, it is actually [locale-dependent](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/toLocaleUpperCase).

### Mutations

The typical use case for i18n is a fixed static translations set.

There are situations however, in which you'll want to dynamically add or change translations:
- lazy loading for a specific locale
- overriding the [utility functions](#utility-customization)
- overriding existing translations for an [external libraries](#i18n-for-libraries)

There are a couple of ways to change a translation object:
1. By directly changing the *raw* definition object
2. By using `patch` or `patchStrict`
3. By using `patchLocale` or `patchLocaleStrict`

#### Raw
You can change an existing translations set directly by changing the *raw* definition object. That can be obtained from 
a translator using the `_raw` property, which is a reference to the translations object that was originally passed to 
`translate`.

```typescript
const obj = {
    hello: l({
        en: "hello",
        nl: "hallo",
        fallback: "👋",
    }),
    group: {
        world: l({
            en: "world",
            nl: "wereld",
            fallback: "🌍"
        })
    }
}
const t = translate(obj);

// Notice that obj === t._raw

t._raw.hello.locales["fr"] = "bonjour";
t._raw.hello.locales["de"] = "hallo";
t._raw.group.world.locales["fr"] = "monde";
t._raw.group.world.locales["de"] = "Welt";
t._raw.group.world.locales.fallback = "🌎";
```

When you have to add locales to a large translations set this quickly becomes tedious.

#### `patch`

The patch object allows an existing translator set to be *patched* with additions and changes using a translations 
object of the same structure.

This usually leads to less and better readable code than changing the raw object manually.

`patch` iterates over both the translations object recursively, and merges the locales for the translatable items:

```typescript
patch(t, {
    hello: l({ fr: "bonjour", de: "hallo" }),
    group: {
        world: { fr: "monde", de: "Welt", fallback: "🌎" }
    }
});
```

Using the **`patchStrict`** function ensures that all translation items have been specified. If some keys have not been 
specified a typescript error will occur. This makes sure you didn't forget one.

You can explicitly ignore a part of the translations set by setting it as `undefined`:

```typescript
patchStrict(t, {
    hello: l({ it: "ciao" }),
    group: undefined
});
```

> `patchStrict` simply invokes `patch`. It only has stricter type checking.

#### `patchLocale`
When changing a single locale, `patchLocale` provides an even cleaner syntax:

```typescript
patchLocale(t, "fr", { 
    hello: "bonjour",
    group: {
        world: "monde"
    }
});
```

Furthermore, you don't need to use the `l` function but simply a value. This makes it a better choice for processing
lazy loaded translations.

**`patchLocaleStrict`** enforces that all items are specified.

## Advanced use cases

### Utility customization

The `numberParts`, `datetimeParts` and `ucFirst` utility functions can be localized.

They are defined in a translator object which is exposed as `i18n`. 

It's possible to provide your own implementation (for a specific locale):

```typescript
const wrapped = withLocales(["nl"], () => i18n.numberParts);
patchLocale(i18n, "nl", {
    numberParts: (v, o) => {
        const parts = wrapped(v, o);
        return parts.filter((p) => p.type !== "group");
    },
});
locales.value = ["nl"];
console.log(number(99999.123)); // 99999,123
```

> Notice that `number` and `datetime` simply concatenate the parts returned by `numberParts` and `datetimeParts`.

### Reactive translation objects
If you have a translations object that will change dynamically, wrap the object into `reactive` before passing it to 
`translate`:

```typescript
const reactiveTranslations = translate(reactive({} as any));
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

### i18n for libraries

This lightweight module is also intended for providing i18n in Vue3 libraries and generic components.

You should define your translations in a seperate file and export it as part of your module. Then import the translations into your 
component(s) and use them where you need them. Add translations for the locales that you wish to ship with your module.

Add a `peerDependency` and `devDependency` towards `@planning/vue3-i18n` to ensure that module is installed (only once).

This enables applications using your component to *patch* the translation set with additional locales, or even to 
override the defaults that you have set.

Even better, `patchStrict` / `patchLocaleStrict` enforces that **all** translation items are translated. If you add a 
new key to your module, the depending applications, after upgrading, will receive a typescript error which forces them to 
provide translations for their own locales as well.

## Browser support

Browser support for this module matches Vue3 browser support. 

This module relies on `Proxy`, which means that IE11 is not supported.

## License
[Apache](https://opensource.org/licenses/Apache-2.0)
