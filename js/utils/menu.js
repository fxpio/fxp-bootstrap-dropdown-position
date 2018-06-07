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
 * Get dropdown menu.
 *
 * @param {EventTarget} target The DOM element
 *
 * @return {jQuery}
 */
export function getMenu(target) {
    let $menu = $('.dropdown-menu', target),
        menuId;

    if (0 === $menu.length) {
        menuId = $('.dropdown-menu-restore-position', target).attr('data-dropdown-restore-for');
        $menu = $('[data-dropdown-restore-id=' + menuId + ']');
    }

    return $menu;
}
