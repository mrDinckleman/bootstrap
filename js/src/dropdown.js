/**
 * --------------------------------------------------------------------------
 * Bootstrap (v4.4.1): dropdown.js
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * --------------------------------------------------------------------------
 */

import $ from 'jquery'
import Util from './util'
import {
  createPopper
} from '@popperjs/core'

/**
 * ------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------
 */

const NAME                     = 'dropdown'
// const VERSION                  = '4.4.1'
const DATA_KEY                 = 'bs.dropdown'
const EVENT_KEY                = `.${DATA_KEY}`
const DATA_API_KEY             = '.data-api'
const ESCAPE_KEYCODE           = 27 // KeyboardEvent.which value for Escape (Esc) key
const SPACE_KEYCODE            = 32 // KeyboardEvent.which value for space key
const TAB_KEYCODE              = 9 // KeyboardEvent.which value for tab key
const ARROW_UP_KEYCODE         = 38 // KeyboardEvent.which value for up arrow key
const ARROW_DOWN_KEYCODE       = 40 // KeyboardEvent.which value for down arrow key
const RIGHT_MOUSE_BUTTON_WHICH = 3 // MouseEvent.which value for the right button (assuming a right-handed mouse)
const REGEXP_KEYDOWN           = new RegExp(`${ARROW_UP_KEYCODE}|${ARROW_DOWN_KEYCODE}|${ESCAPE_KEYCODE}`)

const Event = {
  HIDE             : `hide${EVENT_KEY}`,
  HIDDEN           : `hidden${EVENT_KEY}`,
  SHOW             : `show${EVENT_KEY}`,
  SHOWN            : `shown${EVENT_KEY}`,
  CLICK            : `click${EVENT_KEY}`,
  CLICK_DATA_API   : `click${EVENT_KEY}${DATA_API_KEY}`,
  KEYDOWN_DATA_API : `keydown${EVENT_KEY}${DATA_API_KEY}`,
  KEYUP_DATA_API   : `keyup${EVENT_KEY}${DATA_API_KEY}`
}

const ClassName = {
  DISABLED        : 'disabled',
  SHOW            : 'show',
  DROPUP          : 'dropup',
  DROPRIGHT       : 'dropright',
  DROPLEFT        : 'dropleft',
  MENURIGHT       : 'dropdown-menu-right'
  // MENULEFT        : 'dropdown-menu-left',
  // POSITION_STATIC : 'position-static'
}

const Selector = {
  DATA_TOGGLE   : '[data-toggle="dropdown"]',
  FORM_CHILD    : '.dropdown form',
  MENU          : '.dropdown-menu',
  // NAVBAR_NAV    : '.navbar-nav',
  VISIBLE_ITEMS : '.dropdown-menu .dropdown-item:not(.disabled):not(:disabled)'
}

const AttachmentMap = {
  TOP       : 'top-start',
  TOPEND    : 'top-end',
  BOTTOM    : 'bottom-start',
  BOTTOMEND : 'bottom-end',
  RIGHT     : 'right-start',
  RIGHTEND  : 'right-end',
  LEFT      : 'left-start',
  LEFTEND   : 'left-end'
}

const Default = {
  offset       : [0, 0],
  flip         : true,
  // boundary     : 'scrollParent',
  reference    : 'toggle',
  display      : 'dynamic',
  popperConfig : null
}

const DefaultType = {
  offset       : '(array|function)',
  flip         : 'boolean',
  // boundary     : '(string|element)',
  reference    : '(string|element)',
  display      : 'string',
  popperConfig : '(null|object)'
}

/**
 * ------------------------------------------------------------------------
 * Class Definition
 * ------------------------------------------------------------------------
 */

class Dropdown {
  constructor(element, config) {
    this._element  = element
    this._popper   = null
    this._config   = this._getConfig(config)
    this._menu     = this._getMenuElement()
    // this._inNavbar = this._detectNavbar()

    this._addEventListeners()
  }

  // Getters

  // static get VERSION() {
  //   return VERSION
  // }

  static get Default() {
    return Default
  }

  static get DefaultType() {
    return DefaultType
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

  static get EVENT_KEY() {
    return EVENT_KEY
  }

  static get ClassName() {
    return ClassName
  }

  static get Selector() {
    return Selector
  }

  // Public

  toggle() {
    if (this._element.disabled || $(this._element).hasClass(this.constructor.ClassName.DISABLED)) {
      return
    }

    const isActive = $(this._menu).hasClass(this.constructor.ClassName.SHOW)

    this.constructor._clearMenus(this.constructor)({
      target: this._element
    })

    if (isActive) {
      return
    }

    this.show(true)
  }

  show(usePopper = false) {
    if (this._element.disabled || $(this._element).hasClass(this.constructor.ClassName.DISABLED) || $(this._menu).hasClass(this.constructor.ClassName.SHOW)) {
      return
    }

    const relatedTarget = {
      relatedTarget: this._element
    }
    const showEvent = $.Event(this.constructor.Event.SHOW, relatedTarget)
    const parent = Dropdown._getParentFromElement(this._element)

    $(parent).trigger(showEvent)

    if (showEvent.isDefaultPrevented()) {
      return
    }

    // Disable totally Popper.js for Dropdown in Navbar
    if (/* !this._inNavbar && */usePopper) {
      /**
       * Check for Popper dependency
       * Popper - https://popper.js.org
       */
      if (typeof createPopper === 'undefined') {
        throw new TypeError('Bootstrap\'s dropdowns require Popper.js (https://popper.js.org/)')
      }

      let referenceElement = this._element

      if (this._config.reference === 'parent') {
        referenceElement = parent
      } else if (Util.isElement(this._config.reference)) {
        referenceElement = this._config.reference

        // Check if it's jQuery element
        if (typeof this._config.reference.jquery !== 'undefined') {
          referenceElement = this._config.reference[0]
        }
      }

      // If boundary is not `scrollParent`, then set position to `static`
      // to allow the menu to "escape" the scroll parent's boundaries
      // https://github.com/twbs/bootstrap/issues/24251
      // if (this._config.boundary !== 'scrollParent') {
      //   $(parent).addClass(this.constructor.ClassName.POSITION_STATIC)
      // }
      this._popper = createPopper(referenceElement, this._menu, this._getPopperConfig())
    }

    // If this is a touch-enabled device we add extra
    // empty mouseover listeners to the body's immediate children;
    // only needed because of broken event delegation on iOS
    // https://www.quirksmode.org/blog/archives/2014/02/mouse_event_bub.html
    if ('ontouchstart' in document.documentElement/* &&
        $(parent).closest(this.constructor.Selector.NAVBAR_NAV).length === 0*/) {
      $(document.body).children().on('mouseover', null, $.noop)
    }

    this._element.focus()
    this._element.setAttribute('aria-expanded', true)

    $(this._menu).toggleClass(this.constructor.ClassName.SHOW)
    $(parent)
      .toggleClass(this.constructor.ClassName.SHOW)
      .trigger($.Event(this.constructor.Event.SHOWN, relatedTarget))
  }

  hide() {
    if (this._element.disabled || $(this._element).hasClass(this.constructor.ClassName.DISABLED) || !$(this._menu).hasClass(this.constructor.ClassName.SHOW)) {
      return
    }

    const relatedTarget = {
      relatedTarget: this._element
    }
    const hideEvent = $.Event(this.constructor.Event.HIDE, relatedTarget)
    const parent = Dropdown._getParentFromElement(this._element)

    $(parent).trigger(hideEvent)

    if (hideEvent.isDefaultPrevented()) {
      return
    }

    if (this._popper) {
      this._popper.destroy()
    }

    $(this._menu).toggleClass(this.constructor.ClassName.SHOW)
    $(parent)
      .toggleClass(this.constructor.ClassName.SHOW)
      .trigger($.Event(this.constructor.Event.HIDDEN, relatedTarget))
  }

  dispose() {
    $.removeData(this._element, this.constructor.DATA_KEY)
    $(this._element).off(this.constructor.EVENT_KEY)
    this._element = null
    this._config  = null
    this._menu = null
    if (this._popper !== null) {
      this._popper.destroy()
      this._popper = null
    }
  }

  update() {
    // this._inNavbar = this._detectNavbar()
    if (this._popper !== null) {
      this._popper.update()
    }
  }

  // Private

  _addEventListeners() {
    $(this._element).on(this.constructor.Event.CLICK, (event) => {
      event.preventDefault()
      event.stopPropagation()
      this.toggle()
    })
  }

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

  _getMenuElement() {
    if (!this._menu) {
      const parent = Dropdown._getParentFromElement(this._element)

      if (parent) {
        this._menu = parent.querySelector(this.constructor.Selector.MENU)
      }
    }
    return this._menu
  }

  _getPlacement() {
    const $parentDropdown = $(this._element.parentNode)
    let placement = AttachmentMap.BOTTOM

    // Handle dropup
    if ($parentDropdown.hasClass(this.constructor.ClassName.DROPUP)) {
      placement = AttachmentMap.TOP
      if ($(this._menu).hasClass(this.constructor.ClassName.MENURIGHT)) {
        placement = AttachmentMap.TOPEND
      }
    } else if ($parentDropdown.hasClass(this.constructor.ClassName.DROPRIGHT)) {
      placement = AttachmentMap.RIGHT
    } else if ($parentDropdown.hasClass(this.constructor.ClassName.DROPLEFT)) {
      placement = AttachmentMap.LEFT
    } else if ($(this._menu).hasClass(this.constructor.ClassName.MENURIGHT)) {
      placement = AttachmentMap.BOTTOMEND
    }
    return placement
  }

  // _detectNavbar() {
  //   return $(this._element).closest('.navbar').length > 0
  // }

  // _getOffset() {
  //   const offset = {}
  //
  //   if (typeof this._config.offset === 'function') {
  //     offset.fn = (data) => {
  //       data.offsets = {
  //         ...data.offsets,
  //         ...this._config.offset(data.offsets, this._element) || {}
  //       }
  //
  //       return data
  //     }
  //   } else {
  //     offset.offset = this._config.offset
  //   }
  //
  //   return offset
  // }

  _getPopperConfig() {
    const popperConfig = {
      placement: this._getPlacement(),
      modifiers: [
        {
          name: 'offset',
          options: {
            offset: this._config.offset
          }
        },
        {
          name: 'applyStyles',
          enabled: this._config.display !== 'static'
        },
        {
          name: 'preventOverflow',
          options: {
            tetherOffset: ({
              reference, placement
            }) => {
              if (placement.indexOf('right') !== -1 || placement.indexOf('left') !== -1) {
                return reference.height
              }
              return reference.width
            }
          }
        }
      ]
      // modifiers: {
      //   offset: this._getOffset(),
      //   flip: {
      //     enabled: this._config.flip
      //   },
      //   preventOverflow: {
      //     boundariesElement: this._config.boundary
      //   }
      // }
    }

    // Disable Popper.js if we have a static display
    // if (this._config.display === 'static') {
    //   popperConfig.modifiers.applyStyle = {
    //     enabled: false
    //   }
    // }

    return {
      ...popperConfig,
      ...this._config.popperConfig
    }
  }

  // Static

  static _jQueryInterface(Class) {
    return function (config) {
      return this.each(function () {
        let data = $(this).data(Class.DATA_KEY)
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

  static _clearMenus(Class) {
    // eslint-disable-next-line complexity
    return function (event) {
      if (event && (event.which === RIGHT_MOUSE_BUTTON_WHICH ||
        event.type === 'keyup' && event.which !== TAB_KEYCODE)) {
        return
      }

      const toggles = [].slice.call(document.querySelectorAll(Class.Selector.DATA_TOGGLE))

      for (let i = 0, len = toggles.length; i < len; i++) {
        const parent = Class._getParentFromElement(toggles[i])
        const context = $(toggles[i]).data(Class.DATA_KEY)
        const relatedTarget = {
          relatedTarget: toggles[i]
        }

        if (event && event.target !== toggles[i] && parent.contains(event.target)) {
          continue
        }

        if (event && event.type === 'click') {
          relatedTarget.clickEvent = event
        }

        if (!context) {
          continue
        }

        const dropdownMenu = context._menu
        if (!$(parent).hasClass(Class.ClassName.SHOW)) {
          continue
        }

        if (event && (event.type === 'click' &&
          /input|textarea/i.test(event.target.tagName) || event.type === 'keyup' && event.which === TAB_KEYCODE) &&
          $.contains(parent, event.target)) {
          continue
        }

        const hideEvent = $.Event(Class.Event.HIDE, relatedTarget)
        $(parent).trigger(hideEvent)
        if (hideEvent.isDefaultPrevented()) {
          continue
        }

        // If this is a touch-enabled device we remove the extra
        // empty mouseover listeners we added for iOS support
        if ('ontouchstart' in document.documentElement) {
          $(document.body).children().off('mouseover', null, $.noop)
        }

        toggles[i].setAttribute('aria-expanded', 'false')

        if (context._popper) {
          context._popper.destroy()
        }

        $(dropdownMenu).removeClass(Class.ClassName.SHOW)
        $(parent)
          .removeClass(Class.ClassName.SHOW)
          .trigger($.Event(Class.Event.HIDDEN, relatedTarget))
      }
    }
  }

  static _getParentFromElement(element) {
    let parent
    const selector = Util.getSelectorFromElement(element)

    if (selector) {
      parent = document.querySelector(selector)
    }

    return parent || element.parentNode
  }

  static _dataApiKeydownHandler(Class) {
    // eslint-disable-next-line complexity
    return function (event) {
      // If not input/textarea:
      //  - And not a key in REGEXP_KEYDOWN => not a dropdown command
      // If input/textarea:
      //  - If space key => not a dropdown command
      //  - If key is other than escape
      //    - If key is not up or down => not a dropdown command
      //    - If trigger inside the menu => not a dropdown command
      if (/input|textarea/i.test(event.target.tagName)
        ? event.which === SPACE_KEYCODE || event.which !== ESCAPE_KEYCODE &&
        (event.which !== ARROW_DOWN_KEYCODE && event.which !== ARROW_UP_KEYCODE ||
          $(event.target).closest(Class.Selector.MENU).length) : !REGEXP_KEYDOWN.test(event.which)) {
        return
      }

      event.preventDefault()
      event.stopPropagation()

      if (this.disabled || $(this).hasClass(Class.ClassName.DISABLED)) {
        return
      }

      const parent   = Dropdown._getParentFromElement(this)
      const isActive = $(parent).hasClass(Class.ClassName.SHOW)

      if (!isActive && event.which === ESCAPE_KEYCODE) {
        return
      }

      if (!isActive || isActive && (event.which === ESCAPE_KEYCODE || event.which === SPACE_KEYCODE)) {
        if (event.which === ESCAPE_KEYCODE) {
          const toggle = parent.querySelector(Class.Selector.DATA_TOGGLE)
          $(toggle).trigger('focus')
        }

        $(this).trigger('click')
        return
      }

      const items = [].slice.call(parent.querySelectorAll(Class.Selector.VISIBLE_ITEMS))
        .filter((item) => $(item).is(':visible'))

      if (items.length === 0) {
        return
      }

      let index = items.indexOf(event.target)

      if (event.which === ARROW_UP_KEYCODE && index > 0) { // Up
        index--
      }

      if (event.which === ARROW_DOWN_KEYCODE && index < items.length - 1) { // Down
        index++
      }

      if (index < 0) {
        index = 0
      }

      items[index].focus()
    }
  }
}

/**
 * ------------------------------------------------------------------------
 * Data Api implementation
 * ------------------------------------------------------------------------
 */

$(document)
  .on(Dropdown.Event.KEYDOWN_DATA_API, Dropdown.Selector.DATA_TOGGLE, Dropdown._dataApiKeydownHandler(Dropdown))
  .on(Dropdown.Event.KEYDOWN_DATA_API, Dropdown.Selector.MENU, Dropdown._dataApiKeydownHandler(Dropdown))
  .on(`${Dropdown.Event.CLICK_DATA_API} ${Dropdown.Event.KEYUP_DATA_API}`, Dropdown._clearMenus(Dropdown))
  .on(Dropdown.Event.CLICK_DATA_API, Dropdown.Selector.DATA_TOGGLE, function (event) {
    event.preventDefault()
    event.stopPropagation()
    Dropdown._jQueryInterface(Dropdown).call($(this), 'toggle')
  })
  .on(Dropdown.Event.CLICK_DATA_API, Dropdown.Selector.FORM_CHILD, (e) => {
    e.stopPropagation()
  })

/**
 * ------------------------------------------------------------------------
 * jQuery
 * ------------------------------------------------------------------------
 */

const JQUERY_NO_CONFLICT = $.fn[Dropdown.NAME]
const plugin = Dropdown._jQueryInterface(Dropdown)

$.fn[Dropdown.NAME] = plugin
$.fn[Dropdown.NAME].Constructor = Dropdown
$.fn[Dropdown.NAME].noConflict = () => {
  $.fn[Dropdown.NAME] = JQUERY_NO_CONFLICT
  return plugin
}

export default Dropdown
