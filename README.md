# RYZE Digital Cookie Consent

## Install

```sh
npm i @ryze-digital/cookie-consent
```

## Usage

Place the following `<script>` tag inside `<head>`.

```html
<script
    data-cookie-consent
    data-privacy-url="//Your presence dependent privacy url"
    data-text-placeholder="//Language dependent placeholder text i.e. Please accept <button data-cookie-preference-center>cookie</button> to see the content."
    data-document-language="true"
    type="text/javascript"
    async
></script>
```

Now you have to decide between one of the following implementations.

### OneTrust

Add the following `src` and `data-domain-script` attributes the `<script>` tag above.

```html
src="https://cdn.cookielaw.org/scripttemplates/otSDKStub.js"
data-domain-script="//OneTrust domain id"
```

#### Initialization

```js
import { OneTrustConsent } from '@ryze-digital/cookie-consent';

new OneTrustConsent();
```

### Cookiebot

Add the following `src` and `data-domain-script` attributes the `<script>` tag above.

```html
src="https://consent.cookiebot.com/uc.js"
data-cbid="//Cookiebot domain id"
```

#### Initialization

```js
import { CookiebotConsent } from '@ryze-digital/cookie-consent';

new CookiebotConsent();
```

## Demos
- [OneTrust demo](/demos/onetrust.html)
- [Cookiebot demo](/demos/cookiebot.html)

## Cookie categories

| Category    | Description                                                                       | OneTrust category | Cookiebot category |
|-------------|-----------------------------------------------------------------------------------|-------------------|--------------------|
| statistics  | Cookies mainly for analytics                                                      | performance       | statistics         |
| marketing   | Cookies used for advertisement and conversion                                     | targeting         | marketing          |
| preferences | Cookies to improve user experience like save seletecd language on language switch | functional        | preferences        |

## Additional functionalities

Beside loading up respective cookie consent platform and blocking the initial cookies, it also provides additional
functionalities independent of 3rd party platforms.

### Events

There are two custom events:
1. ```cookieBannerVisible``` triggers when the banner becomes visible 
2. ```cookieConsentStatus``` triggers when the consent is changed (including initial load)

```js
window.addEventListener('cookieBannerVisible', () => {
    console.log('cookieBannerVisible');
});

window.addEventListener('cookieConsentStatus', (event) => {
    console.log('cookieConsentStatus');
    console.log(event.detail.consent);
});
```

### Helper class

There is also an additional class ```ConsentDependentElementHelper``` which can be extended if a JS component depends on
user consent. It requires one or more comma separated consent categories. The helper class has two empty methods
```allowedByCookieConsent``` and ```disallowedByCookieConsent``` to be overwritten in your project

Depending on user consent it either calls the ```allowedByCookieConsent``` or ```disallowedByCookieConsent``` method.

```js
class LanguagePreference extends ConsentDependentElementHelper {
    constructor() {
        super();

        this.consentCategory = 'marketing, preferences';
    }

    allowedByCookieConsent() {
        // Set cookie to browser if user has given consent to 'preferences' cookies
    }
}

new LanguagePreference();
```

### Data attributes

There are some additional data attributes like ```data-cookieconsent``` which can be used to enable a certain script
depending on user consent. Multiple categories can be set by using comma separation.

```js
<script type="text/plain" data-cookieconsent="preferences">
    console.log('Executed if preferences cookies get approval');
</script>
```

If this attribute is added to any element (iFrame, Google Map, etc.) which is not a `<script>` a placeholder text will be
shown instead of the element, until consent is given.

```html
<iframe data-src="https://www.youtube.com/embed/098Cw40KuPw" data-cookieconsent="marketing, preferences, statistics"></iframe>
```

You can set ```data-cookie-placeholder-text``` to overwrite the default placeholder text.

To show the **privacy center**, you can set the ```data-cookie-preference-center``` attribute on a `<button>`. Or you can 
also use a `<button>` inside the placeholder text.

```html
<iframe data-src="https://www.youtube.com/embed/098Cw40KuPw" data-cookie-placeholder-text="Please accept <button data-cookie-preference-center>cookies</button> to see this content." data-cookieconsent="marketing, preferences, statistics"></iframe>
```

You can use ```data-cookieconsent="ignore"```, if you don't want an element to depend on the cookie platform.

## Google Tag Manager and Matomo

You can also load GTM or Matomo synchronously with this library. There are some custom data that are getting pushed
to the dataLayer object when consent has changed, so tags can be triggered depending on those data as well.

1. PreferencesCategoryAccepted
2. MarketingCategoryAccepted
3. StatisticsCategoryAccepted
 

To use it, you have to update your `webpack.config.js`.
Add the line below to your [entry configuration](https://webpack.js.org/concepts/entry-points/).

```js
CookieConsentTagManager: ['./node_modules/@ryze-digital/cookie-consent/dist/CookieConsentTagManager']
```

And exclude it from bundling to vendors chunk.

```js
vendors: {
    test: (mod) => {
        // Include all node_modules except cookie consent
        return !(!mod.context.includes('node_modules') || mod.context.includes('@ryze-digital/cookie-consent/dist'));
    },
    name: 'vendor',
    chunks: 'all',
    enforce: true
}
```

### Google Tag Manager

Apart from custom data, this library also supports Google consent mode. This means that it pushes consent mode data in
addition to custom data to GTM dataLayer based on user consent. So, if a Google container is configured for consent mode
then it should work out of the box.

```js
<script
    data-tag-manager="google"
    src="{WebResource->scripts:file=CookieConsentTagManager.js}"
    id="//yourTagmanagerID"
></script>
```

### Matomo

```js
<script
    data-tag-manager="matomo"
    src="{WebResource->scripts:file=CookieConsentTagManager.js}"
    id="//yourTagmanagerUrl"
></script>
```

#### Note

If you don't want to use the tag loading functionality and want to load whole GTM, Matomo or any other platform after
user consent is given, then simply set the data attribute.

```js
<script type="text/plain" data-cookieconsent="preferences">(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','//yourTagmangerID');</script>
```
