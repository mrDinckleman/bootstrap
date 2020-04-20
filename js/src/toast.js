/**
 * --------------------------------------------------------------------------
 * Bootstrap (v4.4.1): toast.js
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * --------------------------------------------------------------------------
 */

import $ from 'jquery'
import Util from './util'

/**
 * ------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------
 */

const NAME               = 'toast'
// const VERSION            = '4.4.1'
const DATA_KEY           = 'bs.toast'
const EVENT_KEY          = `.${DATA_KEY}`

const Event = {
  CLICK_DISMISS : `click.dismiss${EVENT_KEY}`,
  HIDE          : `hide${EVENT_KEY}`,
  HIDDEN        : `hidden${EVENT_KEY}`,
  SHOW          : `show${EVENT_KEY}`,
  SHOWN         : `shown${EVENT_KEY}`
}

const ClassName = {
  FADE    : 'fade',
  HIDE    : 'hide',
  SHOW    : 'show',
  SHOWING : 'showing'
}

const DefaultType = {
  animation : 'boolean',
  autohide  : 'boolean',
  delay     : 'number'
}

const Default = {
  animation : true,
  autohide  : true,
  delay     : 500
}

const Selector = {
  DATA_DISMISS : '[data-dismiss="toast"]'
}

/**
 * ------------------------------------------------------------------------
 * Class Definition
 * ------------------------------------------------------------------------
 */

class Toast {
  constructor(element, config) {
    this._element = element
    this._config  = this._getConfig(config)
    this._timeout = null
    this._setListeners()
  }

  // Getters

  // static get VERSION() {
  //   return VERSION
  // }

  static get DefaultType() {
    return DefaultType
  }

  static get Default() {
    return Default
  }

  static get NAME() {
    return NAME
  }

  static get DATA_KEY() {
    return DATA_KEY
  }

  static get Event() {
    return Event
  }

  static get ClassName() {
    return ClassName
  }

  static get Selector() {
    return Selector
  }

  // Public

  show() {
    const showEvent = $.Event(this.constructor.Event.SHOW)

    $(this._element).trigger(showEvent)
    if (showEvent.isDefaultPrevented()) {
      return
    }

    if (this._config.animation) {
      this._element.classList.add(this.constructor.ClassName.FADE)
    }

    const complete = () => {
      this._element.classList.remove(this.constructor.ClassName.SHOWING)
      this._element.classList.add(this.constructor.ClassName.SHOW)

      $(this._element).trigger(this.constructor.Event.SHOWN)

      if (this._config.autohide) {
        this._timeout = setTimeout(() => {
          this.hide()
        }, this._config.delay)
      }
    }

    this._element.classList.remove(this.constructor.ClassName.HIDE)
    Util.reflow(this._element)
    this._element.classList.add(this.constructor.ClassName.SHOWING)
    if (this._config.animation) {
      const transitionDuration = Util.getTransitionDurationFromElement(this._element)

      $(this._element)
        .one(Util.TRANSITION_END, complete)
        .emulateTransitionEnd(transitionDuration)
    } else {
      complete()
    }
  }

  hide() {
    if (!this._element.classList.contains(this.constructor.ClassName.SHOW)) {
      return
    }

    const hideEvent = $.Event(this.constructor.Event.HIDE)

    $(this._element).trigger(hideEvent)
    if (hideEvent.isDefaultPrevented()) {
      return
    }

    this._close()
  }

  dispose() {
    clearTimeout(this._timeout)
    this._timeout = null

    if (this._element.classList.contains(this.constructor.ClassName.SHOW)) {
      this._element.classList.remove(this.constructor.ClassName.SHOW)
    }

    $(this._element).off(this.constructor.Event.CLICK_DISMISS)

    $.removeData(this._element, this.constructor.DATA_KEY)
    this._element = null
    this._config  = null
  }

  // Private

  _getConfig(config) {
    const dataAttributes = $(this._element).data()

    config = {
      ...this.constructor.Default,
      ...dataAttributes,
      ...typeof config === 'object' && config ? config : {}
    }

    Util.typeCheckConfig(
      this.constructor.NAME,
      config,
      this.constructor.DefaultType
    )

    return config
  }

  _setListeners() {
    $(this._element).on(
      this.constructor.Event.CLICK_DISMISS,
      this.constructor.Selector.DATA_DISMISS,
      () => this.hide()
    )
  }

  _close() {
    const complete = () => {
      this._element.classList.add(this.constructor.ClassName.HIDE)
      $(this._element).trigger(this.constructor.Event.HIDDEN)
    }

    this._element.classList.remove(this.constructor.ClassName.SHOW)
    if (this._config.animation) {
      const transitionDuration = Util.getTransitionDurationFromElement(this._element)

      $(this._element)
        .one(Util.TRANSITION_END, complete)
        .emulateTransitionEnd(transitionDuration)
    } else {
      complete()
    }
  }

  // Static

  static _jQueryInterface(Class) {
    return function (config) {
      return this.each(function () {
        let data      = $(this).data(Class.DATA_KEY)
        const _config = typeof config === 'object' && config

        if (!data) {
          data = new Class(this, _config)
          $(this).data(Class.DATA_KEY, data)
        }

        if (typeof config === 'string') {
          if (typeof data[config] === 'undefined') {
            throw new TypeError(`No method named "${config}"`)
          }

          data[config]()
        }
      })
    }
  }
}

/**
 * ------------------------------------------------------------------------
 * jQuery
 * ------------------------------------------------------------------------
 */

const JQUERY_NO_CONFLICT = $.fn[Toast.NAME]
const plugin = Toast._jQueryInterface(Toast)

$.fn[Toast.NAME]             = plugin
$.fn[Toast.NAME].Constructor = Toast
$.fn[Toast.NAME].noConflict  = () => {
  $.fn[Toast.NAME] = JQUERY_NO_CONFLICT
  return plugin
}

export default Toast
