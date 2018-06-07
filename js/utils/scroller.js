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
export function lockBodyScroll(self) {
    let bodyPad = parseInt((self.$body.css('padding-right') || 0), 10),
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
 */
export function unlockBodyScroll(self) {
    if (null !== self.originalBodyPad || null !== self.originalBodyOverflowY) {
        self.$body.css({
            'padding-right': self.originalBodyPad,
            'overflow-y': self.originalBodyOverflowY
        });

        self.originalBodyPad = null;
        self.originalBodyOverflowY = null;
    }
}
