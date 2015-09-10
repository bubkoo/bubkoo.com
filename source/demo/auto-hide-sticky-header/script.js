// 原生 JS 版本
function useNative() {
    'use strict';

    var selector = '.header',
        element = document.querySelector(selector);

    if (!element) {
        return true;
    }

    var elHeight = 0,
        elTop = 0,
        dHeight = 0,
        wHeight = 0,
        wScrollY = 0,
        wScrollYOld = 0,
        wScrollYDiff = 0;

    window.addEventListener('scroll', function () {
        elHeight = element.offsetHeight;
        dHeight = document.body.offsetHeight;
        wHeight = window.innerHeight;
        wScrollY = window.pageYOffset;
        wScrollYDiff = wScrollYOld - wScrollY;
        elTop = parseInt(window.getComputedStyle(element).getPropertyValue('top')) + wScrollYDiff;

        if (wScrollY <= 0)
        {
            element.style.top = '0px';
        } else if (wScrollYDiff > 0) // scrolled up; element slides in
        {
            element.style.top = ( elTop > 0 ? 0 : elTop ) + 'px';
        } else if (wScrollYDiff < 0) // scrolled down
        {
            if (wScrollY + wHeight >= dHeight - elHeight)  // scrolled to the very bottom; element slides in
            {
                element.style.top = ( ( elTop = wScrollY + wHeight - dHeight ) < 0 ? elTop : 0 ) + 'px';
            } else // scrolled down; element slides out
            {
                element.style.top = ( Math.abs(elTop) > elHeight ? -elHeight : elTop ) + 'px';
            }
        }

        wScrollYOld = wScrollY;
    });
}

function useJQ() {
    var selector = '.header',
        $element = $(selector);

    if (!$element.length) {
        return true;
    }

    var elHeight = 0,
        elTop = 0,

        $document = $(document),
        $window = $(window),

        dHeight = 0,
        wHeight = 0,
        wScrollY = 0,
        wScrollYOld = 0,
        wScrollYDiff = 0;

    $window.on('scroll', function () {
        elHeight = $element.outerHeight();
        dHeight = $document.height();
        wHeight = $window.height();
        wScrollY = $window.scrollTop();
        wScrollYDiff = wScrollYOld - wScrollY;
        elTop = parseInt($element.css('top')) + wScrollYDiff;


        if (wScrollY <= 0) { // scrolled to the very top; element sticks to the top
            $element.css('top', 0);
        } else if (wScrollYDiff > 0) {// scrolled up; element slides in
            $element.css('top', elTop > 0 ? 0 : elTop);
        } else if (wScrollYDiff < 0) {// scrolled down
            if (wScrollY + wHeight >= dHeight - elHeight) {// scrolled to the very bottom; element slides in
                $element.css('top', ( elTop = wScrollY + wHeight - dHeight ) < 0 ? elTop : 0);
            } else {// scrolled down; element slides out
                $element.css('top', Math.abs(elTop) > elHeight ? -elHeight : elTop);
            }
        }

        wScrollYOld = wScrollY;
    });
}

function useThrottle() {
    var selector = '.header',
        classHidden = 'header--hidden',
        $element = $(selector);

    if (!$element.length) {
        return true;
    }

    var elHeight = 0,
        elTop = 0,

        $document = $(document),
        $window = $(window),

        dHeight = 0,
        wHeight = 0,
        wScrollY = 0,
        wScrollYOld = 0,
        wScrollYDiff = 0;

    // 节流函数
    $window.on('scroll', _.throttle(function () {
        elHeight = $element.outerHeight();
        dHeight = $document.height();
        wHeight = $window.height();
        wScrollY = $window.scrollTop();
        wScrollYDiff = wScrollYOld - wScrollY;
        elTop = parseInt($element.css('top')) + wScrollYDiff;


        if (wScrollY <= 0) {
            $element.removeClass(classHidden);
        } else if (wScrollYDiff > 0 && $element.hasClass(classHidden)) {
            $element.removeClass(classHidden);
        } else if (wScrollYDiff < 0) {// scrolled down
            if (wScrollY + wHeight >= dHeight && $element.hasClass(classHidden)) {// scrolled to the very bottom; element slides in
                $element.removeClass(classHidden);
            } else {// scrolled down; element slides out
                $element.addClass(classHidden);
            }
        }

        wScrollYOld = wScrollY;

    }, 100));
}

useThrottle();