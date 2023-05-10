/**
 * jQuery Multi-Language Plugin
 *
 * This plugin provides multi language support across all common browsers and
 * does not require a page reload. It can be used to change simple text
 * containers content (i.e. <span>, <p>, <div>, ...) as well as input values
 * (i.e. type is button or submit) and placeholder (i.e. type is email, password
 * or text) and title attribues of any tag.
 *
 * Please see the source page on how to use this.
 *
 * Changelog:
 *  - Added support for title attribute and input types email and password
 *
 * Source: http://www.isogenicengine.com/documentation/jquery-multi-language-site-plugin/
**/


function fn_MlangSet() {
	//다국어 적용을 위한 사전 작업
	window.lang = new jquery_lang_js();
	$().ready(function () {
		window.lang.run();
	});
	gf_Trace('mlang=>'+gf_GetCookie("loclCd"));
	window.lang.change(gf_GetCookie("loclCd"));
}

var IgeEventsLite = function () {}

IgeEventsLite.prototype.on = function (evtName, fn) {
	if (evtName && fn) {
		this.eventList[evtName] = this.eventList[evtName] || [];
		this.eventList[evtName].push(fn);
	}
}

IgeEventsLite.prototype.emit = function (evtName) {
	if (evtName) {
		this.eventList = this.eventList || [];
		var args = [];
		for (var i = 1; i < arguments.length; i++) {
			args.push(arguments[i]);
		}
		if (evtName) {
			var fnList = this.eventList[evtName];
			for (var i in fnList) {
				if (typeof fnList[i] == 'function') {
					fnList[i].apply(this, args);
				}
			}
		}
	}
}

var jquery_lang_js = function () {
	this.events = new IgeEventsLite();

	this.on = this.events.on;
	this.emit = this.events.emit;

	return this;
}

/*var langs = {"문서번호" : "doc_no", "결재유형" : "sign type"};
$("body *").each(function(i, ele){
	var key = $(ele).text();
	if(typeof(langs[key]) != "undefined") $(ele).text(langs[key]);
});*/

jquery_lang_js.prototype.lang = {};
jquery_lang_js.prototype.defaultLang = 'kr';
jquery_lang_js.prototype.currentLang = 'kr';

jquery_lang_js.prototype.run = function () {


	$("body *").each(function(i, ele){
		/*if (ele.tagName == 'HTML' || ele.tagName == 'TABLE' || ele.tagName == 'TR' ||
		    ele.tagName == 'CENTER' || ele.tagName == 'TBODY' || ele.tagName == 'BR' ||
		    ele.tagName == 'HEAD' || ele.tagName == 'TITLE' || ele.tagName == 'STYLE' ||
		    ele.tagName == 'SCRIPT' || ele.tagName == 'DIV' || ele.tagName == 'SELECT' ||
		    ele.tagName == 'FORM'){
		}
		else {
			$(ele).attr('lang', 'kr');
		}*/

		//$(ele).filter(":only-child").attr('lang','kr');
		// 모든 input type text 개체에 더블클릭시 초기화 시키는 이벤트 강제 삽입
		if ( $(ele).children().length == 0 && ele.tagName != "OBJECT" && ele.tagName != "PARAM" ) {
			if($(ele))
			$(ele).attr('lang','kr');
		}
	});

	$("#searchForm input[type='text']").bind("dblclick", function () {
		$(this).val('');
		}
	);

	var langElems = $('[lang]');
	var langElems = $("body *");
	var elemsLength = langElems.length;

	while (elemsLength--) {
		var elem = langElems[elemsLength];
		var elemType = elem.tagName;
		if(elemType!='HTML'){
			var langElem = $(elem);
			if (langElem.attr('lang') == this.defaultLang) {
				var titleText = langElem.attr('title');
				if (titleText || langElem.is("input")) {
					if (titleText) {
						langElem.attr('data-deftexttitle', titleText);
					}
					if (langElem.is("input")) {
						// An input element
						switch (langElem.attr('type')) {
							case 'button':
							case 'submit':
								langElem.attr('data-deftext', langElem.val());
							break;

							case 'email':
							case 'password':
							case 'text':
								// Check for a placeholder text value
								var plText = langElem.attr('placeholder');
								if (plText) {
									langElem.attr('data-deftext', plText);
								}
							break;
						}
					}
				} else {
					if($("#viewWrap").find(langElem).size() > 0)
						continue;
					// Not an input element
					if(langElem.attr("id") != "main")
						langElem.attr('data-deftext', langElem.clone().html());
				}
			}
		}
	}
	this.change(this.currentLang);

	// Now that the language system is setup, check
	// if there is a default language and switch to it
	/*if (localStorage) {

		var lsLang = localStorage.getItem('langJs_currentLang');
		console.log('lsLang->'+lsLang);
		if (lsLang) {
			this.change(lsLang);
		}
	}*/
}

jquery_lang_js.prototype.loadPack = function (packPath) {
	$('<script type="text/javascript" charset="utf-8" src="' + packPath + '" />').appendTo("head");
}

jquery_lang_js.prototype.change = function (lang) {
	if (this.currentLang != lang) { this.update(lang); }
	this.currentLang = lang;

	// Get the page HTML
	var langElems = $('[lang]');
	if (lang != this.defaultLang) {

		if (this.lang[lang]) {

			var elemsLength = langElems.length;
			while (elemsLength--) {

				var elem = langElems[elemsLength];

				var langElem = $(elem);

				if (langElem.attr('data-deftexttitle')) {
					if (langElem.attr('title')) {
						// Check for a title attribute
						var currentText = langElem.attr('title');
						var defaultLangText = langElem.attr('data-deftexttitle').removeNewLine().trim();

						var newText = typeof(this.lang[lang][defaultLangText]) != "undefined"? typeof(this.lang[lang][defaultLangText]) : currentText;
						var newHtml = currentText.replace(currentText, newText);
						langElem.attr('title', newHtml);
						if (currentText != newHtml) {
							langElem.attr('lang', lang);
						}
					}
				}

				if (langElem.attr('data-deftext')) {
					if (langElem.is("input")) {
						// An input element
						switch (langElem.attr('type')) {
							case 'button':
							case 'submit':
								// A button or submit, change the value attribute
								var currentText = langElem.val();
								var defaultLangText = langElem.attr('data-deftext').removeNewLine().trim();
								var newText = this.lang[lang][defaultLangText] || currentText;

								var newHtml = currentText.replace(currentText, newText);
								langElem.val(newHtml);


								if (currentText != newHtml) {
									langElem.attr('lang', lang);
								}
							break;

							case 'email':
							case 'password':
							case 'text':
								// Check for a placeholder text value
								var currentText = langElem.attr('placeholder');
								var defaultLangText = langElem.attr('data-deftext').removeNewLine().trim();

								var newText = this.lang[lang][defaultLangText] || currentText;
								var newHtml = currentText.replace(currentText, newText);
								langElem.attr('placeholder', newHtml);

								if (currentText != newHtml) {
									langElem.attr('lang', lang);
								}
							break;
						}
					} else {
						// Not an input element
						var currentText = langElem.clone().html();
						var defaultLangText = langElem.attr('data-deftext').removeNewLine().trim();
                        var newText = this.lang[lang][defaultLangText] || currentText;
						var newHtml = currentText.replace(currentText, newText);
						//console.log('new html->'+newHtml);
						langElem.html(newHtml);

						if (currentText != newHtml) {
							langElem.attr('lang', lang);
						}
					}
				} else {
					//console.log('No language data for element... have you executed .run() first?');
				}
			}
		} else {
			//console.log('Cannot switch language, no language pack defined for "' + lang + '"');
		}
	} else {
		// Restore the deftext data
		langElems.each(function () {
			var langElem = $(this);
			if (langElem.attr('data-deftexttitle')) {
				// handle title attribute
				if (langElem.attr('title')) {
					langElem.attr('title', langElem.attr('data-deftexttitle'));
				}
			}
			if (langElem.attr('data-deftext')) {
				if (langElem.is("input")) {
					// An input element
					switch (langElem.attr('type')) {
						case 'button':
						case 'submit':
							langElem.val(langElem.attr('data-deftext'));
						break;

						case 'email':
						case 'password':
						case 'text':
							// Check for a placeholder text value
							langElem.attr('placeholder', langElem.attr('data-deftext'));
						break;
					}
				} else {
					langElem.html(langElem.attr('data-deftext'));
				}
			}
		});
	}

//	gf_GetMlangText();
}

jquery_lang_js.prototype.convert = function (text, lang) {
	if (lang) {
		if (lang != this.defaultLang) {
			return this.lang[lang][text];
		} else {
			return text;
		}
	} else {
		if (this.currentLang != this.defaultLang) {
			return this.lang[this.currentLang][text];
		} else {
			return text;
		}
	}
}

jquery_lang_js.prototype.update = function (lang) {
	if (localStorage) {
		localStorage.setItem('langJs_currentLang', lang);
	}
	this.emit('update', lang);
}

function gf_GetMlangText(){


	var ds_LabelDatas = new DataSet(["progId", "sysCd", "mlangId", "loclCd", "mlangNm", "mlangExpl", "useYn"]);
	var $dataDeftexts = $("[data-deftext&='']");

	var size = $dataDeftexts.size();
	var progId = location.pathname;
	var list = [];

	for(var i = 0 ; i < size; i++){
		var $dataDeftext = $($dataDeftexts[i]);
		var text = $dataDeftext.attr("data-deftext");
		var obj;

		if(text.search(/^[&][^; ]*;$/g) > -1)
			continue;

		if(ds_LabelDatas.find("mlangId", text) > -1)
			continue;

		obj = {
				progId: progId ,
				sysCd: "csg",
				mlangId: text,
				loclCd: "en_US",
				mlangNm: text,
				mlangExpl:  text,
				useYn: "Y"
		};
		ds_LabelDatas.add(obj);
	}
	list = ds_LabelDatas.getAll();
	ds_LabelDatas.clear();

	list.sort(function(perv,next){
		var pervFirstChar = perv.mlangId.charCodeAt(0);
		var nextFirstChar = next.mlangId.charCodeAt(0);
		return pervFirstChar - nextFirstChar;
	});

	for(var i = 0 ; i < list.length ; i++){
		var obj = list[i];
		ds_LabelDatas.add(obj);

		obj.loclCd = "ko_KR";
		ds_LabelDatas.add(obj);
	}

	progId = progId.substring(progId.lastIndexOf("/")+1, progId.lastIndexOf("."));

	//console.table(ds_LabelDatas.getAll());
	//ds_LabelDatas.saveAs("excel", progId);

	var params = {};
	var dataSets = {
			ds_LabelDatas : ds_LabelDatas.getAllData("A")
	};

	gf_Transaction("MSG_FORM", "/sys/sysMgmt/mlangCd/saveMlangCdConv.xpl", params, dataSets, "", true);

	ds_LabelDatas.clear();
}


