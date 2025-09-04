import { CookieConsent } from './CookieConsent.js';

/**
 *
 * Usercentrics consent class extends Abstract CookieConsent class to inherit all base functionalities
 * @example
 * const usercentricsConsent = new UsercentricsConsent();
 */
export class UsercentricsConsent extends CookieConsent {
    #consentCategoryMap;

    constructor() {
        super({
            bannerIdentifier: '#uc-main-dialog',
            privacyUrlIdentifier: '[data-cookie-preference-center]'
        });

        this.#consentCategoryMap = {
            preferences: 'functional',
            marketing: 'marketing',
            statistics: 'marketing'
        };

        const rulesetIdAttr = this.options.el.getAttribute('data-ruleset-id');
        const settingsIdAttr = this.options.el.getAttribute('data-settings-id');

        if (rulesetIdAttr === '' && settingsIdAttr === '') {
            console.warn('Usercentrics project id not found. Please provide Usercentrics project id in data-ruleset-id or data-settings-id attribute.');
            return;
        }

        this.#initUserBehaviourEvent();
    }

    #initUserBehaviourEvent() {
        this.#checkForConsentStatus();

        window.addEventListener('UC_UI_INITIALIZED', () => {
            this.#checkForConsentStatus();
        });

        window.addEventListener('UC_CONSENT', () => {
            this.#checkForConsentStatus();
        });
    }

    #checkForConsentStatus() {
        const entries = window.dataLayer?.filter((dataLayerItem) => {
            return dataLayerItem.event === 'consent_status';
        }) || [];
        const entry = entries[entries.length - 1] || {};
        const categories = entry.ucCategory || {};

        this.options.consent.preferences = categories[this.#consentCategoryMap.preferences] === true;
        this.options.consent.marketing = categories[this.#consentCategoryMap.marketing] === true;
        this.options.consent.statistics = categories[this.#consentCategoryMap.statistics] === true;

        const knownFields = ['event', 'action', 'type', 'ucCategory'];

        Object.keys(entry).forEach((key) => {
            if (!knownFields.includes(key)) {
                this.options.consent[key] = entry[key] === true;
            }
        });

        this._emitConsentStatusEvent();
    }

    /**
     *
     * Open privacy center to change consent
     * @protected
     */
    _openPrivacyCenter() {
        if (window.UC_UI?.showSecondLayer) {
            window.UC_UI.showSecondLayer();
        }
    }

    /**
     * Override the base isConsentRequired method to handle Usercentrics service names
     * @param {string} consents
     * @param {{[key: string]: boolean}} consentModel
     * @returns {boolean}
     */
    static isConsentRequired(consents, consentModel) {
        if (!consents) {
            return false;
        }

        const keys = consents.split(',').map((segment) => {
            return segment.trim();
        }).filter(Boolean);

        if (keys.length === 0) {
            return false;
        }

        return keys.some((key) => {
            return !consentModel[key];
        });
    }
}