// ref: github.com

'use strict';

var hasIntl = 'Intl' in window;

function padZero(num) {
    return ('0' + num).slice(-2);
}

var weekNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function datetimeFormat(data, format) {
    var
        day = data.getDay(),
        date = data.getDate(),
        month = data.getMonth(),
        fullYear = data.getFullYear(),
        hours = data.getHours(),
        minutes = data.getMinutes(),
        seconds = data.getSeconds();

    return format.replace(/%([%aAbBcdeHIlmMpPSwyYZz])/g, function (r) {
        var h, p = r[1];
        switch (p) {
            case '%':
                return '%';
            case 'a':
                return weekNames[day].slice(0, 3);
            case 'A':
                return weekNames[day];
            case 'b':
                return monthNames[month].slice(0, 3);
            case 'B':
                return monthNames[month];
            case 'c':
                return data.toString();
            case 'd':
                return padZero(date);
            case 'e':
                return date;
            case 'H':
                return padZero(hours);
            case 'I':
                return padZero(datetimeFormat(data, '%l'));
            case 'l':
                return 0 === hours || 12 === hours ? 12 : (hours + 12) % 12;
            case 'm':
                return padZero(month + 1);
            case 'M':
                return padZero(minutes);
            case 'p':
                return hours > 11 ? 'PM' : 'AM';
            case 'P':
                return hours > 11 ? 'pm' : 'am';
            case 'S':
                return padZero(seconds);
            case 'w':
                return day;
            case 'y':
                return padZero(fullYear % 100);
            case 'Y':
                return fullYear;
            case 'Z':
                return h = data.toString().match(/\((\w+)\)$/), h ? h[1] : '';
            case 'z':
                return h = data.toString().match(/\w([+-]\d\d\d\d) /), h ? h[1] : ''
        }
    })
}

var f = null,
    d = null;
function r() {
    if (null !== f) {
        return f;
    }
    if (!('Intl' in window)) {
        return false;
    }

    var options = {day: 'numeric', month: 'short'},
        formatter = new window.Intl.DateTimeFormat(void 0, options),
        result = formatter.format(new Date(0));

    return f = !!result.match(/^\d/);
}
function i() {
    if (null !== d) {
        return d;
    }
    if (!('Intl' in window)) {
        return true;
    }

    var options = {day: 'numeric', month: 'short', year: 'numeric'},
        formatter = new window.Intl.DateTimeFormat(void 0, options),
        result = formatter.format(new Date(0));
    return d = !!result.match(/\d,/);
}

function isNowYear(datetime) {
    var now = new Date;
    return now.getUTCFullYear() === datetime.getUTCFullYear()
}


function getDateString(localTimeElement) {
    var options = {
            weekday: {'short': '%a', 'long': '%A'},
            day: {numeric: '%e', '2-digit': '%d'},
            month: {'short': '%b', 'long': '%B'},
            year: {numeric: '%Y', '2-digit': '%y'}
        },
        format = r() ? 'weekday day month year' : 'weekday month day, year';

    for (var key in options) {
        var type = options[key][localTimeElement.getAttribute(key)];
        format = format.replace(key, type || '');
    }
    format = format.replace(/(\s,)|(,\s$)/, '');
    return datetimeFormat(localTimeElement._date, format)
        .replace(/\s+/, ' ')
        .trim();
}

function getTimeString(localTimeElement) {
    var options = {
        hour: localTimeElement.getAttribute('hour'),
        minute: localTimeElement.getAttribute('minute'),
        second: localTimeElement.getAttribute('second')
    };

    for (var key in options) {
        options[key] || delete options[key];
    }

    if (0 !== Object.keys(options).length) {
        if ('Intl' in window) {
            var formatter = new window.Intl.DateTimeFormat(void 0, options);
            return formatter.format(localTimeElement._date)
        }

        var format = options.second ? '%H:%M:%S' : '%H:%M';
        return datetimeFormat(localTimeElement._date, format);
    }
}

function DatetimeFormatter(data) {
    this.date = data;
}
DatetimeFormatter.prototype.toString = function () {
    var result = this.timeElapsed();
    return result ? result : 'on ' + this.formatDate()
};
DatetimeFormatter.prototype.timeElapsed = function () {
    var microseconds = (new Date).getTime() - this.date.getTime(),
        seconds = Math.round(microseconds / 1000),
        minutes = Math.round(seconds / 60),
        hours = Math.round(minutes / 60),
        days = Math.round(hours / 24);

    return 0 > microseconds
        ? 'just now'
        : 10 > seconds
        ? 'just now'
        : 45 > seconds
        ? seconds + ' seconds ago'
        : 90 > seconds
        ? 'a minute ago'
        : 45 > minutes
        ? minutes + ' minutes ago'
        : 90 > minutes
        ? 'an hour ago'
        : 24 > hours
        ? hours + ' hours ago'
        : 36 > hours
        ? 'a day ago'
        : 30 > days
        ? days + ' days ago'
        : null;
};
DatetimeFormatter.prototype.timeAgo = function () {
    var microseconds = (new Date).getTime() - this.date.getTime(),
        seconds = Math.round(microseconds / 1000),
        minutes = Math.round(seconds / 60),
        hours = Math.round(minutes / 60),
        days = Math.round(hours / 24),
        months = Math.round(days / 30),
        years = Math.round(months / 12);
    return 0 > microseconds
        ? 'just now'
        : 10 > seconds
        ? 'just now'
        : 45 > seconds
        ? seconds + ' seconds ago'
        : 90 > seconds
        ? 'a minute ago'
        : 45 > minutes
        ? minutes + ' minutes ago'
        : 90 > minutes
        ? 'an hour ago'
        : 24 > hours
        ? hours + ' hours ago'
        : 36 > hours
        ? 'a day ago'
        : 30 > days
        ? days + ' days ago'
        : 45 > days
        ? 'a month ago'
        : 12 > months
        ? months + ' months ago'
        : 18 > months
        ? 'a year ago'
        : years + ' years ago'
};
DatetimeFormatter.prototype.microTimeAgo = function () {
    var microseconds = (new Date).getTime() - this.date.getTime(),
        seconds = microseconds / 1000,
        minutes = seconds / 60,
        hours = minutes / 60,
        days = hours / 24,
        months = days / 30,
        years = months / 12;
    return 1 > minutes
        ? '1m'
        : 60 > minutes
        ? Math.round(minutes) + 'm'
        : 24 > hours
        ? Math.round(hours) + 'h'
        : 365 > days
        ? Math.round(days) + 'd'
        : Math.round(years) + 'y';
};
DatetimeFormatter.prototype.formatDate = function () {
    var format = r() ? '%e %b' : '%b %e';
    return isNowYear(this.date) || (format += i() ? ', %Y' : ' %Y'), datetimeFormat(this.date, format)
};
DatetimeFormatter.prototype.formatTime = function () {
    if ('Intl' in window) {
        var formatter = new window.Intl.DateTimeFormat(void 0, {hour: 'numeric', minute: '2-digit'});
        return formatter.format(this.date);
    }
    return datetimeFormat(this.date, '%l:%M%P');
};


var timeElementPrototype = Object.create('HTMLTimeElement' in window
    ? window.HTMLTimeElement.prototype
    : window.HTMLElement.prototype);
timeElementPrototype.attributeChangedCallback = function (attrName, oldVal, newVal) {
    if ('datetime' === attrName) {
        var data = Date.parse(newVal);
        this._date = isNaN(data) ? null : new Date(data)
    }
    var title = this.getFormattedTitle();
    title && this.setAttribute('title', title);

    var textContent = this.getFormattedDate();
    textContent && (this.textContent = textContent);
};
timeElementPrototype.getFormattedTitle = function () {
    if (this._date) {
        if (this.hasAttribute('title')) {
            return this.getAttribute('title');
        }
        if ('Intl' in window) {
            var options = {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    timeZoneName: 'short'
                },
                formatter = new window.Intl.DateTimeFormat(void 0, options);
            return formatter.format(this._date);
        }
        return this._date.toLocaleString();
    }
};

var updateTimer;
var relativeTimeElements = [];

function updateRelativeTimeElements() {
    for (var i = 0, l = relativeTimeElements.length; l > i; i++) {
        var ele = relativeTimeElements[i];
        ele.textContent = ele.getFormattedDate();
    }
}

var relativeTimeElementPrototype = Object.create(timeElementPrototype);
relativeTimeElementPrototype.createdCallback = function () {
    var datetime = this.getAttribute('datetime');
    datetime && this.attributeChangedCallback('datetime', null, datetime)
};
relativeTimeElementPrototype.attachedCallback = function () {
    relativeTimeElements.push(this);
    if (!updateTimer) {
        updateRelativeTimeElements();
        updateTimer = setInterval(updateRelativeTimeElements, 60000);
    }
};
relativeTimeElementPrototype.detachedCallback = function () {
    var index = relativeTimeElements.indexOf(this);
    if (-1 !== index) {
        relativeTimeElements.splice(index, 1);
    }
    if (!relativeTimeElements.length && updateTimer) {
        clearInterval(updateTimer);
        updateTimer = null;
    }
};
relativeTimeElementPrototype.getFormattedDate = function () {
    return this._date
        ? new DatetimeFormatter(this._date).toString()
        : void 0;
};


var timeAgoElementPrototype = Object.create(relativeTimeElementPrototype);
timeAgoElementPrototype.getFormattedDate = function () {
    if (this._date) {
        var format = this.getAttribute('format');
        return 'micro' === format
            ? new DatetimeFormatter(this._date).microTimeAgo()
            : new DatetimeFormatter(this._date).timeAgo();
    }
};

var localTimeElementPrototype = Object.create(timeElementPrototype);
localTimeElementPrototype.createdCallback = function () {
    var value;
    if (value = this.getAttribute('datetime')) {
        this.attributeChangedCallback('datetime', null, value);
    }
    if (value = this.getAttribute('format')) {
        this.attributeChangedCallback('format', null, value);
    }
};
localTimeElementPrototype.getFormattedDate = function () {
    if (this._date) {
        var dateString = getDateString(this) || '';
        var timeString = getTimeString(this) || '';
        return (dateString + ' ' + timeString).trim()
    }
};

window.RelativeTimeElement = document.registerElement('relative-time', {prototype: relativeTimeElementPrototype, 'extends': 'time'});
window.TimeAgoElement = document.registerElement('time-ago', {prototype: timeAgoElementPrototype, 'extends': 'time'});
window.LocalTimeElement = document.registerElement('local-time', {prototype: localTimeElementPrototype, 'extends': 'time'});

