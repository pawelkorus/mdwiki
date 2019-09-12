export class Url {
    static isRelativeUrl(url:string) {
        if (!url)
            return false;

        // if there is :// in it, its considered absolute
        // else its relative
        if (url.indexOf('://') === -1) {
            return true;
        } else {
            return false;
        }
    }

    static isRelativePath(path:string) {
        if (path === undefined)
            return false;
        if (path.startsWith('/'))
            return false;
        return true;
    }

    static isGimmickLink(domAnchor:any) {
        if (domAnchor.toptext().indexOf('gimmick:') !== -1) {
            return true;
        } else {
            return false;
        }
    }

    static hasMarkdownFileExtension(str:string) {
        if (!str) return false;
        var markdownExtensions = ['.md', '.markdown', '.mdown'];
        var value = str.toLowerCase().split('#')[0];
        return markdownExtensions.filter(ext => value.endsWith(ext)).length > 0;
    }
}

export class Util {
    static wait(miliseconds:number) {
        return $.Deferred(function (dfd) {
            setTimeout(dfd.resolve, miliseconds);
        });
    }

    // turns hostname/path links into http://hostname/path links
    // we need to do this because if accessed by file:///, we need a different
    // transport scheme for external resources (like http://)
    static prepareLink(link:string, options:any) {
        options = options || {};
        var ownProtocol = window.location.protocol;

        if (options.forceSSL)
            return 'https://' + link;
        if (options.forceHTTP)
            return 'http://' + link;

        if (ownProtocol === 'file:') {
            return 'http://' + link;
        }
        // default: use the same as origin resource
        return '//' + link;
    }

    static repeatUntil(interval:number, predicate:Function, maxRepeats:number) {
        maxRepeats = maxRepeats || 10;
        var dfd = $.Deferred();

        function recursive_repeat(interval:number, predicate:Function, maxRepeats:number) {
            if (maxRepeats === 0) {
                dfd.reject();
                return;
            }
            if (predicate()) {
                dfd.resolve();
                return;
            } else {
                Util.wait(interval).always(function () {
                    recursive_repeat(interval, predicate, maxRepeats - 1);
                });
            }
        }

        recursive_repeat(interval, predicate, maxRepeats);
        return dfd;
    }

    // a count-down latch as in Java7.
    static countDownLatch(capacity:number, min:number) {
        min = min || 0;
        capacity = (capacity === undefined) ? 1 : capacity;
        var dfd:any = $.Deferred();
        if (capacity <= min) dfd.resolve();
        dfd.capacity = capacity;
        dfd.countDown = function () {
            dfd.capacity--;
            if (dfd.capacity <= min) {
                dfd.resolve();
            }
        };
        return dfd;
    }

    static getInpageAnchorText(text:string) {
        var subhash = text.replace(/ /g, '_');
        // TODO remove more unwanted characters like ?/,- etc.
        return subhash;
    }

    static getInpageAnchorHref(text:string, href?:string) {
        href = href || $.md.mainHref;
        var subhash = this.getInpageAnchorText(text);
        return '#!' + href + '#' + subhash;
    }
};
