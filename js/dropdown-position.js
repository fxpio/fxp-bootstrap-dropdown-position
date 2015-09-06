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
     * Get the margin right defined by scroller when native scrollis used.
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
     * Action on hide dropdown event.
     *
     * @param {jQuery.Event|Event} event
     *
     * @private
     */
    function onHide(event) {
        var self = event.data,
            duration;

        if (undefined === self.$menu) {
            return;
        }

        duration = parseFloat(self.$wrapper.css('transition-duration')) * 1000;
        self.$wrapper.removeClass('wrapper-open');

        window.setTimeout(function () {
            if (undefined === self.$menu) {
                return;
            }
            if (typeof $.fn.scroller === 'function') {
                self.$menu.scroller('destroy');
            }

            self.$restoreMenu.after(self.$contentMenu);
            self.$restoreMenu.remove();
            self.$wrapperMask.remove();
            self.$wrapper.remove();
            self.$menu.removeAttr('data-dropdown-restore-id');
            self.$menu.css({
                'margin-right': '',
                'overflow': '',
                'width': '',
                'height': ''
            });

            delete self.$toggle;
            delete self.$wrapperMask;
            delete self.$wrapper;
            delete self.$menu;
            delete self.$contentMenu;
            delete self.$restoreMenu;
            delete self.menuOffset;
        }, duration);
    }

    /**
     * Action on show dropdown event.
     *
     * @param {jQuery.Event|Event} event
     *
     * @private
     */
    function onShow(event) {
        var self = event.data,
            ddId = 'dropdown-menu-original-' + self.guid,
            $body = $('body'),
            duration,
            zindex,
            $content;

        if (undefined !== self.$menu) {
            onHide(event);
        }

        self.$toggle = $(event.target);
        self.$menu = getMenu(event.target);
        self.$contentMenu = self.$menu;
        self.$wrapperMask = $('<div class="wrapper-dropdown-position-mask"></div>');
        self.$wrapper = $('<div class="wrapper-dropdown-position"></div>');

        self.$menu.attr('class').split(' ').forEach(function (className) {
            self.$wrapper.addClass('wrapper-' + className);
        });

        if (self.$menu.hasClass('pull-right')) {
            self.$wrapperMask.addClass('wrapper-pull-right');
            self.$wrapper.addClass('wrapper-pull-right');
        }

        if (self.$menu.hasClass('pull-height')) {
            self.$wrapperMask.addClass('wrapper-pull-height');
            self.$wrapper.addClass('wrapper-pull-height');
        }

        zindex = Math.max(getZindex(self.$wrapper), self.$menu);
        zindex = Math.max(findParentZindex(self.$toggle), zindex);

        self.$wrapperMask.css({
            'position': 'fixed',
            'z-index': -1,
            'left': 0,
            'right': 0,
            'top': 0,
            'bottom': 0
        });
        self.$wrapper.css({
            'z-index': zindex,
            'border-top-width': self.$menu.css('border-top-width'),
            'border-top-style': self.$menu.css('border-top-style'),
            'border-top-color': self.$menu.css('border-top-color'),
            'border-bottom-width': self.$menu.css('border-bottom-width'),
            'border-bottom-style': self.$menu.css('border-bottom-style'),
            'border-bottom-color': self.$menu.css('border-bottom-color'),
            'border-left-width': self.$menu.css('border-left-width'),
            'border-left-style': self.$menu.css('border-left-style'),
            'border-left-color': self.$menu.css('border-left-color'),
            'border-right-width': self.$menu.css('border-right-width'),
            'border-right-style': self.$menu.css('border-right-style'),
            'border-right-color': self.$menu.css('border-right-color'),
            'box-shadow': self.$menu.css('box-shadow'),
            'border-top-left-radius': self.$menu.css('border-top-left-radius'),
            'border-top-right-radius': self.$menu.css('border-top-right-radius'),
            'border-bottom-left-radius': self.$menu.css('border-bottom-left-radius'),
            'border-bottom-right-radius': self.$menu.css('border-bottom-right-radius'),
            'background-color': self.$menu.css('background-color')
        });

        self.$restoreMenu = $('<div class="dropdown-menu-restore-position"></div>');
        self.$restoreMenu.attr('data-dropdown-restore-for', ddId);
        self.menuOffset = self.$menu.offset();
        self.$menu.after(self.$restoreMenu);
        self.$wrapper.append(self.$menu);
        $body.append($('.dropdown-backdrop', self.$restoreMenu.parent()));
        $body.append(self.$wrapperMask);
        $body.append(self.$wrapper);

        if (typeof $.fn.scroller === 'function') {
            $content = $('<div class="dropdown-position-content"></div>');
            self.$menu.before($content);
            $content.append(self.$menu);
            self.$menu = $content;
            self.$menu.scroller();
        }

        refreshPosition(self.$wrapper, self.$menu, self.menuOffset);
        self.$wrapper.addClass('wrapper-open');

        if (navigator.userAgent.match(/chrome/i)) {
            duration = parseFloat(self.$wrapper.css('transition-duration')) * 1000;
            window.setTimeout(function () {
                if (undefined !== self.$wrapper) {
                    var max = parseInt(self.$wrapper.css('max-height'), 10);
                    self.$wrapper.css('max-height', (max + 1) + 'px');
                    window.setTimeout(function () {
                        self.$wrapper.css('max-height', max + 'px');
                    }, 10);
                }
            }, duration);
        }
    }

    /**
     * Refresh the position.
     *
     * @param {jQuery.Event|Event} event
     *
     * @private
     */
    function externalRefresh(event) {
        var self = event.data;

        if (undefined !== self.$menu && undefined !== self.menuOffset && undefined !== self.menuOffset.left) {
            refreshPosition(self.$wrapper, self.$menu, self.menuOffset);
        }
    }

    /**
     * Close the current dropdown when window is resized.
     *
     * @param {jQuery.Event|Event} event
     *
     * @private
     */
    function externalResize(event) {
        var self = event.data;

        if (undefined !== self.$toggle) {
            self.$toggle.removeClass('open');
            self.$toggle.find('.dropdown-backdrop').remove();
            onHide(event);
        }
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
        this.guid     = $.guid;
        this.options  = $.extend(true, {}, options);
        this.$element = $(element);

        $(document)
            .on('shown.bs.dropdown.st.dropdownposition' + this.guid, null, this, onShow)
            .on('hide.bs.dropdown.st.dropdownposition' + this.guid, null, this, onHide);

        $(window).on('resize.st.dropdownposition' + this.guid, null, this, externalResize);
        $(window).on('scroll.st.dropdownposition' + this.guid, null, this, externalRefresh);
    },
        old;

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
            .off('shown.bs.dropdown.st.dropdownposition' + this.guid, onShow)
            .off('hide.bs.dropdown.st.dropdownposition' + this.guid, onHide);

        $(window).off('resize.st.dropdownposition' + this.guid, externalResize);
        $(window).off('scroll.st.dropdownposition' + this.guid, externalRefresh);

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
