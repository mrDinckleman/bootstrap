/**
 * --------------------------------------------------------------------------
 * Bootstrap (v4.4.1): alert.js
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

const NAME                = 'alert'
// const VERSION             = '4.4.1'
const DATA_KEY            = 'bs.alert'
const EVENT_KEY           = `.${DATA_KEY}`
const DATA_API_KEY        = '.data-api'

const Selector = {
  DISMISS : '[data-dismiss="alert"]'
}

const Event = {
  CLOSE          : `close${EVENT_KEY}`,
  CLOSED         : `closed${EVENT_KEY}`,
  CLICK_DATA_API : `click${EVENT_KEY}${DATA_API_KEY}`
}

const ClassName = {
  ALERT : 'alert',
  FADE  : 'fade',
  SHOW  : 'show'
}

/**
 * ------------------------------------------------------------------------
 * Class Definition
 * ------------------------------------------------------------------------
 */

class Alert {
  constructor(element) {
    this._element = element
  }

  // Getters

  // static get VERSION() {
  //   return VERSION
  // }

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

  close(element) {
    let rootElement = this._element
    if (element) {
      rootElement = this._getRootElement(element)
    }

    const customEvent = this._triggerCloseEvent(rootElement)

    if (customEvent.isDefaultPrevented()) {
      return
    }

    this._removeElement(rootElement)
  }

  dispose() {
    $.removeData(this._element, this.constructor.DATA_KEY)
    this._element = null
  }

  // Private

  _getRootElement(element) {
    const selector = Util.getSelectorFromElement(element)
    let parent     = false

    if (selector) {
      parent = document.querySelector(selector)
    }

    if (!parent) {
      parent = $(element).closest(`.${this.constructor.ClassName.ALERT}`)[0]
    }

    return parent
  }

  _triggerCloseEvent(element) {
    const closeEvent = $.Event(this.constructor.Event.CLOSE)

    $(element).trigger(closeEvent)
    return closeEvent
  }

  _removeElement(element) {
    $(element).removeClass(this.constructor.ClassName.SHOW)

    if (!$(element).hasClass(this.constructor.ClassName.FADE)) {
      this._destroyElement(element)
      return
    }

    const transitionDuration = Util.getTransitionDurationFromElement(element)

    $(element)
      .one(Util.TRANSITION_END, (event) => this._destroyElement(element, event))
      .emulateTransitionEnd(transitionDuration)
  }

  _destroyElement(element) {
    $(element)
      .detach()
      .trigger(this.constructor.Event.CLOSED)
      .remove()
  }

  // Static

  static _jQueryInterface(Class) {
    return function (config) {
      return this.each(function () {
        const $element = $(this)
        let data = $element.data(Class.DATA_KEY)

        if (!data) {
          data = new Class(this)
          $element.data(Class.DATA_KEY, data)
        }

        if (config === 'close') {
          data[config](this)
        }
      })
    }
  }

  static _handleDismiss(alertInstance) {
    return function (event) {
      if (event) {
        event.preventDefault()
      }

      alertInstance.close(this)
    }
  }
}

/**
 * ------------------------------------------------------------------------
 * Data Api implementation
 * ------------------------------------------------------------------------
 */

$(document).on(
  Alert.Event.CLICK_DATA_API,
  Alert.Selector.DISMISS,
  Alert._handleDismiss(new Alert())
)

/**
 * ------------------------------------------------------------------------
 * jQuery
 * ------------------------------------------------------------------------
 */

const JQUERY_NO_CONFLICT = $.fn[Alert.NAME]
const plugin = Alert._jQueryInterface(Alert)

$.fn[Alert.NAME]             = plugin
$.fn[Alert.NAME].Constructor = Alert
$.fn[Alert.NAME].noConflict  = () => {
  $.fn[Alert.NAME] = JQUERY_NO_CONFLICT
  return plugin
}

export default Alert
