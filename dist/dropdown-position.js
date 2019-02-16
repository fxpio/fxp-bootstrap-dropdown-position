var FxpDropdownPosition = (function (exports, $) {
  'use strict';

  $ = $ && $.hasOwnProperty('default') ? $['default'] : $;

  function _typeof(obj) {
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
  }

  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }

  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };

    return _setPrototypeOf(o, p);
  }

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  function _possibleConstructorReturn(self, call) {
    if (call && (typeof call === "object" || typeof call === "function")) {
      return call;
    }

    return _assertThisInitialized(self);
  }

  function _superPropBase(object, property) {
    while (!Object.prototype.hasOwnProperty.call(object, property)) {
      object = _getPrototypeOf(object);
      if (object === null) break;
    }

    return object;
  }

  function _get(target, property, receiver) {
    if (typeof Reflect !== "undefined" && Reflect.get) {
      _get = Reflect.get;
    } else {
      _get = function _get(target, property, receiver) {
        var base = _superPropBase(target, property);

        if (!base) return;
        var desc = Object.getOwnPropertyDescriptor(base, property);

        if (desc.get) {
          return desc.get.call(receiver);
        }

        return desc.value;
      };
    }

    return _get(target, property, receiver || target);
  }

  /**
   * Define the class as Jquery plugin.
   *
   * @param {String}      pluginName  The name of jquery plugin defined in $.fn
   * @param {String}      dataName    The key name of jquery data
   * @param {function}    ClassName   The class name
   * @param {boolean}     [shorthand] Check if the shorthand of jquery plugin must be added
   * @param {String|null} dataApiAttr The DOM data attribute selector name to init the jquery plugin with Data API, NULL to disable
   * @param {String}      removeName  The method name to remove the plugin data
   */

  function pluginify (pluginName, dataName, ClassName) {
    var shorthand = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
    var dataApiAttr = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
    var removeName = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 'destroy';
    var old = $.fn[pluginName];

    $.fn[pluginName] = function () {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      var resFunc, resList;
      resList = this.each(function (i, element) {
        var $this = $(element),
            data = $this.data(dataName);

        if (!data) {
          data = new ClassName(element, _typeof(options) === 'object' ? options : {});
          $this.data(dataName, data);
        }

        if (typeof options === 'string' && data) {
          if (data[options]) {
            resFunc = data[options].apply(data, args);
            resFunc = resFunc !== data ? resFunc : undefined;
          } else if (data.constructor[options]) {
            resFunc = data.constructor[options].apply(data, args);
            resFunc = resFunc !== data ? resFunc : undefined;
          }

          if (options === removeName) {
            $this.removeData(dataName);
          }
        }
      });
      return 1 === resList.length && undefined !== resFunc ? resFunc : resList;
    };

    $.fn[pluginName].Constructor = ClassName; // Shorthand

    if (shorthand) {
      $[pluginName] = function (options) {
        return $({})[pluginName](options);
      };
    } // No conflict


    $.fn[pluginName].noConflict = function () {
      return $.fn[pluginName] = old;
    }; // Data API


    if (null !== dataApiAttr) {
      $(window).on('load', function () {
        $(dataApiAttr).each(function () {
          var $this = $(this);
          $.fn[pluginName].call($this, $this.data());
        });
      });
    }
  }

  var DEFAULT_OPTIONS = {};
  /**
   * Base class for plugin.
   */

  var BasePlugin =
  /*#__PURE__*/
  function () {
    /**
     * Constructor.
     *
     * @param {HTMLElement} element The DOM element
     * @param {object}      options The options
     */
    function BasePlugin(element) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      _classCallCheck(this, BasePlugin);

      this.guid = $.guid;
      this.options = $.extend(true, {}, this.constructor.defaultOptions, options);
      this.$element = $(element);
    }
    /**
     * Destroy the instance.
     */


    _createClass(BasePlugin, [{
      key: "destroy",
      value: function destroy() {
        var self = this;
        Object.keys(self).forEach(function (key) {
          delete self[key];
        });
      }
      /**
       * Set the default options.
       * The new values are merged with the existing values.
       *
       * @param {object} options
       */

    }], [{
      key: "defaultOptions",
      set: function set(options) {
        DEFAULT_OPTIONS[this.name] = $.extend(true, {}, DEFAULT_OPTIONS[this.name], options);
      }
      /**
       * Get the default options.
       *
       * @return {object}
       */
      ,
      get: function get() {
        if (undefined === DEFAULT_OPTIONS[this.name]) {
          DEFAULT_OPTIONS[this.name] = {};
        }

        return DEFAULT_OPTIONS[this.name];
      }
    }]);

    return BasePlugin;
  }();

  /*
   * This file is part of the Fxp package.
   *
   * (c) François Pluchino <francois.pluchino@gmail.com>
   *
   * For the full copyright and license information, please view the LICENSE
   * file that was distributed with this source code.
   */

  /**
   * Lock the scroll of body.
   *
   * @param {DropdownPosition} self The dropdown position instance
   */
  function lockBodyScroll(self) {
    var bodyPad = parseInt(self.$body.css('padding-right') || 0, 10),
        hasScrollbar = self.$body.get(0).scrollHeight > document.documentElement.clientHeight && 'hidden' !== self.$body.css('overflow-y');

    if (hasScrollbar) {
      self.originalBodyPad = document.body.style.paddingRight || '';
      self.originalBodyOverflowY = document.body.style.overflowY || '';
      self.$body.css({
        'padding-right': bodyPad + self.nativeScrollWidth + 'px',
        'overflow-y': 'hidden'
      });
    }
  }
  /**
   * Unlock the scroll of body.
   *
   * @param {DropdownPosition} self The dropdown position instance
   */

  function unlockBodyScroll(self) {
    if (null !== self.originalBodyPad || null !== self.originalBodyOverflowY) {
      self.$body.css({
        'padding-right': self.originalBodyPad,
        'overflow-y': self.originalBodyOverflowY
      });
      self.originalBodyPad = null;
      self.originalBodyOverflowY = null;
    }
  }

  /*
   * This file is part of the Fxp package.
   *
   * (c) François Pluchino <francois.pluchino@gmail.com>
   *
   * For the full copyright and license information, please view the LICENSE
   * file that was distributed with this source code.
   */
  /**
   * Get dropdown menu.
   *
   * @param {EventTarget} target The DOM element
   *
   * @return {jQuery}
   */

  function getMenu(target) {
    var $menu = $('.dropdown-menu', target),
        menuId;

    if (0 === $menu.length) {
      menuId = $('.dropdown-menu-restore-position', target).attr('data-dropdown-restore-for');
      $menu = $('[data-dropdown-restore-id=' + menuId + ']');
    }

    return $menu;
  }

  /*
   * This file is part of the Fxp package.
   *
   * (c) François Pluchino <francois.pluchino@gmail.com>
   *
   * For the full copyright and license information, please view the LICENSE
   * file that was distributed with this source code.
   */
  /**
   * Get the margin right defined by scroller when native scroll is used.
   *
   * @param {jQuery} $element The jquery element
   *
   * @return {Number}
   */

  function getScrollerMargin($element) {
    var margin = parseInt($element.css('margin-right'), 0);
    return isNaN(margin) ? 0 : margin;
  }
  /**
   * Refresh the position of dropdown wrapper.
   *
   * @param {jQuery} $wrapper   The wrapper position of dropdown menu
   * @param {jQuery} $menu      The dropdown menu
   * @param {object} menuOffset The offset left and top on init position of menu
   */

  function refreshPosition($wrapper, $menu, menuOffset) {
    var padding = 15,
        usePadding = false,
        left = Math.round(menuOffset.left) - parseInt($wrapper.css('border-left-width'), 10),
        top = Math.round(menuOffset.top - $(window).eq(0).scrollTop()) - parseInt($wrapper.css('border-top-width'), 10),
        width,
        height,
        endLeft,
        endTop,
        maxWidth = $(window).width() - padding * ($wrapper.hasClass('wrapper-pull-height') ? 2 : 1),
        maxHeight = $(window).height() - padding * ($wrapper.hasClass('wrapper-pull-height') ? 2 : 1);
    $wrapper.css({
      'left': left,
      'top': top,
      'max-width': maxWidth,
      'max-height': maxHeight
    });
    width = $wrapper.outerWidth();
    height = $wrapper.outerHeight();
    endLeft = left + width;
    endTop = top + height;

    if ($wrapper.hasClass('wrapper-pull-height') && left !== $wrapper.offset().left) {
      top = $(window).height() / 2 - height / 2;
      endTop = top + height;
      maxHeight -= padding;
      usePadding = true;
      $wrapper.css('max-height', maxHeight);
    }

    if ($wrapper.hasClass('wrapper-pull-right')) {
      left = Math.max(left, padding);
    } else if (menuOffset.left > padding) {
      if (endLeft > maxWidth) {
        left = maxWidth - width;
      }

      left = Math.max(left, padding);
    }

    if (menuOffset.top > padding || usePadding) {
      if (endTop > maxHeight) {
        top = maxHeight - height;
      }

      top = Math.max(top, padding);
    }

    $wrapper.css({
      'left': left,
      'top': top
    });
    $menu.css({
      'width': $wrapper.innerWidth() - getScrollerMargin($menu),
      'height': $wrapper.innerHeight()
    });

    if (typeof $.fn.scroller === 'function') {
      $menu.scroller('resizeScrollbar');
    }
  }
  /**
   * Get the zindex of element.
   *
   * @param {jQuery} $element The jquery element
   *
   * @return {Number}
   */

  function getZindex($element) {
    var zindex = parseInt($element.css('z-index'), 0);

    if (isNaN(zindex)) {
      zindex = 0;
    }

    return zindex;
  }
  /**
   * Find the parent zindex.
   *
   * @param {jQuery} $element The jquery element
   *
   * @return {Number}
   */

  function findParentZindex($element) {
    var zindex = getZindex($element),
        $parents = $element.parents(),
        value,
        i;

    for (i = 0; i < $parents.length; i += 1) {
      value = parseInt($parents.eq(i).css('z-index'), 0);

      if (!isNaN(value)) {
        zindex = Math.max(zindex, value);
      }
    }

    return zindex;
  }

  /*
   * This file is part of the Fxp package.
   *
   * (c) François Pluchino <francois.pluchino@gmail.com>
   *
   * For the full copyright and license information, please view the LICENSE
   * file that was distributed with this source code.
   */
  /**
   * Action on keydown event.
   *
   * @param {jQuery.Event|Event} event
   *
   * @typedef {Object} jQuery.Event.data        The dropdown menu and toggle
   * @typedef {jQuery} jQuery.Event.data.menu   The dropdown menu
   * @typedef {jQuery} jQuery.Event.data.toggle The toggle
   * @typedef {String} jQuery.Event.which       The which
   */

  function onKeydown(event) {
    var $menu = event.data.menu,
        $toggle = event.data.toggle,
        $btn = $('[data-toggle="dropdown"]', $toggle),
        $items,
        index;

    if (!/(38|40|27|32)/.test(event.which) || /input|textarea/i.test(event.target.tagName)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    if ($btn.is('.disabled, :disabled')) {
      return;
    }

    if (event.which === 27) {
      $btn.trigger('focus');
      return $btn.trigger('click');
    }

    $items = $menu.find('li:not(.disabled):visible a:not(.btn), li:visible a.btn:not(.disabled)');

    if (!$items.length) {
      return;
    }

    index = $items.index(event.target); // up

    if (event.which === 38 && index > 0) {
      index--;
    } // down


    if (event.which === 40 && index < $items.length - 1) {
      index++;
    }

    if (!~index) {
      index = 0;
    }

    $items.eq(index).trigger('focus');
  }
  /**
   * Action on hide dropdown event.
   *
   * @param {jQuery.Event|Event} event
   */

  function onHide(event) {
    var $toggle = $(event.target),
        $menu = $toggle.data('st-menu'),
        $contentMenu,
        $wrapper,
        $wrapperClone,
        $wrapperMask,
        $restoreMenu,
        duration;

    if (undefined === $menu) {
      return;
    }

    unlockBodyScroll(event.data);
    $toggle.off('keydown.fxp.dropdownposition.data-api', onKeydown);
    $menu.off('keydown.fxp.dropdownposition.data-api', onKeydown);
    $toggle.data('st-contentContainer').off('scroll.fxp.dropdownposition' + self.guid, externalClose);
    $contentMenu = $toggle.data('st-contentMenu');
    $wrapperMask = $toggle.data('st-wrapperMask');
    $wrapper = $toggle.data('st-wrapper');
    $wrapperClone = $($wrapper.clone(false).get(0).outerHTML);
    $restoreMenu = $toggle.data('st-restoreMenu');
    duration = parseFloat($wrapper.css('transition-duration')) * 1000;

    if ($wrapperClone.prop('id').length > 0) {
      $wrapperClone.prop('id', $wrapperClone.prop('id') + '_hide_transition');
    }

    $wrapper.before($wrapperClone);
    $wrapper.removeClass('wrapper-open');

    if (typeof $.fn.scroller === 'function') {
      $menu.scroller('destroy');
    }

    $restoreMenu.after($contentMenu);
    $restoreMenu.remove();
    $wrapper.remove();
    $menu.removeAttr('data-dropdown-restore-id');
    $menu.css({
      'margin-right': '',
      'overflow': '',
      'width': '',
      'height': ''
    });
    $toggle.removeData('st-menu').removeData('st-contentMenu').removeData('st-wrapperMask').removeData('st-wrapper').removeData('st-restoreMenu').removeData('st-contentContainer');
    window.setTimeout(function () {
      $wrapperClone.removeClass('wrapper-open');
      $wrapperMask.removeClass('wrapper-open');
      window.setTimeout(function () {
        if (undefined === $menu) {
          return;
        }

        $wrapperMask.remove();
        $wrapperClone.remove();
      }, duration);
    }, 1);
  }
  /**
   * Action on shown dropdown event.
   *
   * @param {jQuery.Event|Event} event
   */

  function onShown(event) {
    var self = event.data,
        ddId = 'dropdown-menu-original-' + self.guid,
        $body = $('body'),
        duration,
        zindex,
        $content,
        $toggle = $(event.target),
        $menu = $toggle.data('st-menu'),
        $contentMenu,
        $wrapper,
        $wrapperMask,
        $restoreMenu,
        menuOffset;

    if (undefined !== $menu) {
      onHide(event);
    }

    $menu = getMenu(event.target);
    $menu.css('display', 'none');
    lockBodyScroll(event.data);
    $menu.css('display', '');
    $contentMenu = $menu;
    $wrapperMask = $('<div class="wrapper-dropdown-position-mask"></div>');
    $wrapper = $('<div class="wrapper-dropdown-position"></div>');
    $toggle.data('st-menu', $menu);
    $toggle.data('st-contentMenu', $contentMenu);
    $toggle.data('st-wrapperMask', $wrapperMask);
    $toggle.data('st-wrapper', $wrapper);
    $toggle.data('st-contentContainer', $toggle.parents('[data-dropdown-position-container]'));
    $menu.attr('class').trim().split(' ').forEach(function (className) {
      $wrapper.addClass('wrapper-' + className);
      $wrapperMask.addClass('wrapper-' + className);
    });

    if ($menu.parent().hasClass('dropup')) {
      $wrapper.addClass('wrapper-dropup');
    }

    if ($menu.hasClass('pull-right')) {
      $wrapperMask.addClass('wrapper-pull-right');
      $wrapper.addClass('wrapper-pull-right');
    }

    if ($menu.hasClass('pull-height')) {
      $wrapperMask.addClass('wrapper-pull-height');
      $wrapper.addClass('wrapper-pull-height');
    }

    zindex = Math.max(getZindex($wrapper), getZindex($menu));
    zindex = Math.max(findParentZindex($toggle), zindex);
    zindex = Math.max(zindex, 1);
    $('.dropdown-backdrop').css('z-index', zindex);
    $wrapperMask.css({
      'position': 'fixed',
      'z-index': zindex,
      'left': 0,
      'right': 0,
      'top': 0,
      'bottom': 0
    });
    $wrapper.css({
      'z-index': zindex,
      'border-top-width': $menu.css('border-top-width'),
      'border-top-style': $menu.css('border-top-style'),
      'border-top-color': $menu.css('border-top-color'),
      'border-bottom-width': $menu.css('border-bottom-width'),
      'border-bottom-style': $menu.css('border-bottom-style'),
      'border-bottom-color': $menu.css('border-bottom-color'),
      'border-left-width': $menu.css('border-left-width'),
      'border-left-style': $menu.css('border-left-style'),
      'border-left-color': $menu.css('border-left-color'),
      'border-right-width': $menu.css('border-right-width'),
      'border-right-style': $menu.css('border-right-style'),
      'border-right-color': $menu.css('border-right-color'),
      'box-shadow': $menu.css('box-shadow'),
      'border-top-left-radius': $menu.css('border-top-left-radius'),
      'border-top-right-radius': $menu.css('border-top-right-radius'),
      'border-bottom-left-radius': $menu.css('border-bottom-left-radius'),
      'border-bottom-right-radius': $menu.css('border-bottom-right-radius'),
      'background-color': $menu.css('background-color')
    });
    $restoreMenu = $('<div class="dropdown-menu-restore-position"></div>');
    $restoreMenu.attr('data-dropdown-restore-for', ddId);
    menuOffset = $menu.offset();
    $toggle.data('st-restoreMenu', $restoreMenu);
    $menu.after($restoreMenu);
    $wrapper.append($menu);
    $body.append($('.dropdown-backdrop', $restoreMenu.parent()));
    $body.append($wrapperMask);
    $body.append($wrapper);

    if (typeof $.fn.scroller === 'function') {
      $content = $('<div class="dropdown-position-content"></div>');
      $menu.before($content);
      $content.append($menu);
      $menu = $content;
      $menu.scroller();
    }

    refreshPosition($wrapper, $menu, menuOffset);
    $wrapper.addClass('wrapper-open');
    $wrapperMask.addClass('wrapper-open');
    $toggle.data('st-contentContainer').on('scroll.fxp.dropdownposition' + self.guid, null, self, externalClose);

    if (navigator.userAgent.match(/chrome/i)) {
      duration = parseFloat($wrapper.css('transition-duration')) * 1000;
      window.setTimeout(function () {
        if (undefined !== $wrapper) {
          var max = parseInt($wrapper.css('max-height'), 10);
          $wrapper.css('max-height', max + 1 + 'px');
          window.setTimeout(function () {
            $wrapper.css('max-height', max + 'px');
          }, 10);
        }
      }, duration);
    }

    $toggle.on('keydown.fxp.dropdownposition.data-api', null, {
      menu: $menu,
      toggle: $toggle
    }, onKeydown);
    $menu.on('keydown.fxp.dropdownposition.data-api', null, {
      menu: $menu,
      toggle: $toggle
    }, onKeydown);
  }
  /**
   * Close the dropdown on external event.
   */

  function externalClose() {
    $('[data-toggle="dropdown"]').each(function () {
      var $this = $(this);

      if (!$this.parent().hasClass('open')) {
        return;
      }

      $this.dropdown('toggle');
    });
  }

  /*
   * This file is part of the Fxp package.
   *
   * (c) François Pluchino <francois.pluchino@gmail.com>
   *
   * For the full copyright and license information, please view the LICENSE
   * file that was distributed with this source code.
   */

  /**
   * Get the width of native scrollbar.
   *
   * @returns {Number}
   */
  function getNativeScrollWidth() {
    var sbDiv = document.createElement("div"),
        size;
    sbDiv.style.width = '100px';
    sbDiv.style.height = '100px';
    sbDiv.style.overflow = 'scroll';
    sbDiv.style.position = 'absolute';
    sbDiv.style.top = '-9999px';
    document.body.appendChild(sbDiv);
    size = sbDiv.offsetWidth - sbDiv.clientWidth;
    document.body.removeChild(sbDiv);
    return size;
  }

  /**
   * Dropdown Position class.
   */

  var DropdownPosition =
  /*#__PURE__*/
  function (_BasePlugin) {
    _inherits(DropdownPosition, _BasePlugin);

    /**
     * Constructor.
     *
     * @param {HTMLElement} element The DOM element
     * @param {object}      options The options
     */
    function DropdownPosition(element) {
      var _this;

      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      _classCallCheck(this, DropdownPosition);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(DropdownPosition).call(this, element, options));
      _this.$body = $('body');
      _this.nativeScrollWidth = getNativeScrollWidth();
      _this.originalBodyPad = null;
      _this.originalBodyOverflowY = null;

      _this.$element.on('shown.bs.dropdown.fxp.dropdownposition' + _this.guid, null, _assertThisInitialized(_assertThisInitialized(_this)), onShown).on('hide.bs.dropdown.fxp.dropdownposition' + _this.guid, null, _assertThisInitialized(_assertThisInitialized(_this)), onHide);

      $(window).on('resize.fxp.dropdownposition scroll.fxp.dropdownposition' + _this.guid, null, _assertThisInitialized(_assertThisInitialized(_this)), externalClose);
      return _this;
    }
    /**
     * Refresh the position.
     *
     * @param {element|jQuery} menu   The original dropdown menu
     * @param {element|jQuery} toggle The original dropdown menu
     */


    _createClass(DropdownPosition, [{
      key: "refresh",
      value: function refresh(menu, toggle) {
        var $menu = $(menu),
            $wrapper = $menu.parents('.wrapper-dropdown-position'),
            $content = $wrapper.find('.dropdown-position-content'),
            left,
            width;

        if (!$menu.hasClass('dropdown-menu') || $wrapper.length === 0) {
          return;
        }

        left = $wrapper.offset().left;
        width = $wrapper.width();
        $content.css({
          width: '',
          height: ''
        });
        $content.css({
          width: $wrapper.width(),
          height: $wrapper.height()
        });

        if ($wrapper.hasClass('wrapper-pull-right')) {
          if ($wrapper.width() !== width) {
            left = left + (width - $wrapper.width());
            $wrapper.css('left', left);
          }
        }

        if (typeof $.fn.scroller === 'function') {
          $content.scroller('resizeScrollbar');
        }
      }
      /**
       * Destroy the instance.
       */

    }, {
      key: "destroy",
      value: function destroy() {
        var event = new CustomEvent('destroy');
        event.target = this.$element.get(0);
        onHide(event);
        this.$element.off('shown.bs.dropdown.fxp.dropdownposition' + this.guid, onShown).off('hide.bs.dropdown.fxp.dropdownposition' + this.guid, onHide);
        $(window).off('resize.fxp.dropdownposition scroll.fxp.dropdownposition' + this.guid, externalClose);

        _get(_getPrototypeOf(DropdownPosition.prototype), "destroy", this).call(this);
      }
    }]);

    return DropdownPosition;
  }(BasePlugin);
  pluginify('dropdownPosition', 'fxp.dropdownposition', DropdownPosition, true, document);

  exports.default = DropdownPosition;

  return exports;

}({}, jQuery));
