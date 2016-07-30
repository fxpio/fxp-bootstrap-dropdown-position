/*
 * This file is part of the Sonatra package.
 *
 * (c) François Pluchino <francois.pluchino@sonatra.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/*global define*/
/*global jQuery*/
/*global navigator*/
/*global window*/
/*global Window*/
/*global document*/
/*global CustomEvent*/
/*global DropdownPosition*/

/**
 * @param {jQuery} $
 *
 * @typedef {object}           define.amd
 * @typedef {DropdownPosition} DropdownPosition
 * @typedef {jQuery|undefined} DropdownPosition.$toggle
 * @typedef {jQuery|undefined} DropdownPosition.$wrapperMask
 * @typedef {jQuery|undefined} DropdownPosition.$wrapper
 * @typedef {jQuery|undefined} DropdownPosition.$menu
 * @typedef {jQuery|undefined} DropdownPosition.$contentMenu
 * @typedef {jQuery|undefined} DropdownPosition.$restoreMenu
 * @typedef {object|undefined} DropdownPosition.menuOffset
 * @typedef {Function}         jQuery.scroller
 */
(function (factory) {
    'use strict';

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery', 'bootstrap/dropdown'], factory);
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {
    'use strict';

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
     * Lock the scroll of body.
     *
     * @param {DropdownPosition} self The dropdown position instance
     *
     * @private
     */
    function lockBodyScroll(self) {
        var bodyPad = parseInt((self.$body.css('padding-right') || 0), 10),
            hasScrollbar = self.$body.get(0).scrollHeight > document.documentElement.clientHeight
                && 'hidden' !== self.$body.css('overflow-y');

        if (hasScrollbar) {
            self.originalBodyPad = document.body.style.paddingRight || '';
            self.originalBodyOverflowY = document.body.style.overflowY || '';

            self.$body.css({
                'padding-right': (bodyPad + self.nativeScrollWidth) + 'px',
                'overflow-y': 'hidden'
            });
        }
    }

    /**
     * Unlock the scroll of body.
     *
     * @param {DropdownPosition} self The dropdown position instance
     *
     * @private
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

    /**
     * Get dropdown menu.
     *
     * @param {EventTarget} target The DOM element
     *
     * @return {jQuery}
     *
     * @private
     */
    function getMenu(target) {
        var $menu = $('.dropdown-menu', target),
            menuId;

        if (0 === $menu.size()) {
            menuId = $('.dropdown-menu-restore-position', target).attr('data-dropdown-restore-for');
            $menu = $('[data-dropdown-restore-id=' + menuId + ']');
        }

        return $menu;
    }

    /**
     * Get the margin right defined by scroller when native scroll is used.
     *
     * @param {jQuery} $element The jquery element
     *
     * @return {Number}
     *
     * @private
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
     *
     * @private
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
            maxHeight -=  padding;
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
     *
     * @private
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

    /**
     * Action on keydown event.
     *
     * @param {jQuery.Event|Event} event
     *
     * @typedef {Object} jQuery.Event.data        The dropdown menu and toggle
     * @typedef {jQuery} jQuery.Event.data.menu   The dropdown menu
     * @typedef {jQuery} jQuery.Event.data.toggle The toggle
     * @typedef {String} jQuery.Event.which       The which
     *
     * @private
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

        index = $items.index(event.target);

        // up
        if (event.which === 38 && index > 0) {
            index--;
        }

        // down
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
     *
     * @private
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

        $toggle.off('keydown.st.dropdownposition.data-api', onKeydown);
        $menu.off('keydown.st.dropdownposition.data-api', onKeydown);

        $toggle.data('st-contentContainer').off('scroll.st.dropdownposition' + self.guid, externalClose);

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

        $toggle
            .removeData('st-menu')
            .removeData('st-contentMenu')
            .removeData('st-wrapperMask')
            .removeData('st-wrapper')
            .removeData('st-restoreMenu')
            .removeData('st-contentContainer');

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
     *
     * @private
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

        lockBodyScroll(event.data);

        $menu = getMenu(event.target);
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

        $toggle.data('st-contentContainer').on('scroll.st.dropdownposition' + self.guid, null, self, externalClose);

        if (navigator.userAgent.match(/chrome/i)) {
            duration = parseFloat($wrapper.css('transition-duration')) * 1000;
            window.setTimeout(function () {
                if (undefined !== $wrapper) {
                    var max = parseInt($wrapper.css('max-height'), 10);
                    $wrapper.css('max-height', (max + 1) + 'px');
                    window.setTimeout(function () {
                        $wrapper.css('max-height', max + 'px');
                    }, 10);
                }
            }, duration);
        }

        $toggle.on('keydown.st.dropdownposition.data-api', null, {menu: $menu, toggle: $toggle}, onKeydown);
        $menu.on('keydown.st.dropdownposition.data-api', null, {menu: $menu, toggle: $toggle}, onKeydown);
    }

    /**
     * Close the dropdown on external event.
     *
     * @private
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

    // DROPDOWN POSITION CLASS DEFINITION
    // ==================================

    /**
     * @constructor
     *
     * @param {string|elements|object|jQuery} element
     * @param {object}                        options
     *
     * @this DropdownPosition
     */
    var DropdownPosition = function (element, options) {
        this.guid                  = $.guid;
        this.options               = $.extend(true, {}, options);
        this.$element              = $(element);
        this.$body                 = $('body');
        this.nativeScrollWidth     = getNativeScrollWidth();
        this.originalBodyPad       = null;
        this.originalBodyOverflowY = null;

        $(document)
            .on('shown.bs.dropdown.st.dropdownposition' + this.guid, null, this, onShown)
            .on('hide.bs.dropdown.st.dropdownposition' + this.guid, null, this, onHide);

        $(window).on('resize.st.dropdownposition scroll.st.dropdownposition' + this.guid, null, this, externalClose);
    },
        old;

    /**
     * Refresh the position.
     *
     * @param {element|jQuery} menu   The original dropdown menu
     * @param {element|jQuery} toggle The original dropdown menu
     *
     * @this DropdownPosition
     */
    DropdownPosition.prototype.refresh = function (menu, toggle) {
        var $menu = $(menu),
            $toggle = $(toggle),
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
    };

    /**
     * Destroy instance.
     *
     * @this DropdownPosition
     */
    DropdownPosition.prototype.destroy = function () {
        var event = new CustomEvent('destroy');
        event.target = this.$element.get(0);
        onHide(event);

        $(document)
            .off('shown.bs.dropdown.st.dropdownposition' + this.guid, onShown)
            .off('hide.bs.dropdown.st.dropdownposition' + this.guid, onHide);

        $(window).off('resize.st.dropdownposition scroll.st.dropdownposition' + this.guid, externalClose);

        this.$element.removeData('st.dropdownposition');
    };


    // DROPDOWN POSITION PLUGIN DEFINITION
    // ===================================

    function Plugin(option, value) {
        return this.each(function () {
            var $this   = $(this),
                data    = $this.data('st.dropdownposition'),
                options = typeof option === 'object' && option;

            if (!data && option === 'destroy') {
                return;
            }

            if (!data) {
                data = new DropdownPosition(this, options);
                $this.data('st.dropdownposition', data);
            }

            if (typeof option === 'string') {
                data[option](value);
            }
        });
    }

    old = $.fn.dropdownPosition;

    $.fn.dropdownPosition             = Plugin;
    $.fn.dropdownPosition.Constructor = DropdownPosition;


    // DROPDOWN POSITION NO CONFLICT
    // =============================

    $.fn.dropdownPosition.noConflict = function () {
        $.fn.dropdownPosition = old;

        return this;
    };


    // DROPDOWN POSITION DATA-API
    // ==========================

    $(window).on('load', function () {
        var $this = $(document);
        Plugin.call($this, $this.data());
    });

}));
