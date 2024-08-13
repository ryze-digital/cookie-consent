import { CookieConsent } from './CookieConsent.js';

/**
 *
 * Cookiebot consent class extends Abstract CookieConsent class to inherit all base functionalities
 * @example
 * const cookiebotConsent = new CookiebotConsent();
 */
export class CookiebotConsent extends CookieConsent {
    constructor() {
        super({
            bannerIdentifier: '#CybotCookiebotDialog',
            privacyUrlIdentifier: '#CybotCookiebotDialogDetailBodyContentTextAbout a'
        });

        this.#initUserBehaviourEvent();
    }

    #initUserBehaviourEvent() {
        this.#checkForConsentStatus();

        window.addEventListener('CookiebotOnDialogInit', () => {
            this.#checkForConsentStatus();
        });

        window.addEventListener('CookiebotOnAccept', () => {
            this.#checkForConsentStatus();
        });

        window.addEventListener('CookiebotOnDecline', () => {
            this.#checkForConsentStatus();
        });
    }

    #checkForConsentStatus() {
        if (window.Cookiebot && window.Cookiebot.consent) {
            this.options.consent.marketing = window.Cookiebot.consent.marketing;
            this.options.consent.preferences = window.Cookiebot.consent.preferences;
            this.options.consent.statistics = window.Cookiebot.consent.statistics;

            this._emitConsentStatusEvent();
        }
    }

    /**
     *
     * Initialize banner relevant events
     * @protected
     */
    _initBannerEvents() {
        window.addEventListener('CookiebotOnDialogDisplay', () => {
            this._testBannerVisibility();
        });

        super._initBannerEvents();
    }

    /**
     *
     * Open privacy center to change consent
     * @protected
     */
    _openPrivacyCenter() {
        if (window.Cookiebot) {
            window.Cookiebot.renew();
        }
    }
}