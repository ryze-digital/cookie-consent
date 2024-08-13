import { Base } from '@ryze-digital/js-utilities';

/**
 *
 * Contains common functionalities for OneTrust and Cookiebot
 * @abstract
 */
export class CookieConsent extends Base {
    #isBannerElementVisible;

    /**
     *
     * @param {object} options
     * @param {HTMLElement} [options.el]
     * @param {object} [options.consent]
     * @param {boolean} [options.consent.marketing]
     * @param {boolean} [options.consent.preferences]
     * @param {boolean} [options.consent.statistics]
     * @param {string} [options.bannerIdentifier]
     * @param {string} [options.privacyUrlIdentifier]
     */
    constructor(options = {}) {
        if (new.target === CookieConsent) {
            throw new TypeError('Cannot construct Abstract instances directly');
        }

        super({
            el: document.querySelector('[data-cookie-consent]'),
            consent: {
                marketing: false,
                preferences: false,
                statistics: false
            }
        }, options);

        this.#isBannerElementVisible = false;

        if (this.options.el === null) {
            return;
        }

        this.#bindEvents();
        this._initBannerEvents();
    }

    #bindEvents() {
        window.addEventListener('cookieConsentStatus', (event) => {
            this.#updatePlaceholders(event.detail.consent);
            this.#updateScripts(event.detail.consent);
            this.#updateIframes(event.detail.consent);
        });

        document.addEventListener('click', (event) => {
            if (event.target && event.target.hasAttribute('data-cookie-preference-center')) {
                this._openPrivacyCenter();
            }
        });
    }

    #updateBannerPrivacyUrl() {
        const privacyUrlElement = document.querySelector(this.options.privacyUrlIdentifier);
        const privacyUrl = this.options.el.getAttribute('data-privacy-url');

        if (privacyUrlElement === null || privacyUrl === null) {
            return;
        }

        privacyUrlElement.setAttribute('href', privacyUrl);
    }

    /**
     *
     * @param {object} consentModel
     * @param {boolean} [consentModel.marketing]
     * @param {boolean} [consentModel.preferences]
     * @param {boolean} [consentModel.statistics]
     */
    #updatePlaceholders(consentModel) {
        const consentRequiredElements = document.querySelectorAll('[data-cookieconsent]:not(script):not([data-cookieconsent="ignore"])');
        let placeholderText = this.options.el.getAttribute('data-text-placeholder');

        if (!placeholderText) {
            return;
        }

        consentRequiredElements.forEach((el) => {
            const consents = el.getAttribute('data-cookieconsent');
            const contentPlaceholderText = el.getAttribute('data-cookie-placeholder-text');

            if (el.previousElementSibling && el.previousElementSibling.classList.contains('cookie-placeholder')) {
                el.previousElementSibling.remove();
            }

            if (this.constructor.isConsentRequired(consents, consentModel) === false) {
                return;
            }

            if (contentPlaceholderText) {
                placeholderText = contentPlaceholderText;
            }

            const placeholderMarkup = `
                <div class="cookie-placeholder">
                    <div class="placeholder-text">
                        ${placeholderText}
                    </div>
                </div>
            `;

            el.insertAdjacentHTML('beforebegin', placeholderMarkup);
        });
    }

    /**
     *
     * @param {object} consentModel
     * @param {boolean} [consentModel.marketing]
     * @param {boolean} [consentModel.preferences]
     * @param {boolean} [consentModel.statistics]
     */
    #updateScripts(consentModel) {
        const scripts = document.querySelectorAll('script[type="text/plain"][data-cookieconsent]');

        scripts.forEach((el) => {
            const consents = el.getAttribute('data-cookieconsent');

            if (this.constructor.isConsentRequired(consents, consentModel) === true) {
                return;
            }

            const script = document.createElement('script');

            script.innerHTML = el.innerHTML;
            script.type = 'text/javascript';

            el.insertAdjacentElement('afterend', script);
            el.remove();
        });
    }

    /**
     *
     * @param {object} consentModel
     * @param {boolean} [consentModel.marketing]
     * @param {boolean} [consentModel.preferences]
     * @param {boolean} [consentModel.statistics]
     */
    #updateIframes(consentModel) {
        const iframes = document.querySelectorAll('iframe[data-src][data-cookieconsent]');

        iframes.forEach((iframe) => {
            const consents = iframe.getAttribute('data-cookieconsent');

            if (this.constructor.isConsentRequired(consents, consentModel) === true || iframe.getAttribute('src') !== null) {
                return;
            }

            iframe.setAttribute('src', iframe.getAttribute('data-src'));
        });
    }

    /**
     *
     * Initialize banner relevant events
     * @protected
     */
    _initBannerEvents() {
        if (document.readyState !== 'interactive') {
            document.addEventListener('DOMContentLoaded', () => {
                this._testBannerVisibility();
            });

            return;
        }

        this._testBannerVisibility();
    }

    /**
     *
     * Update banner and necessary events when banner is visible
     * @protected
     */
    _testBannerVisibility() {
        const bannerElement = document.querySelector(this.options.bannerIdentifier);

        if (!this.#isBannerElementVisible && bannerElement !== null && bannerElement.offsetWidth > 0 && bannerElement.offsetHeight > 0) {
            this.#isBannerElementVisible = true;

            this._emitBannerVisibilityEvent();
            this.#updateBannerPrivacyUrl();
        }
    }

    /**
     *
     * Emit events with current consent when consent is changed
     * @fires CookieConsent#cookieConsentStatus
     * @protected
     */
    _emitConsentStatusEvent() {
        /**
         *
         * @event CookieConsent#cookieConsentStatus
         * @type {object}
         * @property {object} consent - Updated consent model on user interaction
         * @property {boolean} [consent.marketing=false]
         * @property {boolean} [consent.preferences=false]
         * @property {boolean} [consent.statistics=false]
         */
        this.emitEvent('cookieConsentStatus', { consent: this.options.consent }, window);
    }

    /**
     *
     * Emit events when banner is visible
     * @fires CookieConsent#cookieBannerVisible
     * @protected
     */
    _emitBannerVisibilityEvent() {
        /**
         *
         * @event CookieConsent#cookieBannerVisible
         * @type {object}
         */
        this.emitEvent('cookieBannerVisible', {}, window);
    }

    /**
     *
     * Can be called directly on class with available Consents and Consent Model to find if consent is given or not
     * @function isConsentRequired
     * @param {string} consents
     * @param {object} consentModel
     * @param {boolean} [consentModel.marketing]
     * @param {boolean} [consentModel.preferences]
     * @param {boolean} [consentModel.statistics]
     * @returns {boolean}
     * @static
     */
    static isConsentRequired(consents, consentModel) {
        let consentRequirementStatus = false;

        Object.keys(consentModel).forEach((item) => {
            if (!consents.includes(item)) {
                return;
            }

            if (consentModel[item] === true) {
                return;
            }

            consentRequirementStatus = true;
        });

        return consentRequirementStatus;
    }
}