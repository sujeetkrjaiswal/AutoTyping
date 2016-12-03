module AutoTyping {
/**AutoTying
 * This module is used to immitate auto-type of pre selected content based on time, which can be used as a effect or
 * based on the key press event to immitate fast and accurate typing
 */
 
    /**ListnerType : Public Visibility
     * This is the list of listener available for the AutoTying to work
     * keyStroke : Tells the auto type should happen on every keypress : imitates psedo auto typing
     * timer(default): This tells to auto type based on some time duration : imitates true auto-typing
     */
    export enum ListnerType {
        keyStroke,
        timer,
        default
    }
    /**Corpus Type: Private Visibility
     * This is used for inner refrence in the module and denotes the action like Add, Remove and Wait
     */
    enum CorpusType {
        Add,
        Remove,
        Wait
    }
    /**TextNodeManger: Private Visibility
     * This manages the text node and perform adding and removing of text
     */
    class TextNodeManger {
        element: HTMLElement;
        constructor(element: HTMLElement) {
            this.element = element;
        }
        /** 
         * @param data : String input
         * returns : boolean
         * Try to append the text. returns the status of the operation
         */
        addTextNode(data: string): boolean {
            try {
                this.element.appendChild(document.createTextNode(data));
                return true;
            } catch (e) {
                console.log(e)
                return false;
            }
        }
        removeLastTextNode(): boolean {
            let lastChild = this.element.lastChild;
            if (lastChild) {
                this.element.removeChild(lastChild);
                return true;
            } else {
                //No child to remove. Set the removal item to 
                return false;
            }
        }
    }
    /**Corpus : Private Visibility 
     * This is an Interface which will help to implement action of the differnt Corpus Type
     * Every Corpus Type(Action) will have an implementation of this interface 
    */
    interface Corpus {
        doNext(): void;
        hasNext(): boolean;
    }
    /**AddCorpus
     * This implements functionality for CorpusType:Add
     */
    class AddCorpus implements Corpus {
        private corpus: string;
        private corpusLength: number;
        private corpusPointer: number;
        private textNodeManager: TextNodeManger;
        constructor(textNodeManger: TextNodeManger, corpus: string) {
            this.corpus = corpus;
            this.corpusLength = this.corpus.length;
            this.corpusPointer = -1;
            this.textNodeManager = textNodeManger;
        }
        doNext(): void {
            this.corpusPointer++;
            if (this.corpusPointer < this.corpusLength) {
                this.textNodeManager.addTextNode(this.corpus[this.corpusPointer])
            }
        }
        hasNext(): boolean {
            return this.corpusPointer < this.corpusLength;
        }
    }
    /**RemoveCorpus
     * This impliments fuctionality for CorpusType:Remove
     */
    class RemoveCorpus implements Corpus {
        private textNodeManager: TextNodeManger;
        private itemToRemove: number;
        constructor(textNodeManager: TextNodeManger, itemToRemove: number) {
            this.textNodeManager = textNodeManager;
            this.itemToRemove = itemToRemove;
        }
        doNext(): void {
            if (this.itemToRemove > 0) {
                this.textNodeManager.removeLastTextNode();
                this.itemToRemove--;
            }
        }
        hasNext(): boolean {
            return this.itemToRemove > 0;
        }
    }
    /**WaitCorpus
     * This implements funcitonality for CorpusType:Wait
     */
    class WaitCorpus implements Corpus {
        strokeToWait: number;
        constructor(strokeToWait: number) {
            this.strokeToWait = strokeToWait;
        }
        doNext(): void {
            --this.strokeToWait;
        }
        hasNext() {
            return this.strokeToWait > 0;
        }
    }
    /**CorpusManager
     * This will help managing the courpus and help provide an interface to the autotyping app
     * This will take the full string/text to be auto-typed and the element where the auto-typing effect will take place
     * This will break the full-text into differnt courpus types and provide interface/fuctions to invoke their action
     */
    class CorpusManager {
        private textNodeManger: TextNodeManger;
        private corpusArr: Corpus[];
        private static removePattern: RegExp = new RegExp("^\\^#\\d+#\\^$");
        private static waitPattern: RegExp = new RegExp("^\\^@\\d+@\\^$");

        private currCorpus: Corpus;

        constructor(wholeCorpus: string, element: HTMLElement) {
            this.textNodeManger = new TextNodeManger(element)
            this.corpusArr = this.stringToCorpusArr(wholeCorpus).reverse();
        }
        private stringToCorpusArr(wholeCorpus: string): Corpus[] {
            return wholeCorpus.split(/(\^#\d+#\^|\^@\d+@\^)/g).map((corpus) => this.stringToCorpus(corpus));
        }
        private stringToCorpus(corpusStr: string): Corpus {
            if (CorpusManager.removePattern.test(corpusStr)) {
                return new RemoveCorpus(this.textNodeManger, parseInt(corpusStr.slice(2, -2)) || 0)
            } else if (CorpusManager.waitPattern.test(corpusStr)) {
                return new WaitCorpus(parseInt(corpusStr.slice(2, -2)) || 0);
            } else {
                return new AddCorpus(this.textNodeManger, corpusStr);
            }
        }

        private hasNext(): boolean {
            while ((this.currCorpus == null || this.currCorpus.hasNext() == false) && this.corpusArr.length > 0) {
                this.currCorpus = this.corpusArr.pop();
            }
            return this.currCorpus != null && (this.currCorpus.hasNext() || this.corpusArr.length > 0);
        }
        public doNext(): boolean {
            if (this.hasNext()) {
                this.currCorpus.doNext();
                return this.hasNext();
            } else {
                return false;
            }
        }
    }
    /**AutotypeApp :PUBLIC
     * This will be acting as the manger for the auto-typeing app. This will setup the appropriate event listner for the effect
     * this will also be the  interface for the users to provide details to initiate the auto-typing (see constructor comments)
     */
    export class App {
        private corpusManager: CorpusManager;
        private type: ListnerType;
        private appTimerToken: number;
        private stopped: boolean;
        private strokeSpeed: number;
        private callback: Function;
        private strokeListener :EventListener;
        /**
         * 
         * @param element :  The element over inside which, the auto typing will insert text nodes
         * @param text : the complete text that will be inserted
         * @param type : is it timer based or key press event based
         * @param strokeSpeed : for timer = it is time ( in t X 100 ms) when pseduo key stroke is pressed
         *                      for key Stroke: no. of characters it would process for every physical key press
         * @param callback : Optional callback function when the text auto tying is finished
         */
        constructor(element: HTMLElement, text: string, type: ListnerType, strokeSpeed: number, callback?:Function) {
            this.corpusManager = new CorpusManager(text, element);
            this.type = type == ListnerType.default ? ListnerType.timer : type;
            this.stopped = false;
            this.strokeSpeed = strokeSpeed;
            this.callback = callback;
            this.strokeListener = ()=>{
                if (!this.stopped) {
                    for (let i = 0; i < this.strokeSpeed; i++) {
                        this.next();
                    }
                }
            };
        }
        private next() {
            if (!this.corpusManager.doNext()) {
                console.log("complete corpus managed.");
                this.stop();
                if (typeof this.callback == "function") {
                    this.callback();
                }
            }
        }
        public start() {
            this.stopped = false;
            switch (this.type) {
                case ListnerType.keyStroke:
                    document.body.addEventListener("keyup", this.strokeListener, false);
                    break;
                case ListnerType.timer:
                    this.timerCaller();
                    break;
            }
        }
        private timerCaller() {
            this.appTimerToken = setTimeout(() => {
                if (!this.stopped) {
                    requestAnimationFrame(() => {
                        this.next();
                        this.timerCaller();
                    });
                }
            }, this.strokeSpeed * 100)
        }
        public stop() {
            switch (this.type) {
                case ListnerType.keyStroke:
                    this.stopped = true;
                    document.body.removeEventListener("keyup",this.strokeListener,false);
                    break;
                case ListnerType.timer:
                    this.stopped = true;
                    clearTimeout(this.appTimerToken);
                    break;
            }
        }
    }
}