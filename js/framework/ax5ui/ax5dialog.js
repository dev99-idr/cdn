"use strict";

// ax5.ui.dialog
(function () {

    var UI = ax5.ui;
    var U = ax5.util;
    var DIALOG;

    UI.addClass({
        className: "dialog",
        version: "1.3.108"
    }, function () {
        /**
         * @class ax5dialog
         * @classdesc
         * @author tom@axisj.com
         * @example
         * ```js
         * var dialog = new ax5.ui.dialog();
         * var mask = new ax5.ui.mask();
         * dialog.setConfig({
         *     zIndex: 5000,
         *     onStateChanged: function () {
         *         if (this.state === "open") {
         *             mask.open();
         *         }
         *         else if (this.state === "close") {
         *             mask.close();
         *         }
         *     }
         * });
         *
         * dialog.alert({
         *     theme: 'default',
         *     title: 'Alert default',
         *     msg: theme + ' color'
         * }, function () {
         *     console.log(this);
         * });
         * ```
         */
        var ax5dialog = function ax5dialog() {
            var self = this,
                cfg;

            this.instanceId = ax5.getGuid();
            this.instanceId = 'filter';
            this.config = {
                id: 'ax5-dialog-' + this.instanceId,
                clickEventName: "click", //(('ontouchstart' in document.documentElement) ? "touchend" : "click"),
                theme: 'default',
                position: 'center',
                width: 500,
                title: '',
                msg: '',
                lang: {
                	"ok": "ok", "cancel": "cancel", "close": "close"
                },
                animateTime: 150
            };
            this.activeDialog = null;
            cfg = this.config;

            var onStateChanged = function onStateChanged(opts, that) {
                    if (opts && opts.onStateChanged) {
                        opts.onStateChanged.call(that, that);
                    } else if (this.onStateChanged) {
                        this.onStateChanged.call(that, that);
                    }

                    that = null;
                    return true;
                },

                /**
                 * @method ax5dialog.getContent
                 * @param {String} dialogId
                 * @param {Object} opts
                 * @returns dialogDisplay
                 */
                getContent = function getContent(dialogId, opts) {
                    var data = {
                        dialogId: dialogId,
                        title: opts.title || cfg.title || "",
                        msg: (opts.msg || cfg.msg || "").replace(/\n/g, "<br/>"),
                        input: opts.input,
                        btns: opts.btns,
                        '_crlf': function _crlf() {
                            return this.replace(/\n/g, "<br/>");
                        }
                    };
                    var displayType = cfg.displayType ;
                    if(displayType == "dialogFilter") {
                    	displayType = "dialogFilter" ;
                    } else if(displayType == "dialogTrans") {
                    	displayType = "dialogTrans" ;
                    } else if(displayType == "dialogSTT") {
                    	displayType = "dialogSTT" ;
                    } else if(displayType == "dialogTTS") {
                    	displayType = "dialogTTS" ;
                    } else if(displayType == "dialogSpchTrans") {
                    	displayType = "dialogSpchTrans" ;
                    } else if(displayType == "dialogWebSocket") {
                    	displayType = "dialogWebSocket" ;
                    } else if(displayType == "dialogRtrvCond") {
                    	displayType = "dialogRtrvCond" ;
                    } else {
                    	displayType = "dialogDisplay" ;
                    }
                    try {
                        return DIALOG.tmpl.get.call(this, displayType, data);
                    } finally {
                        data = null;
                    }
                },

                /**
                 * @method ax5dialog.open
                 * @param {Object} opts
                 * @param callback
                 */
                open = function open(opts, callback) {
                    var pos = {},
                        box;

                    opts.id = opts.id || cfg.id;

                    box = {
                            width: opts.width
                    };

//                    if (this.activeDialog.find("[data-dialog-btn]") != null) {
//                    	return ;
//                    }

                    jQuery(document.body).append(getContent.call(this, opts.id, opts));
                    this.activeDialog = jQuery('#' + opts.id);
                    this.activeDialog.css({width: box.width});

                    // dialog 높이 구하기 - 너비가 정해지면 높이가 변경 될 것.
                    opts.height = box.height = this.activeDialog.height();

                    //- position 정렬
                    if (typeof opts.position === "undefined" || opts.position === "center") {
                        pos.top = jQuery(window).height() / 2 - box.height / 2;
                        pos.left = jQuery(window).width() / 2 - box.width / 2;
                    } else {
                        pos.left = opts.position.left || 0;
                        pos.top = opts.position.top || 0;
                    }

                    this.activeDialog.css({top: pos.top});
                    this.activeDialog.css({left: pos.left});

                    if (cfg.zIndex) {
                        pos["z-index"] = cfg.zIndex;
                    }
//                    this.activeDialog.css(pos);

                    // bind button event
                    if (opts.dialogType === "prompt") {
                        this.activeDialog.find("[data-dialog-prompt]").get(0).focus();
                    } else {
                        this.activeDialog.find("[data-dialog-btn]").get(0).focus();
                    }

                    this.activeDialog.find("[data-dialog-btn]").on(cfg.clickEventName, function (e) {
                        btnOnClick.call(this, e || window.event, opts, callback);
                    }.bind(this));

                    // bind key event
                    jQuery(window).bind("keydown.ax5dialog", function (e) {
                        onKeyup.call(this, e || window.event, opts, callback);
                    }.bind(this));

                    jQuery(window).bind("resize.ax5dialog", function (e) {
                        align.call(this, e || window.event);
                    }.bind(this));

                    onStateChanged.call(this, opts, {
                        self: this,
                        state: "open"
                    });

                    pos = null;
                    box = null;
                },
                align = function align(e) {
                    if (!this.activeDialog) return this;
                    var opts = self.dialogConfig,
                        box = {
                            width: opts.width,
                            height: opts.height
                        };
                    //- position 정렬
                    if (typeof opts.position === "undefined" || opts.position === "center") {
                        box.top = window.innerHeight / 2 - box.height / 2;
                        box.left = window.innerWidth / 2 - box.width / 2;
                    } else {
                        box.left = opts.position.left || 0;
                        box.top = opts.position.top || 0;
                    }
                    if (box.left < 0) box.left = 0;
                    if (box.top < 0) box.top = 0;

                    this.activeDialog.css(box);

                    opts = null;
                    box = null;

                    return this;
                },
                btnOnClick = function btnOnClick(e, opts, callback, target, k) {
                    var that;
                    if (e.srcElement) e.target = e.srcElement;

                    target = U.findParentNode(e.target, function (target) {
                        if (target.getAttribute("data-dialog-btn")) {
                            return true;
                        }
                    });

                    if (target) {
                        k = target.getAttribute("data-dialog-btn");

                        that = {
                            self: this,
                            key: k, value: opts.btns[k],
                            dialogId: opts.id,
                            btnTarget: target
                        };
                        if (opts.dialogType === "prompt") {
                            var emptyKey = null;
                            for (var oi in opts.input) {
                            	for(var i=0; i<3; i++) {
                            		if (i == 0) {
                            			keyVal = oi ;
                            		} else {
                            			keyVal = oi + i ;
                            		}
                            		that[keyVal] = this.activeDialog.find('[data-dialog-prompt=' + keyVal + ']').val();
                                	var keyVal = oi ;
                            	}
//                                if (that[oi] == "" || that[oi] == null) {
//                                    emptyKey = oi;
//                                    break;
//                                }
                            }
                        }
                        if (opts.btns[k].onClick) {
                            opts.btns[k].onClick.call(that, k);
                        } else if (opts.dialogType === "alert") {
                            if (callback) callback.call(that, k);
                            this.close({doNotCallback: true});
                        } else if (opts.dialogType === "confirm") {
                            if (callback) callback.call(that, k);
                            this.close({doNotCallback: true});
                        } else if (opts.dialogType === "prompt") {
                            if (k === 'ok') {
//                                if (emptyKey) {
//                                    this.activeDialog.find('[data-dialog-prompt="' + emptyKey + '"]').get(0).focus();
//                                    return false;
//                                }
                            } else if (k === 'cancel') {
//                            	this.close({doNotCallback: true});
//                            } else if (k === 'trans') {
//                            	this.close({doNotCallback: true});
                            } else  if (k === 'close') {
                            	this.close({doNotCallback: true});
                            }
                            if (callback) callback.call(that, k);

                        }
                    }

                    that = null;
                    opts = null;
                    callback = null;
                    target = null;
                    k = null;
                },
                onKeyup = function onKeyup(e, opts, callback, target, k) {
                    var that,
                        emptyKey = null;

                    if (e.keyCode == ax5.info.eventKeys.ESC) {
                        this.close();
                    }
                    if (opts.dialogType === "prompt") {
                        if (e.keyCode == ax5.info.eventKeys.RETURN) {
                            that = {
                                self: this,
                                key: "ok", value: opts.btns["ok"],
                                dialogId: opts.id,
                                btnTarget: "ok"
                            };

                            for (var oi in opts.input) {
                                that[oi] = this.activeDialog.find('[data-dialog-prompt=' + oi + ']').val();
                                if (that[oi] == "" || that[oi] == null) {
                                    emptyKey = oi;
                                    break;
                                }
                            }
                            btnOnClick.call(that, e || window.event, opts, callback);
                            if (emptyKey) {
                                that = null;
                                emptyKey = null;
                                return false;
                            }
                            if (callback) callback.call(that, k);
                            this.close({doNotCallback: true});
                        }
                    }

                    that = null;
                    emptyKey = null;
                    opts = null;
                    callback = null;
                    target = null;
                    k = null;
                };

            /**
             * Preferences of dialog UI
             * @method ax5dialog.setConfig
             * @param {Object} config - 클래스 속성값
             * @param {Number} [config.zIndex]
             * @returns {ax5dialog}
             * @example
             * ```
             * ```
             */
            //== class body start
            this.init = function () {

                this.onStateChanged = cfg.onStateChanged;
                // this.onLoad = cfg.onLoad;
            };

            /**
             * open the dialog of alert type
             * @method ax5dialog.alert
             * @param {Object|String} [{theme, title, msg, btns}|msg] - dialog 속성을 json으로 정의하거나 msg만 전달
             * @param {Function} [callback] - 사용자 확인 이벤트시 호출될 callback 함수
             * @returns {ax5dialog}
             * @example
             * ```
             * myDialog.alert({
             *  title: 'app title',
             *  msg: 'alert'
             * }, function(){});
             * ```
             */
            this.alert = function (opts, callback, tryCount) {
                if (U.isString(opts)) {
                    opts = {
                        title: cfg.title,
                        msg: opts
                    };
                }

                if (this.activeDialog) {
                    // try one more
                    if (!tryCount) {
                        setTimeout(function () {
                            this.alert(opts, callback, 1);
                        }.bind(this), Number(cfg.animateTime) + 100);
                    } else {
                        console.log(ax5.info.getError("ax5dialog", "501", "alert"));
                    }
                    return this;
                }

                self.dialogConfig = {};
                jQuery.extend(true, self.dialogConfig, cfg, opts);
                opts = self.dialogConfig;

                opts.dialogType = "alert";
                opts.theme = opts.theme || cfg.theme || "";
                opts.callback = callback;

                if (typeof opts.btns === "undefined") {
                    opts.btns = {
                        ok: {label: cfg.lang["ok"], theme: opts.theme}
                    };
                }
                open.call(this, opts, callback);

                return this;
            };

            /**
             * open the dialog of confirm type
             * @method ax5dialog.confirm
             * @param {Object|String} [{theme, title, msg, btns}|msg] - dialog 속성을 json으로 정의하거나 msg만 전달
             * @param {Function} [callback] - 사용자 확인 이벤트시 호출될 callback 함수
             * @returns {ax5dialog}
             * @example
             * ```
             * myDialog.confirm({
             *  title: 'app title',
             *  msg: 'confirm'
             * }, function(){});
             * ```
             */
            this.confirm = function (opts, callback, tryCount) {
                if (U.isString(opts)) {
                    opts = {
                        title: cfg.title,
                        msg: opts
                    };
                }

                if (this.activeDialog) {
                    // try one more
                    if (!tryCount) {
                        setTimeout(function () {
                            this.confirm(opts, callback, 1);
                        }.bind(this), Number(cfg.animateTime) + 100);
                    } else {
                        console.log(ax5.info.getError("ax5dialog", "501", "confirm"));
                    }
                    return this;
                }

                self.dialogConfig = {};
                jQuery.extend(true, self.dialogConfig, cfg, opts);
                opts = self.dialogConfig;

                opts.dialogType = "confirm";
                opts.theme = opts.theme || cfg.theme || "";
                opts.callback = callback;

                if (typeof opts.btns === "undefined") {
                    opts.btns = {
                        ok: {label: cfg.lang["ok"], theme: opts.theme},
                        cancel: {label: cfg.lang["cancel"]}
                    };
                }
                open.call(this, opts, callback);

                return this;
            };

            /**
             * open the dialog of prompt type
             * @method ax5dialog.prompt
             * @param {Object|String} [{theme, title, msg, btns, input}|msg] - dialog 속성을 json으로 정의하거나 msg만 전달
             * @param {Function} [callback] - 사용자 확인 이벤트시 호출될 callback 함수
             * @returns {ax5dialog}
             * @example
             * ```
             * myDialog.prompt({
             *  title: 'app title',
             *  msg: 'alert'
             * }, function(){});
             * ```
             */
            this.prompt = function (opts, callback, tryCount) {
                if (U.isString(opts)) {
                    opts = {
                        title: cfg.title,
                        msg: opts
                    };
                }

                if (this.activeDialog) {
                    // try one more
                    if (!tryCount) {
                        setTimeout(function () {
                            this.prompt(opts, callback, 1);
                        }.bind(this), Number(cfg.animateTime) + 100);
                    } else {
                        console.log(ax5.info.getError("ax5dialog", "501", "prompt"));
                    }
                    return this;
                }

                self.dialogConfig = {};
                jQuery.extend(true, self.dialogConfig, cfg, opts);
                opts = self.dialogConfig;
                opts.dialogType = "prompt";
                opts.theme = opts.theme || cfg.theme || "";
                opts.callback = callback;

                if (typeof opts.input === "undefined") {
                    opts.input = {
                        value: {label: ""}
                    };
                }
                if (typeof opts.btns === "undefined") {
                    opts.btns = {
                        ok: {label: cfg.lang["ok"], theme: opts.theme},
                        cancel: {label: cfg.lang["cancel"]},
                        close: {label: cfg.lang["close"]}
                    };
                }
                open.call(this, opts, callback);

                return this;
            };

            /**
             * close the dialog
             * @method ax5dialog.close
             * @returns {ax5dialog}
             * @example
             * ```
             * myDialog.close();
             * ```
             */
            this.close = function (_option) {
                var opts, that;
                if (this.activeDialog) {
                    opts = self.dialogConfig;
                    this.activeDialog.addClass("destroy");
                    jQuery(window).unbind("keydown.ax5dialog");
                    jQuery(window).unbind("resize.ax5dialog");

                    setTimeout(function () {
                        if (this.activeDialog) {
                            this.activeDialog.remove();
                            this.activeDialog = null;
                        }

                        that = {
                            self: this,
                            state: "close",
                            dialogId: opts.id
                        };

                        if (opts.callback && (!_option || !_option.doNotCallback)) {
                            opts.callback.call(that);
                        }

                        if (opts && opts.onStateChanged) {
                            opts.onStateChanged.call(that, that);
                        } else if (this.onStateChanged) {
                            this.onStateChanged.call(that, that);
                        }

                        opts = null;
                        that = null;
                    }.bind(this), cfg.animateTime);
                }
                return this;
            };

            // 클래스 생성자
            this.main = function () {

                UI.dialog_instance = UI.dialog_instance || [];
                UI.dialog_instance.push(this);

                if (arguments && U.isObject(arguments[0])) {
                    this.setConfig(arguments[0]);
                }
            }.apply(this, arguments);
        };
        return ax5dialog;
    }());
    DIALOG = ax5.ui.dialog;
})();

// ax5.ui.dialog.tmpl
(function () {

    var DIALOG = ax5.ui.dialog;

    //필터용
    var dialogFilter = function (columnKeys) {
    	var returnVal = "\n        <div id=\"{{dialogId}}\" data-ax5-ui=\"dialog\" class=\"ax5-ui-dialog {{theme}}\">" +
        		"\n            <div style=\"background: cadetblue;\" class=\"ax-dialog-header\">" +
        		"\n                {{{title}}}" +
        		"\n            </div>" +
        		"\n            <div class=\"ax-dialog-body\">" +
        		"\n                " +
        		"\n                {{#input}}" +
        		"\n                <div class=\"ax-dialog-prompt\">" +
        		"\n                    {{#@each}}" +
        		"\n                    <div class=\"form-group\">" +
        		"\n                    {{#@value.label}}" +
        		"\n                    <td><label>{{#_crlf}}{{{.}}}{{/_crlf}}</label></td>" +
        		"\n                    {{/@value.label}}" +
        		"\n                    <table><tbody><tr>" +
        		"\n                    <td><input type=\"{{@value.type}}\" placeholder=\"{{@value.placeholder}}\" class=\"form-control {{@value.theme}}\" data-dialog-prompt=\"{{@key}}\" style=\"width:100%;\" value=\"{{@value.value}}\" /></td>" +
        		"\n                    <td><select type=\"{{@value.type}}\" placeholder=\"{{@value.placeholder}}\" class=\"form-control {{@value.theme}}\" data-dialog-prompt=\"{{@value.key1}}\" style=\"width:100%;\" value=\"{{@value.value}}\" >" +
        		"\n                    		<option value='&&' lang='kr' data-deftext='AND'>AND</option>" +
        		"\n                    		<option value='||' lang='kr' data-deftext='OR'>OR</option></select></td>" +
        		"\n                    <td><select type=\"{{@value.type}}\" placeholder=\"{{@value.placeholder}}\" class=\"form-control {{@value.theme}}\" data-dialog-prompt=\"{{@value.key2}}\" style=\"width:100%;\" value=\"{{@value.value}}\" >" +
        		"\n                    		<option value='==' lang='kr' data-deftext='IN'>IN</option>" +
        		"\n                    		<option value='!=' lang='kr' data-deftext='NOT IN'>NOT IN</option></select></td>" +
        		"\n                    <td><button type=\"button\" data-dialog-btn=\"{{@value.btn}}\" class=\"btn btn-{{@value.theme}}\">찾기</button></td>" +
        		"\n                    </tr></tbody></table>" +
        		"\n                    </div>" +
        		"\n                    {{/@each}}" +
        		"\n                </div>" +
        		"\n                {{/input}}" +
        		"\n                " +
        		"\n                <div class=\"ax-dialog-buttons\">" +
        		"\n                    <div class=\"ax-button-wrap\">" +
        		"\n                    {{#btns}}" +
        		"\n                        <button type=\"button\" data-dialog-btn=\"ok\" class=\"btn btn-{{@value.theme}}\">적용</button>" +
        		"\n                        <button type=\"button\" data-dialog-btn=\"cancel\" class=\"btn btn-{{@value.theme}}\">초기화</button>" +
        		"\n                        <button type=\"button\" data-dialog-btn=\"close\" class=\"btn btn-{{@value.theme}}\">닫기</button>" +
        		"\n                    {{/btns}}" +
        		"\n                    </div>" +
        		"\n                </div>" +
        		"\n            </div>" +
        		"\n        </div>  " +
        		"\n        ";
    	return returnVal ;
    };

    //Translator용
    var dialogTrans = function(columnKeys) {
    	var returnVal = "\n        <div id=\"{{dialogId}}\" data-ax5-ui=\"dialog\" class=\"ax5-ui-dialog {{theme}}\">" +
		"\n            <div style=\"background: cadetblue;\" class=\"ax-dialog-header\">" +
		"\n                {{{title}}}" +
		"\n            </div>" +
		"\n            <div class=\"ax-dialog-body\">" +
		"\n                " +
		"\n                {{#input}}" +
		"\n                <div class=\"ax-dialog-prompt\">" +
		"\n                    {{#@each}}" +
		"\n                    <div class=\"form-group\">" +
		"\n                    {{#@value.labelSrcLang}}" +
		"\n                    <td><label>{{#_crlf}}{{{.}}}{{/_crlf}}</label></td>" +
		"\n                    {{/@value.labelSrcLang}}" +
		"\n                    <table style=\"width: 95%;\"><tbody><tr>" +
		"\n                    <td><select type=\"{{@value.type}}\" placeholder=\"{{@value.placeholder}}\" class=\"form-control {{@value.theme}}\" data-dialog-prompt=\"{{@value.keySrcLang}}\" id=\"{{@value.keySrcLang}}\" style=\"width:100%;\" value=\"{{@value.valueSrcLang}}\" >" +
		"\n                    		<option value='kr' lang='kr' data-deftext='kr'>한국어</option>" +
		"\n                    		<option value='en' lang='kr' data-deftext='en'>영어</option>" +
		"\n                    		<option value='cn' lang='kr' data-deftext='kr'>중국어</option>" +
		"\n                    		<option value='jp' lang='kr' data-deftext='jp'>일본어</option>" +
		"\n                    		<option value='vi' lang='kr' data-deftext='vi'>베트남어</option>" +
		"\n                    		<option value='id' lang='kr' data-deftext='id'>인도네시아어</option>" +
		"\n                    		<option value='ar' lang='kr' data-deftext='ar'>아랍어</option>" +
		"\n                    		<option value='de' lang='kr' data-deftext='de'>독일어</option>" +
		"\n                    		<option value='fr' lang='kr' data-deftext='fr'>프랑스어</option>" +
		"\n                    		<option value='it' lang='kr' data-deftext='it'>이탈리아어</option>" +
		"\n                    		<option value='ru' lang='kr' data-deftext='ru'>러시아어</option>" +
		"\n                    		<option value='th' lang='kr' data-deftext='th'>태국어</option>" +
		"\n                    		<option value='tr' lang='kr' data-deftext='tr'>터키어</option>" +
		"\n                    		<option value='nl' lang='kr' data-deftext='nl'>네덜란드어</option>" +
		"\n                    		<option value='pt' lang='kr' data-deftext='pt'>포르투갈어</option>" +
		"\n                    		<option value='ms' lang='kr' data-deftext='ms'>말레이시아어</option>" +
		"\n                    		<option value='hi' lang='kr' data-deftext='hi'>힌디어</option>" +
		"\n                    		<option value='bn' lang='kr' data-deftext='bn'>뱅갈어</option></select></td>" +
		"\n                    </tr></tbody></table>" +
		"\n                    </div>" +

		"\n                    <div class=\"form-group\">" +
		"\n                    {{#@value.labelTargetLang}}" +
		"\n                    <td><label>{{#_crlf}}{{{.}}}{{/_crlf}}</label></td>" +
		"\n                    {{/@value.labelTargetLang}}" +
		"\n                    <table style=\"width: 95%;\"><tbody><tr>" +
		"\n                    <td><select type=\"{{@value.type}}\" placeholder=\"{{@value.placeholder}}\" class=\"form-control {{@value.theme}}\" data-dialog-prompt=\"{{@value.keyTargetLang}}\" id=\"{{@value.keyTargetLang}}\" style=\"width:100%;\" value=\"{{@value.valueTargetLang}}\" >" +
		"\n                    		<option value='en' lang='kr' data-deftext='en'>영어</option>" +
		"\n                    		<option value='cn' lang='kr' data-deftext='kr'>중국어</option>" +
		"\n                    		<option value='jp' lang='kr' data-deftext='jp'>일본어</option>" +
		"\n                    		<option value='vi' lang='kr' data-deftext='vi'>베트남어</option>" +
		"\n                    		<option value='id' lang='kr' data-deftext='id'>인도네시아어</option>" +
		"\n                    		<option value='ar' lang='kr' data-deftext='ar'>아랍어</option>" +
		"\n                    		<option value='de' lang='kr' data-deftext='de'>독일어</option>" +
		"\n                    		<option value='fr' lang='kr' data-deftext='fr'>프랑스어</option>" +
		"\n                    		<option value='it' lang='kr' data-deftext='it'>이탈리아어</option>" +
		"\n                    		<option value='ru' lang='kr' data-deftext='ru'>러시아어</option>" +
		"\n                    		<option value='th' lang='kr' data-deftext='th'>태국어</option>" +
		"\n                    		<option value='tr' lang='kr' data-deftext='tr'>터키어</option>" +
		"\n                    		<option value='nl' lang='kr' data-deftext='nl'>네덜란드어</option>" +
		"\n                    		<option value='pt' lang='kr' data-deftext='pt'>포르투갈어</option>" +
		"\n                    		<option value='ms' lang='kr' data-deftext='ms'>말레이시아어</option>" +
		"\n                    		<option value='hi' lang='kr' data-deftext='hi'>힌디어</option>" +
		"\n                    		<option value='bn' lang='kr' data-deftext='bn'>뱅갈어</option>" +
		"\n                    		<option value='kr' lang='kr' data-deftext='cn'>한국어</option></select></td>" +
		"\n                    </tr></tbody></table>" +
		"\n                    </div>" +

		"\n                    <div class=\"form-group\">" +
		"\n                    {{#@value.labelSrcText}}" +
		"\n                    <td><label>{{#_crlf}}{{{.}}}{{/_crlf}}</label></td>" +
		"\n                    {{/@value.labelSrcText}}" +
		"\n                    <table style=\"width: 95%;\"><tbody><tr>" +
		"\n                    <td><input type=\"{{@value.type}}\" placeholder=\"{{@value.placeholder}}\" class=\"form-control {{@value.theme}}\" data-dialog-prompt=\"{{@value.keySrcText}}\" id=\"{{@value.keySrcText}}\" style=\"width:100%;\" value=\"{{@value.valueSrcText}}\" /></td>" +
		"\n                    </tr></tbody></table>" +
		"\n                    </div>" +


		"\n                    <div class=\"form-group\">" +
		"\n                    {{#@value.labelTargetText}}" +
		"\n                    <td><label>{{#_crlf}}{{{.}}}{{/_crlf}}</label></td>" +
		"\n                    {{/@value.labelTargetText}}" +
		"\n                    <table style=\"width: 95%;\"><tbody><tr>" +
		"\n                    <td><input type=\"{text}\" placeholder=\"{{@value.placeholder}}\" class=\"form-control {{@value.theme}}\" data-dialog-prompt=\"{{@value.keyTargetText}}\" id=\"{{@value.keyTargetText}}\" style=\"width:100%;\" value=\"{{@value.valueTargetText}}\" /></td>" +
		"\n                    </tr></tbody></table>" +
		"\n                    </div>" +

		"\n                    {{/@each}}" +
		"\n                </div>" +
		"\n                {{/input}}" +
		"\n                " +
		"\n                <div class=\"ax-dialog-buttons\">" +
		"\n                    <div class=\"ax-button-wrap\">" +
		"\n                    {{#btns}}" +
		"\n                        <button type=\"button\" data-dialog-btn=\"trans\" class=\"btn btn-{{@value.theme}}\">번역</button>" +
		"\n                        <button type=\"button\" data-dialog-btn=\"ok\" class=\"btn btn-{{@value.theme}}\">적용</button>" +
//		"\n                        <button type=\"button\" data-dialog-btn=\"cancel\" class=\"btn btn-{{@value.theme}}\">취소</button>" +
		"\n                        <button type=\"button\" data-dialog-btn=\"close\" class=\"btn btn-{{@value.theme}}\">닫기</button>" +
		"\n                    {{/btns}}" +
		"\n                    </div>" +
		"\n                </div>" +
		"\n            </div>" +
		"\n        </div>  " +
		"\n        ";
    	return returnVal ;
    };

    //STT용(Speech To Text)
    var dialogSTT = function(columnKeys) {
    	var returnVal = "\n        <div id=\"{{dialogId}}\" data-ax5-ui=\"dialog\" class=\"ax5-ui-dialog {{theme}}\">" +
		"\n            <div style=\"background: cadetblue;\" class=\"ax-dialog-header\">" +
		"\n                {{{title}}}" +
		"\n            </div>" +
		"\n            <div class=\"ax-dialog-body\">" +
		"\n                " +
		"\n                {{#input}}" +
		"\n                <div class=\"ax-dialog-prompt\">" +
		"\n                    {{#@each}}" +
		"\n                    <div class=\"form-group\">" +
		"\n                    {{#@value.labelSpeachLang}}" +
		"\n                    <td><label>{{#_crlf}}{{{.}}}{{/_crlf}}</label></td>" +
		"\n                    {{/@value.labelSpeachLang}}" +
		"\n                    <table style=\"width: 95%;\"><tbody><tr>" +
		"\n                    <td><select type=\"{{@value.type}}\" placeholder=\"{{@value.placeholder}}\" class=\"form-control {{@value.theme}}\" data-dialog-prompt=\"{{@value.keySpeachLang}}\" id=\"{{@value.keySpeachLang}}\" style=\"width:100%;\" value=\"{{@value.valueSrcLang}}\" >" +
		"\n                    		<option value='ko-KR' lang='kr' data-deftext='ko-KR'>한국어</option>" +
		"\n                    		<option value='en-US' lang='kr' data-deftext='en-US'>영어(미국)</option>" +
		"\n                    		<option value='en-GB' lang='kr' data-deftext='en-GB'>영어(영국)</option>" +
		"\n                    		<option value='zh-CN' lang='kr' data-deftext='zh-CN'>중국어(북경어)</option>" +
		"\n                    		<option value='zh-HK' lang='kr' data-deftext='zh-HK'>중국어(광둥어)</option>" +
		"\n                    		<option value='ja-JP' lang='kr' data-deftext='ja-JP'>일본어</option>" +
		"\n                    		<option value='de-DE' lang='kr' data-deftext='de-DE'>독일어</option>" +
		"\n                    		<option value='fr-FR' lang='kr' data-deftext='fr-FR'>프랑스어</option>" +
		"\n                    		<option value='it-IT' lang='kr' data-deftext='it-IT'>이탈리아어</option>" +
		"\n                    		<option value='ru-RU' lang='kr' data-deftext='ru-RU'>러시아어</option>" +
		"\n                    		<option value='th-TH' lang='kr' data-deftext='th-TH'>태국어</option>" +
		"\n                    		<option value='tr-TR' lang='kr' data-deftext='tr-TR'>터키어</option>" +
		"\n                    		<option value='nl-NL' lang='kr' data-deftext='nl-NL'>네덜란드어</option>" +
		"\n                    		<option value='pt-PT' lang='kr' data-deftext='pt-PT'>포르투갈어</option></select></td>" +
		"\n                    </tr></tbody></table>" +
		"\n                    </div>" +
		"\n                    <div class=\"form-group\">" +
		"\n                    {{#@value.labelSrcText}}" +
		"\n                    <td><label>{{#_crlf}}{{{.}}}{{/_crlf}}</label></td>" +
		"\n                    {{/@value.labelSrcText}}" +
		"\n                    <table style=\"width: 95%;height: 100px;\"><tbody><tr>" +
		"\n                    <td><textarea style=\"width: 100%;height: 100px;\" type=\"{{@value.type}}\" placeholder=\"{{@value.placeholder}}\" class=\"form-control {{@value.theme}}\" data-dialog-prompt=\"{{@value.keySpeachText}}\" id=\"{{@value.keySpeachText}}\" style=\"width:100%;\" >{{@value.valueSpeachText}}</textarea></td>" +
		"\n                    </tr></tbody></table>" +
		"\n                    </div>" +

		"\n                    {{/@each}}" +
		"\n                </div>" +
		"\n                {{/input}}" +
		"\n                " +
		"\n                <div class=\"ax-dialog-buttons\">" +
		"\n                    <div class=\"ax-button-wrap\">" +
		"\n                    {{#btns}}" +
//		"\n                        <button type=\"button\" data-dialog-btn=\"speach\" class=\"btn btn-{{@value.theme}}\">말하기</button>" +
		"\n                        <button type=\"button\" data-dialog-btn=\"addSpeach\" class=\"btn btn-{{@value.theme}}\">말하기</button>" +
		"\n                        <button type=\"button\" data-dialog-btn=\"ok\" class=\"btn btn-{{@value.theme}}\">적용</button>" +
		"\n                        <button type=\"button\" data-dialog-btn=\"close\" class=\"btn btn-{{@value.theme}}\">닫기</button>" +
		"\n                    {{/btns}}" +
		"\n                    </div>" +
		"\n                </div>" +
		"\n            </div>" +
		"\n        </div>  " +
		"\n        ";
    	return returnVal ;
    };
  //TTS용(Text To Speech)
    var dialogTTS = function(columnKeys) {
    	var returnVal = "\n        <div id=\"{{dialogId}}\" data-ax5-ui=\"dialog\" class=\"ax5-ui-dialog {{theme}}\">" +
		"\n            <div style=\"background: cadetblue;\" class=\"ax-dialog-header\">" +
		"\n                {{{title}}}" +
		"\n            </div>" +
		"\n            <div class=\"ax-dialog-body\">" +
		"\n                " +
		"\n                {{#input}}" +
		"\n                <div class=\"ax-dialog-prompt\">" +
		"\n                    {{#@each}}" +
		"\n                    <div class=\"form-group\">" +
		"\n                    {{#@value.labelSpeachLang}}" +
		"\n                    <td><label>{{#_crlf}}{{{.}}}{{/_crlf}}</label></td>" +
		"\n                    {{/@value.labelSpeachLang}}" +
		"\n                    <table style=\"width: 95%;\"><tbody><tr>" +
		"\n                    <td><select type=\"{{@value.type}}\" placeholder=\"{{@value.placeholder}}\" class=\"form-control {{@value.theme}}\" data-dialog-prompt=\"{{@value.keySpeachLang}}\" id=\"{{@value.keySpeachLang}}\" style=\"width:100%;\" value=\"{{@value.valueSrcLang}}\" >" +
		"\n                    		<option value='ko-KR' lang='kr' data-deftext='ko-KR'>한국어</option>" +
		"\n                    		<option value='en-US' lang='kr' data-deftext='en-US'>영어(미국)</option>" +
		"\n                    		<option value='en-GB' lang='kr' data-deftext='en-GB'>영어(영국)</option>" +
		"\n                    		<option value='zh-CN' lang='kr' data-deftext='zh-CN'>중국어(북경어)</option>" +
		"\n                    		<option value='zh-HK' lang='kr' data-deftext='zh-HK'>중국어(광둥어)</option>" +
		"\n                    		<option value='ja-JP' lang='kr' data-deftext='ja-JP'>일본어</option>" +
		"\n                    		<option value='de-DE' lang='kr' data-deftext='de-DE'>독일어</option>" +
		"\n                    		<option value='fr-FR' lang='kr' data-deftext='fr-FR'>프랑스어</option>" +
		"\n                    		<option value='it-IT' lang='kr' data-deftext='it-IT'>이탈리아어</option>" +
		"\n                    		<option value='ru-RU' lang='kr' data-deftext='ru-RU'>러시아어</option>" +
		"\n                    		<option value='th-TH' lang='kr' data-deftext='th-TH'>태국어</option>" +
		"\n                    		<option value='tr-TR' lang='kr' data-deftext='tr-TR'>터키어</option>" +
		"\n                    		<option value='nl-NL' lang='kr' data-deftext='nl-NL'>네덜란드어</option>" +
		"\n                    		<option value='pt-PT' lang='kr' data-deftext='pt-PT'>포르투갈어</option></select></td>" +
		"\n                    </tr></tbody></table>" +
		"\n                    </div>" +
		"\n                    <div class=\"form-group\">" +
		"\n                    {{#@value.labelSrcText}}" +
		"\n                    <td><label>{{#_crlf}}{{{.}}}{{/_crlf}}</label></td>" +
		"\n                    {{/@value.labelSrcText}}" +
		"\n                    <table style=\"width: 95%;height: 100px;\"><tbody><tr>" +
		"\n                    <td><textarea style=\"width: 100%;height: 100px;\" type=\"{{@value.type}}\" placeholder=\"{{@value.placeholder}}\" class=\"form-control {{@value.theme}}\" data-dialog-prompt=\"{{@value.keySpeachText}}\" id=\"{{@value.keySpeachText}}\" style=\"width:100%;\" >{{@value.valueSpeachText}}</textarea></td>" +
		"\n                    </tr></tbody></table>" +
		"\n                    </div>" +

		"\n                    {{/@each}}" +
		"\n                </div>" +
		"\n                {{/input}}" +
		"\n                " +
		"\n                <div class=\"ax-dialog-buttons\">" +
		"\n                    <div class=\"ax-button-wrap\">" +
		"\n                    {{#btns}}" +
		"\n                        <button type=\"button\" data-dialog-btn=\"addSpeach\" class=\"btn btn-{{@value.theme}}\">듣기</button>" +
		"\n                        <button type=\"button\" data-dialog-btn=\"close\" class=\"btn btn-{{@value.theme}}\">닫기</button>" +
		"\n                    {{/btns}}" +
		"\n                    </div>" +
		"\n                </div>" +
		"\n            </div>" +
		"\n        </div>  " +
		"\n        ";
    	return returnVal ;
    };
    //STT / TTS / Translator 용
    var dialogSpchTrans = function(columnKeys) {
    	var returnVal = "\n        <div id=\"{{dialogId}}\" data-ax5-ui=\"dialog\" class=\"ax5-ui-dialog {{theme}}\">" +
		"\n            <div style=\"background: cadetblue;\" class=\"ax-dialog-header\">" +
		"\n                {{{title}}}" +
		"\n            </div>" +
		"\n            <div class=\"ax-dialog-body\">" +
		"\n                " +
		"\n                {{#input}}" +
		"\n                <div class=\"ax-dialog-prompt\">" +
		"\n                    {{#@each}}" +
		"\n                    <div class=\"form-group\">" +
		"\n                    {{#@value.labelSrcLang}}" +
		"\n                    <td><label>{{#_crlf}}{{{.}}}{{/_crlf}}</label></td>" +
		"\n                    {{/@value.labelSrcLang}}" +
		"\n                    <table style=\"width: 95%;\"><tbody><tr>" +
		"\n                    <td><select style=\"width:95%;\" type=\"{{@value.type}}\" placeholder=\"{{@value.placeholder}}\" class=\"form-control {{@value.theme}}\" data-dialog-prompt=\"{{@value.keySrcLang}}\" id=\"{{@value.keySrcLang}}\" style=\"width:100%;\" value=\"{{@value.valueSrcLang}}\" >" +
		"\n                    		<option value='ko-KR' lang='kr' data-deftext='ko-KR'>한국어</option>" +
		"\n                    		<option value='en-US' lang='kr' data-deftext='en-US'>영어(미국)</option>" +
		"\n                    		<option value='en-GB' lang='kr' data-deftext='en-GB'>영어(영국)</option>" +
		"\n                    		<option value='zh-CN' lang='kr' data-deftext='zh-CN'>중국어(북경어)</option>" +
		"\n                    		<option value='zh-HK' lang='kr' data-deftext='zh-HK'>중국어(광둥어)</option>" +
		"\n                    		<option value='ja-JP' lang='kr' data-deftext='ja-JP'>일본어</option>" +
		"\n                    		<option value='de-DE' lang='kr' data-deftext='de-DE'>독일어</option>" +
		"\n                    		<option value='fr-FR' lang='kr' data-deftext='fr-FR'>프랑스어</option>" +
		"\n                    		<option value='it-IT' lang='kr' data-deftext='it-IT'>이탈리아어</option>" +
		"\n                    		<option value='ru-RU' lang='kr' data-deftext='ru-RU'>러시아어</option>" +
		"\n                    		<option value='th-TH' lang='kr' data-deftext='th-TH'>태국어</option>" +
		"\n                    		<option value='tr-TR' lang='kr' data-deftext='tr-TR'>터키어</option>" +
		"\n                    		<option value='nl-NL' lang='kr' data-deftext='nl-NL'>네덜란드어</option>" +
		"\n                    		<option value='pt-PT' lang='kr' data-deftext='pt-PT'>포르투갈어</option></select></td>" +
		"\n                    <td><button type=\"button\" data-dialog-btn=\"srcSpeach\" class=\"btn btn-{{@value.theme}}\">말하기</button></td>" +
		"\n                    <td><button type=\"button\" data-dialog-btn=\"srcListen\" class=\"btn btn-{{@value.theme}}\">듣기</button></td>" +
		"\n                    <td><button type=\"button\" data-dialog-btn=\"srcTrans\" class=\"btn btn-{{@value.theme}}\">번역</button></td>" +
		"\n                    <td><button type=\"button\" data-dialog-btn=\"srcOk\" class=\"btn btn-{{@value.theme}}\">적용</button></td>" +
		"\n                    </tr></tbody></table>" +
		"\n                    </div>" +

		"\n                    <div class=\"form-group\">" +
		"\n                    {{#@value.labelSrcText}}" +
		"\n                    <td><label>{{#_crlf}}{{{.}}}{{/_crlf}}</label></td>" +
		"\n                    {{/@value.labelSrcText}}" +
		"\n                    <table style=\"width: 95%;\"><tbody><tr>" +
		"\n                    <td><textarea style=\"width: 100%;height: 100px;\" class=\"form-control {{@value.theme}}\" data-dialog-prompt=\"{{@value.keySrcText}}\" id=\"{{@value.keySrcText}}\" style=\"width:100%;\" >{{@value.valueSrcText}}</textarea></td>" +
		"\n                    </tr></tbody></table>" +
		"\n                    </div>" +


		"\n                    <div class=\"form-group\">" +
		"\n                    {{#@value.labelTargetLang}}" +
		"\n                    <td><label>{{#_crlf}}{{{.}}}{{/_crlf}}</label></td>" +
		"\n                    {{/@value.labelTargetLang}}" +
		"\n                    <table style=\"width: 95%;\"><tbody><tr>" +
		"\n                    <td><select style=\"width:95%;\" type=\"{{@value.type}}\" placeholder=\"{{@value.placeholder}}\" class=\"form-control {{@value.theme}}\" data-dialog-prompt=\"{{@value.keyTargetLang}}\" id=\"{{@value.keyTargetLang}}\" style=\"width:100%;\" value=\"{{@value.valueTargetLang}}\" >" +
		"\n                    		<option value='ko-KR' lang='kr' data-deftext='ko-KR'>한국어</option>" +
		"\n                    		<option value='en-US' lang='kr' data-deftext='en-US'>영어(미국)</option>" +
		"\n                    		<option value='en-GB' lang='kr' data-deftext='en-GB'>영어(영국)</option>" +
		"\n                    		<option value='zh-CN' lang='kr' data-deftext='zh-CN'>중국어(북경어)</option>" +
		"\n                    		<option value='zh-HK' lang='kr' data-deftext='zh-HK'>중국어(광둥어)</option>" +
		"\n                    		<option value='ja-JP' lang='kr' data-deftext='ja-JP'>일본어</option>" +
		"\n                    		<option value='de-DE' lang='kr' data-deftext='de-DE'>독일어</option>" +
		"\n                    		<option value='fr-FR' lang='kr' data-deftext='fr-FR'>프랑스어</option>" +
		"\n                    		<option value='it-IT' lang='kr' data-deftext='it-IT'>이탈리아어</option>" +
		"\n                    		<option value='ru-RU' lang='kr' data-deftext='ru-RU'>러시아어</option>" +
		"\n                    		<option value='th-TH' lang='kr' data-deftext='th-TH'>태국어</option>" +
		"\n                    		<option value='tr-TR' lang='kr' data-deftext='tr-TR'>터키어</option>" +
		"\n                    		<option value='nl-NL' lang='kr' data-deftext='nl-NL'>네덜란드어</option>" +
		"\n                    		<option value='pt-PT' lang='kr' data-deftext='pt-PT'>포르투갈어</option></select></td>" +
		"\n                    <td><button type=\"button\" data-dialog-btn=\"targetSpeach\" class=\"btn btn-{{@value.theme}}\">말하기</button></td>" +
		"\n                    <td><button type=\"button\" data-dialog-btn=\"targetListen\" class=\"btn btn-{{@value.theme}}\">듣기</button></td>" +
		"\n                    <td><button type=\"button\" data-dialog-btn=\"targetTrans\" class=\"btn btn-{{@value.theme}}\">번역</button></td>" +
		"\n                    <td><button type=\"button\" data-dialog-btn=\"targetOk\" class=\"btn btn-{{@value.theme}}\">적용</button></td>" +
		"\n                    </tr></tbody></table>" +
		"\n                    </div>" +

		"\n                    <div class=\"form-group\">" +
		"\n                    {{#@value.labelTargetText}}" +
		"\n                    <td><label>{{#_crlf}}{{{.}}}{{/_crlf}}</label></td>" +
		"\n                    {{/@value.labelTargetText}}" +
		"\n                    <table style=\"width: 95%;\"><tbody><tr>" +
//		"\n                    <td><input type=\"{text}\" placeholder=\"{{@value.placeholder}}\" class=\"form-control {{@value.theme}}\" data-dialog-prompt=\"{{@value.keyTargetText}}\" id=\"{{@value.keyTargetText}}\" style=\"width:100%;\" value=\"{{@value.valueTargetText}}\" /></td>" +
		"\n                    <td><textarea style=\"width: 100%;height: 100px;\" class=\"form-control {{@value.theme}}\" data-dialog-prompt=\"{{@value.keyTargetText}}\" id=\"{{@value.keyTargetText}}\" style=\"width:100%;\" >{{@value.valueTargetText}}</textarea></td>" +
		"\n                    </tr></tbody></table>" +
		"\n                    </div>" +

		"\n                    {{/@each}}" +
		"\n                </div>" +
		"\n                {{/input}}" +
		"\n                " +
		"\n                <div class=\"ax-dialog-buttons\">" +
		"\n                    <div class=\"ax-button-wrap\">" +
		"\n                    {{#btns}}" +
		"\n                        <button type=\"button\" data-dialog-btn=\"close\" class=\"btn btn-{{@value.theme}}\">닫기</button>" +
		"\n                    {{/btns}}" +
		"\n                    </div>" +
		"\n                </div>" +
		"\n            </div>" +
		"\n        </div>  " +
		"\n        ";
    	return returnVal ;
    };
    //WebSocket용
    var dialogWebSocket = function(columnKeys) {
    	var returnVal = "\n        <div id=\"{{dialogId}}\" data-ax5-ui=\"dialog\" class=\"ax5-ui-dialog {{theme}}\">" +
		"\n            <div style=\"background: #875fa0;\" class=\"ax-dialog-header\">" +
		"\n                {{{title}}}" +
		"\n            </div>" +
		"\n            <div class=\"ax-dialog-body\">" +
		"\n                " +
		"\n                {{#input}}" +
		"\n                <div class=\"ax-dialog-prompt\">" +
		"\n                    {{#@each}}" +
		"\n                    <div class=\"form-group\">" +
		"\n                    {{#@value.labelWebSocket}}" +
		"\n                    <td><label>{{#_crlf}}{{{.}}}{{/_crlf}}</label></td>" +
		"\n                    {{/@value.labelWebSocket}}" +
		"\n                    <table style=\"width: 95%;height: 100px;\"><tbody><tr>" +
		"\n                    <td><textarea style=\"width: 100%;height: 100px;\" type=\"{{@value.type}}\" placeholder=\"{{@value.placeholder}}\" class=\"form-control {{@value.theme}}\" data-dialog-prompt=\"{{@value.keyWebSocket}}\" id=\"{{@value.keyWebSocket}}\" style=\"width:100%;\" >{{@value.valueWebSocket}}</textarea></td>" +
		"\n                    </tr></tbody></table>" +
		"\n                    </div>" +

		"\n                    {{/@each}}" +
		"\n                </div>" +
		"\n                {{/input}}" +
		"\n                " +
		"\n                <div class=\"ax-dialog-buttons\">" +
		"\n                    <div class=\"ax-button-wrap\">" +
		"\n                    {{#btns}}" +
		"\n                        <button type=\"button\" data-dialog-btn=\"ok\" class=\"btn btn-{{@value.theme}}\">확인</button>" +
		"\n                        <button type=\"button\" data-dialog-btn=\"close\" class=\"btn btn-{{@value.theme}}\">닫기</button>" +
		"\n                    {{/btns}}" +
		"\n                    </div>" +
		"\n                </div>" +
		"\n            </div>" +
		"\n        </div>  " +
		"\n        ";
    	return returnVal ;
    };
    //조회공통
    var dialogRtrvCond = function(columnKeys) {
    	var returnVal = "\n        <div id=\"{{dialogId}}\" data-ax5-ui=\"dialog\" class=\"ax5-ui-dialog {{theme}}\">" +
		"\n            <div style=\"background: cadetblue;\" class=\"ax-dialog-header\">" +
		"\n                {{{title}}}" +
		"\n            </div>" +
		"\n            <div class=\"ax-dialog-body\">" +
		"\n                " +
		"\n                {{#input}}" +
		"\n                <div class=\"ax-dialog-prompt\">" +
		"\n                    {{#@each}}" +
		"\n                    <div class=\"form-group\">" +
		"\n                    {{#@value.labelSpeachLang}}" +
		"\n                    <td><label>{{#_crlf}}{{{.}}}{{/_crlf}}</label></td>" +
		"\n                    {{/@value.labelSpeachLang}}" +
		"\n                    <table style=\"width: 95%;\"><tbody><tr>" +
		"\n                    <td><select type=\"{{@value.type}}\" placeholder=\"{{@value.placeholder}}\" class=\"form-control {{@value.theme}}\" data-dialog-prompt=\"{{@value.keySpeachLang}}\" id=\"{{@value.keySpeachLang}}\" style=\"width:100%;\" value=\"{{@value.valueSrcLang}}\" >" +
		"\n                    		<option value='ko-KR' lang='kr' data-deftext='ko-KR'>한국어</option>" +
		"\n                    		<option value='en-US' lang='kr' data-deftext='en-US'>영어(미국)</option>" +
		"\n                    		<option value='en-GB' lang='kr' data-deftext='en-GB'>영어(영국)</option>" +
		"\n                    		<option value='zh-CN' lang='kr' data-deftext='zh-CN'>중국어(북경어)</option>" +
		"\n                    		<option value='zh-HK' lang='kr' data-deftext='zh-HK'>중국어(광둥어)</option>" +
		"\n                    		<option value='ja-JP' lang='kr' data-deftext='ja-JP'>일본어</option>" +
		"\n                    		<option value='de-DE' lang='kr' data-deftext='de-DE'>독일어</option>" +
		"\n                    		<option value='fr-FR' lang='kr' data-deftext='fr-FR'>프랑스어</option>" +
		"\n                    		<option value='it-IT' lang='kr' data-deftext='it-IT'>이탈리아어</option>" +
		"\n                    		<option value='ru-RU' lang='kr' data-deftext='ru-RU'>러시아어</option>" +
		"\n                    		<option value='th-TH' lang='kr' data-deftext='th-TH'>태국어</option>" +
		"\n                    		<option value='tr-TR' lang='kr' data-deftext='tr-TR'>터키어</option>" +
		"\n                    		<option value='nl-NL' lang='kr' data-deftext='nl-NL'>네덜란드어</option>" +
		"\n                    		<option value='pt-PT' lang='kr' data-deftext='pt-PT'>포르투갈어</option></select></td>" +
		"\n                    </tr></tbody></table>" +
		"\n                    </div>" +
		"\n                    <div class=\"form-group\">" +
		"\n                    {{#@value.labelSrcText}}" +
		"\n                    <td><label>{{#_crlf}}{{{.}}}{{/_crlf}}</label></td>" +
		"\n                    {{/@value.labelSrcText}}" +
		"\n                    <table style=\"width: 95%;height: 100px;\"><tbody><tr>" +
		"\n                    <td><textarea style=\"width: 100%;height: 100px;\" type=\"{{@value.type}}\" placeholder=\"{{@value.placeholder}}\" class=\"form-control {{@value.theme}}\" data-dialog-prompt=\"{{@value.keySpeachText}}\" id=\"{{@value.keySpeachText}}\" style=\"width:100%;\" >{{@value.valueSpeachText}}</textarea></td>" +
		"\n                    </tr></tbody></table>" +
		"\n                    </div>" +

		"\n                    {{/@each}}" +
		"\n                </div>" +
		"\n                {{/input}}" +
		"\n                " +
		"\n                <div class=\"ax-dialog-buttons\">" +
		"\n                    <div class=\"ax-button-wrap\">" +
		"\n                    {{#btns}}" +
		"\n                        <button type=\"button\" data-dialog-btn=\"addRetrieve\" class=\"btn btn-{{@value.theme}}\">조회</button>" +
		"\n                        <button type=\"button\" data-dialog-btn=\"close\" class=\"btn btn-{{@value.theme}}\">닫기</button>" +
		"\n                    {{/btns}}" +
		"\n                    </div>" +
		"\n                </div>" +
		"\n            </div>" +
		"\n        </div>  " +
		"\n        ";
    	return returnVal ;
    };
    //일반
    var dialogDisplay = function(columnKeys) {
        return `
        <div id="{{dialogId}}" data-dialog-els="root" class="ax5-ui-dialog {{theme}}">
            <div class="ax-dialog-header" data-dialog-els="header">
                {{{title}}}
            </div>
            <div class="ax-dialog-body" data-dialog-els="body">
                <div class="ax-dialog-msg">{{{msg}}}</div>

                {{#input}}
                <div class="ax-dialog-prompt">
                    {{#@each}}
                    <div class="form-group">
                    {{#@value.label}}
                    <label>{{#_crlf}}{{{.}}}{{/_crlf}}</label>
                    {{/@value.label}}
                    <input type="{{@value.type}}" placeholder="{{@value.placeholder}}" class="form-control {{@value.theme}}" data-dialog-prompt="{{@key}}" style="width:100%;" value="{{@value.value}}" />
                    {{#@value.help}}
                    <p class="help-block">{{#_crlf}}{{.}}{{/_crlf}}</p>
                    {{/@value.help}}
                    </div>
                    {{/@each}}
                </div>
                {{/input}}

                <div class="ax-dialog-buttons" data-dialog-els="buttons">
                    <div class="ax-button-wrap">
                    {{#btns}}
                        {{#@each}}
                        <button type="button" data-dialog-btn="{{@key}}" class="btn btn-{{@value.theme}}">{{@value.label}}</button>
                        {{/@each}}
                    {{/btns}}
                    </div>
                </div>

                {{#additionalContent}}
                <div data-dialog-els="additional-content">{{{.}}}</div>
                {{/additionalContent}}
            </div>
        </div>
        `;
    };

    DIALOG.tmpl = {
            "dialogDisplay": dialogDisplay,
            "dialogFilter": dialogFilter,
            "dialogTrans": dialogTrans,
            "dialogSTT": dialogSTT,
            "dialogTTS": dialogTTS,
            "dialogWebSocket": dialogWebSocket,
            "dialogRtrvCond": dialogRtrvCond,
            "dialogSpchTrans": dialogSpchTrans,
        get: function get(tmplName, data, columnKeys) {
            return ax5.mustache.render(DIALOG.tmpl[tmplName].call(this, columnKeys), data);
        }
    };
})();