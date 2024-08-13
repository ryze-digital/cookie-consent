import { CookieConsent } from './CookieConsent.js';

/**
 *
 * This helper class can be extended by individual consent dependent class
 * @example
 * class LanguagePreference extends ConsentDependentElementHelper {}
 */
export class ConsentDependentElementHelper {
    constructor() {
        this.consentCategory = '';

        this.#bindEvents();
    }

    #bindEvents() {
        window.addEventListener('cookieConsentStatus', (event) => {
            if (CookieConsent.isConsentRequired(this.consentCategory, event.detail.consent) === false) {
                this.allowedByCookieConsent();

                return;
            }

            this.disallowedByCookieConsent();
        });
    }

    /**
     *
     * Invoke allowedByCookieConsent when consentCategory is in overall user consent
     */
    allowedByCookieConsent() {}

    /**
     *
     * Invoke disallowedByCookieConsent when consentCategory is not in overall user consent
     */
    disallowedByCookieConsent() {}
}