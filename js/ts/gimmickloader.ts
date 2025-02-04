import GimmickParser from './gimmickparser';
import { StageChain } from './stage';

export interface IMultilineGimmickHandler {
    (trigger: string, content: string, options: any, domElement: any): void;
}
export interface ISinglelineGimmickCallback {
    (trigger: string, content: string, options: any, domElement: any): void;
}
export interface ILinkGimmickHandler {
    (trigger: string, text: string, options: any, domElement:any): void;
}

export class GimmickHandler {
    callback: Function;
    loadStage: string = 'gimmick';
    kind: string = 'link';
    trigger: string;

    // reference to the gimmick the handler belongs,
    public get gimmick (): Gimmick {
        return this.gimmickReference;
    }
    gimmickReference: Gimmick;

    constructor(kind?: string, callback?: Function) {
        if (kind)
            this.kind = kind;
        if (callback)
            this.callback = callback;
    }
}
export class ScriptResource {
    constructor (
        public url: string,
        public loadstage: string = 'pregimmick',
        public finishstage: string = 'gimmick'
    ) { }
}

export class Gimmick {
    name: string;
    handlers: GimmickHandler[] = [];
    // set by the gimmickloader when registering a gimmick
    stages: StageChain;

    private initFunctions = $.Callbacks();

    // should be called by the implementor to register init functions
    initFunction (initFn: Function) {
        this.initFunctions.add(initFn);
    }

    // should only be called internall by MDwiki to trigger initialization
    init(stageLoader:any) {
        this.initFunctions.fire(stageLoader);
    }

    // TODO create a test passing of 2nd paramter
    constructor(name: string, handler?: GimmickHandler) {
        if (arguments.length == 0) {
            throw "name argument is required for the Gimmick constructor";
        }
        this.name = name;

        if (handler)
            this.addHandler(handler);
    }
    addHandler(handler: GimmickHandler) {
        if (!handler.trigger)
            handler.trigger = this.name;

        handler.gimmickReference = this;
        this.handlers.push(handler);
    }
    findHandler(kind: string, trigger: string):GimmickHandler {
        var match = null;
        this.handlers.forEach(handler => {
            if (handler.trigger == trigger && handler.kind == kind)
                match = handler;
        });
        return match;
    }
    registerScriptResource (res: ScriptResource) {
        var loadDone = $.Deferred();

        // load the script
        this.stages.getStage(res.loadstage).subscribe(done => {
            if (res.url.startsWith('//') || res.url.startsWith('http')) {
                $.getScript(res.url, () => loadDone.resolve());
            } else {
                // inline script that we directly insert
                // jQuery does some magic when inserting inline scripts, so better
                // use vanilla JS. See:
                // http://stackoverflow.com/questions/610995/jquery-cant-append-script-element
                // scripts always need to go directly into the DOM
                var script = document.createElement('script');
                script.type = 'text/javascript';
                script.text = res.url;
                document.body.appendChild(script);
                loadDone.resolve();
            }
            done();
        });

        // wait for the script to be fully loaded
        this.stages.getStage(res.finishstage).subscribe(done => {
            loadDone.done(() => done());
        });
    }
}

export class GimmickLoader {
    private globalGimmickRegistry: Gimmick[] = [];
    private domElement: JQuery;
    private stages: StageChain;

    constructor (stageChain:any, domElement?:any) {
        this.domElement = domElement || $(document);
        this.stages = stageChain;
    }

    selectHandler(kind: string, trigger: string): GimmickHandler {
        var matching_trigger_and_kind = null;

        this.globalGimmickRegistry.forEach(gmck => {
            var handler = gmck.findHandler(kind, trigger);
            if (handler != null)
                matching_trigger_and_kind = handler;
        });

        return matching_trigger_and_kind;
    }

    private findGimmick(name: string): Gimmick {
        var found = this.globalGimmickRegistry.filter(gmck => {
            return gmck.name == name;
        });
        if (found.length == 0)
            return null;
        else
            return found[0];
    }

    registerGimmick(gmck: Gimmick) {
        var already_registered = this.globalGimmickRegistry.some(g => g.name == gmck.name);
        if (already_registered)
            throw "A gimmick by that name is already registered";

        this.globalGimmickRegistry.push(gmck);
    }

    initializeGimmick(name: string, doneCallback: Function) {
        var gmck = this.findGimmick(name);

        if (gmck == null)
            return;

        // TODO the callback must be passed down
        gmck.init(this.stages);
        doneCallback();
    }
    initializeGimmicks(parser: GimmickParser) {
        parser.singlelineReferences.forEach((ref) => {
            this.stages.getStage('ready').subscribe(done => {
                this.initializeGimmick(ref.trigger, done);
            });
        });
        parser.multilineReferences.forEach((ref) => {
            this.stages.getStage('ready').subscribe(done => {
                this.initializeGimmick(ref.trigger, done);
            });
        });
        parser.linkReferences.forEach((ref) => {
            this.stages.getStage('ready').subscribe(done => {
                this.initializeGimmick(ref.trigger, done);
            });
        });
    }

    subscribeGimmickExecution(parser: GimmickParser) {
        parser.singlelineReferences.forEach(ref => {
            var handler = this.selectHandler('singleline', ref.trigger);
            this.stages.getStage(handler.loadStage).subscribe(done => {
                handler.callback(ref, done);
            });
        });
        parser.multilineReferences.forEach(ref => {
            var handler = this.selectHandler('multiline', ref.trigger);
            this.stages.getStage(handler.loadStage).subscribe(done => {
                handler.callback(ref, done);
            });
        });
        parser.linkReferences.forEach(ref => {
            var handler = this.selectHandler('link', ref.trigger);
            this.stages.getStage(handler.loadStage).subscribe(done => {
                handler.callback(ref, done);
            });
        });
    }
};
