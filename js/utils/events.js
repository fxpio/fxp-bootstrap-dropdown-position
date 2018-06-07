/*
 * This file is part of the Fxp package.
 *
 * (c) François Pluchino <francois.pluchino@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import $ from 'jquery';
import {lockBodyScroll, unlockBodyScroll} from "./scroller";
import {getMenu} from "./menu";
import {findParentZindex, getZindex, refreshPosition} from "./css";

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
export function onKeydown(event) {
    let $menu = event.data.menu,
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
 */
export function onHide(event) {
    let $toggle = $(event.target),
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
 */
export function onShown(event) {
    let self = event.data,
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
                let max = parseInt($wrapper.css('max-height'), 10);
                $wrapper.css('max-height', (max + 1) + 'px');
                window.setTimeout(function () {
                    $wrapper.css('max-height', max + 'px');
                }, 10);
            }
        }, duration);
    }

    $toggle.on('keydown.fxp.dropdownposition.data-api', null, {menu: $menu, toggle: $toggle}, onKeydown);
    $menu.on('keydown.fxp.dropdownposition.data-api', null, {menu: $menu, toggle: $toggle}, onKeydown);
}

/**
 * Close the dropdown on external event.
 */
export function externalClose() {
    $('[data-toggle="dropdown"]').each(function () {
        let $this = $(this);

        if (!$this.parent().hasClass('open')) {
            return;
        }

        $this.dropdown('toggle');
    });
}
