import { CookieConsent } from './CookieConsent.js';

export class UsercentricsConsent extends CookieConsent {
    categoryMap = {
        preferences: 'functional',
        marketing: 'marketing',
        statistics: 'statistics',
        sale_data: 'sale_of_personal_data',
        targeted_advertising: 'targeted_advertising'
    };

    constructor() {
        super({
            bannerIdentifier: '#uc-main-dialog',
            privacyUrlIdentifier: '[data-cookie-preference-center]'
        });
        this._initEvents();

        if (Array.isArray(window.dataLayer)) {
            const originalPush = window.dataLayer.push;

            window.dataLayer.push = (...args) => {
                const result = originalPush.apply(window.dataLayer, args);

                this._checkConsent();

                return result;
            };
        }

        this._checkConsent();
    }

    _initEvents() {
        window.addEventListener('UC_UI_INITIALIZED', () => {
            setTimeout(() => {
                return this._checkConsent();
            }, 100);
        });
        window.addEventListener('UC_CONSENT', () => {
            setTimeout(() => {
                return this._checkConsent();
            }, 100);
        });
        window.addEventListener('consent_status', () => {
            setTimeout(() => {
                return this._checkConsent();
            }, 100);
        });
        window.addEventListener('UC_UI_CMP_EVENT', (e) => {
            if (['ACCEPT_ALL', 'SAVE'].includes(e.detail?.type)) {
                setTimeout(() => {
                    return this._checkConsent();
                }, 100);
            }
        });
        document.addEventListener('click', (e) => {
            if (e.target.matches(this.options.privacyUrlIdentifier)) {
                this._openPrivacyCenter();
            }
        });
    }

    _checkConsent() {
        const entries = window.dataLayer?.filter((item) => {
            return item.event === 'consent_status';
        }) || [];
        const entry = entries[entries.length - 1] || {};
        const categories = entry.ucCategory || {};

        Object.keys(this.categoryMap).forEach((key) => {
            this.options.consent[key] = categories[this.categoryMap[key]] === true;
        });

        const knownFields = ['event', 'action', 'type', 'ucCategory'];

        Object.keys(entry).forEach((key) => {
            if (!knownFields.includes(key)) {
                this.options.consent[key] = entry[key] === true;
            }
        });

        const consentModel = this.options.consent;

        document.querySelectorAll('iframe[data-src][data-cookieconsent]').forEach((iframe) => {
            const consents = iframe.getAttribute('data-cookieconsent');

            if (UsercentricsConsent.isConsentRequired(consents, consentModel)) {
                iframe.removeAttribute('src');
            } else if (!iframe.getAttribute('src')) {
                iframe.setAttribute('src', iframe.getAttribute('data-src'));
            }
        });

        document.querySelectorAll('script[type="text/plain"][data-cookieconsent]').forEach((el) => {
            const consents = el.getAttribute('data-cookieconsent');

            if (!UsercentricsConsent.isConsentRequired(consents, consentModel)) {
                const script = document.createElement('script');

                script.textContent = el.textContent;
                Array.from(el.attributes).forEach((attr) => {
                    if (attr.name !== 'type') {
                        script.setAttribute(attr.name, attr.value);
                    }
                });
                el.parentNode.replaceChild(script, el);
            }
        });

        this._emitConsentStatusEvent();
        this.toggleContentElements(consentModel);
    }

    /**
     * @param {string} consents
     * @param {{[key: string]: boolean}} consentModel
     * @returns {boolean}
     */
    static isConsentRequired(consents, consentModel) {
        if (!consents) {
            return false;
        }
        const keys = consents.split(',').map((s) => {
            return s.trim();
        }).filter(Boolean);

        if (keys.length === 0) {
            return false;
        }

        return keys.some((key) => {
            return !consentModel[key];
        });
    }

    /**
     * @param {string} key
     * @returns {boolean}
     */
    hasConsent(key) {
        return this.options.consent[key] === true;
    }

    _openPrivacyCenter() {
        if (window.UC_UI?.showSecondLayer) {
            window.UC_UI.showSecondLayer();
        }
    }

    /**
     *
     * @param {{[key: string]: boolean}} consentModel
     */
    toggleContentElements(consentModel) {
        document
            .querySelectorAll('[data-cookieconsent]:not(script):not([data-cookieconsent="ignore"])')
            .forEach((el) => {
                const consents = el.getAttribute('data-cookieconsent');

                if (UsercentricsConsent.isConsentRequired(consents, consentModel)) {
                    el.classList.remove('cookie-consent-visible');
                    el.classList.add('cookie-consent-hidden');
                } else {
                    el.classList.add('cookie-consent-visible');
                    el.classList.remove('cookie-consent-hidden');
                }
            });
    }
}