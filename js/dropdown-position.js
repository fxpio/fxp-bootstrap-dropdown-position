/*
 * This file is part of the Fxp package.
 *
 * (c) François Pluchino <francois.pluchino@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import pluginify from '@fxp/jquery-pluginify';
import BasePlugin from '@fxp/jquery-pluginify/js/plugin';
import $ from "jquery";
import {externalClose, onHide, onShown} from "./utils/events";
import {getNativeScrollWidth} from "./utils/window";
import 'bootstrap/js/dropdown';

/**
 * Dropdown Position class.
 */
export default class DropdownPosition extends BasePlugin
{
    /**
     * Constructor.
     *
     * @param {HTMLElement} element The DOM element
     * @param {object}      options The options
     */
    constructor(element, options = {}) {
        super(element, options);

        this.$body                 = $('body');
        this.nativeScrollWidth     = getNativeScrollWidth();
        this.originalBodyPad       = null;
        this.originalBodyOverflowY = null;

        this.$element
            .on('shown.bs.dropdown.fxp.dropdownposition' + this.guid, null, this, onShown)
            .on('hide.bs.dropdown.fxp.dropdownposition' + this.guid, null, this, onHide);

        $(window).on('resize.fxp.dropdownposition scroll.fxp.dropdownposition' + this.guid, null, this, externalClose);
    }

    /**
     * Refresh the position.
     *
     * @param {element|jQuery} menu   The original dropdown menu
     * @param {element|jQuery} toggle The original dropdown menu
     */
    refresh(menu, toggle) {
        let $menu = $(menu),
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
    destroy() {
        let event = new CustomEvent('destroy');
        event.target = this.$element.get(0);
        onHide(event);

        this.$element
            .off('shown.bs.dropdown.fxp.dropdownposition' + this.guid, onShown)
            .off('hide.bs.dropdown.fxp.dropdownposition' + this.guid, onHide);

        $(window).off('resize.fxp.dropdownposition scroll.fxp.dropdownposition' + this.guid, externalClose);

        super.destroy();
    }
}

pluginify('dropdownPosition', 'fxp.dropdownposition', DropdownPosition, true, document);
