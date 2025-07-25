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
            privacyUrlIdentifier: '[data-cookie-preference-center]',
            consentReadDelay: 120
        });
        this._initEvents();
        this._checkConsent();
    }

    _initEvents() {
        window.addEventListener('UC_UI_INITIALIZED', () => {
            return this._checkConsent();
        });
        window.addEventListener('UC_CONSENT', () => {
            return this._checkConsent();
        });
        window.addEventListener('consent_status', () => {
            return this._checkConsent();
        });
        window.addEventListener('UC_UI_CMP_EVENT', (e) => {
            if (['ACCEPT_ALL', 'SAVE'].includes(e.detail.type)) {
                this._checkConsent();
            }
        });
        document.addEventListener('click', (e) => {
            if (e.target.matches(this.options.privacyUrlIdentifier)) {
                this._openPrivacyCenter();
            }
        });
    }

    _checkConsent() {
        setTimeout(() => {
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

                if (this.constructor.isConsentRequired(consents, consentModel) && iframe.getAttribute('src')) {
                    iframe.removeAttribute('src');
                }
            });

            document.querySelectorAll('script[type="text/plain"][data-cookieconsent]').forEach((el) => {
                const consents = el.getAttribute('data-cookieconsent');
                if (!this.constructor.isConsentRequired(consents, consentModel)) {
                    const s = document.createElement('script');
                    s.textContent = el.textContent;
                    document.body.appendChild(s);
                }
            });

            this._emitConsentStatusEvent();
            this.toggleContentElements(consentModel);
        }, this.options.consentReadDelay);
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
     * @param {object} consentModel
     */
    toggleContentElements(consentModel) {
        document
            .querySelectorAll('[data-cookieconsent]:not(script):not([data-cookieconsent="ignore"])')
            .forEach((el) => {
                const consents = el.getAttribute('data-cookieconsent');

                if (this.constructor.isConsentRequired(consents, consentModel)) {
                    el.classList.remove('cookie-consent-visible');
                    el.classList.add('cookie-consent-hidden');
                } else {
                    el.classList.add('cookie-consent-visible');
                    el.classList.remove('cookie-consent-hidden');
                }
            });
    }
}
