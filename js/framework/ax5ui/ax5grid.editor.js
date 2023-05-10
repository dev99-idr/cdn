"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
        return typeof obj;
    } : function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };

// ax5.ui.grid.inlineEditor
(function () {

    var GRID = ax5.ui.grid;

    var edit_text = {
            useReturnToSave: true,
            editMode: "popup",
            getHtml: function getHtml(_root, _columnKey, _editor, _value) {
                if (typeof _editor.attributes !== "undefined") {
                    var attributesText = "";
                    for (var k in _editor.attributes) {
                        attributesText += " " + k + "='" + _editor.attributes[k] + "'";
                    }
                }
                return "<input type=\"text\" data-ax5grid-editor=\"text\" value=\"" + _value + "\" " + attributesText + "; ime-mode:auto>";
            },
            init: function init(_root, _columnKey, _editor, _$parent, _value) {
                var $el;
                _$parent.append($el = jQuery(this.getHtml(_root, _columnKey, _editor, _value)));
                this.bindUI(_root, _columnKey, $el, _editor, _$parent, _value);
                $el.on("blur", function () {
                    GRID.body.inlineEdit.deActive.call(_root, "RETURN", _columnKey);
                });
                return $el;
            },
            bindUI: function bindUI(_root, _columnKey, _$el, _editor, _$parent, _value) {
              _$el.select();
//              _$el.focus().select();
            }
        };

    var edit_money = {
        useReturnToSave: true,
        editMode: "popup",
        getHtml: function getHtml(_root, _columnKey, _editor, _value) {
            var attributesText = "";
            if (typeof _editor.attributes !== "undefined") {
                for (var k in _editor.attributes) {
                    attributesText += " " + k + "='" + _editor.attributes[k] + "'";
                }
            }
            return '<input type="text" numberOnly data-ax5grid-editor="money" value="' + _value + '" ' + attributesText + '" />';
        },
        init: function init(_root, _columnKey, _editor, _$parent, _value) {
            var $el;
            _$parent.append($el = jQuery(this.getHtml(_root, _columnKey, _editor, _value)));
            this.bindUI(_root, _columnKey, $el, _editor, _$parent, _value);
            $el.on("blur", function () {
                GRID.body.inlineEdit.deActive.call(_root, "RETURN", _columnKey);
            });
            return $el;
        },
        bindUI: function bindUI(_root, _columnKey, _$el, _editor, _$parent, _value) {
            _$el.data("binded-ax5ui", "ax5formater");
            _$el.ax5formatter({
                pattern: "money"
            });
            _$el.select();
//            _$el.focus().select();
        }
    };

    var edit_number = {
        useReturnToSave: true,
        editMode: "popup",
        getHtml: function getHtml(_root, _columnKey, _editor, _value) {
            var attributesText = "";
            if (typeof _editor.attributes !== "undefined") {
                for (var k in _editor.attributes) {
                    attributesText += " " + k + "='" + _editor.attributes[k] + "'";
                }
            }
            return '<input type="text" numberOnly data-ax5grid-editor="number" value="' + _value + '" ' + attributesText + '" />';
        },
        init: function init(_root, _columnKey, _editor, _$parent, _value) {
            var $el;
            _$parent.append($el = jQuery(this.getHtml(_root, _columnKey, _editor, _value)));
            this.bindUI(_root, _columnKey, $el, _editor, _$parent, _value);
            $el.on("blur", function () {
                GRID.body.inlineEdit.deActive.call(_root, "RETURN", _columnKey);
            });
            return $el;
        },
        bindUI: function bindUI(_root, _columnKey, _$el, _editor, _$parent, _value) {
            _$el.data("binded-ax5ui", "ax5formater");
            _$el.ax5formatter({
                pattern: "number"
            });
//            _$el.focus().select();
            _$el.select();
        }
    };

    var edit_date = {
        useReturnToSave: true,
        editMode: "popup",
        getHtml: function getHtml(_root, _columnKey, _editor, _value) {
            var attributesText = "";
            if (typeof _editor.attributes !== "undefined") {
                for (var k in _editor.attributes) {
                    attributesText += " " + k + "='" + _editor.attributes[k] + "'";
                }
            }
            return '<input type="text" numberOnly data-ax5grid-editor="calendar" value="' + _value + '" ' + attributesText + '" />';
        },
        init: function init(_root, _columnKey, _editor, _$parent, _value) {
            var $el;
            _$parent.append($el = jQuery(this.getHtml(_root, _columnKey, _editor, _value)));
            this.bindUI(_root, _columnKey, $el, _editor, _$parent, _value);
            $el.instance = this;
            return $el;
        },
        bindUI: function bindUI(_root, _columnKey, _$el, _editor, _$parent, _value) {
            var self = _root;
            var cell = _columnKey.replace(/(\d*)_(\d*)_(\d*)/, "$3_$2");
            var col = _root.bodyRowMap[cell];
            var config = this.config = (col.editor||{}).config? col.editor.config : col.config;
            var type = config.pikcerType? config.pikcerType :  "date";
            var pickerConfig = {};
            var pickerParse = "yy-mm-dd";
        	var parse = config.parse? config.parse :  "yymmdd";

        	if(type == "year"){
        		pickerConfig = {mode: "year"};
        		pickerParse = "yy";
        	}else if(type == "month"){
        		pickerConfig =  {mode: "year", selectMode: "month"};
        		pickerParse = "yy-mm";
        	}

        	_value = (_value||"").length == 0 ? new Date(): $.datepicker.parseDate(parse, _value);
        	var formatVal = $.datepicker.formatDate(pickerParse, _value);

        	_$el.val(formatVal);
            _$el.data("binded-ax5ui", "ax5picker");
            _$el.ax5picker({
                direction: "auto",
                content: {
                    type: 'date',
                    config: pickerConfig
                },
                onStateChanged: function onStateChanged() {
                    if (this.state == "open") {
                        this.self.activePicker.attr("data-ax5grid-inline-edit-picker", "date");
                    } else if (this.state == "close") {
                    	formatVal = $.datepicker.formatDate(parse, $.datepicker.parseDate(pickerParse, _$el.val()));
                    	_$el.val(formatVal);
                        GRID.body.inlineEdit.deActive.call(self, "RETURN", _columnKey);
                    }
                }
            });
            _$el.select();
//            _$el.focus().select();
//            _$el.find("a").focus();
        },
        getValue: function getValue(_el) {
        	var _$el = $(_el);
        	var config = this.config;
        	var parse = config.parse? config.parse :  "yymmdd";
            var type = config.pikcerType? config.pikcerType :  "data";
            var pickerConfig = {};
            var pickerParse = "yy-mm-dd";

        	if(type == "year"){
        		pickerParse = "yy";
        	}else if(type == "month"){
        		pickerParse = "yy-mm";
        	}

        	var formatVal = $.datepicker.formatDate(parse, $.datepicker.parseDate(pickerParse, _$el.val()));
            _$el.ax5picker("setValue", formatVal);
            return formatVal;
        }
    };

    var edit_select = {
        useReturnToSave: false,
        editMode: "popup",
        getHtml: function getHtml(_root, _columnKey, _editor, _value) {
            var po = [];
            po.push('<div data-ax5select="ax5grid-editor" data-ax5select-config="{}">');
            po.push('</div>');

            return po.join('');
        },
        init: function init(_root, _columnKey, _editor, _$parent, _value) {
            var $el;
            _$parent.append($el = jQuery(this.getHtml(_root, _columnKey, _editor, _value)));
            this.bindUI(_root, _columnKey, $el, _editor, _$parent, _value);
            return $el;
        },
        bindUI: function bindUI(_root, _columnKey, _$el, _editor, _$parent, _value) {
            var eConfig = {
                columnKeys: {
                    optionValue: "value",
                    optionText: "text",
                    optionSelected: "selected"
                }
            };
            var cell = _columnKey.replace(/(\d*)_(\d*)_(\d*)/, "$3_$2");
            var col = _root.bodyRowMap[cell];
            var config = (col.editor||{}).config? col.editor.config : col.config;

            if (config.options instanceof Array) {
                jQuery.extend(true, eConfig, config);
            } else if (config.options instanceof DataSet) {
                jQuery.extend(true, eConfig, {
                    columnKeys: config.columnKeys,
                    options: config.options.getViewAll(false)
                });
            }

            eConfig.options.forEach(function (n) {
                if (n[eConfig.columnKeys.optionValue] == _value) n[eConfig.columnKeys.optionSelected] = true;
            });

            var self = _root;
            _$el.data("binded-ax5ui", "ax5select");
            _$el.ax5select({
                direction: "auto",
                columnKeys: eConfig.columnKeys,
                options: eConfig.options,
                onStateChanged: function onStateChanged() {
                    if (this.state == "open") {
                        this.self.activeSelectOptionGroup.attr("data-ax5grid-inline-edit-picker", "select");
                    } else if (this.state == "changeValue") {
                        GRID.body.inlineEdit.deActive.call(self, "RETURN", _columnKey, this.value[0][eConfig.columnKeys.optionValue]);
                    } else if (this.state == "close") {
                        GRID.body.inlineEdit.deActive.call(self, "ESC", _columnKey);
                    }
                }
            });
            _$el.ax5select("open");
            _$el.ax5select("setValue", _value);
            _$el.focus().select();
            _$el.find("a").focus();
        }
    };

    var edit_checkbox = {
        editMode: "inline",
        getHtml: function getHtml(_root, _editor, _value) {

            var lineHeight = _root.config.body.columnHeight - _root.config.body.columnPadding * 2 - _root.config.body.columnBorderWidth;
            var checked;
            if (_editor.config && _editor.config.trueValue) {
                checked = _value == _editor.config.trueValue ? "true" : "false";
            } else {
                checked = _value == false || _value == "false" || _value < "1" ? "false" : "true";
            }

            var eConfig = {
                marginTop: 2,
                height: lineHeight - 4
            };
            jQuery.extend(true, eConfig, _editor.config);
            eConfig.marginTop = (lineHeight - eConfig.height) / 2;

            return '<div data-ax5grid-editor="checkbox" data-ax5grid-checked="' + checked + '" style="height:' + eConfig.height + 'px;width:' + eConfig.height + 'px;margin-top:' + eConfig.marginTop + 'px;"></div>';
        }
    };

    var edit_textarea = {
        useReturnToSave: true,
        editMode: "popup",
        getHtml: function getHtml(_root, _columnKey, _editor, _value) {
        	var inputStr = [];
        	/*inputStr.push("<div style='width:100%; height:100%; position: relative; display:block; overflow:hidden'>");
        	inputStr.push("<textarea type=text class='editor-text' style='width:100%;height:100%;overflow:hidden'></textarea>");
        	inputStr.push("<img src='" + gv_ContextPath + "/images/xui/btn_pencil.png' style='width:16px; height:16px; position: absolute; top:0; right:0;'/>");
        	inputStr.push("</div>");*/
        	inputStr.push('<div class="input-group" id="pickerTarget">');
        	inputStr.push('<input type="text" class="form-control" style="width:40px;" placeholder="" />');
        	inputStr.push('<span class="input-group-addon"><i class="fa fa-calendar-o"></i></span>');
        	inputStr.push('</div>');
            return inputStr.join("");
        },
        init: function init(_root, _columnKey, _editor, _$parent, _value) {
            var $el;
            _$parent.empty();
            _$parent.append($el = jQuery(this.getHtml(_root, _columnKey, _editor, _value)));
            this.bindUI(_root, _columnKey, $el, _editor, _$parent, _value);
            return $el;
        },
        bindUI: function bindUI(_root, _columnKey, _$el, _editor, _$parent, _value) {
        	var picker = new ax5.ui.picker();
        	picker.bind({
        	    target: _$el,
        	    direction: "top",
        	    contentWidth: 200,
        	    content: function (callback) {
        	        var html = ''
        	                + 'picker contents'
        	                + '<div style="padding: 10px;">'
        	                + '<button class="btn btn-default">FN 1</button>'
        	                + '</div>'
        	            ;
        	        callback(html);
        	    },
                onStateChanged: function onStateChanged() {
                    if (this.state == "open") {

                    } else if (this.state == "changeValue") {
                        GRID.body.inlineEdit.deActive.call(self, "RETURN", _columnKey, _value);
                    } else if (this.state == "close") {
                        GRID.body.inlineEdit.deActive.call(self, "ESC", _columnKey);
                    }
                }
        	});
           /* _$el.ax5select("open");
            _$el.ax5select("setValue", _value);*/
            _$el.find("input").focus();
        }
    };

    var edit_radio = {
        editMode: "inline",
        getHtml: function getHtml(_root, _editor, _value) {


            return "";
        }
    };

    GRID.inlineEditor = {
        "text": edit_text,
        "money": edit_money,
        "number": edit_number,
        "date": edit_date,
        "select": edit_select,
        "checkbox": edit_checkbox,	//데이터 옵션
        //"textarea": edit_textarea,	TODO: 이벤트 처리 방법 고려, 그리드에서 에디터 종료 이벤트 주지 않음.//edit_textarea,	//텍스트박스
        "radio": edit_radio	//향후 추가
    };
})();