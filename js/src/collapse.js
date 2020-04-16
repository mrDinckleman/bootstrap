/**
 * --------------------------------------------------------------------------
 * Bootstrap (v4.4.1): collapse.js
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

const NAME                = 'collapse'
// const VERSION             = '4.4.1'
const DATA_KEY            = 'bs.collapse'
const EVENT_KEY           = `.${DATA_KEY}`
const DATA_API_KEY        = '.data-api'

const Default = {
  toggle : true,
  parent : ''
}

const DefaultType = {
  toggle : 'boolean',
  parent : '(string|element)'
}

const Event = {
  SHOW           : `show${EVENT_KEY}`,
  SHOWN          : `shown${EVENT_KEY}`,
  HIDE           : `hide${EVENT_KEY}`,
  HIDDEN         : `hidden${EVENT_KEY}`,
  CLICK_DATA_API : `click${EVENT_KEY}${DATA_API_KEY}`
}

const ClassName = {
  SHOW       : 'show',
  COLLAPSE   : 'collapse',
  COLLAPSING : 'collapsing'
  // COLLAPSED  : 'collapsed'
}

const Dimension = {
  WIDTH  : 'width',
  HEIGHT : 'height'
}

const Selector = {
  ACTIVES     : '.show, .collapsing',
  DATA_TOGGLE : '[data-toggle="collapse"]'
}

/**
 * ------------------------------------------------------------------------
 * Class Definition
 * ------------------------------------------------------------------------
 */

class Collapse {
  constructor(element, config) {
    this._isTransitioning = false
    this._element         = element
    this._config          = this._getConfig(config)
    this._triggerArray    = [].slice.call(document.querySelectorAll(
      `${this.constructor.Selector.DATA_TOGGLE}[href="#${element.id}"],` +
      `${this.constructor.Selector.DATA_TOGGLE}[data-target="#${element.id}"]`
    ))

    const toggleList = [].slice.call(document.querySelectorAll(this.constructor.Selector.DATA_TOGGLE))
    for (let i = 0, len = toggleList.length; i < len; i++) {
      const elem = toggleList[i]
      const selector = Util.getSelectorFromElement(elem)
      const filterElement = [].slice.call(document.querySelectorAll(selector))
        .filter((foundElem) => foundElem === element)

      if (selector !== null && filterElement.length > 0) {
        this._selector = selector
        this._triggerArray.push(elem)
      }
    }

    this._parent = this._config.parent ? this._getParent() : null

    if (!this._config.parent) {
      this._addAriaAndCollapsedClass(this._element, this._triggerArray)
    }

    if (this._config.toggle) {
      this.toggle()
    }
  }

  // Getters

  // static get VERSION() {
  //   return VERSION
  // }

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

  static get DefaultType() {
    return DefaultType
  }

  static get ClassName() {
    return ClassName
  }

  static get Selector() {
    return Selector
  }

  // Public

  toggle() {
    if ($(this._element).hasClass(this.constructor.ClassName.SHOW)) {
      this.hide()
    } else {
      this.show()
    }
  }

  show() {
    if (this._isTransitioning ||
      $(this._element).hasClass(this.constructor.ClassName.SHOW)) {
      return
    }

    let actives
    let activesData

    if (this._parent) {
      actives = [].slice.call(this._parent.querySelectorAll(this.constructor.Selector.ACTIVES))
        .filter((elem) => {
          if (typeof this._config.parent === 'string') {
            return elem.getAttribute('data-parent') === this._config.parent
          }

          return elem.classList.contains(this.constructor.ClassName.COLLAPSE)
        })

      if (actives.length === 0) {
        actives = null
      }
    }

    if (actives) {
      activesData = $(actives).not(this._selector).data(this.constructor.DATA_KEY)
      if (activesData && activesData._isTransitioning) {
        return
      }
    }

    const startEvent = $.Event(this.constructor.Event.SHOW)
    $(this._element).trigger(startEvent)
    if (startEvent.isDefaultPrevented()) {
      return
    }

    if (actives) {
      this.constructor._jQueryInterface(this.constructor).call($(actives).not(this._selector), 'hide')
      if (!activesData) {
        $(actives).data(this.constructor.DATA_KEY, null)
      }
    }

    const dimension = this._getDimension()

    $(this._element)
      .removeClass(this.constructor.ClassName.COLLAPSE)
      .addClass(this.constructor.ClassName.COLLAPSING)

    this._element.style[dimension] = 0

    if (this._triggerArray.length) {
      $(this._triggerArray)
        // .removeClass(this.constructor.ClassName.COLLAPSED)
        .attr('aria-expanded', true)
    }

    this.setTransitioning(true)

    const complete = () => {
      $(this._element)
        .removeClass(this.constructor.ClassName.COLLAPSING)
        .addClass(this.constructor.ClassName.COLLAPSE)
        .addClass(this.constructor.ClassName.SHOW)

      this._element.style[dimension] = ''

      this.setTransitioning(false)

      $(this._element).trigger(this.constructor.Event.SHOWN)
    }

    const capitalizedDimension = dimension[0].toUpperCase() + dimension.slice(1)
    const scrollSize = `scroll${capitalizedDimension}`
    const transitionDuration = Util.getTransitionDurationFromElement(this._element)

    $(this._element)
      .one(Util.TRANSITION_END, complete)
      .emulateTransitionEnd(transitionDuration)

    this._element.style[dimension] = `${this._element[scrollSize]}px`
  }

  hide() {
    if (this._isTransitioning ||
      !$(this._element).hasClass(this.constructor.ClassName.SHOW)) {
      return
    }

    const startEvent = $.Event(this.constructor.Event.HIDE)
    $(this._element).trigger(startEvent)
    if (startEvent.isDefaultPrevented()) {
      return
    }

    const dimension = this._getDimension()

    this._element.style[dimension] = `${this._element.getBoundingClientRect()[dimension]}px`

    Util.reflow(this._element)

    $(this._element)
      .addClass(this.constructor.ClassName.COLLAPSING)
      .removeClass(this.constructor.ClassName.COLLAPSE)
      .removeClass(this.constructor.ClassName.SHOW)

    const triggerArrayLength = this._triggerArray.length
    if (triggerArrayLength > 0) {
      for (let i = 0; i < triggerArrayLength; i++) {
        const trigger = this._triggerArray[i]
        const selector = Util.getSelectorFromElement(trigger)

        if (selector !== null) {
          const $elem = $([].slice.call(document.querySelectorAll(selector)))
          if (!$elem.hasClass(this.constructor.ClassName.SHOW)) {
            $(trigger)// .addClass(this.constructor.ClassName.COLLAPSED)
              .attr('aria-expanded', false)
          }
        }
      }
    }

    this.setTransitioning(true)

    const complete = () => {
      this.setTransitioning(false)
      $(this._element)
        .removeClass(this.constructor.ClassName.COLLAPSING)
        .addClass(this.constructor.ClassName.COLLAPSE)
        .trigger(this.constructor.Event.HIDDEN)
    }

    this._element.style[dimension] = ''
    const transitionDuration = Util.getTransitionDurationFromElement(this._element)

    $(this._element)
      .one(Util.TRANSITION_END, complete)
      .emulateTransitionEnd(transitionDuration)
  }

  setTransitioning(isTransitioning) {
    this._isTransitioning = isTransitioning
  }

  dispose() {
    $.removeData(this._element, this.constructor.DATA_KEY)

    this._config          = null
    this._parent          = null
    this._element         = null
    this._triggerArray    = null
    this._isTransitioning = null
  }

  // Private

  _getConfig(config) {
    const dataAttributes = $(this._element).data()

    config = {
      ...this.constructor.Default,
      ...dataAttributes,
      ...typeof config === 'object' && config ? config : {}
    }

    config.toggle = Boolean(config.toggle) // Coerce string values

    Util.typeCheckConfig(
      this.constructor.NAME,
      config,
      this.constructor.DefaultType
    )

    return config
  }

  _getDimension() {
    const hasWidth = $(this._element).hasClass(Dimension.WIDTH)
    return hasWidth ? Dimension.WIDTH : Dimension.HEIGHT
  }

  _getParent() {
    let parent

    if (Util.isElement(this._config.parent)) {
      parent = this._config.parent

      // It's a jQuery object
      if (typeof this._config.parent.jquery !== 'undefined') {
        parent = this._config.parent[0]
      }
    } else {
      parent = document.querySelector(this._config.parent)
    }

    const selector =
      `${this.constructor.Selector.DATA_TOGGLE}[data-parent="${this._config.parent}"]`

    const children = [].slice.call(parent.querySelectorAll(selector))
    $(children).each((i, element) => {
      this._addAriaAndCollapsedClass(
        Collapse._getTargetFromElement(element),
        [element]
      )
    })

    return parent
  }

  _addAriaAndCollapsedClass(element, triggerArray) {
    const isOpen = $(element).hasClass(this.constructor.ClassName.SHOW)

    if (triggerArray.length) {
      $(triggerArray)
        // .toggleClass(this.constructor.ClassName.COLLAPSED, !isOpen)
        .attr('aria-expanded', isOpen)
    }
  }

  // Static

  static _getTargetFromElement(element) {
    const selector = Util.getSelectorFromElement(element)
    return selector ? document.querySelector(selector) : null
  }

  static _jQueryInterface(Class) {
    return function (config) {
      return this.each(function () {
        let data = $(this).data(Class.DATA_KEY)
        const _config = typeof config === 'object' && config

        if (!data && _config.toggle && /show|hide/.test(config)) {
          _config.toggle = false
        }

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

  static _dataAPI(Class) {
    return function (event) {
      // preventDefault only for <a> elements (which change the URL) not inside the collapsible element
      if (event.currentTarget.tagName === 'A') {
        event.preventDefault()
      }

      const $trigger = $(this)
      const selector = Util.getSelectorFromElement(this)
      const selectors = [].slice.call(document.querySelectorAll(selector))

      $(selectors).each(function () {
        const $target = $(this)
        const data    = $target.data(Class.DATA_KEY)
        const config  = data ? 'toggle' : $trigger.data()
        Class._jQueryInterface(Class).call($target, config)
      })
    }
  }
}

/**
 * ------------------------------------------------------------------------
 * Data Api implementation
 * ------------------------------------------------------------------------
 */

$(document).on(Collapse.Event.CLICK_DATA_API, Collapse.Selector.DATA_TOGGLE, Collapse._dataAPI(Collapse))

/**
 * ------------------------------------------------------------------------
 * jQuery
 * ------------------------------------------------------------------------
 */

const JQUERY_NO_CONFLICT  = $.fn[Collapse.NAME]
const plugin = Collapse._jQueryInterface(Collapse)

$.fn[Collapse.NAME] = plugin
$.fn[Collapse.NAME].Constructor = Collapse
$.fn[Collapse.NAME].noConflict = () => {
  $.fn[Collapse.NAME] = JQUERY_NO_CONFLICT
  return plugin
}

export default Collapse
