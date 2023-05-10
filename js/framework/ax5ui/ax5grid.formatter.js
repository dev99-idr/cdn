"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
        return typeof obj;
    } : function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };

//ax5.ui.grid.formatter
(function () {

    var GRID = ax5.ui.grid,
        U = ax5.util;

    var money = function () {
        return U.number(this.value, {"money": true});
    };

    var date = function (col) {
        if (col) {
            var self = this;
            var config = col.formatter.config ?col.formatter.config
            				:(col.editor||{}).config ? col.editor.config : col.config;

        	var format = config? config.format :  "yymmdd";
        	var parse = config? config.parse :  "yymmdd";
        	var formatVal = "";

        	var strDate = this.value ;
    	    var y = strDate.substr(0, 4);
    	    var m = strDate.substr(4, 2);
    	    var d = strDate.substr(6, 2);
        	var newDate =  new Date(y,m-1,d);

        	try{
        		if(this.value != null)
//        			formatVal = $.datepicker.formatDate(format, $.datepicker.parseDate(parse, newDate));		//new Date().toJSON().substring(0,10)
        			formatVal = $.datepicker.formatDate(format, $.datepicker.parseDate(parse, this.value));		//new Date().toJSON().substring(0,10)
        	}catch(e){
        		formatVal = "";
        	}

            return formatVal;

        } else {
            return this.value;
        }
    };

    var select = function (col) {
        if (col) {
            var self = this;
            var config = (col.editor||{}).config? col.editor.config : col.config;
            config = (col.formatter||{}).config? col.formatter.config: config;

            var key = col.formatter instanceof String || typeof(col.formatter.key) == "undefined"
                ? config.columnKeys.optionText : col.formatter.key;
            var options = config.options;
            var codeKey = config.columnKeys.optionValue;

            try {
                if (options instanceof DataSet) {
                    return options.findRow(codeKey, this.value).get(key);
                } else if (options instanceof Array) {
                    return options.find(function (row) {
                        if (row[codeKey] == self.value) return row
                    })[key];
                }
            } catch (e) {
                return "";
            }

            return this.value;

        } else {
            return this.value;
        }
    };

    var imageButton = function () {
        return this.value;
    };

    var button = function () {
        return this.value;
    };

    var textarea = function (col) {
        var formatter = col.formatter || {};
        var imageUri = gv_ContextPath + "/images/common/btn_search.png";
        var str = this.value == null ? "" : (this.value + "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        var $div = [];

        $div.push("<div style='width:100%; height:100%; position: relative; display:block; overflow:hidden'>");
        $div.push(str);
        $div.push("<img src='" + imageUri + "' style=' position: absolute; top:0; right:0;'/>");
        $div.push("</div>");

        return $div.join("");
    };

    var textButton = function (col) {
//        var formatter = col.formatter || {};
//        var imageUri = gv_ContextPath + "/images/common/btn_search.png";
//        var str = this.value == null ? "" : (this.value + "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
//        var $div = [];
//
//        if (formatter.images)
//            imageUri = formatter.images;
//
//        $div.push("<div style='width:100%; height:100%; position: relative; display:block; overflow:hidden'>");
//        $div.push(str);
//        $div.push("<img src='" + imageUri + "' style=' position: absolute; top:0; right:0;' data-extend-event='true'/>");
//        $div.push("</div>");
//
//        return $div.join("");

        return this.value;
    };

    var iconButton = function (col) {
//        var formatter = col.formatter || {};
//        var imageUri = gv_ContextPath + "/images/common/btn_search.png";
//        var str = this.value == null ? "" : (this.value + "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
//        var $div = [];
//
//        if (formatter.images)
//            imageUri = formatter.images;
//
//        $div.push("<div style='width:100%; height:100%; position: relative; display:block; overflow:hidden'>");
//        $div.push(str);
//        $div.push("<img src='" + imageUri + "' style=' position: absolute; top:0; right:0;' data-extend-event='true'/>");
//        $div.push("</div>");
//
//        return $div.join("");

        return this.value;
    };

    var attchButton = function (col) {
        var formatter = col.formatter || {};
//        var imageUri = (this.value == "") ? gv_ContextPath + "/images/common/attch_icon.png" : gv_ContextPath + "/images/common/icon_file.png";
        var imageUri = (this.item.fileCnt == "") ? "<a><i class='fas fa-paperclip' data-extend-event='true' style='font-size:1.5em; margin-top: 3px;'></i></a>"
        		: "<a><i class='far fa-save' data-extend-event='true' style='font-size:1.5em; margin-top: 3px;'></i></a>";	// 파일 갯수에 따라 아이콘 변경
        var str = this.value == null ? "" : (this.value + "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        var $div = [];

        if (formatter.images)
            imageUri = formatter.images;

        $div.push("<div style='width:100%; height:100%; position: relative; display:block; overflow:hidden'>");
//        $div.push(str);
//        $div.push("<img src='" + imageUri + "' data-extend-event='true' style='margin-top:4px; cursor:pointer;'/>");
        $div.push(imageUri);
        $div.push("</div>");

        return $div.join("");
    };

    var dateRender = function(col){
    	var $div = [];
        //var imageUri = gv_ContextPath + "/images/common/bar1-1.gif";
    	var str = this.value == null ? "" : (this.value + "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
         if(this.value=="")
         {
        	 $div.join = this.value;
         }
         else
         {
             $div.push("<div style=\"border:0;background:url('/images/common/bar1-2.gif') no-repeat;background-size:100% 17px;\"><font style=font-size:7.7pt>");
             $div.push(str);
             $div.push("</div>");
             return $div.join("");

         }


    }

    GRID.formatter = {
        money: money,
        date: date,
        select: select,
        imageButton: imageButton,
        button: button,
        //textarea: textarea, TODO: 미완성
        textButton: textButton,
        iconButton: iconButton,
        attchButton: attchButton,
        dateRender : dateRender
    };
})();

//formatter
//버튼
//이미지 버튼
//텍스트 & 버튼