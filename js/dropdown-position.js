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
     * Get parent offset of menu.
     *
     * @param {jQuery} $target
     *
     * @return Object (left and top properties)
     *
     * @private
     */
    function getParentOffset($target) {
        var $parent = $target.parent();

        if ($parent.get(0) instanceof Window) {
            return {'top': 0, 'left': 0};
        }

        return $parent.offset();
    }

    /**
     * Action on show dropdown event.
     *
     * @param {jQuery.Event|Event} event
     *
     * @private
     */
    function onShow(event) {
        var $menu,
            $wrapper,
            parentOffset,
            left,
            top,
            maxLeft,
            maxTop,
            width,
            height,
            endLeft,
            endTop;

        $menu = getMenu(event.target);
        $menu.hammerScroll({useScroll: true, scrollbar: true});

        $wrapper = $menu.parent().eq(0);
        $wrapper.css('position', 'absolute');
        $wrapper.css('top', $menu.css('top'));
        $wrapper.css('left', $menu.css('left'));
        $wrapper.css('z-index', $menu.css('z-index'));
        $wrapper.css('border', $menu.css('border'));
        $wrapper.css('-webkit-box-shadow', $menu.css('-webkit-box-shadow'));
        $wrapper.css('box-shadow', $menu.css('box-shadow'));
        $wrapper.css('overflow', 'hidden');
        $wrapper.css('margin-top', '-1px');
        $menu.css('position', 'static');
        $menu.css('top', '0');
        $menu.css('left', 'inherit');
        $menu.css('right', 'auto');
        $menu.css('margin-top', '0');
        $menu.css('padding-top', '0');
        $menu.css('border', 'none');
        $menu.css('-webkit-box-shadow', 'none');
        $menu.css('box-shadow', 'none');
        $menu.css('display', 'block');

        parentOffset = getParentOffset($wrapper);
        left = $wrapper.offset().left;
        top = $wrapper.offset().top - parentOffset.top;
        maxLeft = $(window).width();
        maxTop = $(window).height() + $(window).eq(0).scrollTop() - 50;

        $wrapper.css('max-width', maxLeft);
        $wrapper.css('max-height', maxTop);
        $menu.css('max-height', maxTop);

        width = $wrapper.outerWidth();
        height = $wrapper.outerHeight();
        endLeft = left + width;
        endTop = top + height;

        if (left < 0) {
            $wrapper.css('margin-left', -left);
        } else if (endLeft > maxLeft) {
            $wrapper.css('margin-left', -(endLeft - maxLeft));
        }

        if (top < 0) {
            $wrapper.css('margin-top', -top);
        } else if (endTop > maxTop) {
            $wrapper.css('margin-top', -(endTop - maxTop));
        }

        $menu.hammerScroll('resizeScrollbar');
    }

    /**
     * Action on hide dropdown event.
     *
     * @param {jQuery.Event|Event} event
     *
     * @private
     */
    function onHide(event) {
        var $menu = getMenu(event.target);

        $menu.hammerScroll('destroy');
        $menu.css('position', '');
        $menu.css('top', '');
        $menu.css('left', '');
        $menu.css('right', '');
        $menu.css('margin-top', '');
        $menu.css('padding-top', '');
        $menu.css('border', '');
        $menu.css('-webkit-box-shadow', '');
        $menu.css('box-shadow', '');
        $menu.css('max-width', '');
        $menu.css('max-height', '');
        $menu.css('overflow', '');
        $menu.css('display', '');
    }

    /**
     * Action on window resize event.
     *
     * @param {jQuery.Event|Event} event
     *
     * @private
     */
    function onResize(event) {
        var $menu = getMenu(event.target);

        $menu.removeClass('open');
        $menu.trigger('shown.bs.dropdown', { relatedTarget: event.target });
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
            .on('shown.bs.dropdown.st.dropdownposition' + this.guid, '.dropdown', onShow)
            .on('hide.bs.dropdown.st.dropdownposition' + this.guid, '.dropdown', onHide);

        $(window).on('shown.bs.dropdown.st.dropdownposition' + this.guid, '.dropdown.open', onResize);
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
            .off('shown.bs.dropdown.st.dropdownposition' + this.guid, '.dropdown', onShow)
            .off('hide.bs.dropdown.st.dropdownposition' + this.guid, '.dropdown', onHide);

        $(window).off('shown.bs.dropdown.st.dropdownposition' + this.guid, '.dropdown.open', onResize);

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

    $(document)
        .on('shown.bs.dropdown.st.dropdownposition', '.dropdown', onShow)
        .on('hide.bs.dropdown.st.dropdownposition', '.dropdown', onHide);

    $(window).on('shown.bs.dropdown.st.dropdownposition', '.dropdown.open', onResize);

}(jQuery));
