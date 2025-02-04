declare var MDwikiEnableDebug: any;

import { StageChain } from './stage';
import { Wiki } from './wiki';
import { GimmickLoader } from './gimmickloader';
import { LogLevel, Logger } from './logger';

(function($:JQueryStatic) {

    var logger:Logger;
    if (typeof(MDwikiEnableDebug) != "undefined")
        logger = new Logger(LogLevel.DEBUG);
    else
        logger = new Logger(LogLevel.ERROR);

    $.md.getLogger = function() {
        return logger;
    };

    $.initMDwiki = function (name: string, registerDomReady: boolean = true) {

        // this is the main object graph composition root
        var stageChain = new StageChain();
        var gimmickLoader = new GimmickLoader(stageChain);
        var wiki  = new Wiki(gimmickLoader, stageChain, $(document));

        $.md.wiki = wiki;

        if (!registerDomReady) {
            $.md.wiki.gimmicks = {};
            $.md.wiki.gimmicks.registerModule = function() {};
            $.md.wiki.gimmicks.registerGimmick = function() {};
            return;
        }

        $(document).ready(function () {

            function extractHashData() {
            // first char is the # or #!
                var href;
                if (window.location.hash.startsWith('#!')) {
                    href = window.location.hash.substring(2);
                } else {
                    href = window.location.hash.substring(1);
                }

                // Validation of the href 
                var parser = document.createElement('a');
                parser.href = href;
                if (window.location.hostname != parser.hostname) {
                    // fall to default
                    href = 'index.md';
                }

                href = decodeURIComponent(href);

                // extract possible in-page anchor
                var ex_pos = href.indexOf('#');
                if (ex_pos !== -1) {
                    $.md.inPageAnchor = href.substring(ex_pos + 1);
                    $.md.mainHref = href.substring(0, ex_pos);
                } else {
                    $.md.mainHref = href;
                }
            }

            function appendDefaultFilenameToHash () {
                var newHashString = '';
                var currentHashString = window.location.hash || '';
                if (currentHashString === '' ||
                    currentHashString === '#'||
                    currentHashString === '#!')
                {
                    newHashString = '#!index.md';
                }
                else if (currentHashString.startsWith ('#!') &&
                         currentHashString.endsWith('/')
                        ) {
                    newHashString = currentHashString + 'index.md';
                }
                if (newHashString)
                    window.location.hash = newHashString;
            }

            // stage init stuff
            extractHashData();

            appendDefaultFilenameToHash();

            $(window).bind('hashchange', function () {
                window.location.reload(false);
            });

            $.md.wiki.run();
        });
    }

}(jQuery));
