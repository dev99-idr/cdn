var AxFileUpload = {

};

var accepts = {
	"*" : "*",
	images: "image/*",
	pdf: "application/pdf",
	zip: "application/zip,application/x-zip,application/x-zip-compressed",
	doc: "application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	xls: "application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	ppt: "application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
};

var acceptExts = {
	"*" : "",
	images: "jpg|jpe|jpeg|png|bmp",
	pdf: "pdf",
	zip: "zip",
	doc: "doc|docx",
	xls: "xls|xlsx",
	ppt: "ppt|pptx"
};
var exclude = "js|exe|jsp|java";

AxFileUpload = function(id, options){
	var _this = this;
	var _id = this.id = "upload_" + (new Date()).getTime();
	var _rootElm = this.rootElm = $(id);
	var _options = this.options = null;
	var _defaultOptions = this.defaultOptions = {
			policy : "default",
			multiple: true,
			fileAtchId: "",
			width: "100%",
			height: 100,
			mode: "UPLOAD",
			template: "template1",
			retrieveUrl : gv_ContextPath + '/file/retrieveWebFileList.xpl',
			uploadUrl : gv_ContextPath + '/file/uploadWebFile.xpl',
			progId : "",
			atchGrp : "",
			atchFIleSeq : "",
			docclsCd: "",
			isSaveBtn: false,
			isAdd:true,
			isCancel:true,
			isDelete:true,
			isDownload:true,
			proxyAddBtn: null,
			fileType: "*",
			mdlYn:false,
			mdlDocno:"",
			sysCode:"",
			endDir:"",
			successSave: null,
			onAdd:null,
			beforeAdd:null
	};
	var _dataset = this.dataset = new DataSet(["fileAtchId", "fileId", "ecmNo", "sysCd", "filePath", "fileNm", "fileSize", "fstRegDt", "fstRegUserId", "siteCd"]);
	var _dsDesc = this.dsDesc = new DataSet();
	var _files = this.files = [];

	this.grid = null;
	this.multiple = false;
	this.fileType = "*";
	this.fileAtchId = "";
	this.policy = "";
	this.uploadUrl = "";
	this.retrieveUrl = "";
	this.mdlYn = false;
	this.mdlDocno = "";
	this.sysCode = "";
	this.endDir = "";
	this.maxSize = "";

	// 기본정보를 설정한다.
	_options = this.options = $.extend(_defaultOptions, options||{});

	this.multiple = _options.multiple;
	this.policy = _options.policy;
	this.fileAtchId = _options.fileAtchId;
	this.uploadUrl = _options.uploadUrl;
	this.retrieveUrl = _options.retrieveUrl;
	this.mdlYn = _options.mdlYn;
	this.mdlDocno = _options.mdlDocno;
	this.sysCode = _options.sysCode;
	this.endDir = _options.endDir;
	//this.fileType = accepts[_options.fileType];
	this.accepts = this.fileType = _options.fileType;

	var fileTypes = this.fileType.split(",");
	for(var i = 0 ; i < fileTypes.length; i++)
		fileTypes[i] = accepts[fileTypes[i]];
	this.accepts = fileTypes.join(",");


	// 컴퍼넌트 형태를 설정한다.
	_rootElm.css({
		position: "relative",
		clear: "both"
	});

	this.templates[_options.template].call(this, _rootElm);

	//버튼생성
	if(_options.mode == "UPLOAD"){
		if(_options.isAdd)	$("<a href='#' class='button-light'>").attr("id", "add_" + _id).text("파일추가").appendTo(_rootElm.find(".btn_layer"));
		if(_options.isDelete)	$("<a href='#' class='button-light'>").attr("id", "del_" + _id).text("파일삭제").appendTo(_rootElm.find(".btn_layer"));
		if(_options.isCancel)	$("<a href='#' class='button-light'>").attr("id", "cancel_" + _id).text("초기화").appendTo(_rootElm.find(".btn_layer"));
		if(_options.isDownload)	$("<a href='#' class='button-light'>").attr("id", "download_" + _id).text("다운로드").appendTo(_rootElm.find(".btn_layer"));
		if(_options.isSaveBtn)
			$("<a href='#' class='button-light'>").attr("id", "save_" + _id).text("저장").appendTo(_rootElm.find(".btn_layer"));


	}else if(_options.mode == "DOWNLOAD"){
		$("<a href='#' class='button-light'>").attr("id", "download_" + _id).text("다운로드").appendTo(_rootElm.find(".btn_layer"));
	}else if(_options.mode == "VIEW"){

	}

	//테스트
	_rootElm.find(".file_layer").append("<input type='file'  name='file' id='fileElm' style='width:100%; height:100%; padding:0;' accept='" + this.accepts + "'>");
	if(this.multiple)
		_rootElm.find(".file_layer input[name='file']:last").attr("multiple", true);

	//파일그리드를 생성함
	var gridBox = $("<div>").attr({
					"id": "grid_" + _id,
					"data-ax5grid": "grid_" + _id,
					"data-ax5grid-config": "{ showLineNumber: true, showRowSelector: true, autowidth:true, sortable: false, header: {align:'center'} }"
				})
				.css({width:_options.width, height: _options.height})
				.appendTo(_rootElm.find(".grid_layer"));

	this.grid = new ax5.ui.grid({
		target: gridBox,
        fixedWidth: true,
		columns: [
			{key: "fileNm", label: gf_FindLang('파일명'), width: 80, sortable: true},
			{key: "fileSize", label: gf_FindLang("크기 (KB)"), width: 40, align: "right", sortable: true},
			{key: "fstRegUserId", name: gf_FindLang('등록자'), width: 50, align: "center", sortable: true},
			{key: "fstRegDt", label: gf_FindLang('등록일자'), width: 40, align: "center", sortable: true}
		]
	});
	//this._checkRender();

	// 드래그 레이어를 생성한다.
	$("<div class='drop-layer'>파일을 올려주세요</div>").css({
		position: "absolute",
		display: "block",
		width: "100%",
		height: "100%",
		top: "0px",
		left: "0px",
		textAlign: "center",
		verticalAlign: "middle",
		padding: "auto",
		lineHeight: _rootElm.height() + "px",
		zIndex: "10000",
		backgroundColor: "#Fddfdf",
		opacity: "0.4",
		fontSize: "50px",
		fontWeight: "bold"
	}).hide().appendTo(_rootElm);

	//이벤트 처리
	if(_options.mode == "UPLOAD"){
		_rootElm.on("dragenter", this._handlerProxy("_dragenterHandler"));
		_rootElm.on("dragover", this._handlerProxy("_dragoverHandler"));
		_rootElm.find(".drop-layer").on("dragleave", this._handlerProxy("_dragleaveHandler"));
		_rootElm.on("drop", this._handlerProxy("_dropHandler"));
		//_rootElm.on("dragexit", this._handlerProxy("_dragexitHandler"));
		//_rootElm.on("dragover", this._handlerProxy("_dragoverHandler"));

		$("#add_" + _id).on("click", function(e){ e.preventDefault(); }); //this._handlerProxy("_addHandler"));
		$("#del_" + _id).on("click", this._handlerProxy("_delHandler"));
		$("#cancel_" + _id).on("click", this._handlerProxy("_cancelHandler"));
		$("#download_" + _id).on("click", this._handlerProxy("_downloadHandler"));
		$("#save_" + _id).on("click", this._handlerProxy("_saveHandler"));

	/*	$("#add_" + _id).on("mousemove", function(e){
			var file_layer = _rootElm.find(".file_layer");
			var base = _rootElm.offset();
			file_layer.css({top:e.clientY- base.top, left:e.clientX-base.left});
		});*/


		//_rootElm.on("focus", "input[name='file']", this._handlerProxy("_fileFocusHandler"));
		_rootElm.on("change", "input[name='file']", this._handlerProxy("_fileChangeHandler"));

	}else if(_options.mode == "DOWNLOAD"){
		$("#download_" + _id).on("click", this._handlerProxy("_downloadHandler"));
	}

	if(_options.proxyAddBtn)
		this.setProxyAddBtn(_options.proxyAddBtn);

	if(this.fileAtchId != "")
		this.setFileAtchId(this.fileAtchId);

	/*gf_Transaction("RETRIEVE_MAX_FILESIZE", "/sys/common/file/retrieveMaxFileSize.xpl", {policy: this.policy}, {}, function(strSvcId, obj, resultData){
		  // transaction determines whether the normal processing.
		  if (!gf_ChkTransaction(strSvcId, resultData, true )) {
			  return;
		  }

		  switch(strSvcId) {
		  	case "RETRIEVE_MAX_FILESIZE" :
		  		_this.maxSize = resultData.maxSize == null ? "" : resultData.maxSize[0].value;
				break;
		  }
	}, true);*/
	$(window).trigger("resize");
};

AxFileUpload.prototype.templates = {
	template1: function(rootElm){
		var that = this;
		$("<form style='position:absolute; display: block; overflow: hidden;'>").addClass("file_layer").appendTo(rootElm); //width:0; height:0;
		$("<div style='float:right;'>").addClass("btn_layer").appendTo(rootElm);
		$("<div style='clear:both;'>").addClass("grid_layer").appendTo(rootElm);

		$(window).on("resize", function(){
			if(that.options.proxyAddBtn || !that.options.isAdd)
				return;

			if(that.rootElm.find(".file_layer").size() < 1)
				return;

			var base = that.rootElm.offset();
			var btnOffset = $("#add_" + that.id).offset();
			that.rootElm.find(".file_layer").css({
				top:btnOffset.top- base.top,
				left:btnOffset.left-base.left,
				width: $("#add_" + that.id).outerWidth(),
				height: $("#add_" + that.id).outerHeight(),
				opacity : 0.01
			});
		});
	},
	template2: function(rootElm){
		$("<form style='display: block;'>").addClass("file_layer").appendTo(rootElm); //width:0; height:0;
		$("<div style='display:none;'>").addClass("btn_layer").appendTo(rootElm);
		$("<div style='display:none;'>").addClass("grid_layer").appendTo(rootElm);

		$(window).on("resize", function(){

		});
	},
	template3: function(rootElm){
		var that = this;
		rootElm.css({display: "inline-block"});
		$("<form style='position:absolute;display: block; overflow: hidden;'>").addClass("file_layer").appendTo(rootElm); //width:0; height:0;
		$("<div>").addClass("btn_layer").appendTo(rootElm);
		$("<div style='display:none;'>").addClass("grid_layer").appendTo(rootElm);

		this.options.isAdd = true;
		this.options.isDelete = false;
		this.options.isCancel = false;
		this.options.isDownload = false;

		$(window).on("resize", function(){
			if(that.options.proxyAddBtn || !that.options.isAdd)
				return;

			if(that.rootElm.find(".file_layer").size() < 1)
				return;

			var base = that.rootElm.offset();
			var btnOffset = $("#add_" + that.id).offset();
			that.rootElm.find(".file_layer").css({
				top:btnOffset.top- base.top,
				left:btnOffset.left-base.left,
				width: $("#add_" + that.id).outerWidth(),
				height: $("#add_" + that.id).outerHeight(),
				opacity : 0.01
			});
		});
	},
	template4: function(rootElm){
		var that = this;
		rootElm.css({display: "inline-block"});
		$("<form style='position:absolute;display: block; overflow: hidden;'>").addClass("file_layer").appendTo(rootElm); //width:0; height:0;
		$("<div>").addClass("btn_layer").appendTo(rootElm);
		$("<div style='display:none;'>").addClass("grid_layer").appendTo(rootElm);

		$(window).on("resize", function(){
			if(that.options.proxyAddBtn || !that.options.isAdd)
				return;

			if(that.rootElm.find(".file_layer").size() < 1)
				return;

			var base = that.rootElm.offset();
			var btnOffset = $("#add_" + that.id).offset();
			that.rootElm.find(".file_layer").css({
				top:btnOffset.top- base.top,
				left:btnOffset.left-base.left,
				width: $("#add_" + that.id).outerWidth(),
				height: $("#add_" + that.id).outerHeight(),
				opacity : 0.01
			});
		});
	}
};

AxFileUpload.prototype.setFileType = function(type){
	this.accepts = this.fileType = type; //accepts[type];

	var fileTypes = this.fileType.split(",");
	for(var i = 0 ; i < fileTypes.length; i++)
		fileTypes[i] = accepts[fileTypes[i]];
	this.accepts = fileTypes.join(",");

	this.rootElm.find(".file_layer input[name='file']").attr("accept", this.accepts);
};

AxFileUpload.prototype.getFileAtchId = function(){
	return this.fileAtchId;
};

AxFileUpload.prototype.setFileAtchId = function(fileAtchId, async){
	this.fileAtchId = fileAtchId||"";
	this.retrieveFile(async);
};

AxFileUpload.prototype.reset = function(){
	this.dataset.reset();
	this.rootElm.find(".file_layer input[name='file']").remove();
	this.rootElm.find(".file_layer").append("<input type='file'  name='file' id='fileElm' style='width:100%; height:100%; padding:0;' accept='" + this.accepts + "'>");
	if(this.multiple)
		this.rootElm.find(".file_layer input[name='file']:last").attr("multiple", true);
	this.files = [];
};

AxFileUpload.prototype.setProxyAddBtn = function(btn){
	this.options.proxyAddBtn = btn;
	var that = this;
	//향후 추가
	if(btn){
		$("#add_" + this.id).hide();
	}else{
		$("#add_" + this.id).show();
	}

	var resize = function(){
		if(!btn)
			return;

		var base = that.rootElm.offset();
		var btnOffset = btn.offset();
		that.rootElm.find(".file_layer").css({
			top:btnOffset.top- base.top,
			left:btnOffset.left-base.left,
			width: btn.outerWidth(),
			height: btn.outerHeight(),
			opacity : 0.01
		});
	};

	$(window).on("resize", resize);
	resize();
};

AxFileUpload.prototype.getGrid = function(){
	return this.grid;
};

AxFileUpload.prototype.getDataSet = function(){
	return this.dataset;
};

AxFileUpload.prototype.fileCount = function(){
	return this.dataset.size();
};
AxFileUpload.prototype.setSaveCallback = function(successSave){
	 this.options.successSave = successSave;
};
AxFileUpload.prototype.setOnAdd = function(onAdd){
	 this.options.onAdd = onAdd;
};
AxFileUpload.prototype.setBeforeAdd = function(beforeAdd){
	 this.options.beforeAdd = beforeAdd;
};


AxFileUpload.prototype.retrieveFile = function(async){
	async = typeof(async) == "undefined"? true: async;
	var fileAtchId = this.fileAtchId;
	var retrieveUrl = this.retrieveUrl;
	if(fileAtchId == null || fileAtchId == ""){
		this.reset();
		this.dataset.clear();
		return;
	}

    $.ajax({
    	type: "post",
    	url: retrieveUrl+"?fileAtchId="+fileAtchId,
    	data: {},
		datatype: "json",
		headers: {
	        Accept : "application/json+core; charset=utf-8",
	        "Content-Type": "application/json+core; charset=utf-8"
	    },
		success: this._handlerProxy("_retrieveSuccessHandler"),
		error: this._handlerProxy("_retrieveErrorHandler"),
	    async : async
	});
};

AxFileUpload.prototype._checkRender = function(){
};

AxFileUpload.prototype.showProgress = function(){
	var $progressLayer = this.rootElm.find(".progress-layer");
	if($progressLayer.size() == 0){
		$progressLayer = $("<div class='progress-layer'>").css({
			position: "absolute",
			display: "block",
			width: "100%",
			height: "100%",
			top: "0px",
			left: "0px",
			textAlign: "center",
			verticalAlign: "middle",
			padding: "auto",
			lineHeight:  this.rootElm.height() + "px",
			zIndex: "10000",
			backgroundColor: "#Fddfdf",
			opacity: "0.4",
			fontSize: "50px",
			fontWeight: "bold"
		}).hide().appendTo( this.rootElm);

		$("<span class=\"progress-label\" ></span>").appendTo($progressLayer);

		$progressLayer.progressbar({
	        value: false,
	        change: function () {
	        	$progressLayer.find(".progress-label").text("Uploading Files " + $progressLayer.progressbar("value") + "%");
	        },
	        complete: function () {
	            //progressLabel.text( " );
	        }
	    });
	}

	var $progressLabel = this.rootElm.find(".progress-label");
	var width = $progressLayer.width();
	var height = $progressLayer.height();
	$progressLabel.css({
		position: "absolute",
		"font-size" : (width * 0.8) / 15 ,
		"line-height" : (height / 2) + "px",
		width: width * 0.8,
		height: height / 2,
		top: (height / 4),
		left: (width * 0.1)
	});
	if($progressLabel.width() < 100)
		$progressLabel.hide();

	$progressLayer.progressbar("option", "value", false).show();


};

AxFileUpload.prototype.hideProgress = function(){
	var $progressLayer = this.rootElm.find(".progress-layer");
	$progressLayer.hide();
};

AxFileUpload.prototype.setProgress = function(total, val){
	var percent = Math.round(val / total * 100);
	var $progressLayer = this.rootElm.find(".progress-layer");
	//$progressLayer.text( percent + "%");

	$progressLayer.progressbar("option", {
        value: percent
    });
};

AxFileUpload.prototype.isUpdate = function(){
	return this.dataset.isUpdate();
};

// 파일업로드 및 파일 삭제 작업을 진행함.
AxFileUpload.prototype.saveFile = function(type){
	var fileObj = this.rootElm.find(".file_layer input[name='file']:last")[0];
	var dataset = this.dataset;
	var files = this.files;
	var fileAtchId = this.fileAtchId;
	var policy = this.policy;


	if(!dataset.isUpdate()){
		gf_AlertMsg('co.err.noChange');
		return false;
	}

	if(typeof(fileObj.files) != "undefined" ){
		//다중업로드를 지원하는 경우


	    // 멀티파트를 지원하는 FormData를 생성함.
	    var formData = new FormData();

	    //리절트 타입을 설정함.
	    if(typeof(type) != "undefined")
	    	formData.append("type", type);

	    // 업로드할 파일 객체를 추가함
	    for (var i = 0; i < files.length; i++) {
	        formData.append("file", files[i]);
	    }

	    // 파일묶음 ID를 설정함
	   formData.append("fileAtchId", fileAtchId);
	   // 파일저장 환경을 설정함
	   formData.append("policy", policy);

	    var deleteIds = [];
	    var updateList = dataset.getAllData("U");
	    for(var i = 0 ; i < updateList.length; i++){
	    	if(updateList[i].rowStatus == "DELETE")
	    		deleteIds[deleteIds.length] = updateList[i].fileId;
	    }
	    if(deleteIds.length > 0){
	    	formData.append("deleteFileIds", deleteIds.join(","));
	    }

	    this.showProgress();

	    var xhr = new XMLHttpRequest();

	    // Set up events
	    //xhr.addEventListener('loadstart', onloadstartHandler, false);
	    xhr.upload.addEventListener('progress', this._handlerProxy("_progressHandler"), false);
	    //xhr.addEventListener('load', onloadHandler, false);
	    xhr.addEventListener('loadend', this._handlerProxy("_successHandler"), false);
	    //xhr.addEventListener('readystatechange', onreadystatechangeHandler, false);

	    // Set up request
	    xhr.open('POST', this.uploadUrl, true);

	    // Fire!
	    xhr.send(formData);
	}else{
		var form = this.rootElm.find(".file_layer");
		var fileElm = this.rootElm.find(".file_layer input[name='file']");
		var fileUploaderFrame = null;
		var formName = "form"+this.id;
		var fileUploaderName = "frame"+this.id;
		var callbackName = "callback"+this.id;
		var uploadUrl = this.uploadUrl;
		if( this.rootElm.find("iframe[name='" + fileUploaderName + "']").size() == 0) //가상의 iframe을 생성함
			$("<iframe style='height:0; width:0;'>").attr("name", fileUploaderName).appendTo(this.rootElm);

		//fileUploaderFrame = this.rootElm.find("iframe[name='" + fileUploaderName + "']");

	  /*  if (fileElm.size() < 2) {
	        gf_Trace("업로드할 파일이 없습니다.");
	        return false;
	    }*/

	    if(!AxFileUpload[callbackName])
	    	AxFileUpload[callbackName] = this._handlerProxy("_successHandler");

	    uploadUrl += "?type=frame";
	    uploadUrl += "&fileAtchId=" + fileAtchId;
	    uploadUrl += "&policy=" + policy;
	    uploadUrl += "&callback="+ encodeURIComponent("AxFileUpload."+callbackName);
	    form.attr({
	    	name: formName,
	    	action: uploadUrl,
	    	method:'post',
	    	enctype: "multipart/form-data",
	    	target: fileUploaderName
	    });

	    this.rootElm.find(".file_layer input[name='file']:last").remove();
	    form.submit();
	}
};


AxFileUpload.prototype.existFile = function(fileInfos){
	var dataset = this.dataset;
    for (var i = 0; i < fileInfos.length; i++) {
        for (var j = 0; j < dataset.size(); j++) {
            if (dataset.get(i, "fileNm") == fileInfos[i].fileNm) {
                return true; // duplicate
            }
        }
    }
    return false; // non duplicate
};

AxFileUpload.prototype.existFileNm = function(fileInfos){
	var dataset = this.dataset;
    for (var i = 0; i < fileInfos.length; i++) {
        for (var j = 0; j < dataset.size(); j++) {
            if (dataset.get(i, "fileNm") == fileInfos[i].fileNm) {
                return fileInfos[i].fileNm; // duplicate
            }
        }
    }
    return ""; // non duplicate
};

AxFileUpload.prototype.markFileInfos = function(files){
	var fileInfos = [];

	if( typeof(files) == "string"){
		//다중파일 선택 지원하지 않는 브라우저
		var fileNm = files.substr(files.lastIndexOf("/")+1);
        fileInfos.push({
            "fileAtchId": this.fileAtchId,
            "fileId": "",
            "sysCd": "",
            "filePath": "",
            "fileNm": fileNm,
            "fileSize": 0
        });
	}else{
		//다중파일 선택 지원하는 브라우저
	    for (var i = 0; i < files.length; i++) {
	        fileInfos.push({
	            "fileAtchId": this.fileAtchId,
	            "fileId": "",
	            "sysCd": "",
	            "filePath": "",
	            "fileNm": files[i].name,
	            "fileSize": parseInt(files[i].size / 1024).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")		// KB단위로 변환 후 , 삽입
	        });
	    }

	}

    return fileInfos;
    //gds_Test() ;
};
AxFileUpload.prototype.deleteFile = function(fileNm){

	var fileObj = this.rootElm.find(".file_layer input[name='file']:last")[0];
	if(typeof(fileObj.files) != "undefined" ){
		//다중파일 선택 지원하는 브라우저

		//새로 추가될 파일이라면
        for (var i = 0; i < this.files.length; i++) {
            if (fileNm == this.files[i].name) {
            	this.files.remove(i);	//저장된 파일Item을 삭제
            	this.dataset.remove( this.dataset.find("fileNm", fileNm) );	//저장된 파일정보를 삭제
            	break;
            }
        }

        var delPos = this.dataset.find("fileNm", fileNm);
        if(delPos > -1)
        	this.dataset.remove(delPos);

	}else{
		//다중파일 선택 지원하지 않는 브라우저
    	var files =  this.rootElm.find(".file_layer input[name='file']");

    	//숨겨져 있는 파일입력 박스를 삭제한다.
    	for(var i = 0 ; i < files.size(); i++){
    		var filePath = files.eq(i).val().replace(/\\/g, "/");
    		var fileName = filePath.substr(filePath.lastIndexOf("/")+1);
    		if(fileNm == fileName){
    			files.eq(i).remove(); //저장된 파일Item을 삭제
            	this.dataset.remove( this.dataset.find("fileNm", fileNm) );	//저장된 파일정보를 삭제
    			break;
    		}
    	}

        var delPos = this.dataset.find("fileNm", fileNm);
        if(delPos > -1)
        	this.dataset.remove(delPos);
	}
};

AxFileUpload.prototype.setMdlMode = function(){
	this.mdlYn = true;
};

AxFileUpload.prototype.setNonMdlMode = function(){
	this.mdlYn = false;
};

AxFileUpload.prototype.setDocno = function(docno){
	this.mdlDocno = docno;
};

AxFileUpload.prototype.setServerPath = function(sysCode, endDir){
	this.sysCode = sysCode;
	this.endDir = endDir;
};

// 이벤트의 기준을 해당 컴포넌트가 될수 있도록 이벤트를 매핑함.
AxFileUpload.prototype._handlerProxy = function(handler){
	var _this = this;
	if(this.options.mode == "DOWNLOAD"){
		//if(handler == "")
	}

	return function(e){
		_this[handler].call(_this, this, e);
	};
};

/**
 * 버튼 이벤트 처리
 *
 *
 * */
AxFileUpload.prototype._addHandler = function(self, e){
	this.rootElm.find("input[name='file']:last").trigger("click");
};

AxFileUpload.prototype._delHandler = function(self, e){

	var datas = this.grid.getData();
	var dataset = this.dataset;

	var deleteRows = dataset.getSelectedRows();

	deleteRows.sort(function (prev, next) {
        return next - prev;
    })

	if(deleteRows.length == 0){
		gf_AlertMsg('co.info.selectcheckbox');
		return;
	}

	for(var i = 0 ; i < deleteRows.length ; i++){
		var pos = deleteRows[i];
		if(dataset.getStatus(pos) == "NORMAL")
			dataset.remove(pos);
		else
			this.deleteFile(dataset.get(pos, "fileNm"));
	}
};

AxFileUpload.prototype._cancelHandler = function(self, e){
	this.reset();
};

AxFileUpload.prototype._downloadHandler = function(self, e){
	var datas = this.grid.getData();
	var dataset = this.dataset;
	var downRows = dataset.getSelectedRows();

	if(downRows.length == 0){
		gf_AlertMsg("co_err_notAtchFile");
		return;
	}

	for(var i = 0 ; i < downRows.length ; i++){
		var pos = downRows[i];
		if(dataset.get(pos, "fileId") != "")
		    gf_FileDownload({
		    	fileAtchId: dataset.get(pos, "fileAtchId"),
		    	fileId: dataset.get(pos, "fileId")
		    });
	}
};

AxFileUpload.prototype._saveHandler = function(self, e){
	this.saveFile();
};


/**
 * 파일 입력 처리
 * */
AxFileUpload.prototype._fileChangeHandler = function(self, e){

	var fileInfos = [];
	var dataset = this.dataset;
	var files = null;

	if(this.options.beforeAdd != null)
		this.options.beforeAdd();

	if(typeof(self.files) != "undefined"){
		//다중파일 선택 지원하는 브라우저
		files = self.files;
	    if (files.length == 0) return;

	    var fileExt = this._excludeFile(files);
	    if(fileExt != null){
	    	self.value = "";
	    	gf_AlertMsg("ad.info.cantUploadExt", [fileExt]);
	    	return false;
	    }

		if(!this.multiple){
			var fileNm = files[0].name;
			for(var i = dataset.size()-1 ; i >= 0 ; i--){
				if(fileNm != dataset.get(i, "fileNm"))
					this.deleteFile(dataset.get(i, "fileNm"));
			}
			this.files = [];
		}

	    fileInfos = this.markFileInfos(files);

	}else{
		//다중파일 선택 지원하지 않는 브라우저
		var filePath = self.value.replace(/\\/g, "/");
		var fileNm = filePath.substr(filePath.lastIndexOf("/")+1);
	    var fileExt = this._excludeFile(filePath);

	    if(fileExt != null){
			this.deleteFile(fileNm);
			this._createFileElm();
	    	gf_AlertMsg("ad.info.cantUploadExt", [fileExt]);
	    	return false;
	    }

		if(!this.multiple){
			for(var i = dataset.size()-1 ; i >= 0 ; i--){
				if(fileNm != dataset.get(i, "fileNm"))
					this.deleteFile(dataset.get(i, "fileNm"));
			}
		}

	    fileInfos = this.markFileInfos(filePath);

	    //var fileName = filePath.substr(filePath.lastIndexOf("/")+1);

	}

	// 이미 동일한 파일이 등록되어 있을시 등록을 취소한다.
    if(this.existFile(fileInfos)){
    	self.value = "";
		if(files == null ){
			// 다중파일 선택을 지원하지 않는 경우 파일입력 박스를 제거하고 새로 생성한다.
			$(self).remove();
			this._createFileElm();
		}
        gf_AlertMsg('ad.info.existDupFilename', [this.existFileNm(fileInfos)]);
        return;
    }

    // 입력 받을 파일정보를 등록한다.
	for(var i = 0 ; i < fileInfos.length; i++){
		if(files != null ){
			// 다중파일 선택을 지원할 경우 해당 파일 정보를 저장한다.
			this.files.push(files[i]);
		}
		dataset.add(fileInfos[i]);
	}

	if(files != null ){
		self.value = "";
	}else{
		// 다중파일 선택을 지원하지 않을 경우 해당 파일입력박스를 숨기고 새로운 입력박스를 생성한다.
		$(self).hide();
		this._createFileElm();
	}

	if(this.options.onAdd != null)
		this.options.onAdd();

	return;
};

AxFileUpload.prototype._createFileElm = function(){
	// 다중파일 선택을 지원하지 않을 경우 해당 파일입력박스를 숨기고 새로운 입력박스를 생성한다.
	this.rootElm.find(".file_layer").append("<input type='file'  name='file' id='fileElm' style='width:100%; height:100%; padding:0;' accept='" + this.accepts + "'>");
	if(this.multiple){
		this.rootElm.find(".file_layer input[name='file']:last").attr("multiple", true);
	}
};

AxFileUpload.prototype._excludeFile = function(files){
	var fileTypes = this.fileType.split(",");
	var acceptExt = [];
	for(var i = 0 ; i < fileTypes.length; i++){
		acceptExt.push(acceptExts[fileTypes[i]]);
	}
	acceptExt= acceptExt.join("|");

	if( typeof(files) == "string") {
		//다중파일 선택 지원하지 않는 브라우저
		var fileNm = files.substr(files.lastIndexOf("/")+1);
		var fileExt = fileNm.substr(fileNm.lastIndexOf(".") + 1);

		if(exclude.indexOf(fileExt.toLowerCase()) > -1)
			return fileExt;

		if(acceptExt != "" && acceptExt.indexOf(fileExt.toLowerCase()) < 0)
			return fileExt;
	}
	else {
		//다중파일 선택 지원하는 브라우저
	    for (var i = 0; i < files.length; i++) {
			var fileNm = files[i].name;
			var fileExt = fileNm.substr(fileNm.lastIndexOf(".") + 1);

			if(exclude.indexOf(fileExt.toLowerCase()) > -1)
				return fileExt;

			if(acceptExt != "" && acceptExt.indexOf(fileExt.toLowerCase()) < 0)
				return fileExt;
	    }
	}
};

/**
 * 파일 드래그엔드랍 처리
 * */
//파일을 드래그한 커서가 해당 컴퍼넌트에 진입시 발생
AxFileUpload.prototype._dragenterHandler = function(self, e){
	// 이벤트 버블링을 막는다.
    e.preventDefault();
    this.rootElm.find(".drop-layer").show();
    //console.log("_dragenterHandler");
};

//파일을 드래그한 커서가 해당 컴퍼넌트에 머물러 있을때 발생
AxFileUpload.prototype._dragoverHandler = function(self, e){
	// 이벤트 버블링을 막는다.
    e.preventDefault();
    //this.rootElm.find(".drop-layer").show();
    //console.log("_dragoverHandler");
};

//파일을 드래그한 커서가 해당 컴퍼넌트에 탈출시 발생
AxFileUpload.prototype._dragleaveHandler = function(self, e){
	// 이벤트 버블링을 막는다.
    e.preventDefault();
    this.rootElm.find(".drop-layer").hide();
    //console.log("_dragleaveHandler");
};

//파일을 드래그한 커서가 해당 컴퍼넌트에서 마우스버튼을 놓았을시
AxFileUpload.prototype._dropHandler = function(self, e){
	// 이벤트 버블링을 막는다.
    e.preventDefault();
    this.rootElm.find(".drop-layer").hide();
    //console.log("_dropHandler");

	var fileInfos = [];
	var dataset = this.dataset;
	var files = null;
    var evt = e.originalEvent;

	files = evt.dataTransfer.files;
    if (files.length == 0) return;

    var fileExt = this._excludeFile(files);
    if( fileExt != null){
    	self.value = "";
    	gf_AlertMsg("ad.info.cantUploadExt", [fileExt]);
    	return false;
    }

	if(!this.multiple){
		files = [files[0]];
	}

    fileInfos = this.markFileInfos(files);

	// 이미 동일한 파일이 등록되어 있을시 등록을 취소한다.
    if(this.existFile(fileInfos)){
        gf_AlertMsg('ad.info.existDupFilename', [this.existFileNm(fileInfos)]);
        return;
    }

    // 입력 받을 파일정보를 등록한다.
	for(var i = 0 ; i < fileInfos.length; i++){
		this.files.push(files[i]);
		dataset.add(fileInfos[i]);
	}
};

/**
 * 파일업로드 관련 이벤트
 *
		    	xhr.upload.addEventListener("progress", this._handlerProxy("_progressHandler"));
		    },
			success: this._handlerProxy("_successHandler"),
			error: this._handlerProxy("_errorHandler")
 * */
AxFileUpload.prototype._retrieveSuccessHandler = function(self, data){
	if (data.exception != undefined) {
		err = true;
		var errMsg = data.exception.split("//DETAIL//");
		msgAlert(errMsg[0]);
	}
	this.dataset.setAllData(data.fileList);

	this.reset();
	if(this.dataset.size() > 0 )
		this.dataset.setPosition(0);
};

AxFileUpload.prototype._retrieveErrorHandler = function(self, xhr){
	e;
};

/**
 * 파일업로드 관련 이벤트
 *
		    	xhr.upload.addEventListener("progress", this._handlerProxy("_progressHandler"));
		    },
			success: this._handlerProxy("_successHandler"),
			error: this._handlerProxy("_errorHandler")
 * */
AxFileUpload.prototype._progressHandler = function(self, e){
    this.setProgress(e.total, e.loaded);
};

AxFileUpload.prototype._successHandler = function(self, e){
	var that = this;
	var dataset = this.dataset;
	var successSave = that.options.successSave;
    this.hideProgress();

    var result = e.target.responseText;
    result = typeof(result) == "string"? JSON.parse(result) : result;

    if(result.fileAtchId){
    	var tempDs = new DataSet(this.dataset.getColumns(), this.dataset.getAll());
        this.setFileAtchId(result.fileAtchId, false);
        //this.retrieveFile();

        if(this.mdlYn){
        	var dsFile = new DataSet(dataset.getColumns());
        	for(var i =0 ; i < dataset.size(); i++){
        		dsFile.add( dataset.get(i) );
        		var fileNm = dsFile.get(i, "fileNm");
        		var docno = null;
        		try{	docno = tempDs.get(tempDs.find("fileNm", fileNm ), "docno"); }catch(e){};
        		if(docno){
        			//var fileExt = fileNm.lastIndexOf(".") > 0 ?  fileNm.substr(fileNm.lastIndexOf(".")): "";
        			//docno += "_" + dsFile.get(i, "fileId"); //gf_Lpad(dsFile.get(i, "fileId"), 2, "0");
        			dsFile.set(i, "docno", docno);
        		}
        	}
    		var params = {};

    		var dataSets ={
    			input1: dsFile.getAllData()
    		};

    		gf_Transaction("DELETE_FILE_LIST", "/sys/common/file/deleteRealFileInfoList.xpl", params, dataSets
    			, function(strSvcId, obj, resultData){
    				  // transaction determines whether the normal processing.
    				  if (!gf_ChkTransaction(strSvcId, resultData, true )) {
    					  return;
    				  }

    				  switch(strSvcId) {
    				  	case "DELETE_FILE_LIST" :
    						break;
    				  }
    			}
    		, false);

    		f_FillSiteCd(dsFile);
    		params = {
    				docno: this.mdlDocno
    		};

    		dataSets ={
    			input1: dsFile.getAllData("U"),
    			input2: this.dsDesc.getAllData("U")
    		};

    		gf_Transaction("SAVE_FILE_LIST", "/dmz/dmz02/file2/saveFileList.xpl", params, dataSets
    			, function(strSvcId, obj, resultData){
    				  // transaction determines whether the normal processing.
    				  if (!gf_ChkTransaction(strSvcId, resultData, true )) {
    					  return;
    				  }

    				  switch(strSvcId) {
    				  	case "SAVE_FILE_LIST" :
    			        	for(var i =0 ; i < dsFile.size(); i++){
    			        		var fileNm = dsFile.get(i, "fileNm");
    			        		var docno = null;
    			        		try{	docno = dsFile.get(i, "docno"); }catch(e){}
    			        		if(docno){
    			        			var fileExt = fileNm.lastIndexOf(".") > 0 ?  fileNm.substr(fileNm.lastIndexOf(".")): "";
    			        			dsFile.set(i, "fileNm", docno + fileExt);
    			        		}
    			        	}
    			        	dataset.setAllData(dsFile.getAll());
    				  		if(successSave) successSave(that, true);
    						break;
    				  }
    			}
    		, false);
        }else{
        	if(successSave) successSave(this, true);
        }

    }else{
    	var fileElm = this.rootElm.find(".file_layer input[name='file']:last")[0];
		if(typeof(fileElm.files) == "undefined"){
			this.rootElm.find(".file_layer").append("<input type='file'  name='file' id='fileElm' style='width:100%; height:100%; padding:0;' accept='" + this.accepts + "'>");
			if(this.multiple){
				this.rootElm.find(".file_layer input[name='file']:last").attr("multiple", true);
			}
		}

    	var callFunc = result.callFunc;
    	(new Function(callFunc)).call(); //eval(callFunc); EVAL을 써도 솽관 없으나, 향후 추가될 액션을 대비해 Function을 사용함.
    	if(successSave) successSave(this, false);
    }
};

AxFileUpload.prototype._errorHandler = function(self, e){
	var successSave = that.options.successSave;
    this.hideProgress();
    if(successSave) successSave(this, false);
};

// 업로드 대상 파일이 최대 용량을 초과했는지 체크하는 함수
AxFileUpload.prototype.checkExceedFileSize = function(){
	var fileSize = 0;
	for(var i = 0; i < this.dataset.size(); i++)
		fileSize += this.files[i].size;

	return fileSize > this.maxSize;
};

function f_FillSiteCd(dataset)
{
	var _v_siteCd = gv_orgCd;

	if (gf_IsNull(_v_siteCd))
	{
		return;
	}

	for (var i=0; i < dataset.size() ; i++)
	{
		dataset.setColumn(i, "siteCd", _v_siteCd);
	}
}

