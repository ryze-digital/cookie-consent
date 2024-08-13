import { CookieConsent } from './CookieConsent.js';

/**
 *
 * OneTrust consent class extends Abstract CookieConsent class to inherit all base functionalities
 * @example
 * const oneTrustConsent = new OneTrustConsent();
 */
export class OneTrustConsent extends CookieConsent {
    #consentCategoryMap;

    constructor() {
        super({
            bannerIdentifier: '#onetrust-banner-sdk',
            privacyUrlIdentifier: '#onetrust-policy-text a'
        });

        this.#consentCategoryMap = {
            preferences: 'C0003',
            marketing: 'C0004',
            statistics: 'C0002'
        };

        this.#initUserBehaviourEvent();
    }

    #initUserBehaviourEvent() {
        this.#checkForConsentStatus();

        window.addEventListener('OneTrustGroupsUpdated', () => {
            this.#checkForConsentStatus();
        });
    }

    #checkForConsentStatus() {
        if (window.OnetrustActiveGroups) {
            const activeGroups = window.OnetrustActiveGroups.split(',').filter((el) => {
                return el !== '';
            });

            this.options.consent.preferences = activeGroups.includes(this.#consentCategoryMap.preferences);
            this.options.consent.marketing = activeGroups.includes(this.#consentCategoryMap.marketing);
            this.options.consent.statistics = activeGroups.includes(this.#consentCategoryMap.statistics);

            this._emitConsentStatusEvent();
        }
    }

    /**
     *
     * Initialize banner relevant events
     * @protected
     */
    _initBannerEvents() {
        window.OptanonWrapper = () => {
            this._testBannerVisibility();
        };

        super._initBannerEvents();
    }

    /**
     *
     * Open privacy center to change consent
     * @protected
     */
    _openPrivacyCenter() {
        if (window.OneTrust) {
            window.OneTrust.ToggleInfoDisplay();
        }
    }
}