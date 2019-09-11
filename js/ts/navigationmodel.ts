
module MDwiki.DataModels {

    export class NavigationBarParser {
        private navbar:NavigationBarModel;
        private node: JQuery<HTMLElement>;

        constructor (node: any) {
            this.node = $(node);
            this.navbar = new NavigationBarModel();
        }

        parse(): NavigationBarModel {
            this.findPageTitle();
            this.findTopLevelEntries();

            return this.navbar;
        }

        private findPageTitle () {
            this.navbar.pageTitle = this.node.filter("h1").first().text() || "";
        }

        private findTopLevelEntries () {
            // TODO fancy selector that selects only p's that aren't
            // followed by <ul>
            this.node.filter("p").find("a").each((i, e) => {
                let $el = $(e);
                let toplevelentry = new ToplevelEntry();
                toplevelentry.title = $el.text();
                toplevelentry.href = $el.attr("href");

                let parent_paragraph_successor = $el.parent().next();
                if (parent_paragraph_successor.is("ul")) {
                    toplevelentry.childs = this.findSublevelEntries(parent_paragraph_successor);
                }
                this.navbar.toplevelEntries.push(toplevelentry);
            });
        }

        private findSublevelEntries (ul:any): SublevelEntry[] {
            let found_sublevel_entries:any[] = [];
            $(ul).find("li").each((i:number, e:HTMLElement) => {
                // TODO is this always only one child?
                let child = $(e).children();
                let sublevel_entry = this.getSublevelEntry(e);
                found_sublevel_entries.push(sublevel_entry);
            });
            return found_sublevel_entries;
        }

        private getSublevelEntry (el: Element): SublevelEntry {
            let $el = $(el);
            let entry = new SublevelEntry();
            if ($el.is("h1")) {
                entry.seperator = true;
            } else if ($el.is("a")) {
                entry.href = $el.attr("href");
                entry.title = $el.text();
            }
            return entry;
        }
    }

    export class NavigationBarModel {
        toplevelEntries: ToplevelEntry[] = [];
        pageTitle: string = "";
    }

    export class ToplevelEntry
    {
        title: string = "";
        href: string = "";
        childs: SublevelEntry[] = [];
    }

    export class SublevelEntry
    {
        title: string = "";
        href: string = "";
        seperator: boolean = false;
    }
    
}
