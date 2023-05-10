// cfn 은 Component FuNction 의 약자 이다.

/*******************************************************************
 * 01. 업무구분            : 공통
 * 02. 스크립트 설명    : rexpert 파일의 백그라운드 업로드를 위해 만드는 IE용 Dextupload
 * 03. 작성자            : Jun.
 * 04. 작성일            : 2013.04.30
 ******************************************************************/

/**
 * @class rexpert 파일의 백그라운드 업로드를 위해 만드는 IE 용 dextupload class
 * @constructor
 * @param divNm<String> 파일 업로드 컴포넌트가 위치할 div name
 * @see
 * @author Jun.
 * @since 2013-04-30
 * @version 1.0
 */
var upload4Rex = function (divNm) {
    upload4Rex.prototype.dispDivNm = divNm;
};


/**
 * @see    메세지 데이터를 Locale 별로 가지는 변수
 * @author Jun.
 * @since 2013-04-30
 * @version 1.0
 */
upload4Rex.prototype.dispDivNm = "rexFileUplolad";

/**
 * @see    Attachment 묶음 번호
 * @author Jun.
 * @since 2013-04-30
 * @version 1.0
 */
upload4Rex.prototype.fileAtchId = "";

/**
 * @see    file upload 후 수행될 callback 함수
 * @author Jun.
 * @since 2013-04-30
 * @version 1.0
 */
upload4Rex.prototype.uploadCallbackFunc = "";

/**
 * @see    dextupload activex object string
 * @author Jun.
 * @since 2013-04-30
 * @version 1.0
 */
upload4Rex.prototype.uploadMonitorStr =
    "		<OBJECT id=\"FileUploadMonitor{0}\" height=\"0\" width=\"0\"  " +
    "		classid=\"CLSID:96A93E40-E5F8-497A-B029-8D8156DE09C5\"  " +
    "		CodeBase=\"" + gv_BqsComm.mwrsUrl + "/common/install/download/DEXTUploadX.cab#version=3,2,2,0\" VIEWASTEXT> " +
    "		</OBJECT> ";


/**
 * @see    업로드 컴포넌트를 화면에 배치하기위한 초기화 함수
 * @author Jun.
 * @since  2013-04-30
 * @version 1.0
 */
upload4Rex.prototype.initFileUploadComponent = function (aFileAtchId, aUploadCallbak) {

    if (!($.browser.msie && $.browser.version < 10 )) {
        gf_AlertMsg('IE 10 이하에서만 사용가능하거등');
        return false;
    }

    // 파일업로드 UI 를 생성하기 위한 div 체크
    var componentDiv = $("div[name='" + upload4Rex.prototype.dispDivNm + "']");

    if (componentDiv.length == 0) {
        gf_Trace(' file upload를 위한 div가 없기때문에 컴포넌트 UI를 생성하지 않는다. ');
        return false;
    }

    // upload ActiveX 추가
    componentDiv.append(upload4Rex.prototype.uploadMonitorStr.simpleReplace("{0}", upload4Rex.prototype.dispDivNm));

    if (!gf_IsNull(aFileAtchId)) {
        upload4Rex.prototype.setFileAtchId(aFileAtchId);
    }

    if (!gf_IsNull(aUploadCallbak)) {
        upload4Rex.prototype.setUploadCallback(aUploadCallbak);
    }
    return true;
};


// 모든 Component Init

/**
 * @see    업로드 컴포넌트를 초기화 하기 위한 함수
 * @author Jun.
 * @since  2013-04-30
 * @version 1.0
 */
upload4Rex.prototype.onFileInit = function () {
    // 파일업로드 UI를 가지는 div
    var componentDiv = $("div[name='" + upload4Rex.prototype.dispDivNm + "']");

    // 초기화를 위해  파일업로드 UI를 가지는 div 내의 모든 child 요소를 삭제
    componentDiv.empty();
    // UI 다시 그림
    upload4Rex.prototype.initFileUploadComponent();
};


/**
 * @see        파일 업로드 실행후 수행될 business callback 함수 설정
 * @param    callBackFunc<String> 업로드후 수행될 business callbac 함수명
 * @author    Jun.
 * @since    2013-04-30
 * @version    1.0
 */
upload4Rex.prototype.setUploadCallback = function (callBackFunc) {
    upload4Rex.prototype.uploadCallbackFunc = callBackFunc;
};

/**
 * @see        이미 업로드된 내역이 있는경우 업무데이터가 가지는 fileatchid 를 컴포넌트에 설정
 * @param    fileAtchId<String> 업무데이터가 가지고 있는 fileAtchId
 * @author    Jun.
 * @since    2013-04-30
 * @version    1.0
 */
upload4Rex.prototype.setFileAtchId = function (aFileAtchId) {
    upload4Rex.prototype.fileAtchId = aFileAtchId;
};


/**
 * @see        로컬 폴더의 파일에 대한 전체 경로를 전달하여 첨부할 파일을 추가한다.
 * @param    filePath<String> 첨부하려는 로컬파일의 전체 경로 ex) c:\Temp\Test.zip
 * @author    Jun.
 * @since    2013-04-30
 * @version    1.0
 */
upload4Rex.prototype.setFileInfo = function (filePath) {
    // 첨부할 파일 정보 설정
    document.all("FileUploadMonitor" + upload4Rex.prototype.dispDivNm).AddFile(filePath);
};

/**
 * @see        실제 파일을 업로드하는 메서드
 * @author    Jun.
 * @since    2013-04-30
 * @version    1.0
 */
upload4Rex.prototype.onFileUpload = function () {

    if (document.all("FileUploadMonitor" + upload4Rex.prototype.dispDivNm).Count > 0) {
        if (gf_IsNull(upload4Rex.prototype.fileAtchId)) {
            upload4Rex.prototype.retrieveFileAtchId();
        }
        // 첨부 묶음번호 전송
        document.all("FileUploadMonitor" + upload4Rex.prototype.dispDivNm).AddFormItem("fileAtchId", upload4Rex.prototype.fileAtchId);
        // 파일전송 발생
        document.all("FileUploadMonitor" + upload4Rex.prototype.dispDivNm).Transfer();
    }
    else {
        upload4Rex.prototype.uploadCallback();
    }
};

/**
 * @see        신규 fileAtchId 를 생성하는 메서드
 * @author    Jun.
 * @since    2013-04-30
 * @version    1.0
 */
upload4Rex.prototype.retrieveFileAtchId = function () {

    $.ajax({
        type: "post",
        url: gv_ContextPath + '/file/retrieveFileAtchId.xpl',
        data: {},
        datatype: "json",
        contentType: "application/json+core; charset=utf-8",
        success: function (data) {
            $.each(data, function (i, itemAry) {
                if (i == "fileAtchId") {
                    $.each(itemAry, function (j, item) {
                        upload4Rex.prototype.fileAtchId = item.fileAtchId;
                    });
                }
                ;
            });
        },
        async: false
    });

};


/**
 * @see        파일업로드후 callback 을 수행하는 함수
 * @author    Jun.
 * @since    2013-04-30
 * @version    1.0
 */
upload4Rex.prototype.uploadCallback = function () {

    // callback 이 수행되는 시점에 Component Init를 수행해준다.
    upload4Rex.prototype.onFileInit();
    // gf_SetUploadCallback 를 통해 설정된 callback function 있는지 검증
    if (!gf_IsNull(upload4Rex.prototype.uploadCallbackFunc)) {
        // 설정된 callback 이 함수 인지 검증
        var callFunction = eval(upload4Rex.prototype.uploadCallbackFunc);
        if (typeof callFunction != "function") {
            gf_AlertMsg("call back function " + upload4Rex.prototype.uploadCallbackFunc + "is not defined!!");
            return;
        }
        // callback 함수 수행 callback 으로 전달되는 인자는 file atch id 하나이다.
        eval(upload4Rex.prototype.uploadCallbackFunc + "('" + upload4Rex.prototype.fileAtchId + "');");

    }
};

