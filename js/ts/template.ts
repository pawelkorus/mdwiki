export class Template {

    public model: any = {};
    private templateFunction: Function;

    private renderedTemplate: any;

    constructor(templateFunction:Function) {
        this.templateFunction = templateFunction;
    }

    render () {
        this.renderedTemplate = this.templateFunction(this.model);
        return this.renderedTemplate;
    }

    private assertTemplateIsReady() {
        if (!this.renderedTemplate)
            return this.render();
    }

    /**
     *
     * @param node - The node that will be replaced
     * @returns {JQuery} The newly inserted node
     */
    replace (node:any) : JQuery {
        this.assertTemplateIsReady();
        var rendered_template = $(this.renderedTemplate);
        $(node).replaceWith(rendered_template);
        return rendered_template;
    }

    appendTo (node: any) {
        this.assertTemplateIsReady();
        return $(this.renderedTemplate).appendTo($(node));
    }

    insertAfter (node: any) {
        this.assertTemplateIsReady();
        return $(this.renderedTemplate).insertAfter(node);
    }
    
    insertBefore (node: any) {
        this.assertTemplateIsReady();
        return $(this.renderedTemplate).insertBefore(node);
    }
};