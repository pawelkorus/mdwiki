import { Util as util } from './utils';
import { Template } from './template';
import { StageChain } from './stage';
import navbarTpl from './navbar.hbs';
import footerTpl from './footer.hbs';

export class Bootstrap {
    private events:any[] = [];
    private stages: StageChain;
    private config: any;

    constructor(stages: StageChain, config: any) {
        this.stages = stages;
        this.config = config;
    }
    public bootstrapify() {
        this.parseHeader();
        this.createPageSkeleton();
        this.buildMenu ();
        this.changeHeading();
        this.replaceImageParagraphs();

        $('table').addClass('table').addClass('table-bordered');
        //pullRightBumper ();

        // external content should run after gimmicks were run
        this.stages.getStage('pregimmick').subscribe((done) => {
            if (this.config.useSideMenu !== false) {
                this.createPageContentMenu();
            }
            this.addFooter();
            this.addAdditionalFooterText();
            done();
        });
        this.stages.getStage('postgimmick').subscribe((done) => {
            this.adjustExternalContent();
            this.highlightActiveLink();

            done();
        });
    }
    private bind(ev:any, func:any) {
        $(document).bind(ev, func);
        this.events.push(ev);
    }
    private trigger(ev:any) {
        $(document).trigger(ev);
    }
    private parseHeader() {
        if (!this.config.parseHeader)
            return;
        var parsedHeaders:any = {};
        var header = $('#md-content > pre:first-child');
        header.hide();
        var headerLines = header.text().split("\n");
        $.each(headerLines, function(n, elem:any) {
            elem = elem.split(':', 2);
            if (elem.length === 2) {
                parsedHeaders[elem[0].trim()] = elem[1].trim();
            }
        });
        parsedHeaders.title = parsedHeaders.title || $('#md-title h1').text();
        if (parsedHeaders.title) {
            document.title = parsedHeaders.title;
            $('meta[name=subject]').attr('content', parsedHeaders.title);
        }
        if (parsedHeaders.author) $('meta[name=author]').attr('content', parsedHeaders.author);
        if (parsedHeaders.description) $('meta[name=description]').attr('content', parsedHeaders.description);
        if (parsedHeaders.copyright) $('meta[name=copyright]').attr('content', parsedHeaders.copyright);
        if (parsedHeaders.keywords) $('meta[name=keywords]').attr('content', parsedHeaders.keywords);
        $('meta[name=generator]').attr('content', 'mdwiki');
    }

    private buildTopNav() {
        // replace with the navbar skeleton
        if ($('#md-menu').length <= 0) {
            return;
        }
        var $menuContent = $('#md-menu').children();

        // $('#md-menu').addClass ('navbar navbar-default navbar-fixed-top');
        // var menusrc = '';
        // menusrc += '<div id="md-menu-inner" class="container">';
        // menusrc += '<ul id="md-menu-ul" class="nav navbar-nav">';
        // menusrc += '</ul></div>';
        var navbar = new Template(navbarTpl);
        navbar.appendTo('#md-menu');
        // .eq(0) becase we dont want navbar-right to be appended to
        $('#md-menu ul.navbar-nav').eq(0).append($menuContent);

        // the menu should be the first element in the body
        $('#md-menu').prependTo ('#md-all');

        var brand_text = $('#md-menu h1').toptext();
        $('#md-menu h1').remove();
        $('a.navbar-brand').text(brand_text);

        // initial offset
        $('#md-body').css('margin-top', '70px');
        this.stages.getStage('pregimmick').subscribe((done) => {
            this.check_offset_to_navbar();
            done();
        });
    }
    // the navbar has different height depending on theme, number of navbar entries,
    // and window/device width. Therefore recalculate on start and upon window resize
    private set_offset_to_navbar () {
        var height = $('#md-main-navbar').height() + 10;
        $('#md-body').css('margin-top', height + 'px');
    }
    private check_offset_to_navbar () {
        // HACK this is VERY UGLY. When an external theme is used, we don't know when the
        // css style will be finished loading - and we can only correctly calculate
        // the height AFTER it has completely loaded.
        var navbar_height = 0;

        var dfd1 = util.repeatUntil(40, function() {
            navbar_height = $('#md-main-navbar').height();
            return (navbar_height > 35) && (navbar_height < 481);
        }, 25);

        dfd1.done(() => {
            navbar_height = $('#md-main-navbar').height();
            this.set_offset_to_navbar();
            // now bootstrap changes this maybe after a while, again watch for changes
            var dfd2 = util.repeatUntil(20, function () {
                return navbar_height !== $('#md-main-navbar').height();
            }, 25);
            dfd2.done(() => {
                // it changed, so we need to change it again
                this.set_offset_to_navbar();
            });
            // and finally, for real slow computers, make sure it is changed if changin very late
            util.wait(2000).done(() => {
                this.set_offset_to_navbar();
            });
        });
    }

    private buildMenu () {
        if ($('#md-menu a').length === 0) {
            return;
        }
        var h = $('#md-menu');

        // make toplevel <a> a dropdown
        h.find('> a[href=""]')
            .attr('data-toggle', 'dropdown')
            .addClass('dropdown-toggle')
            .attr('href','')
            .append('<b class="caret"/>');
        h.find('ul').addClass('dropdown-menu');
        h.find('ul li').addClass('dropdown');

        // replace hr with dividers
        $('#md-menu hr').each(function(i,e:HTMLElement) {
            var hr = $(e);
            var prev = hr.prev();
            var next = hr.next();
            if (prev.is('ul') && prev.length >= 0) {
                prev.append($('<li class="divider"/>'));
                hr.remove();
                if (next.is('ul')) {
                    next.find('li').appendTo(prev);
                    next.remove();
                }
                // next ul should now be empty
            }
            return;
        });

        // remove empty uls
        $('#md-menu ul').each(function(i,e) {
            var ul = $(e);
            if (ul.find('li').length === 0) {
                ul.remove();
            }
        });

        $('#md-menu hr').replaceWith($('<li class="divider-vertical"/>'));


        // wrap the toplevel links in <li>
        $('#md-menu > a').wrap('<li />').parent().addClass('nav-item');
        $('#md-menu ul').each(function(i,e:HTMLElement) {
            var ul = $(e);
            ul.appendTo(ul.prev());
            ul.parent('li').addClass('dropdown');
        });

        // submenu headers
        $('#md-menu li.dropdown').find('h1, h2, h3').each(function(i,e) {
            var $e = $(e);
            var text = $e.toptext();
            var header = $('<li class="dropdown-header" />');
            header.text(text);
            $e.replaceWith(header);
        });

        // call the user specifed menu function
        this.buildTopNav();
    }
    private isVisibleInViewport(e:any) {
        var el = $(e);
        var top = $(window).scrollTop();
        var bottom = top + $(window).height();

        var eltop = el.offset().top;
        var elbottom = eltop + el.height();

        return (elbottom <= bottom) && (eltop >= top);
    }

    private createPageContentMenu () {
        // assemble the menu
        var $headings = $('#md-content').find(this.config.pageMenu.useHeadings);

        $headings.children().remove();

        if ($headings.length <= 1) {
            return;
        }

        $('#md-content').removeClass ('col-md-12');
        $('#md-content').addClass ('col-md-9');
        $('#md-content-row').prepend('<div class="col-md-3" id="md-left-column"/>');

        var recalc_width = function () {
            // if the page menu is affixed, it is not a child of the
            // <md-left-column> anymore and therefore does not inherit
            // its width. On every resize, change the class accordingly
            var width_left_column = $('#md-left-column').css('width');
            $('#md-page-menu').css('width', width_left_column);
        };

        $(window).scroll(() => {
            recalc_width();
            var $first:any;
            $('*.md-inpage-anchor').each((i,e) => {
                if ($first === undefined) {
                    var h = $(e);
                    if (this.isVisibleInViewport(h)) {
                        $first = h;
                    }
                }
            });
            // highlight in the right menu
            $('#md-page-menu a').each(function(i,e) {
                var $a = $(e);
                if ($first && $a.toptext() === $first.toptext()) {
                    $('#md-page-menu a.active').removeClass('active');
                    //$a.parent('a').addClass('active');
                    $a.addClass('active');
                }
            });
        });


        var affixDiv: any = $('<div id="md-page-menu" />');

        //var top_spacing = $('#md-menu').height() + 15;
        var top_spacing = 70;
        affixDiv.affix({
            //offset: affix.position() - 50,
            offset: 130
        });
        affixDiv.css('top', top_spacing);
        //affix.css('top','-250px');

        var $pannel = $('<div class="panel panel-default"><ul class="list-group"/></div>');
        var $ul = $pannel.find("ul");
        affixDiv.append($pannel);

        function createMenuItem(heading:any, className:string) {
            var $heading = $(heading);
            var $a = $('<a class="list-group-item" />');
            $a.addClass(className);
            $a.attr('href', util.getInpageAnchorHref($heading.toptext()));
            $a.click(function(ev) {
                ev.preventDefault();

                var $this = $(this);
                var anchortext = util.getInpageAnchorText($this.toptext());
                //$.md.scrollToInPageAnchor(anchortext);
            });
            $a.text($heading.toptext());
            return $a;
        }

        $($headings).each(function(i,e) {
            var hClass = $(e).prop('tagName');
            var currLevel = parseInt(hClass.substr(1,1), 10);
            var $hli = createMenuItem(e, hClass.toLowerCase() + '-nav');

            $ul.append($hli);
        });

        $(window).resize(() => {
            recalc_width();
            this.check_offset_to_navbar();
        });
        $('#md-left-column').append(affixDiv);

    }

    private createPageSkeleton() {

        $('#md-title').wrap('<div class="container" id="md-title-container"/>');
        $('#md-title').wrap('<div class="row" id="md-title-row"/>');

        $('#md-menu').wrap('<div class="container" id="md-menu-container"/>');
        $('#md-menu').wrap('<div class="row" id="md-menu-row"/>');

        $('#md-content').wrap('<div class="container" id="md-content-container"/>');
        $('#md-content').wrap('<div class="row" id="md-content-row"/>');

        $('#md-body').wrap('<div class="container" id="md-body-container"/>');
        $('#md-body').wrap('<div class="row" id="md-body-row"/>');

        $('#md-title').addClass('col-md-12');
        $('#md-content').addClass('col-md-12');

    }

    private changeHeading() {

        // HEADING
        var jumbo = $('<div class="page-header" />');
        $('#md-title').wrapInner(jumbo);
    }

    private highlightActiveLink () {
        // when no menu is used, return
        if ($('#md-menu').find ('li').length === 0) {
            return;
        }
        var filename = window.location.hash;

        if (filename.length === 0) {
            filename = '#!index.md';
        }
        var selector = 'li:has(a[href="' + filename + '"])';
        $('#md-menu').find (selector).addClass ('active');
    }

    // replace all <p> around images with a <div class="thumbnail" >
    private replaceImageParagraphs() {

        // only select those paragraphs that have images in them
        var $pars = $('p img').parents('p');
        $pars.each(function(i, e:HTMLElement) {
            var $p = $(e);
            var $images = $(e).find('img')
                .filter(function() {
                    // only select those images that have no parent anchor
                    return $(this).parents('a').length === 0;
                })
                // add those anchors including images
                .add($(e).find ('img'))
                .addClass('img-responsive')
                .addClass('img-thumbnail');

            // create a new url group at the fron of the paragraph
            //$p.prepend($('<ul class="thumbnails" />'));
            // move the images to the newly created ul
            //$p.find('ul').eq(0).append($images);

            // wrap each image with a <li> that limits their space
            // the number of images in a paragraphs determines thei width / span

            // if the image is a link, wrap around the link to avoid
            function wrapImage ($imgages:any, wrapElement:any) {
                return $images.each(function (i, img) {
                    var $img = $(img);
                    var $parent_img = $img.parent('a');
                    if ($parent_img.length > 0)
                        $parent_img.wrap(wrapElement);
                    else
                        $img.wrap(wrapElement);
                });
            }

            if ($p.hasClass ('md-floatenv')) {
                if ($images.length === 1) {
                    wrapImage($images, '<div class="col-sm-8" />');
                } else if ($images.length === 2) {
                    wrapImage($images, '<div class="col-sm-4" />');
                } else {
                    wrapImage($images, '<div class="col-sm-2" />');
                }
            } else {

                // non-float => images are on their own single paragraph, make em larger
                // but remember, our image resizing will make them only as large as they are
                // but do no upscaling
                // TODO replace by calculation

                if ($images.length === 1) {
                    wrapImage($images, '<div class="col-sm-12" />');
                } else if ($images.length === 2) {
                    wrapImage($images, '<div class="col-sm-6" />');
                } else if ($images.length === 3) {
                    wrapImage($images, '<div class="col-sm-4" />');
                } else if ($images.length === 4) {
                    wrapImage($images, '<div class="col-sm-3" />');
                } else {
                    wrapImage($images, '<div class="col-sm-2" />');
                }
            }
            $p.addClass('row');
            // finally, every img gets its own wrapping thumbnail div
            //$images.wrap('<div class="thumbnail" />');
        });

        // apply float to the ul thumbnails
        //$('.md-floatenv.md-float-left ul').addClass ('pull-left');
        //$('.md-floatenv.md-float-right ul').addClass ('pull-right');
    }

    private adjustExternalContent() {
        // external content are usually iframes or divs that are integrated
        // by gimmicks
        // example: youtube iframes, google maps div canvas
        // all external content are in the md-external class

        $('iframe.md-external').not ('.md-external-nowidth')
            .attr('width', '450')
            .css ('width', '450px');

        $('iframe.md-external').not ('.md-external-noheight')
            .attr('height', '280')
            .css ('height', '280px');

        // make it appear like an image thumbnal
        //$('.md-external').addClass('img-thumbnail');

        //.wrap($("<ul class='thumbnails' />")).wrap($("<li class='col-md-6' />"));
        $('div.md-external').not('.md-external-noheight')
            .css('height', '280px');
        $('div.md-external').not('.md-external-nowidth')
            .css('width', '450px');

        // // make it appear like an image thumbnal
        // $("div.md-external").addClass("thumbnail").wrap($("<ul class='thumbnails' />")).wrap($("<li class='col-md-10' />"));

        // $("div.md-external-large").css('width', "700px")
    }

    // note: the footer is part of the GPLv3 legal information
    // and may not be removed or hidden to comply with licensing conditions.
    private addFooter() {
        var footer_template = new Template(footerTpl);
        var $rendered = footer_template.insertAfter($('#md-all'));
    }

    private addAdditionalFooterText () {
        var text = this.config.additionalFooterText;
        if (text) {
            $('.md-copyright-footer #md-footer-additional').html(text);
        }
    }
}
