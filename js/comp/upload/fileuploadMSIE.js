/**
 * @class
 * @see   통합결재 시스템의 IE용 Dextfileupload 컴포넌트를 위한 자바 스크립트 모음
 * @author Jun.
 * @since 2013-04-04
 * @version 1.0
 */

// file_atch_id, 전역변수
var gv_FileAtchId;
// file upload 후 수행될 callback 함수 전역 변수
var gv_UploadCallFunc;
//upload, download, all 세가지의 모드로 구분된다.
var gv_Mode = "upload";
//file upload policy default is "default"
var gv_Policy = "default";
//enable multiple file upload ??
var gv_EnableMultipleUpload = true;
// delete saved file true / false
var gv_Deletefile = false;
// file count (첨부된파일수 )
var gv_FileCnt = 0;


// Dextupload object 를 그리기 위한 변수
var gv_UploadManagerObj = "<div id=\"uploadDiv\">" +
    "		<div id=\"uploadBtn\" class=\"btn-area f_r\" >" +
    "		<a class=\"btn s4\" onclick=\"gf_AddFileClick()\" ><span>Open</span></a> " + //<input type=\"button\" id=\"btnUploadOpen\"   value=\"열기\" onclick=\"gf_AddFileClick()\"> " +
    "     <a class=\"btn s4\" onclick=\"gf_DeleteFileClick()\" ><span>Delete</span></a> " + //<input type=\"button\" id=\"btnUploadDelete\" value=\"삭제\" onclick=\"gf_DeleteFileClick()\"> " +
    "     <a class=\"btn s4\" onclick=\"gf_onFileDownload()\" ><span>Download</span></a> " +
    "     <a class=\"btn s4\" onclick=\"gf_onFileInit(true)\" ><span>Cancel</span></a> " + // <input type=\"button\" id=\"btnUploadCancel\" value=\"취소\" onclick=\"gf_onFileInit()\"> " +
    " 	</div> " +
    "		<OBJECT id=\"FileUploadManager\" codeBase=\"" + gv_BqsComm.mwrsUrl + "/common/install/download/DEXTUploadX.cab#version=3,2,10,0\" height=\"130px\" width=\"100%\" classid=\"CLSID:DF75BAFF-7DD5-4B83-AF5E-692067C90316\" VIEWASTEXT> " +
    " 		<PARAM NAME=\"ButtonVisible\" value=\"FALSE\"> " +
    "			<PARAM NAME=\"VisibleContextMenu\" VALUE=\"FALSE\"> " +
    "			<PARAM NAME=\"MaxTotalSize\" VALUE=\"83886080\"> " +
    "		</OBJECT>" +
    "</div>" +
    "<br>";

// dextupload object를 그리기 위한 변수
var gv_DownloadManagerObj = "<div id=\"downloadDiv\">" +
    "	<div id=\"downBtn\" class=\"btn-area f_r\" >" +
    "		<a class=\"btn s4\" onclick=\"gf_onFileDownload()\" ><span>Download</span></a> " + // <input type=\"button\" id=\"btnDownload\" value=\"다운로드\" onclick=\"gf_onFileDownload()\"> " +
    " 	</div> " +
    "	<OBJECT ID=\"FileDownloadManager\" height=\"100%\" width=\"100%\" CodeBase = \"" + gv_BqsComm.mwrsUrl + "/common/install/download/DEXTUploadX.cab#version=3,2,10,0\" CLASSID=\"CLSID:535AE497-8E85-45F8-AF36-2DFCBCA8B68A\"> " +
    "			<PARAM NAME=\"VisibleContextMenu\" VALUE=\"FALSE\"> " +
    "	</OBJECT> " +
    "   </span> " +
    "</div>" +
    "<br><br>";


// 파일목록이 데이터셑 형태로 필요할 가능성을 위해만든 파일 목록 데이터셑
var gds_FileList = new DataSet();
// drm 파일 다운로드 여부 를 판단하기 위한 전역변수
var gv_DrmDownYn = "";

/**
 * @constructor
 * @param policy<String> 파일 업로드 policy null 일경우 default ( 현재 결재에서의 policy 는 default, excel 두가지 이다. )
 *        enableMultipleUpload<boolean>  multiple file upload 가능 여부
 * @see   fileupload.js를 <script src="/js/comp/fileupload.js"></script>를 이용하여 페이지에
 *        사용하면 화면 로드시 fileupload를 위한 UI를자동으로 생성하며 변수들을 초기화 한다.
 * @return N/A
 * @author Jun.
 * @since 2013-03-20
 * @version 1.0
 */
function gf_InitFileUploadComponent(policy, enableMultipleUpload) {
    /*if (!($.browser.msie && $.browser.version < 10 ))  {
     gf_AlertMsg('Activex Version 업로드는 IE 10 이하에서만 사용가능합니다.');
     return;
     }*/
    // 파일업로드 UI 를 생성하기 위한 div 체크
    var componentDiv = $("div[name='fileComponent']");
    if (componentDiv.length == 0) {
        gf_Trace(' It does not create component UI because there is no div for file upload. ');
        return;
    }
    // upload ActiveX 추가
    componentDiv.append(gv_UploadManagerObj);
    // download ActiveX 추가
    componentDiv.append(gv_DownloadManagerObj);

    // multiple file upload 설정
    gf_SetEnableMultipleUpload(enableMultipleUpload);
    // policy 설정
    gf_SetPolicy(policy);
    gf_setMode();
}


/**
 * @function
 * @param flag<boolean> 초기화 이후 파일 목록 조회 할것인지 여부
 * @see   Dextfileupload 를 위해 화면에 올려놓은 모든 컴포넌트 및 변수 초기화
 * @return N/A
 * @author Jun.
 * @since 2013-03-20
 * @version 1.0
 */
function gf_onFileInit(flag) {

    if (!gf_IsNull(flag)) {
        flag = false;
    }

    // 파일업로드 UI를 가지는 div
    var componentDiv = $("div[name='fileComponent']");

    // 초기화를 위해  파일업로드 UI를 가지는 div 내의 모든 child 요소를 삭제
    componentDiv.empty();
    // UI 다시 그림
    gf_InitFileUploadComponent();
    // component의 mode 설정
    gf_setMode();
    // 파일 개수 초기화
    gv_FileCnt = 0;
    // 파일 리스트를 재조회
    if (flag) {
        gf_retrieveFileListInit(gv_FileAtchId);
    }

}

/**
 * @function
 * @param callBackFunc<String> callback 함수 명
 * @see   file upload 이후 calback 함수를 지정하기 위한 함수
 * @return N/A
 * @author Jun.
 * @since 2013-03-20
 * @version 1.0
 */
function gf_SetUploadCallback(callBackFunc) {
    gv_UploadCallFunc = callBackFunc;
}

/**
 * @function
 * @param mode<String> 파일 업로드 모드 upload, download, all
 * @see   파일 첨부 컴포넌트의 mode 를 설정 하기 위한 함수
 *        upload : 업로드 ui만 표출
 *        download : 다운로드 ui만 표출
 *        all : upload와 동일 이전에는 all 시 upload, download 모두 표출 되었으나
 *              이후의 변경으로 인해 all 도 upload 로 유지
 * @return N/A
 * @author Jun.
 * @since 2013-03-20
 * @version 1.0
 */
function gf_setMode(mode) {
    if (!gf_IsNull(mode)) {
        gv_Mode = mode;
    }

    if (gv_Mode == "upload") {

        $('#uploadDiv').show();
        //$('#FileUploadManager').attr("width", "100%");
        //$('#FileUploadManager').attr("height", "150");

        $('#downloadDiv').hide();
        //$('#FileDownloadManager').attr("width", "0");
        //$('#FileDownloadManager').attr("height", "0");
    }
    else if (gv_Mode == "download") {
        $('#uploadDiv').hide();
        //$('#FileUploadManager').attr("width", "0");
        //$('#FileUploadManager').attr("height", "0");

        $('#downloadDiv').show();
        //$('#FileDownloadManager').attr("width", "100%");
        //$('#FileDownloadManager').attr("height", "150");
    }
    else if (gv_Mode == "all") {
        $('#uploadDiv').show();
        //$('#FileUploadManager').attr("width", "100%");
        //$('#FileUploadManager').attr("height", "150");

        $('#downloadDiv').hide();
        //$('#FileDownloadManager').attr("width", "100%");
        //$('#FileDownloadManager').attr("height", "150");
    }
    else {
        gf_AlertMsg('mode 값이 전달되지 않았습니다. upload, download, all 중 하나를 선택하시기 바랍니다. ');
    }

}

/**
 * @function
 * @param policy<String> file upload policy, "default", "excel"
 * @see   파일 업로드 정책을 설정함 기본 정책은 default
 *        defaut : 기본 결재 파일 업로드 policy
 *        excel : excel 업로드시 사용하는 policy
 *        이 policy 는 dispatcher-import.xml에 정의되어있다.
 * @return N/A
 * @author Jun.
 * @since 2013-03-20
 * @version 1.0
 */
function gf_SetPolicy(policy) {
    if (gf_IsNull(policy)) {
        policy = "default";
    }

    gv_Policy = policy;

}

/**
 * @function
 * @param enableMultipleUpload<boolean>
 * @see   멀티 파일 첨부의 가능여부 설정 기본은 true 이다.
 * @return N/A
 * @author Jun.
 * @since 2013-03-20
 * @version 1.0
 */
function gf_SetEnableMultipleUpload(enableMultipleUpload) {

    if (gf_IsNull(enableMultipleUpload)) {
        enableMultipleUpload = true;
    }

    gv_EnableMultipleUpload = enableMultipleUpload;


    if (!gv_EnableMultipleUpload) {
        document.all("FileUploadManager").MaxCount = 1;
    }

}


/**
 * @function
 * @param fileAtchId<String>
 * @see   파일 첨부 ID 를 설정한다.
 * @return N/A
 * @author Jun.
 * @since 2013-03-20
 * @version 1.0
 */
function gf_setFileAtchId(fileAtchId) {
    gf_retrieveFileList(fileAtchId);
}

/**
 * @function
 * @param N/A
 * @see   파일 업로드를 수행하는 함수
 * @return N/A
 * @author Jun.
 * @since 2013-03-20
 * @version 1.0
 */
function gf_onFileUpload() {

    var uploadCheck = false;
    for (var i = 0; i < document.all("FileUploadManager").Count; i++) {
        if (gf_IsNull(document.all("FileUploadManager")(i + 1).Index)) {
            uploadCheck = true;
        }
    }

    // 신규 추가한 파일이 있거나 이미 저장된 파일을 삭제 했다면 파일 저장용 팝업을 띄운다.
    if (uploadCheck || gv_Deletefile) {
        gf_retrieveFileAtchId();
        document.all("FileUploadManager").AddFormItem("fileAtchId", gv_FileAtchId);
        document.all("FileUploadManager").AddFormItem("policy", gv_Policy);
        document.all("FileUploadManager").Transfer();
    }
    else {
        // 첨부한 파일이 없다면 업로드 콜백을 수행한다
        gf_UploadCallback(gv_FileAtchId);
    }
}

/**
 * @function
 * @param
 * @see   파일 다운로드를 수행하는 함수
 * @return N/A
 * @author Jun.
 * @since 2013-03-20
 * @version 1.0
 */
function gf_onFileDownload() {
    gf_Trace('gv_DrmType->' + gv_DrmType);
    if (!gf_IsNull(gv_DrmType) && gv_DrmType.toUpperCase() != "NONE") {

        // drm을 적용하려면 이 부분의 주석을 해제 합니다.
        // 첨부 mode 가 download 라면 view 화면으로 판단.
        // 이경우 모든 다운로드는 dext 를 통하지 않고 http download 를 이용하여
        // 파일 한개씩 다운로드를 수행 시킨다.
        if (gv_DrmType == "DEC" && gv_Mode == "download") {
            // 복호화 다운로드 이면서
            // 이경우 DRM 해지 요청서 인지 확인 하여 해지 요청서 라면
            // 결재 완료 후 7일간만 다운로드 받게 처리 한다. 결재 완료 전이나 7일 이후에는
            // 다운로드 받을 수 없다는 메세지를 띄운다
            // DRM 해지 요청서 에서 파일을 다운받을수 잇는지 판단하는 함수 호출
            gv_DrmDownYn = gf_retrieveDrmDownloadYn(gv_FileAtchId);
            if (gf_IsNull(gv_DrmDownYn) || gv_DrmDownYn == "N") {
                gf_AlertMsg('gw.info.downloadExpire');
                return;
            }
            else {
                // 선택한 파일의 http 다운로드를 실행한다. 복호화 다운로드
                // drm 다운로드 함수
                f_DownDRMFile();
            }
        }
        else if (gv_DrmType == "ENC" && gv_Mode == "download") {
            // 여기서는 그냥 암호화 다운로드
            // drm 다운로드 함수
            f_DownDRMFile();
        }
    }
    else {
//		document.all("FileDownloadManager").DownloadExecute(nItemIndex);
        document.all("FileDownloadManager").Execute();
    }
}


/**
 * @function
 * @param
 * @see   drm 다운로드를 위한 함수
 * @return N/A
 * @author Jun.
 * @since 2013-03-20
 * @version 1.0
 */
function f_DownDRMFile() {
    var fileName;
    var fileUrl;

    if (document.all('FileDownloadManager').TotalCount == 0) {
        // 다운로드 받을 파일이 없습니다.
        gf_AlertMsg("bqs.inf.notExistDownFile");
        return;
    }

    if (document.all("FileDownloadManager").SelectedFileCount < 1) {
        // 다운로드 받을 파일을 선택하세요.
        gf_AlertMsg('gw.warn.selectDownloadFile');
        document.all("FileDownloadManager").UnselectAll();
        return;
    }

    if (document.all("FileDownloadManager").SelectedFileCount > 1) {
        // DRM이 적용된 파일은 한번에 한개씩 다운로드 할 수 있습니다.
        gf_AlertMsg('gw.warn.drmFileOnlyOneDown');
        document.all("FileDownloadManager").UnselectAll();
        return;
    }

    for (var i = 0; i < document.all("FileDownloadManager").TotalCount; i++) {
        if (document.all("FileDownloadManager").IsSelectedFile(i) == true) {
            fileName = document.all("FileDownloadManager")(i + 1);
            fileUrl = document.all("FileDownloadManager")(i + 1).URL;
        }
    }
    fileName = fileName + "";
    var fileNames = fileName.toString().split(".");
    var fileTitle = "";

    if (fileNames.length == 1) {
        fileTitle = encodeURIComponent(fileNames[0]);
    }
    else {
        fileTitle = encodeURIComponent(fileNames[1]);
    }

    var FileDocID = gv_FileAtchId; 						// 파일 키값
    var FileName = encodeURIComponent(fileName); 		// 파일명 urlencode
    var FileUrl = 0; 									// 0 고정
    var FileUrlRd = encodeURIComponent(fileUrl);  		// 파일다운로드 url encoded url
    var FileTitle = fileTitle;  							// 파일 제목 url encode
    var ServerOrigin = "mwrs";  								// 전자결재의 경우 mwrs
    var FileDocLevel = "D"; 									// 'S' 개인한 으로 고정 'D' 부서한으로 고정
    var DownType = 0;    								// 0=선택창,1=바로열기,2=바로저장
    var OnOff = gv_DrmType == "DEC" ? 0 : 1;    	// 1 암호화 다운로드 0 복호화 다운로드
    var UserScope = 2; 									// 1 사내한 2 부서한 3 개인한
    var CanSave = 1;  									// 저장 가능 &
    var CanEdit = 1;  									// 편집 가능 &
    var BlockCopy = 0; 									// 불가능 &
    var VisualPrint = 1; 									// 워터마크 출력 &
    var ImageSafer = 1; 									// 고정 &
    var PrintCount = -99; 									// 출력 횟수 무제한
    var OpenCount = -99; 									// 파일 오픈 카운트 무제한

    var downUrl = gv_BqsComm.drmdownUrl + "?UserID=" + gv_BqsComm.userId;
    downUrl += "&FileDocID=" + FileDocID;
    downUrl += "&FileName=" + FileName;
    downUrl += "&FileUrl=" + FileUrl;
    downUrl += "&FileUrlRd=" + FileUrlRd;
    downUrl += "&FileTitle=" + FileTitle;
    downUrl += "&ServerOrigin=" + ServerOrigin;
    downUrl += "&FileDocLevel=" + FileDocLevel;
    downUrl += "&DownType=" + DownType;
    downUrl += "&OnOff=" + OnOff;
    downUrl += "&UserScope=" + UserScope;
    downUrl += "&CanSave=" + CanSave;
    downUrl += "&CanEdit=" + CanEdit;
    downUrl += "&BlockCopy=" + BlockCopy;
    downUrl += "&VisualPrint=" + VisualPrint;
    downUrl += "&ImageSafer=" + ImageSafer;
    downUrl += "&PrintCount=" + PrintCount;
    downUrl += "&OpenCount=" + OpenCount;
    gf_Trace('down url 검증 ->' + downUrl);

    var winstyle = "height=420,width=445, status=no,toolbar=no,menubar=no,location=no";
    // drm 다운로드 url 오픈
    // test 용 url
    window.open(downUrl, null, winstyle);
}

/**
 * @function
 * @param
 * @see   drm 다운로드를 위한 함수
 * @return N/A
 * @author Jun.
 * @since 2013-03-20
 * @version 1.0
 */
function f_DownloadDRMFile() {
    var fileName;
    var fileUrl;

    if (document.all('FileDownloadManager').TotalCount == 0) {
        // 다운로드 받을 파일이 없습니다.
        gf_AlertMsg("bqs.inf.notExistDownFile");
        return;
    }

    if (document.all("FileDownloadManager").SelectedFileCount < 1) {
        // 다운로드 받을 파일을 선택하세요.
        gf_AlertMsg('gw.warn.selectDownloadFile');
        document.all("FileDownloadManager").UnselectAll();
        return;
    }

    if (document.all("FileDownloadManager").SelectedFileCount > 1) {
        // DRM이 적용된 파일은 한번에 한개씩 다운로드 할 수 있습니다.
        gf_AlertMsg('gw.warn.drmFileOnlyOneDown');
        document.all("FileDownloadManager").UnselectAll();
        return;
    }

    for (var i = 0; i < document.all("FileDownloadManager").TotalCount; i++) {
        if (document.all("FileDownloadManager").IsSelectedFile(i) == true) {
            fileName = document.all("FileDownloadManager")(i + 1);
            fileUrl = document.all("FileDownloadManager")(i + 1).URL;
        }
    }
    fileName = fileName + "";
    var fileNames = fileName.toString().split(".");
    var fileTitle = "";

    if (fileNames.length == 1) {
        fileTitle = encodeURIComponent(fileNames[0]);
    }
    else {
        fileTitle = encodeURIComponent(fileNames[1]);
    }

    var FileDocID = gv_FileAtchId; 						// 파일 키값
    var FileName = encodeURIComponent(fileName); 		// 파일명 urlencode
    var FileUrl = 0; 									// 0 고정
    var FileUrlRd = encodeURIComponent(fileUrl);  		// 파일다운로드 url encoded url
    var FileTitle = fileTitle;  							// 파일 제목 url encode
    var ServerOrigin = "mwrs";  								// 전자결재의 경우 mwrs
    var FileDocLevel = "D"; 									// 파일등급
    var DownType = 0;    								// 0=선택창,1=바로열기,2=바로저장
    var OnOff = gv_DrmType == "DEC" ? 0 : 1;    	// 1 암호화 다운로드 0 복호화 다운로드
    var UserScope = 2; 									// 1 사내한 2 부서한 3 개인한
    var CanSave = 1;  									// 저장 가능 &
    var CanEdit = 1;  									// 편집 가능 &
    var BlockCopy = 0; 									// 불가능 &
    var VisualPrint = 1; 									// 워터마크 출력 &
    var ImageSafer = 1; 									// 고정 &
    var PrintCount = -99; 									// 출력 횟수 무제한
    var OpenCount = -99; 									// 파일 오픈 카운트 무제한

    var downUrl = gv_BqsComm.drmdownUrl + "?UserID=" + gv_BqsComm.userId;
    downUrl += "&FileDocID=" + FileDocID;
    downUrl += "&FileName=" + FileName;
    downUrl += "&FileUrl=" + FileUrl;
    downUrl += "&FileUrlRd=" + FileUrlRd;
    downUrl += "&FileTitle=" + FileTitle;
    downUrl += "&ServerOrigin=" + ServerOrigin;
    downUrl += "&FileDocLevel=" + FileDocLevel;
    downUrl += "&DownType=" + DownType;
    downUrl += "&OnOff=" + OnOff;
    downUrl += "&UserScope=" + UserScope;
    downUrl += "&CanSave=" + CanSave;
    downUrl += "&CanEdit=" + CanEdit;
    downUrl += "&BlockCopy=" + BlockCopy;
    downUrl += "&VisualPrint=" + VisualPrint;
    downUrl += "&ImageSafer=" + ImageSafer;
    downUrl += "&PrintCount=" + PrintCount;
    downUrl += "&OpenCount=" + OpenCount;
    gf_Trace('down url 검증 ->' + downUrl);

    var winstyle = "height=420,width=445, status=no,toolbar=no,menubar=no,location=no";
    // drm 다운로드 url 오픈
    // test 용 url
    window.open(downUrl, null, winstyle);
}

/**
 * @function
 * @param
 * @see   Dextupload component 를 위한 다운로드 함수
 * @return N/A
 * @author Jun.
 * @since 2013-03-20
 * @version 1.0
 */
function f_DextDownload() {
    if (document.all('FileDownloadManager').TotalCount == 0) {
        // 다운로드 받을 파일이 없습니다.
        gf_AlertMsg("bqs.inf.notExistDownFile");
        return;
    }
    var winstyle = "height=420,width=445, status=no,toolbar=no,menubar=no,location=no";
    window.open(gv_ContextPath + "/jsp/comp/fileupload/DextFileDownloadMonitor.jsp", null, winstyle);
}


/**
 * @function
 * @param fileAtchId<String> 파일 첨부 아이디
 * @see   업로드된 파일 목록 조회 함수
 * @return N/A
 * @author Jun.
 * @since 2013-03-20
 * @version 1.0
 */
function gf_retrieveFileList(fileAtchId) {

    if (gf_IsNull(fileAtchId)) {
        fileAtchId = gv_FileAtchId;
    }
    else {
        gv_FileAtchId = fileAtchId;
    }


    // 조회할 fileAtchId 가 없을경우
    if (gf_IsNull(fileAtchId)) {

        // Component Init를 수행한다.
        gf_onFileInit();
        return;
    }

    // 조회 transaction 수행
    var fileInfo = {"fileAtchId": fileAtchId};
    gf_Transaction("SELECT_FILELIST", "/file/retrieveWebFileList.xpl", fileInfo, {}, "gf_FileList_Callback", false);
}

/**
 * @function
 * @param  fileAtchId<String> Attachment 아이디
 * @see    업로드된 파일 목록을 조회하는 함수 초기화때 호출
 * @return N/A
 * @author Jun.
 * @since 2013-03-20
 * @version 1.0
 */
function gf_retrieveFileListInit(fileAtchId) {

    if (gf_IsNull(fileAtchId)) {
        return;
    }

    // 조회 transaction 수행
    var fileInfo = {"fileAtchId": fileAtchId};
    gf_Transaction("SELECT_FILELIST_INIT", "/file/retrieveWebFileList.xpl", fileInfo, {}, "gf_FileList_Callback", false);
}

/**
 * @function
 * @param
 * @see   Attachment ID를 생성하는 함수
 * @return N/A
 * @author Jun.
 * @since 2013-03-20
 * @version 1.0
 */
function gf_retrieveFileAtchId() {

    if (gf_IsNull(gv_FileAtchId)) {
        gf_Transaction("SELECT_FILEATCHID", "/file/retrieveFileAtchId.xpl?saveYn=Y", {}, {}, "gf_FileList_Callback", false);
    }
}


/**
 * @function
 * @param
 * @see    drm 해지 요청서 일경우 drm 파일 다운로드 가능 여부를 판단
 * @return N/A
 * @author Jun.
 * @since 2013-03-20
 * @version 1.0
 */
function gf_retrieveDrmDownloadYn(fileAtchId) {

    // 조회할 fileAtchId 가 없을경우
    if (gf_IsNull(fileAtchId)) {
        return "N";
    }

    // 조회 transaction 수행
    var fileInfo = {"fileAtchId": fileAtchId};
    gf_Transaction("SELECT_DRMDOWN", "/gw/sign/retrieveSignStatusFromFileAtchId.xpl", fileInfo, {}, "gf_FileList_Callback", false);
    gf_Trace("gv_DrmDownYn->" + gv_DrmDownYn);
    return gv_DrmDownYn;
}


/**
 * @function
 * @param  strSvcId<String> transaction 서비스 id
 *         resultData<JsonObject> transaction 결과로 리턴된 jsonobject
 * @see    파일업로드중 transaction 실행후 수행될 callback 함수
 * @return N/A
 * @author Jun.
 * @since 2013-03-20
 * @version 1.0
 */
function gf_FileList_Callback(strSvcId, obj, resultData) {

    // transaction determines whether the normal processing.
    if (!gf_ChkTransaction(strSvcId, resultData, true)) {
        return;
    }

    // 조회 transaction 후 callback
    if (strSvcId == "SELECT_FILELIST" || strSvcId == "SELECT_FILELIST_INIT") {
        // delete save file variable init ;
        gv_Deletefile = false;
        // gloval file list dataset
        gds_FileList.setAllData(resultData["fileList"]);
        // init ui
        if (strSvcId == "SELECT_FILELIST") {
            gf_onFileInit();
        }

        if (gds_FileList.size() > 0) {
            gv_FileCnt = gds_FileList.size();
            // file list draw
            $.each(resultData, function (i, itemAry) {
                if (i == "fileList") {
                    $.each(itemAry, function (j, item) {
                        // uploadmanager data set
                        if (gv_Mode == "upload" || gv_Mode == "all") {
                            document.all('FileUploadManager').AddUploadedFile(item.fileId, item.fileNm, item.fileSize, gv_ServerUrl + "sys/common/file/downloadUploadedFile.xpl?fileAtchId=" + item.fileAtchId + "&fileId=" + item.fileId);
                        }

                        // downloadmanager data set
                        var downUrl = gv_ServerUrl + "sys/common/file/downloadUploadedFile.xpl?fileAtchId=" + item.fileAtchId + "&fileId=" + item.fileId;
                        document.all('FileDownloadManager').AddFile(downUrl, item.fileSize, item.fileNm);
                    });
                    //}
                }
                ;
            });
            // drm 적용되어있으며 다운로드 모드이면 파일 다운로드 매니져의 check 박스를 없앤다.
            if ((gv_DrmType == "DEC" || gv_DrmType == "ENC") && gv_Mode == "download") {
                document.all('FileDownloadManager').VisibleDownloadCheckbox = false;

            }
        }

    }
    else if (strSvcId == 'SELECT_FILEATCHID') {   // 파일첨부 아이디 생성
        var fileAtchId = "";
        $.each(resultData, function (i, itemAry) {
            if (i == "fileAtchId") {
                $.each(itemAry, function (j, item) {
                    fileAtchId = item.fileAtchId;
                });
                //}
            }
            ;
        });
        gv_FileAtchId = fileAtchId;

    }
    else if (strSvcId == "FILEDELETEALL") {    // 모든 파일 삭제
        // 삭제 transaction후 callback;
        gv_FileAtchId = "";
        gf_onFileInit();
    }
    else if (strSvcId == "SELECT_FILEDELETEALL") {

    }
    else if (strSvcId == "SELECT_DRMDOWN") {     // drm 다운로드 여부 조회
        //ds_SignFileDownYn.setAllData(resultData["ds_SignFileDownYn"]);

        $.each(resultData, function (i, itemAry) {
            if (i == "ds_SignFileDownYn") {
                $.each(itemAry, function (j, item) {
                    gv_DrmDownYn = item.downloadYn;
                });
                //}
            }
            ;
        });
    }
}


/**
 * @function
 * @param  N/A
 * @see    파일 추가 버튼 클릭시 수행되는 이벤트 함수
 * @return N/A
 * @author Jun.
 * @since 2013-03-20
 * @version 1.0
 */
function gf_AddFileClick() {
    document.all('FileUploadManager').OpenFileDialog();
    // 전역 데이터셑에 파일 추가
    var fileObj = document.all("FileUploadManager")(document.all("FileUploadManager").Count);
    var jsonFileInfo = {
        "fileAtchId": gv_FileAtchId,
        "fileId": "",
        "sysCd": "",
        "filePath": "",
        "fileNm": fileObj,
        "fileSize": fileObj.Size
    };
    gds_FileList.add(jsonFileInfo);
}

/**
 * @function
 * @param  oldCnt<number> 추가 되기전의 파일수
 *         newCnt<number> 추가된 후의 파일수
 * @see    컴포넌트에 파일이 추가 되었을때 Dextupload 에서 statuschange 가 이벤트가 invoke
 *         statuschange 이벤트에서 호출하는 함수
 *         전역 데이터셑에서 파일정보를 추가 한다.
 * @return N/A
 * @author Jun.
 * @since 2013-03-20
 * @version 1.0
 */
function gf_AddFileInfoGdsFile(oldCnt, newCnt) {

    for (var i = 0; i < (newCnt - oldCnt); i++) {
        var midx = newCnt - ( oldCnt + 1 ) - i;
        var fileObj = document.all("FileUploadManager")(document.all("FileUploadManager").Count - midx);
        var jsonFileInfo = {
            "fileAtchId": gv_FileAtchId,
            "fileId": "",
            "sysCd": "",
            "filePath": "",
            "fileNm": fileObj.name,
            "fileSize": fileObj.Size
        };
        gds_FileList.add(jsonFileInfo);
    }
    gv_FileCnt = gds_FileList.size();
}

/**
 * @function
 * @param  N/A
 * @see    컴포넌트에 파일이 삭제 되었을때 Dextupload 에서 statuschange 가 이벤트가 invoke
 *         statuschange 이벤트에서 호출하는 함수
 *         전역 데이터셑에서 파일정보를 삭제 한다.
 * @return N/A
 * @author Jun.
 * @since 2013-03-20
 * @version 1.0
 */
function gf_DeleteFileInfoGdsFile() {
    gf_Trace('del mother fucker');
    for (var i = gds_FileList.size() - 1; i >= 0; i--) {
        var removeYn = false;
        if (!document.all("FileUploadManager")) {
            continue;
        }
        for (var j = 0; j < document.all("FileUploadManager").Count; j++) {
            var fileObj = document.all("FileUploadManager")(j + 1);
            if (gds_FileList.get(i, "fileNm") == fileObj.name) {
                removeYn = false;
                break;
            }
            removeYn = true;
        }
        if (removeYn) {
            gf_Trace("deleted file name->" + gds_FileList.get(i, "fileNm"));
            gf_Trace("remove index->" + i);
            gds_FileList.remove(i);
            gv_FileCnt = gds_FileList.size();
        }
    }


}


/**
 * @function
 * @param  N/A
 * @see    컴포넌트에 파일이 삭제 되었을때 Dextupload 에서 statuschange 가 이벤트가 invoke
 *         statuschange 이벤트에서 호출하는 함수
 *         전역 데이터셑에서 파일정보를 삭제 한다.
 * @return N/A
 * @author Jun.
 * @since 2013-03-20
 * @version 1.0
 */
function gf_DeleteFileClick() {

    if (document.all("FileUploadManager").Count == 0) {
        gf_AlertMsg("bqs.err.noDeleteFile");
        return;
    }

    var prevSavedFile = 0;
    var prevNotsavedFile = 0;
    var nextSavedFile = 0;
    var nextNotsavedFile = 0;

    for (var i = 0; i < document.all("FileUploadManager").Count; i++) {
        if (!gf_IsNull(document.all("FileUploadManager")(i + 1).Index)) {
            prevSavedFile++;
        }
    }

    document.all("FileUploadManager").DeleteSelectedFile();


    for (var i = 0; i < document.all("FileUploadManager").Count; i++) {
        if (!gf_IsNull(document.all("FileUploadManager")(i + 1).Index)) {
            // 이미 저장된 파일이 삭제 된경우 gv_Deletefile 변수 true 로 생성
            nextSavedFile++;
        }
    }

    if (prevSavedFile > nextSavedFile) {
        gv_Deletefile = true;
    }

}


/**
 * @function
 * @param
 * @see   파일 업로드 실행후 수행되는 callback
 * @return N/A
 * @author Jun.
 * @since 2013-03-20
 * @version 1.0
 */
function gf_UploadCallback() {


    // gf_SetUploadCallback 를 통해 설정된 callback function 있는지 검증
    if (!gf_IsNull(gv_UploadCallFunc)) {
        // 설정된 callback 이 함수 인지 검증
        var callFunction = eval(gv_UploadCallFunc);
        if (typeof callFunction != "function") {
            gf_AlertMsg("call back function " + callBackFunc + "is not defined!!");
            return;
        }
        // callback 함수 수행 callback 으로 전달되는 인자는 file atch id 하나이다.
        eval(gv_UploadCallFunc + "('" + gv_FileAtchId + "');");
    }

    // 저장된 첨부 조회 수행
    gf_retrieveFileList();
}

/**
 * @function
 * @param  fileAtchId<String> Attachment 아이디
 * @see   모든 파일을 삭제 하는 함수
 * @return N/A
 * @author Jun.
 * @since 2013-03-20
 * @version 1.0
 */
function gf_deleteAllFile(fileAtchId) {
    if (gf_IsNull(fileAtchId)) {
        fileAtchId = gv_FileAtchId;
    }
    // 첨부된 모든 파일이 삭제 됩니다. 계속 하시겠습니까?
    if (!gf_ConfirmMsg('gw.warn.allFileDelete')) {
        return;
    }

    var fileInfo = {"fileAtchId": fileAtchId};

    gf_Transaction("FILEDELETEALL", "/file/deleteFileMasterInfo.xpl", fileInfo, {}, "gf_FileList_Callback", true);


}


