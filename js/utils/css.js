/*
 * This file is part of the Fxp package.
 *
 * (c) François Pluchino <francois.pluchino@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import $ from 'jquery';

/**
 * Get the margin right defined by scroller when native scroll is used.
 *
 * @param {jQuery} $element The jquery element
 *
 * @return {Number}
 */
export function getScrollerMargin($element) {
    let margin = parseInt($element.css('margin-right'), 0);

    return isNaN(margin) ? 0 : margin;
}

/**
 * Refresh the position of dropdown wrapper.
 *
 * @param {jQuery} $wrapper   The wrapper position of dropdown menu
 * @param {jQuery} $menu      The dropdown menu
 * @param {object} menuOffset The offset left and top on init position of menu
 */
export function refreshPosition($wrapper, $menu, menuOffset) {
    let padding = 15,
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
export function getZindex($element) {
    let zindex = parseInt($element.css('z-index'), 0);

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
export function findParentZindex($element) {
    let zindex = getZindex($element),
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
