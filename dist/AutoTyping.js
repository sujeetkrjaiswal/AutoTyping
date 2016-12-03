var AutoTyping;
(function (AutoTyping) {
    /**AutoTying
     * This module is used to immitate auto-type of pre selected content based on time, which can be used as a effect or
     * based on the key press event to immitate fast and accurate typing
     */
    /**ListnerType : Public Visibility
     * This is the list of listener available for the AutoTying to work
     * keyStroke : Tells the auto type should happen on every keypress : imitates psedo auto typing
     * timer(default): This tells to auto type based on some time duration : imitates true auto-typing
     */
    (function (ListnerType) {
        ListnerType[ListnerType["keyStroke"] = 0] = "keyStroke";
        ListnerType[ListnerType["timer"] = 1] = "timer";
        ListnerType[ListnerType["default"] = 2] = "default";
    })(AutoTyping.ListnerType || (AutoTyping.ListnerType = {}));
    var ListnerType = AutoTyping.ListnerType;
    /**Corpus Type: Private Visibility
     * This is used for inner refrence in the module and denotes the action like Add, Remove and Wait
     */
    var CorpusType;
    (function (CorpusType) {
        CorpusType[CorpusType["Add"] = 0] = "Add";
        CorpusType[CorpusType["Remove"] = 1] = "Remove";
        CorpusType[CorpusType["Wait"] = 2] = "Wait";
    })(CorpusType || (CorpusType = {}));
    /**TextNodeManger: Private Visibility
     * This manages the text node and perform adding and removing of text
     */
    var TextNodeManger = (function () {
        function TextNodeManger(element) {
            this.element = element;
        }
        /**
         * @param data : String input
         * returns : boolean
         * Try to append the text. returns the status of the operation
         */
        TextNodeManger.prototype.addTextNode = function (data) {
            try {
                this.element.appendChild(document.createTextNode(data));
                return true;
            }
            catch (e) {
                console.log(e);
                return false;
            }
        };
        TextNodeManger.prototype.removeLastTextNode = function () {
            var lastChild = this.element.lastChild;
            if (lastChild) {
                this.element.removeChild(lastChild);
                return true;
            }
            else {
                //No child to remove. Set the removal item to 
                return false;
            }
        };
        return TextNodeManger;
    }());
    /**AddCorpus
     * This implements functionality for CorpusType:Add
     */
    var AddCorpus = (function () {
        function AddCorpus(textNodeManger, corpus) {
            this.corpus = corpus;
            this.corpusLength = this.corpus.length;
            this.corpusPointer = -1;
            this.textNodeManager = textNodeManger;
        }
        AddCorpus.prototype.doNext = function () {
            this.corpusPointer++;
            if (this.corpusPointer < this.corpusLength) {
                this.textNodeManager.addTextNode(this.corpus[this.corpusPointer]);
            }
        };
        AddCorpus.prototype.hasNext = function () {
            return this.corpusPointer < this.corpusLength;
        };
        return AddCorpus;
    }());
    /**RemoveCorpus
     * This impliments fuctionality for CorpusType:Remove
     */
    var RemoveCorpus = (function () {
        function RemoveCorpus(textNodeManager, itemToRemove) {
            this.textNodeManager = textNodeManager;
            this.itemToRemove = itemToRemove;
        }
        RemoveCorpus.prototype.doNext = function () {
            if (this.itemToRemove > 0) {
                this.textNodeManager.removeLastTextNode();
                this.itemToRemove--;
            }
        };
        RemoveCorpus.prototype.hasNext = function () {
            return this.itemToRemove > 0;
        };
        return RemoveCorpus;
    }());
    /**WaitCorpus
     * This implements funcitonality for CorpusType:Wait
     */
    var WaitCorpus = (function () {
        function WaitCorpus(strokeToWait) {
            this.strokeToWait = strokeToWait;
        }
        WaitCorpus.prototype.doNext = function () {
            --this.strokeToWait;
        };
        WaitCorpus.prototype.hasNext = function () {
            return this.strokeToWait > 0;
        };
        return WaitCorpus;
    }());
    /**CorpusManager
     * This will help managing the courpus and help provide an interface to the autotyping app
     * This will take the full string/text to be auto-typed and the element where the auto-typing effect will take place
     * This will break the full-text into differnt courpus types and provide interface/fuctions to invoke their action
     */
    var CorpusManager = (function () {
        function CorpusManager(wholeCorpus, element) {
            this.textNodeManger = new TextNodeManger(element);
            this.corpusArr = this.stringToCorpusArr(wholeCorpus).reverse();
        }
        CorpusManager.prototype.stringToCorpusArr = function (wholeCorpus) {
            var _this = this;
            return wholeCorpus.split(/(\^#\d+#\^|\^@\d+@\^)/g).map(function (corpus) { return _this.stringToCorpus(corpus); });
        };
        CorpusManager.prototype.stringToCorpus = function (corpusStr) {
            if (CorpusManager.removePattern.test(corpusStr)) {
                return new RemoveCorpus(this.textNodeManger, parseInt(corpusStr.slice(2, -2)) || 0);
            }
            else if (CorpusManager.waitPattern.test(corpusStr)) {
                return new WaitCorpus(parseInt(corpusStr.slice(2, -2)) || 0);
            }
            else {
                return new AddCorpus(this.textNodeManger, corpusStr);
            }
        };
        CorpusManager.prototype.hasNext = function () {
            while ((this.currCorpus == null || this.currCorpus.hasNext() == false) && this.corpusArr.length > 0) {
                this.currCorpus = this.corpusArr.pop();
            }
            return this.currCorpus != null && (this.currCorpus.hasNext() || this.corpusArr.length > 0);
        };
        CorpusManager.prototype.doNext = function () {
            if (this.hasNext()) {
                this.currCorpus.doNext();
                return this.hasNext();
            }
            else {
                return false;
            }
        };
        CorpusManager.removePattern = new RegExp("^\\^#\\d+#\\^$");
        CorpusManager.waitPattern = new RegExp("^\\^@\\d+@\\^$");
        return CorpusManager;
    }());
    /**AutotypeApp :PUBLIC
     * This will be acting as the manger for the auto-typeing app. This will setup the appropriate event listner for the effect
     * this will also be the  interface for the users to provide details to initiate the auto-typing (see constructor comments)
     */
    var App = (function () {
        /**
         *
         * @param element :  The element over inside which, the auto typing will insert text nodes
         * @param text : the complete text that will be inserted
         * @param type : is it timer based or key press event based
         * @param strokeSpeed : for timer = it is time ( in t X 100 ms) when pseduo key stroke is pressed
         *                      for key Stroke: no. of characters it would process for every physical key press
         * @param callback : Optional callback function when the text auto tying is finished
         */
        function App(element, text, type, strokeSpeed, callback) {
            var _this = this;
            this.corpusManager = new CorpusManager(text, element);
            this.type = type == ListnerType.default ? ListnerType.timer : type;
            this.stopped = false;
            this.strokeSpeed = strokeSpeed;
            this.callback = callback;
            this.strokeListener = function () {
                if (!_this.stopped) {
                    for (var i = 0; i < _this.strokeSpeed; i++) {
                        _this.next();
                    }
                }
            };
        }
        App.prototype.next = function () {
            if (!this.corpusManager.doNext()) {
                console.log("complete corpus managed.");
                this.stop();
                if (typeof this.callback == "function") {
                    this.callback();
                }
            }
        };
        App.prototype.start = function () {
            this.stopped = false;
            switch (this.type) {
                case ListnerType.keyStroke:
                    document.body.addEventListener("keyup", this.strokeListener, false);
                    break;
                case ListnerType.timer:
                    this.timerCaller();
                    break;
            }
        };
        App.prototype.timerCaller = function () {
            var _this = this;
            this.appTimerToken = setTimeout(function () {
                if (!_this.stopped) {
                    requestAnimationFrame(function () {
                        _this.next();
                        _this.timerCaller();
                    });
                }
            }, this.strokeSpeed * 100);
        };
        App.prototype.stop = function () {
            switch (this.type) {
                case ListnerType.keyStroke:
                    this.stopped = true;
                    document.body.removeEventListener("keyup", this.strokeListener, false);
                    break;
                case ListnerType.timer:
                    this.stopped = true;
                    clearTimeout(this.appTimerToken);
                    break;
            }
        };
        return App;
    }());
    AutoTyping.App = App;
})(AutoTyping || (AutoTyping = {}));
