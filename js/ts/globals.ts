interface JQuery {
    toptext: () => string;
}

interface JQueryStatic {
    //[x: string]: (name: string, registerDomReady?: boolean) => void;
    md: any;
    toptext: () => string;
    affix: (any:any) => any;
    initMDwiki: (name: string, registerDomReady: boolean | true) => void;
}

$.fn.extend ({
    toptext: function () {
        return this.clone().children().remove().end().text();
    }
});

// adds a :icontains selector to jQuery that is case insensitive
$.expr[':'].icontains = $.expr.createPseudo(function(arg:string) {
    return function(elem:any) {
        return $(elem).toptext().toUpperCase().indexOf(arg.toUpperCase()) >= 0;
    };
});