/*
 * This file is part of the Sonatra package.
 *
 * (c) François Pluchino <francois.pluchino@sonatra.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/*global jQuery*/
/*global window*/
/*global Window*/
/*global document*/
/*global CustomEvent*/
/*global DropdownPosition*/

/**
 * @param {jQuery} $
 *
 * @typedef {DropdownPosition} DropdownPosition
 * @typedef {jQuery|undefined} DropdownPosition.$toggle
 * @typedef {jQuery|undefined} DropdownPosition.$wrapperMask
 * @typedef {jQuery|undefined} DropdownPosition.$wrapper
 * @typedef {jQuery|undefined} DropdownPosition.$menu
 * @typedef {jQuery|undefined} DropdownPosition.$restoreMenu
 * @typedef {Function}         jQuery.hammerScroll
 */
(function ($) {
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
     * Get the margin right defined by hammer scroll when native scrollis used.
     *
     * @param {jQuery} $element The jquery element
     *
     * @return {Number}
     *
     * @private
     */
    function getNativeHammerScrollMargin($element) {
        var margin = parseInt($element.css('margin-right'), 0);

        return isNaN(margin) ? 0 : margin;
    }

    /**
     * Refresh the position of dropdown wrapper.
     *
     * @param {jQuery} $toggle  The toggle button of dropdown menu
     * @param {jQuery} $wrapper The wrapper position of dropdown menu
     * @param {jQuery} $menu    The dropdown menu
     *
     * @private
     */
    function refreshPosition($toggle, $wrapper, $menu) {
        var padding = 15,
            left = Math.round($toggle.offset().left),
            top = Math.round($toggle.offset().top + $toggle.outerHeight() - $(window).eq(0).scrollTop()),
            width,
            height,
            endLeft,
            endTop,
            maxWidth = $(window).width() - padding * 2,
            maxHeight = $(window).height() - padding * 2;

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

        if (endLeft > maxWidth) {
            left = maxWidth - width + padding;
        }
        if (endTop > maxHeight) {
            top = maxHeight - height + padding;
        }

        left = Math.max(left, padding);
        top = Math.max(top, padding);

        $wrapper.css({
            'left': left,
            'top': top
        });
        $menu.css({
            'width': $wrapper.innerWidth() - getNativeHammerScrollMargin($menu),
            'height': $wrapper.innerHeight()
        });

        if (typeof $.fn.hammerScroll === 'function') {
            $menu.hammerScroll('resizeScrollbar');
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
        var self = event.data;

        if (undefined === self.$menu) {
            return;
        }

        if (typeof $.fn.hammerScroll === 'function') {
            self.$menu.hammerScroll('destroy');
        }

        self.$restoreMenu.after(self.$menu);
        self.$restoreMenu.remove();
        self.$wrapperMask.remove();
        self.$wrapper.remove();
        self.$menu.removeAttr('data-dropdown-restore-id');
        self.$menu.css({
            'width': '',
            'height': ''
        });

        delete self.$toggle;
        delete self.$wrapperMask;
        delete self.$wrapper;
        delete self.$menu;
        delete self.$restoreMenu;
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
            zindex;

        if (undefined !== self.$menu) {
            onHide(event);
        }

        self.$toggle = $(event.target);
        self.$menu = getMenu(event.target);
        self.$wrapperMask = $('<div class="wrapper-dropdown-position-mask"></div>');
        self.$wrapper = $('<div class="wrapper-dropdown-position"></div>');

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
            'margin-top': self.$menu.css('margin-top'),
            'margin-bottom': self.$menu.css('margin-bottom'),
            'margin-left': self.$menu.css('margin-left'),
            'margin-right': self.$menu.css('margin-right'),
            'background-color': self.$menu.css('background-color')
        });

        self.$restoreMenu = $('<div class="dropdown-menu-restore-position"></div>');
        self.$restoreMenu.attr('data-dropdown-restore-for', ddId);
        self.$menu.after(self.$restoreMenu);
        self.$wrapper.append(self.$menu);
        $body.append(self.$wrapperMask);
        $body.append(self.$wrapper);

        if (typeof $.fn.hammerScroll === 'function') {
            self.$menu.hammerScroll({useScroll: true});
        }

        refreshPosition(self.$toggle, self.$wrapper, self.$menu);
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

        if (undefined !== self.$menu) {
            refreshPosition(self.$toggle, self.$wrapper, self.$menu);
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
        this.guid     = jQuery.guid;
        this.options  = $.extend({}, options);
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

}(jQuery));
