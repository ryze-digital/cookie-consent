/******/ var __webpack_modules__ = ({

/***/ "./node_modules/@ryze-digital/js-utilities/index.js":
/*!**********************************************************!*\
  !*** ./node_modules/@ryze-digital/js-utilities/index.js ***!
  \**********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Base: () => (/* reexport safe */ _src_Base_js__WEBPACK_IMPORTED_MODULE_0__.Base),
/* harmony export */   BreakpointProvider: () => (/* reexport safe */ _src_BreakpointProvider_js__WEBPACK_IMPORTED_MODULE_1__.BreakpointProvider),
/* harmony export */   DateToInputConverter: () => (/* reexport safe */ _src_DateToInputConverter_js__WEBPACK_IMPORTED_MODULE_2__.DateToInputConverter),
/* harmony export */   DetectSticky: () => (/* reexport safe */ _src_DetectSticky_js__WEBPACK_IMPORTED_MODULE_3__.DetectSticky),
/* harmony export */   FontVerification: () => (/* reexport safe */ _src_FontVerification_js__WEBPACK_IMPORTED_MODULE_4__.FontVerification),
/* harmony export */   ReduceFunctionCalls: () => (/* reexport safe */ _src_ReduceFunctionCalls_js__WEBPACK_IMPORTED_MODULE_5__.ReduceFunctionCalls),
/* harmony export */   Selectors: () => (/* reexport safe */ _src_Selectors_js__WEBPACK_IMPORTED_MODULE_6__.Selectors)
/* harmony export */ });
/* harmony import */ var _src_Base_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./src/Base.js */ "./node_modules/@ryze-digital/js-utilities/src/Base.js");
/* harmony import */ var _src_BreakpointProvider_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./src/BreakpointProvider.js */ "./node_modules/@ryze-digital/js-utilities/src/BreakpointProvider.js");
/* harmony import */ var _src_DateToInputConverter_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./src/DateToInputConverter.js */ "./node_modules/@ryze-digital/js-utilities/src/DateToInputConverter.js");
/* harmony import */ var _src_DetectSticky_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./src/DetectSticky.js */ "./node_modules/@ryze-digital/js-utilities/src/DetectSticky.js");
/* harmony import */ var _src_FontVerification_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./src/FontVerification.js */ "./node_modules/@ryze-digital/js-utilities/src/FontVerification.js");
/* harmony import */ var _src_ReduceFunctionCalls_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./src/ReduceFunctionCalls.js */ "./node_modules/@ryze-digital/js-utilities/src/ReduceFunctionCalls.js");
/* harmony import */ var _src_Selectors_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./src/Selectors.js */ "./node_modules/@ryze-digital/js-utilities/src/Selectors.js");










/***/ }),

/***/ "./node_modules/@ryze-digital/js-utilities/src/Base.js":
/*!*************************************************************!*\
  !*** ./node_modules/@ryze-digital/js-utilities/src/Base.js ***!
  \*************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Base: () => (/* binding */ Base)
/* harmony export */ });
/**
 * Basis-Klasse zur einheitlichen Verwendung von Events und Optionen.
 * Jede Adventure-Komponente leitet von dieser Basis-Klasse ab.
 *
 * @example
 * export class Example extends adventure.Base {
 *     constructor () {
 *          const element = document.querySelector('.example');
 *
 *          this.on(element, 'click', (event) => {...});
 *     }
 * }
 */
class Base {
    /**
     * @param {object} defaultOptions
     * @param {object} options
     */
    constructor(defaultOptions, options) {
        this._defaultOptions = defaultOptions;
        this._options = options;
        this._eventListeners = new Map();
    }

    /**
     * @returns {object}
     */
    get options() {
        return {
            ...this._defaultOptions,
            ...this._options
        };
    }

    /**
     * @private
     * @param {object} selector
     * @returns {boolean}
     */
    _isNodeList(selector) {
        // eslint-disable-next-line
        return NodeList.prototype.isPrototypeOf(selector);
    }

    /**
     * @private
     * @param {Node} element
     * @param {string} eventName
     * @param {Function} callback
     */
    _attachEvent(element, eventName, callback) {
        if (this._eventListeners.has(element)) {
            this._eventListeners.get(element).push({
                [eventName]: callback
            });
        } else {
            this._eventListeners.set(element, [{
                [eventName]: callback
            }]);
        }
        element.addEventListener(eventName, callback);
    }

    /**
     * @private
     * @param {Node} element
     * @param {string} eventName
     * @param {Function} callback
     * @param {number} eventIndex - Es können gleichzeitig mehrere Listener für den gleichen eventName registriert sein.
     */
    _detachEvent(element, eventName, callback, eventIndex) {
        element.removeEventListener(eventName, callback);
        this._eventListeners.get(element).splice(eventIndex, 1);
    }

    /**
     * @private
     * @param {Node} element
     * @param {string} eventName
     */
    _detachEvents(element, eventName) {
        const allListenersForElement = this._eventListeners.get(element);

        allListenersForElement.forEach((listener, index) => {
            if (eventName === '') {
                this._detachEvent(element, Object.keys(listener)[0], Object.values(listener)[0], index);
            } else {
                const callback = listener[eventName];

                if (typeof callback === 'function') {
                    this._detachEvent(element, eventName, callback, index);
                }
            }
        });

        if (this._eventListeners.get(element).length === 0) {
            this._eventListeners.delete(element);
        }
    }

    /**
     * @param {string} name
     * @param {object} [data={}]
     * @param {Element} el
     */
    emitEvent(name = '', data = {}, el = this.options.el) {
        const event = new CustomEvent(name, {
            detail: data
        });

        el.dispatchEvent(event);
    }

    /**
     * Fügt einem oder mehreren Elementen ein Event hinzu.
     *
     * @param {Node|NodeList} selector
     * @param {string} eventName
     * @param {Function} callback
     */
    on(selector, eventName, callback) {
        // Todo: ermögliche Übergabe von Options (wie passive: true) für addEventlistener

        if (this._isNodeList(selector)) {
            selector.forEach((element) => {
                this._attachEvent(element, eventName, callback);
            });
        } else {
            this._attachEvent(selector, eventName, callback);
        }
    }

    /**
     * Entfernt einem Element oder mehreren Elementen das übergebene Event.
     *
     * @param {Node|NodeList} selector
     * @param {string} [eventName] - Kann ausgelassen werden, um alle Events zu entfernen.
     */
    off(selector, eventName = '') {
        if (this._isNodeList(selector)) {
            selector.forEach((element) => {
                this._detachEvents(element, eventName);
            });
        } else {
            this._detachEvents(selector, eventName);
        }
    }

    /**
     * Entfernt alle registrierten Events.
     */
    offAll() {
        this._eventListeners.forEach((allListenersForElement, element) => {
            this._detachEvents(element, '');
        });
    }
}

/***/ }),

/***/ "./node_modules/@ryze-digital/js-utilities/src/BreakpointProvider.js":
/*!***************************************************************************!*\
  !*** ./node_modules/@ryze-digital/js-utilities/src/BreakpointProvider.js ***!
  \***************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BreakpointProvider: () => (/* binding */ BreakpointProvider)
/* harmony export */ });
/**
 * Stellt in adventure-scss definierte Breakpoints im JavaScript zur Verfügung
 *
 * @example
 * const {breakpoints} = new adventure.BreakpointProvider();
 *
 * window.matchMedia(`(min-width: ${breakpoints.large})`).addListener(() => {...});
 */
class BreakpointProvider {
    /**
     * @param {HTMLElement} el
     * @param {string} pseudoElement
     */
    constructor(el = document.querySelector('html'), pseudoElement = 'after') {
        this._el = el;
        this._pseudoElement = pseudoElement;
        this._breakpoints = this._getBreakpoints();
    }

    /**
     * @private
     * @returns {string}
     */
    _getContentValue() {
        return window.getComputedStyle(this._el, `::${this._pseudoElement}`).getPropertyValue('content').replace(/['"]/g, '');
    }

    /**
     * @private
     * @returns {object}
     */
    _getBreakpoints() {
        const breakpointsString = this._getContentValue();
        const breakpoints = {};

        breakpointsString.split(',').forEach((keyValuePair) => {
            const breakpoint = keyValuePair.split(':');

            breakpoints[breakpoint[0]] = breakpoint[1];
        });

        return breakpoints;
    }

    /**
     * @returns {object}
     */
    get breakpoints() {
        return this._breakpoints;
    }
}

/***/ }),

/***/ "./node_modules/@ryze-digital/js-utilities/src/DateToInputConverter.js":
/*!*****************************************************************************!*\
  !*** ./node_modules/@ryze-digital/js-utilities/src/DateToInputConverter.js ***!
  \*****************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DateToInputConverter: () => (/* binding */ DateToInputConverter)
/* harmony export */ });
/**
 * Konvertiert ein Date-Objekt zur Verwendung mit input[type="date"] und input[type="time"]
 *
 * @example
 * const dateToInputConverter = new adventure.DateToInputConverter();
 *
 * document.querySelector('input[type="date"]').value = dateToInputConverter.date;
 */
class DateToInputConverter {
    constructor() {
        // eslint-disable-next-line prefer-rest-params
        this.dateObj = new Date(...arguments);
    }

    /**
     * @private
     * @param {number} number
     * @returns {string}
     */
    _prependLeadingZero(number) {
        let numberAsString = number.toString();

        if (number < 10) {
            numberAsString = `0${number}`;
        }

        return numberAsString;
    }

    /**
     * @returns {string}
     */
    get date() {
        return this.dateObj.toISOString().substr(0, 10);
    }

    /**
     * @returns {string}
     */
    get hours() {
        const hours = this.dateObj.getHours();

        return this._prependLeadingZero(hours);
    }

    /**
     * @returns {string}
     */
    get minutes() {
        const minutes = this.dateObj.getMinutes();

        return this._prependLeadingZero(minutes);
    }

    /**
     * @returns {string}
     */
    get time() {
        return `${this.hours}:${this.minutes}`;
    }
}

/***/ }),

/***/ "./node_modules/@ryze-digital/js-utilities/src/DetectSticky.js":
/*!*********************************************************************!*\
  !*** ./node_modules/@ryze-digital/js-utilities/src/DetectSticky.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DetectSticky: () => (/* binding */ DetectSticky)
/* harmony export */ });
/**
 * Setzt Klasse während ein Element "sticky" ist
 *
 * @see https://davidwalsh.name/detect-sticky
 * @example
 * const element = document.getElementById('id');
 *
 * new adventure.DetectSticky(element);
 */
class DetectSticky {
    /**
     * @param {HTMLElement} el
     */
    constructor(el) {
        this._el = el;
        this._observer = this._getObserver();

        this._el.style.top = '-1px';

        this._observer.observe(this._el);
    }

    /**
     * @private
     * @returns {IntersectionObserver}
     */
    _getObserver() {
        return new IntersectionObserver(([{ target, intersectionRatio }]) => {
            target.classList.toggle('is-sticky', intersectionRatio < 1);
        }, {
            threshold: [1]
        });
    }

    /**
     * @returns {IntersectionObserver}
     */
    get observer() {
        return this._observer;
    }
}

/***/ }),

/***/ "./node_modules/@ryze-digital/js-utilities/src/FontVerification.js":
/*!*************************************************************************!*\
  !*** ./node_modules/@ryze-digital/js-utilities/src/FontVerification.js ***!
  \*************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   FontVerification: () => (/* binding */ FontVerification)
/* harmony export */ });
/**
 * Verifiziert ein Fonts.net Projekt asynchron
 *
 * @example
 * new adventure.FontVerification('your fonts.net project ID');
 */
class FontVerification {
    /**
     * @param {string} projectId
     * @param {string} baseUrl
     */
    constructor(projectId, baseUrl = 'fast.fonts.net/t/1.css?apiType=css&projectid=') {
        this._projectId = projectId;
        this._baseUrl = baseUrl;

        if (document.readyState !== 'loading') {
            this._createVerificationTag();

            return;
        }

        document.addEventListener('DOMContentLoaded', this._createVerificationTag);
    }

    /**
     *  @private
     */
    _createVerificationTag() {
        const linkTag = document.createElement('link');
        const url = `https://${this._baseUrl}${this._projectId}`;

        linkTag.rel = 'stylesheet';
        linkTag.media = 'all';
        linkTag.href = url;

        document.body.appendChild(linkTag);
    }
}

/***/ }),

/***/ "./node_modules/@ryze-digital/js-utilities/src/ReduceFunctionCalls.js":
/*!****************************************************************************!*\
  !*** ./node_modules/@ryze-digital/js-utilities/src/ReduceFunctionCalls.js ***!
  \****************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ReduceFunctionCalls: () => (/* binding */ ReduceFunctionCalls)
/* harmony export */ });
/**
 * Reduziert Funktionsaufrufe
 *
 * @example
 * window.addEventListener('resize', adventure.ReduceFunctionCalls.throttle(() => {...}));
 */
class ReduceFunctionCalls {
    /**
     * @param {Function} callback
     * @param {number} delay
     * @param {object} scope
     * @param {Array} args
     * @returns {Function}
     * @see https://codeburst.io/throttling-and-debouncing-in-javascript-b01cad5c8edf
     */
    static throttle(callback, delay = 250, scope = this, ...args) {
        let timeout;
        let lastRan;

        return () => {
            if (!lastRan) {
                callback.apply(scope, args);
                lastRan = Date.now();
            } else {
                clearTimeout(timeout);

                timeout = setTimeout(() => {
                    if ((Date.now() - lastRan) >= delay) {
                        callback.apply(scope, args);
                        lastRan = Date.now();
                    }
                }, delay - (Date.now() - lastRan));
            }
        };
    }

    /**
     * @param {Function} callback
     * @param {number} delay
     * @param {object} scope
     * @param {Array} args
     * @returns {Function}
     * @see https://davidwalsh.name/javascript-debounce-function
     */
    static debounce(callback, delay = 250, scope = this, ...args) {
        let timeout;

        return () => {
            const debouncedCallback = () => {
                timeout = null;

                callback.apply(scope, args);
            };

            clearTimeout(timeout);

            timeout = setTimeout(debouncedCallback, delay);
        };
    }
}

/***/ }),

/***/ "./node_modules/@ryze-digital/js-utilities/src/Selectors.js":
/*!******************************************************************!*\
  !*** ./node_modules/@ryze-digital/js-utilities/src/Selectors.js ***!
  \******************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Selectors: () => (/* binding */ Selectors)
/* harmony export */ });
/**
 * DOM-Zugriffe, die nicht mit CSS möglich sind
 *
 * @example
 * document.querySelector('button').addEventListener('click', (event) => {
 *     const siblings = adventure.Selectors.siblings(event.target);
 * });
 */
class Selectors {
    /**
     *
     * @param {HTMLElement} element
     * @returns {Array}
     */
    static siblings(element) {
        return [...element.parentElement.children].filter((siblings) => {
            return siblings !== element;
        });
    }
}

/***/ }),

/***/ "./src/scripts/ConsentDependentElementHelper.js":
/*!******************************************************!*\
  !*** ./src/scripts/ConsentDependentElementHelper.js ***!
  \******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ConsentDependentElementHelper: () => (/* binding */ ConsentDependentElementHelper)
/* harmony export */ });
/* harmony import */ var _CookieConsent_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./CookieConsent.js */ "./src/scripts/CookieConsent.js");


/**
 *
 * This helper class can be extended by individual consent dependent class
 * @example
 * class LanguagePreference extends ConsentDependentElementHelper {}
 */
class ConsentDependentElementHelper {
    constructor() {
        this.consentCategory = '';

        this.#bindEvents();
    }

    #bindEvents() {
        window.addEventListener('cookieConsentStatus', (event) => {
            if (_CookieConsent_js__WEBPACK_IMPORTED_MODULE_0__.CookieConsent.isConsentRequired(this.consentCategory, event.detail.consent) === false) {
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

/***/ }),

/***/ "./src/scripts/CookieConsent.js":
/*!**************************************!*\
  !*** ./src/scripts/CookieConsent.js ***!
  \**************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CookieConsent: () => (/* binding */ CookieConsent)
/* harmony export */ });
/* harmony import */ var _ryze_digital_js_utilities__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @ryze-digital/js-utilities */ "./node_modules/@ryze-digital/js-utilities/index.js");


/**
 *
 * Contains common functionalities for OneTrust and Cookiebot
 * @abstract
 */
class CookieConsent extends _ryze_digital_js_utilities__WEBPACK_IMPORTED_MODULE_0__.Base {
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

/***/ }),

/***/ "./src/scripts/CookiebotConsent.js":
/*!*****************************************!*\
  !*** ./src/scripts/CookiebotConsent.js ***!
  \*****************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CookiebotConsent: () => (/* binding */ CookiebotConsent)
/* harmony export */ });
/* harmony import */ var _CookieConsent_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./CookieConsent.js */ "./src/scripts/CookieConsent.js");


/**
 *
 * Cookiebot consent class extends Abstract CookieConsent class to inherit all base functionalities
 * @example
 * const cookiebotConsent = new CookiebotConsent();
 */
class CookiebotConsent extends _CookieConsent_js__WEBPACK_IMPORTED_MODULE_0__.CookieConsent {
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

/***/ }),

/***/ "./src/scripts/OneTrustConsent.js":
/*!****************************************!*\
  !*** ./src/scripts/OneTrustConsent.js ***!
  \****************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   OneTrustConsent: () => (/* binding */ OneTrustConsent)
/* harmony export */ });
/* harmony import */ var _CookieConsent_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./CookieConsent.js */ "./src/scripts/CookieConsent.js");


/**
 *
 * OneTrust consent class extends Abstract CookieConsent class to inherit all base functionalities
 * @example
 * const oneTrustConsent = new OneTrustConsent();
 */
class OneTrustConsent extends _CookieConsent_js__WEBPACK_IMPORTED_MODULE_0__.CookieConsent {
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

/***/ })

/******/ });
/************************************************************************/
/******/ // The module cache
/******/ var __webpack_module_cache__ = {};
/******/ 
/******/ // The require function
/******/ function __webpack_require__(moduleId) {
/******/ 	// Check if module is in cache
/******/ 	var cachedModule = __webpack_module_cache__[moduleId];
/******/ 	if (cachedModule !== undefined) {
/******/ 		return cachedModule.exports;
/******/ 	}
/******/ 	// Create a new module (and put it into the cache)
/******/ 	var module = __webpack_module_cache__[moduleId] = {
/******/ 		// no module.id needed
/******/ 		// no module.loaded needed
/******/ 		exports: {}
/******/ 	};
/******/ 
/******/ 	// Execute the module function
/******/ 	__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 
/******/ 	// Return the exports of the module
/******/ 	return module.exports;
/******/ }
/******/ 
/************************************************************************/
/******/ /* webpack/runtime/define property getters */
/******/ (() => {
/******/ 	// define getter functions for harmony exports
/******/ 	__webpack_require__.d = (exports, definition) => {
/******/ 		for(var key in definition) {
/******/ 			if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 				Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 			}
/******/ 		}
/******/ 	};
/******/ })();
/******/ 
/******/ /* webpack/runtime/hasOwnProperty shorthand */
/******/ (() => {
/******/ 	__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ })();
/******/ 
/******/ /* webpack/runtime/make namespace object */
/******/ (() => {
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = (exports) => {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/ })();
/******/ 
/************************************************************************/
var __webpack_exports__ = {};
/*!******************!*\
  !*** ./index.js ***!
  \******************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ConsentDependentElementHelper: () => (/* reexport safe */ _src_scripts_ConsentDependentElementHelper_js__WEBPACK_IMPORTED_MODULE_0__.ConsentDependentElementHelper),
/* harmony export */   CookiebotConsent: () => (/* reexport safe */ _src_scripts_CookiebotConsent_js__WEBPACK_IMPORTED_MODULE_1__.CookiebotConsent),
/* harmony export */   OneTrustConsent: () => (/* reexport safe */ _src_scripts_OneTrustConsent_js__WEBPACK_IMPORTED_MODULE_2__.OneTrustConsent)
/* harmony export */ });
/* harmony import */ var _src_scripts_ConsentDependentElementHelper_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./src/scripts/ConsentDependentElementHelper.js */ "./src/scripts/ConsentDependentElementHelper.js");
/* harmony import */ var _src_scripts_CookiebotConsent_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./src/scripts/CookiebotConsent.js */ "./src/scripts/CookiebotConsent.js");
/* harmony import */ var _src_scripts_OneTrustConsent_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./src/scripts/OneTrustConsent.js */ "./src/scripts/OneTrustConsent.js");






var __webpack_exports__ConsentDependentElementHelper = __webpack_exports__.ConsentDependentElementHelper;
var __webpack_exports__CookiebotConsent = __webpack_exports__.CookiebotConsent;
var __webpack_exports__OneTrustConsent = __webpack_exports__.OneTrustConsent;
export { __webpack_exports__ConsentDependentElementHelper as ConsentDependentElementHelper, __webpack_exports__CookiebotConsent as CookiebotConsent, __webpack_exports__OneTrustConsent as OneTrustConsent };
