/**
 *
 * Load Google tag manager with consent mode or Matomo tag manager
 * @example
 * <script
 *   data-tag-manager="google"
 *   src="../dist/CookieConsentTagManager.js"
 *   id="GTM-WBXVSWR"
 * ></script>
 */
class CookieConsentTagManager {
    #element;

    #trackingId;

    #trackingType;

    #acceptedCookies;

    constructor() {
        this.#element = document.querySelector('[data-tag-manager]');
        this.#trackingId = this.#element.getAttribute('id');
        this.#trackingType = this.#element.getAttribute('data-tag-manager');
        this.#acceptedCookies = {};

        if (this.#element === null || !this.#trackingId) {
            return;
        }

        switch (this.#trackingType) {
            case 'google':
                this.#initGoogleTag();
                break;
            case 'matomo':
                this.#initMatomoTag();
                break;
        }

        this.#bindEvents();
    }

    #initMatomoTag() {
        this.#insertScript(`
            var _mtm = window._mtm = window._mtm || [];
            _mtm.push({'mtm.startTime': (new Date().getTime()), 'event': 'mtm.Start'});
            var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
            g.async=true; g.src='${this.#trackingId}'; s.parentNode.insertBefore(g,s);
        `);
    }

    #initGoogleTag() {
        this.#insertScript(`
            window.dataLayer = window.dataLayer || [];
            function gtag() {dataLayer.push(arguments);}
        `, 'beforebegin');
        this.#initDefaultGoogleConsent();
        this.#insertScript(`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${this.#trackingId}');
        `);
    }

    /**
     *
     * @param {string} html
     * @param {string} position
     */
    #insertScript(html, position = 'afterend') {
        const script = document.createElement('script');

        script.innerHTML = html;
        script.type = 'text/javascript';

        this.#element.insertAdjacentElement(position, script);
    }

    #initDefaultGoogleConsent() {
        let consentMode = {
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            analytics_storage: 'denied',
            personalization_storage: 'denied',
            functionality_storage: 'denied',
            security_storage: 'granted',
        };

        if (localStorage.getItem('consentMode') !== null) {
            consentMode = JSON.parse(localStorage.getItem('consentMode'));
        }

        window.gtag('consent', 'default', consentMode);
    }

    #bindEvents() {
        window.addEventListener('cookieConsentStatus', (event) => {
            this.#pushDatalayerData(event.detail.consent);

            this.#push({
                event: 'cookieUpdate'
            });
        });
    }

    /**
     *
     * @param {object} consent
     * @param {boolean} [consent.marketing]
     * @param {boolean} [consent.preferences]
     * @param {boolean} [consent.statistics]
     */
    #pushDatalayerData(consent) {
        if (this.#trackingType === 'google') {
            this.#updateGoogleConsentData(consent);
        }

        this.#updateCustomConsentData(consent);
    }

    /**
     *
     * @param {object} consent
     * @param {boolean} [consent.marketing]
     * @param {boolean} [consent.preferences]
     * @param {boolean} [consent.statistics]
     */
    #updateGoogleConsentData(consent) {
        const consentMode = {
            ad_storage: consent.marketing ? 'granted' : 'denied',
            ad_user_data: consent.marketing ? 'granted' : 'denied',
            ad_personalization: consent.marketing ? 'granted' : 'denied',
            analytics_storage: consent.statistics ? 'granted' : 'denied',
            functionality_storage: consent.preferences ? 'granted' : 'denied',
            personalization_storage: consent.preferences ? 'granted' : 'denied',
            security_storage: 'granted',
        };

        window.gtag('consent', 'update', consentMode);
        localStorage.setItem('consentMode', JSON.stringify(consentMode));
    }

    /**
     *
     * @param {object} consent
     * @param {boolean} [consent.marketing]
     * @param {boolean} [consent.preferences]
     * @param {boolean} [consent.statistics]
     */
    #updateCustomConsentData(consent) {
        Object.keys(consent).forEach((item) => {
            const eventName = `${item}CategoryAccepted`;
            let eventValue = false;

            if (!(item in this.#acceptedCookies)) {
                this.#acceptedCookies[item] = false;
            }

            if (consent[item] !== this.#acceptedCookies[item]) {
                if (consent[item]) {
                    eventValue = true;
                }

                this.#push({
                    event: eventName,
                    [eventName]: eventValue
                });
            }

            this.#acceptedCookies[item] = consent[item];
        });
    }

    /**
     *
     * @param {object} data
     */
    #push(data) {
        // matomo tag manager
        if (typeof window.MatomoTagManager === 'object') {
            window._mtm = window._mtm || [];
            window._mtm.push(data);
        }

        // google tag manager
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push(data);
    }
}

new CookieConsentTagManager();