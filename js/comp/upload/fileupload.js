/**
 * @class
 * @see   파일첨부 컴포넌트 스크립트 chrome, fire fox, sapari
 * @author Jun.
 * @since 2013-04-04
 * @version 1.0
 */

// file_atch_id, 전역변수
var gv_FileAtchId;
// file upload 후 수행될 callback 함수 전역 변수
var gv_UploadCallFunc;
//file 선택 후 수행될 callback 함수 전역 변수
var gv_ChangeCallFunc;
// file upload와 서버의 변경된 데이터를 조회한후 callback 함수 전역변수
var gv_UploadCompleteCallFunc;
//upload, download, all 세가지의 모드로 구분된다.
var gv_Mode = "upload";
// file upload policy default is "default"
var gv_Policy = "default";
// enable multiple file upload ??
var gv_EnableMultipleUpload = true;


// form string
// upload form string
var gv_UFormStr = "<form name=\"uploadForm\" id=\"uploadForm\" target=\"fileUploader\" method=\"post\" enctype=\"multipart/form-data\" action=\"" + gv_ContextPath + "/file/uploadWebFile.xpl\"></form>";
// download form string
var gv_DFormStr = "<form name=\"downForm\" id=\"downForm\" target=\"fileUploader\" method=\"post\" action=\"" + gv_ContextPath + "/file/downloadUploadedFile.xpl\"></form>";

// iframe String
// iframe string for IE Browser
var gv_IEIframe4UploadButton = "<iframe name=\"openBtnFrame\" src=\"/jsp/comp/fileupload/uploadButton.jsp\" width=\"200\" height=\"26\" frameborder=\"0\"></iframe>";
//iframe string for download
var gv_Iframe4DownTarget = "<iframe name=\"fileUploader\" style=\"display:none\"></iframe>";

// table string
// 파일 업로드 ui를 그리기 위한 변수들
var gv_FileListDnDInfo = "<tr><td class=\"dndRow\" colspan=\"6\" style=\"height:50px\"  align=\"center\">※ Drag to attach</td></tr>";
var gv_FileListEmptyRow = "<tr><td class=\"emptyRow\" colspan=\"6\"  align=\"center\">No Attachment</td></tr>";
var gv_FileListTableHead = "<table id=\"fileTableHead\" name=\"fileTable\" class=\"table-b\" border=\"0\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\"> \r\n" +
    "	<colgroup> 								\r\n" +
    "		<col width=\"8%\"> 					\r\n" +
    "		<col width=\"27%\"> 					\r\n" +
    "		<col width=\"15%\"> 					\r\n" +
    "		<col width=\"20%\"> 				\r\n" +
    "		<col width=\"20%\"> 				\r\n" +
    "		<col width=\"10%\">					\r\n" +
    "	</colgroup> 							\r\n" +
    "  <thead>									\r\n" +
    "		<tr> 								\r\n" +
    "			<th><span>No</span></th>					\r\n" +
    "			<th><span>File Name</span></th> 					\r\n" +
    "			<th><span>File Size</span></th> 				\r\n" +
    " 			<th><span>User</span></th> 					\r\n" +
    " 			<th><span>Date</span></th> 					\r\n" +
    " 			<th><span>delete</span></th> 					\r\n" +
    "		</tr> 								\r\n" +
    " 	</thead>  								\r\n" +
    "</table>										";
var gv_FileListTable = "<div style=\"display:block; width:100%; overflow-y:auto; border-bottom: 1px solid #6991C0;\">" +
    "<table id=\"fileTable\" name=\"fileTable\" class=\"table-b\" border=\"0\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\"> \r\n" +
    "	<colgroup> 								\r\n" +
    "		<col width=\"8%\"> 					\r\n" +
    "		<col width=\"27%\"> 					\r\n" +
    "		<col width=\"15%\"> 					\r\n" +
    "		<col width=\"20%\"> 				\r\n" +
    "		<col width=\"20%\"> 				\r\n" +
    "		<col width=\"10%\">					\r\n" +
    "	</colgroup> 							\r\n" +
    "  <tbody>									\r\n" +
    " 	</tbody>  								\r\n" +
    "</table></div>										";

// hidden string
// hidden field for file atch id
var gv_Hidden4FileAtchId = "<input type=\"hidden\" name=\"fileAtchId\" id=\"fileAtchId\">";
//hidden field for file policy
var gv_Hidden4FilePolicy = "<input type=\"hidden\" name=\"policy\" id=\"policy\">";
//hidden field for file atch id
var gv_Hidden4FileId = "<input type=\"hidden\" name=\"fileId\" id=\"fileId\">";


// input type file object for not IE style=\"display:none\"
var gv_InputFile = "<input type=\"file\" name=\"file\" id=\"file\" {0} onchange=\"gf_changeFile(this)\" style=\"display:none\" >";

// button string
// upload operation button string
var gv_UploadButton = "<button type='button' class='btn btn-primary btn-sm' id='btnSave' onclick=\'gf_onFileUpload()\'>Save</button>";
//var gv_OpenButton = "<a class=\"button-light file-select\" onclick=\"gf_onFileSelect()\">Open File</a> "; //"<input name=\"openBtn\" type=\"button\" value=\"열기\" onclick=\"gf_onFileSelect()\">";
//var gv_OpenButton = "<a onclick=\"gf_onFileSelect()\" style='margin: 0px 5px;'><i title='file open' class='fas fa-folder-open' style='font-size:1.5em; cursor:pointer;'></i></a>";
var gv_OpenButton = "<button type='button' class='btn btn-light btn-sm' onclick=\'gf_onFileSelect()\'>Open</button>";
//var gv_SaveButton = "<input name=\"saveBtn\" type=\"button\" value=\"저장\" onclick=\"gf_onFileUpload()\" style=\"display:none\"  >";
//var gv_InitButton = "<a class=\"button-light\" onclick=\"gf_onFileInit()\" >cancel</a> "; //"<input name=\"initBtn\" type=\"button\" value=\"취소\" onclick=\"gf_onFileInit()\">";
//var gv_InitButton = "<a onclick=\"gf_onFileInit()\" style='margin: 0px 5px;'><i title='cancel' class='fas fa-times' style='font-size:1.5em; cursor:pointer;'></i></a>";
var gv_InitButton = "<button type='button' class='btn btn-light btn-sm' onclick=\'gf_onFileInit()\' style=\'margin:3px 5px;\'>Cancel</button>";
// div string
var gv_DivStatus = "<div id=\"divStatus\" name=\"divStatus\" style=\"width:500px;height:30px\" border=\"1\"></div>";
var gv_DivProgress = "<div id=\"divProgress\" name=\"divProgress\" style=\"width:500px;height:30px\" border=\"1\"></div>";
var gv_DivDragNDrop = "<div id=\"dropbox\" name=\"dropbox\" sytle=\"width:100%;text-align:center;\"></div>";
var gv_DivButtonArea = "<div class=\"title none-icon\" ><span name=\"divBtnArea\" class=\"pull-right\"></span></div>";
var gv_DivProgress = "<div id=\"progressbar\" name=\"progressbar\" style=\"margin:0 auto;width:50%\" >" +
    "<span class=\"progress-label\" ></span>" +
    "</div>";

// 업로드를 수행하기 위해 선택한 파일 개체를 담는 전역 배열
var gv_Files = new Array();

// 파일목록이 데이터셑 형태로 필요할 가능성을 위해만든 파일 목록 데이터셑
var gds_FileList = new DataSet();


/*----------------------------------------------------------------------------------------------
 * 설명   	:
 * 파라미터 	: N/A
 * 리턴값   	: N/A
 * 작성자 	: Jun.
 * 작성일 	: 2013.03.20
 ----------------------------------------------------------------------------------------------*/
/**
 * @constructor
 * @param policy<String> 파일 업로드 policy null 일경우 default ( 현재 결재에서의 policy 는 default, excel 두가지 이다. )
 *        enableMultipleUpload<boolean>  multiple file upload 가능 여부
 * @see   fileupload.js를 <script src="/js/comp/fileupload.js"></script>를 이용하여 페이지에
 *            사용하면 화면 로드시 fileupload를 위한 UI를자동으로 생성하며 변수들을 초기화 한다.
 * @return N/A
 * @author Jun.
 * @since 2013-03-20
 * @version 1.0
 */
function gf_InitFileUploadComponent(policy, enableMultipleUpload, isForm) {

    /*if ($.browser.msie && $.browser.version < 10) {
     gf_AlertMsg('IE8 ~ IE9 버전 파일 첨부컴포넌트는 구현중입니다. \nIE 10, 구글 크롬, 사파리, 파이어폭스 에서 사용할 수 있습니다.');
     return;
     }*/

    var componentDiv = $("div[name='fileComponent']");

    if (componentDiv.length == 0) {
        gf_Trace(' file upload를 위한 div가 없기때문에 컴포넌트 UI를 생성하지 않는다. ');
        return;
    }

    isForm = typeof(isForm) == "undefined" ? true : isForm;

    // multiple file upload 설정
    gf_SetEnableMultipleUpload(enableMultipleUpload);

    // policy 설정
    gf_SetPolicy(policy);


    // 디자인 적용을 위한 div class 적용
    componentDiv.addClass("list_st5");

    var upForm = $("#uploadForm");


    // 이미 uploadForm 이라는 form이 있는지 검사 하여 없다면 새로 그린다.
    if (upForm.size() < 1) {
        // 파일업로드를 위한 폼 자동 생성
        // name이 fileComponent 인 div 를 찾아 form tag를 생성한다. 파일 업로드 이므로 multipart/form-data 로 생성
        $("div[name='fileComponent']").append(gv_UFormStr);

        if (isForm == false) {
            var html = $("#uploadForm").html();
            $("div[name='fileComponent']").empty().append("<div id='uploadForm'>" + html + "</div>");
        }
        // 금방 생성한 uploadForm에 파일 업로드를 위한 UI 를 생성한다.
        var fileForm = $("#uploadForm");
        // input type file 붙이기 non ie 에서만 동작해야 한다.
        fileForm.append(gv_DivButtonArea);
        fileForm.append(gv_DivDragNDrop);

        var btnDiv = $("span[name='divBtnArea']");
        if (typeof(FileList) != "undefined") { // multi file upload
            if (gv_EnableMultipleUpload)
                btnDiv.append(gv_InputFile.simpleReplace("{0}", "multiple"));
            else
                btnDiv.append(gv_InputFile.simpleReplace("{0}", ""));
        } else { // single file upload ( excel upload etc ... )
            btnDiv.append(gv_InputFile.simpleReplace("{0}", ""));
            $("input[name='file']").css({"display": ""});
        }
        btnDiv.append(gv_OpenButton);
        btnDiv.append(gv_InitButton);
        btnDiv.append(gv_UploadButton);
        //btnDiv.append(gv_SaveButton);

        var dndDiv = $("div[name='dropbox']");
        // upload 된 파일의 목록을 나타낼 html table

        dndDiv.append(gv_FileListTableHead);
        dndDiv.append(gv_FileListTable);
        dndDiv.append(gv_DivProgress);

        var tbody = $("table[name='fileTable']").find("tbody");
        // table에 header 를 생성
        // table.append(gv_FileListTableHeader);
        tbody.append(gv_FileListDnDInfo);
        tbody.append(gv_FileListEmptyRow);
        fileForm.append(gv_Hidden4FileAtchId);
        fileForm.append(gv_Hidden4FilePolicy);
        fileForm.append(gv_Hidden4FileId);
        fileForm.append(gv_DivStatus);

        // name이 fileComponent 인 div 를 찾아 form tag를 생성한다. 이 form은 파일 다운로드를 위해 사용한다.
        $("div[name='fileComponent']").append(gv_DFormStr);
        // download 폼을 위한 hidden 필드 생성
        var downForm = $("form[name='downForm']");
        downForm.append(gv_Hidden4FileAtchId);
        downForm.append(gv_Hidden4FilePolicy);
        downForm.append(gv_Hidden4FileId);

        // 파일 upload download시 form 의 target 이 될 iframe
        $("div[name='fileComponent']").append(gv_Iframe4DownTarget);

        // drag & drop 영역 event handler 등록
        var dbox = $("div[name='dropbox']");

        // init event handlers
        if (typeof(dbox[0].draggable) != "undefined") {
            dbox[0].addEventListener ? dbox[0].addEventListener("dragenter", dragEnter, false) : dbox[0].detachEvent("ondragenter", dragEnter);
            dbox[0].addEventListener ? dbox[0].addEventListener("dragexit", dragExit, false) : dbox[0].detachEvent("ondragexit", dragExit);
            dbox[0].addEventListener ? dbox[0].addEventListener("dragover", dragOver, false) : dbox[0].detachEvent("ondragover", dragOver);
            dbox[0].addEventListener ? dbox[0].addEventListener("drop", drop, false) : dbox[0].detachEvent("ondrop", drop);
        }

        gf_InitProgressBar();
    }

    gf_setMode();

}


/**
 * @function
 * @param N/A
 * @see   upload용 프로그래스바를 초기화 하는 함수
 * @return N/A
 * @author Jun.
 * @since 2013-03-20
 * @version 1.0
 */
function gf_InitProgressBar() {
    // 업로드 용 프로그레스바 설정
    var progressbar = $("#progressbar");
    var progressLabel = $(".progress-label");
    progressbar.progressbar({
        value: false,
        change: function () {
            progressLabel.text("Uploading Files " + progressbar.progressbar("value") + "%");
        },
        complete: function () {
            //progressLabel.text( " );
        }
    });
    // 프로그래스바의 재위치
    gf_RepositionProgressBar();
    // 프로그래스바 숨김
    progressbar.hide();
    progressLabel.hide();
}

/**
 * @function
 * @param N/A
 * @see   upload용 프로그래스바의 위치를 초기화 하는 함수
 * @return N/A
 * @author Jun.
 * @since 2013-03-20
 * @version 1.0
 */
function gf_RepositionProgressBar() {
    // 특정 영역의 center 로 설정
    $("#progressbar").css("position", "absolute")
        .css("top", ($("#dropbox").position().top + $("#dropbox").height() / 2) - $("#progressbar").height() / 2)
        .css("left", ($("#dropbox").width() / 2 - $("#progressbar").width() / 2));

    $(".progress-label").css("margin-left", "40%");

}


/**
 * @function
 * @param evt<EventObject> 파일 드래그 이벤트 object
 * @see   파일 드래그 enter 시점의 이벤트
 * @return N/A
 * @author Jun.
 * @since 2013-03-20
 * @version 1.0
 */
function dragEnter(evt) {
    evt.stopPropagation();
    evt.preventDefault();
}

/**
 * @function
 * @param evt<EventObject> 파일 드래그 이벤트 object
 * @see   파일 드래그 Exit 시점의 이벤트
 * @return N/A
 * @author Jun.
 * @since 2013-03-20
 * @version 1.0
 */
function dragExit(evt) {
    evt.stopPropagation();
    evt.preventDefault();
}

/**
 * @function
 * @param evt<EventObject> 파일 드래그 이벤트 object
 * @see   파일 드래그 Over 시점의 이벤트
 * @return N/A
 * @author Jun.
 * @since 2013-03-20
 * @version 1.0
 */
function dragOver(evt) {
    evt.stopPropagation();
    evt.preventDefault();
}

/**
 * @function
 * @param evt<EventObject> 파일 드래그 앤 드롭  이벤트 object
 * @see   파일 drop 시점의 이벤트
 * @return N/A
 * @author Jun.
 * @since 2013-03-20
 * @version 1.0
 */
function drop(evt) {
    // 다운로드 모드일경우 드래그 금지
    if (gv_Mode == "download") {
        return;
    }
    evt.stopPropagation();
    evt.preventDefault();

    // 파일 첨부 개체 추가
    var files = evt.dataTransfer.files;
    var count = files.length;

    // 첨부된 파일이 없으면 종료
    if (count == 0) return;

    // 첫번쩨 첨부라면 배열에 push
    if (gv_Files.length == 0) {
        gf_pushArray(files);
    } else {
        // 이미 파일이 첨부되어 있는 상태에서의 첨부라면 파일명 중복 체크
        if (gf_checkDupFile(files)) {
            gf_AlertMsg('gw.warn.samefilename');
            return;
        } else {
            // 중복 안됬으면 배열에 푸시
            gf_pushArray(files);
        }
    }
    // 파일이 추가된 만큼 목록에 추가
    gf_MakeFileTable(files);
}


/**
 * @function
 * @param
 * @see   파일 추가 버튼 클릭 시 이벤트 함수
 * @return N/A
 * @author Jun.
 * @since 2013-03-20
 * @version 1.0
 */
function gf_onFileSelect() {
    //var fileForm = $("#uploadForm");
    //var formData = new FormData(fileForm);
    var fileObj = document.getElementsByName("file");
    fileObj[0].click();
}


/**
 * @function
 * @param  obj<htmlObject> input type file 개체
 * @see   input type file 개체의 onchange에 걸려 있는 이벤트 함수
 * @return N/A
 * @author Jun.
 * @since 2013-03-20
 * @version 1.0
 */
function gf_changeFile(obj) {

    if (typeof(FileList) == "undefined") { //file single만 지원시
        var filePath = obj.value.replace(/\\/g, "/");
        var fileName = filePath.substr(filePath.lastIndexOf("/") + 1);
        var dupFile = function () {
            var files = $("input[name='file']");
            for (var i = 0; i < files.size(); i++) {
                if (obj == files[i]) continue;
                var oldFilePath = files[i].value.replace(/\\/g, "/");
                var oldFileName = oldFilePath.substr(filePath.lastIndexOf("/") + 1);
                if (fileName == oldFileName) {
                    return true;
                }
            }
            return false;
        }();

        if (dupFile) {
            $(obj).before($(gv_InputFile.simpleReplace("{0}", "")).css({"display": ""}));
            $(obj).remove();
            gf_AlertMsg('gw.warn.samefilename');
            return;
        }

        var jsonFileInfo = {
            "fileAtchId": gv_FileAtchId,
            "fileId": "",
            "sysCd": "",
            "filePath": "",
            "fileNm": fileName,
            "fileSize": 0
        };
        gds_FileList.add(jsonFileInfo);
        gf_MakeFileTable([obj]);
        $(obj).css({"display": "none"});
        $(obj).before($(gv_InputFile.simpleReplace("{0}", "")).css({"display": ""}));

    } else { // file multiple 지원시
        if (obj.files.length == 0) return;

        if (gv_Files.length == 0) {
            gf_pushArray(obj.files);
        } else {
            if (gf_checkDupFile(obj.files)) {
                obj.value = "";
                gf_AlertMsg('gw.warn.samefilename');
                return;
            } else {
                gf_pushArray(obj.files);
            }
        }
        // 파일 목록 테이블 생성
        gf_MakeFileTable(obj.files);
        // 파일 object 초기화
        obj.value = "";
    }

    // gf_SetUploadCallback 를 통해 설정된 callback function 있는지 검증
    if (!gf_IsNull(gv_ChangeCallFunc)) {
        // 설정된 callback 이 함수 인지 검증
        var callFunction = eval(gv_ChangeCallFunc);
        if (typeof callFunction != "function") {
            return;
        }
        // callback 함수 수행 callback 으로 전달되는 인자는 file atch id 하나이다.
        callFunction();
    }
}

/**
 * @function
 * @param  files<Object Array> 첨부된 파일 개체의 배열
 * @see    Attachment의 목록을 html로 그리는 함수
 * @return N/A
 * @author Jun.
 * @since 2013-03-20
 * @version 1.0
 */
function gf_MakeFileTable(files) {
    var tableObj = $("table[name=fileTable]").find("tbody");
    // 테이블의 마지막줄인 여기에 파일을 올려주세요 라인을 삭제 한다.
    var trObjs = $("table[name=fileTable]").find("tbody").find("tr");

    // 여기에 파일을 올려주세요 삭제
    $(".dndRow").parent().remove();
    // 첨부된파일이 없습니다. 삭제
    $(".emptyRow").parent().remove();

    var totalSize = 0;
    if (typeof(FileList) == "undefined") { //file input single만 지원한경우
        for (var i = 0; i < files.length; i++) {
            if (files[i].value == "") continue;
            var filePath = files[i].value.replace(/\\/g, "/");
            var fileName = filePath.substr(filePath.lastIndexOf("/") + 1);
            var fileSize = 0;
            var trObj = $(tableObj).find("tr");

            var fileTableRow = "<tr id='" + (trObj.size() + 1) + "' > 					\r\n " +
                "	<td>" + (trObj.size() + 1) + "</td> 									\r\n " +
                "	<td class=\"din t\">" + fileName + "</td> 									\r\n " +
                "	<td>" + Math.round((fileSize / 1024)) + "KB</td> 					\r\n " +
                "	<td>" + gv_BqsComm.userNm + "</td> 								\r\n " +
                "	<td>" + $.datepicker.formatDate('yy-mm-dd', new Date()) + "</td> \r\n " +
                "	<td > 													\r\n " +
                "		<div class=\"btn_area filedelete\" style=\"padding:0 10px;\"> 						\r\n " +
                "			<a class=\"btn s6\" onclick=\"gf_deleteFile(this)\ style=\"padding: 6px 0px;\" > 				\r\n " +
                "				<span>delete</span> 											\r\n " +
                "			</a> 																\r\n " +
                "		</div> 																	\r\n " +
                "	</td> 																		\r\n " +
                "</tr> 																			\r\n ";

            tableObj.append(fileTableRow);
        }
    } else {//file input muliple을 지원한경우
        for (var i = 0; i < files.length; i++) {
            // 파일 사이즈
            var fileSize = files[i].size;
            // 파일명
            var fileName = files[i].name;
            // 새로 추가된 tr의 넘버링을 위한 변수
            var trObj = $(tableObj).find("tr");
            totalSize += fileSize;
            // 20메가 체크
            if (totalSize > 83886080) {
                gf_AlertMsg("첨부 가능한 전체 파일 크기는 80메가 입니다.\r\n80메가가 넘는 파일은 첨부에서 제외합니다. ");
                break;
            }
            var fileTableRow = "<tr id='" + (trObj.size() + 1) + "' > 					\r\n " +
                "	<td>" + (trObj.size() + 1) + "</td> 									\r\n " +
                "	<td class=\"din t\">" + fileName + "</td> 									\r\n " +
                "	<td>" + Math.round((fileSize / 1024)) + "KB</td> 					\r\n " +
                "	<td>" + gv_BqsComm.userNm + "</td> 								\r\n " +
                "	<td>" + $.datepicker.formatDate('yy-mm-dd', new Date()) + "</td> \r\n " +
                "	<td > 													\r\n " +
                "		<div class=\"btn_area filedelete\" style=\"padding:0 10px;\"> 						\r\n " +
                "			<a class=\"btn s6\" onclick=\"gf_deleteFile(this)\" style=\"padding: 6px 0px;\" > 				\r\n " +
                "				<span>delete</span> 											\r\n " +
                "			</a> 																\r\n " +
                "		</div> 																	\r\n " +
                "	</td> 																		\r\n " +
                "</tr> 																			\r\n ";

            tableObj.append(fileTableRow);
        }
    }

    // table 재구성후 삭제한 여기에 파일을 올려주세요 라인을 다시 추가 한다.
    tableObj.append(gv_FileListDnDInfo);
    // table 재구성후 삭제한 첨부된 파일이 없습니다. 라인 추가
    tableObj.append(gv_FileListEmptyRow);

    gf_RepositionProgressBar();
    //  mode 적용
    gf_setMode();
}

/**
 * @function
 * @param  obj<Html Object> 삭제 버튼 개체
 *         fileId <number> 삭제할 파일 순번
 * @see    특정 Attachment을 삭제하는 함수
 * @return N/A
 * @author Jun.
 * @since 2013-03-20
 * @version 1.0
 */
function gf_deleteFile(obj, fileId) {

    var fileNm = $(obj).parent().parent().parent().find("td:eq(1)").text();

    if (!gf_IsNull(fileId)) {
        if (!confirm('파일도 함께 삭제됩니다. 계속 하시겠습니까?\n※삭제 시 파일을 복구 할 수 없습니다.')) {
            return;
        }
    } else {
        // 아직 업로드된 파일이 아닌경우 전역 배열에서 삭제 처리 한다.

        if (typeof(FileList) == "undefined") {
            var files = $("input[name='file']");
            for (var i = 0; i < files.size(); i++) {
                var filePath = files[i].value.replace(/\\/g, "/");
                var fileName = filePath.substr(filePath.lastIndexOf("/") + 1);
                if (fileNm == fileName) {
                    $(files[i]).remove();
                    break;
                }
            }
        } else {
            for (var i = 0; i < gv_Files.length; i++) {
                if (fileNm == gv_Files[i].name) {
                    gf_removeArray(i);
                }
            }
        }
    }

    // 파일 목록 테이블 삭제asfd
    $(obj).parent().parent().parent().remove();


    // 업로드된 파일이 삭제 처리 되는것이라면 실제 파일을 삭제하는 transaction 처리를 서버로 요청한다.
    if (!gf_IsNull(fileId)) {
        var fileInfo = {
            "fileAtchId": gv_FileAtchId,
            "fileId": fileId
        };

        // global file list dataset 에서 파일정보를 삭제 하기위해 dataset filtering
        gds_FileList.filter(
            function (DataSetRow) {
                if (DataSetRow.get("fileAtchId") == gv_FileAtchId && DataSetRow.get("fileId") == fileId) {
                    return true;
                }
                return false;
            }
        );

        for (var i = gds_FileList.size() - 1; i >= 0; i--) {
            gds_FileList.remove(i);
        }
        // filter 해제
        gds_FileList.filter(null);
        // test 용
        //gds_Test();

        gf_Transaction("FILEDELETE", "/file/deleteFileInfo.xpl", fileInfo, {}, "gf_FileList_Callback", true);
    }


    var trObj = $("table[name=fileTable]").find("tr");
    // 헤더 제외, 마지막줄 제외 하고 순번에 넘버링을 수행한다.
    for (var i = 1; i < trObj.length - 1; i++) {
        $(trObj[i]).find("td:eq(0)").text(i);
    }
}

/**
 * @function
 * @param  fileAtchId <number> Attachment묶음번호
 * @see    모든 Attachment을 삭제하는 함수
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

    var fileInfo = {
        "fileAtchId": fileAtchId
    };

    gf_Transaction("FILEDELETEALL", "/file/deleteFileMasterInfo.xpl", fileInfo, {}, "gf_FileList_Callback", true);


}

/**
 * @function
 * @param  aryFiles<ArrayFileObj> 파일 개체
 * @see    모든 Attachment을 삭제하는 함수
 * @return N/A
 * @author Jun.
 * @since 2013-03-20
 * @version 1.0
 */
function gf_pushArray(aryFiles) {

    for (var i = 0; i < aryFiles.length; i++) {
        gv_Files.push(aryFiles[i]);
        // dataset에 추가 하기 위해 json object 를 만든다.
        var jsonFileInfo = {
            "fileAtchId": gv_FileAtchId,
            "fileId": "",
            "sysCd": "",
            "filePath": "",
            "fileNm": aryFiles[i].name,
            "fileSize": aryFiles[i].size
        };
        gds_FileList.add(jsonFileInfo);
    }
    //gds_Test() ;
}

/**
 * @function
 * @param  arrayIdx<number> 지우려는 배열의 index
 * @see    Attachment 배열에서 특정 파일을 삭제
 * @return N/A
 * @author Jun.
 * @since 2013-03-20
 * @version 1.0
 */
function gf_removeArray(arrayIdx) {

    var rmDSRow = gds_FileList.find("fileNm", gv_Files[arrayIdx].name);
    if (gf_IsNull(rmDSRow) || rmDSRow < 0) {
        gf_AlertMsg('gw.warn.nodeletefileinfo');
        return;
    }
    gds_FileList.remove(rmDSRow);
    gv_Files.remove(arrayIdx);
    //gds_Test() ;
}

/**
 * @function
 * @param  aryFiles<ArrayFileObj> 파일 개체 배열
 * @see    파일 개체내에 중복된 명칭이 있는지 확인
 * @return N/A
 * @author Jun.
 * @since 2013-03-20
 * @version 1.0
 */
function gf_checkDupFile(aryFiles) {

    for (var i = 0; i < aryFiles.length; i++) {
        for (var j = 0; j < gv_Files.length; j++) {
            if (gv_Files[j].name == aryFiles[i].name) {
                return true; // duplicate
            }
        }
    }
    return false; // non duplicate

}


/**
 * @function
 * @param  N/A
 * @see   전역변수 / input type file 개체  초기화 함수
 * @return N/A
 * @author Jun.
 * @since 2013-03-20
 * @version 1.0
 */
function gf_onFileInit() {

    if (typeof(FileList) == "undefined") { //file single만 지원시fileForm.append(gv_InputFile.simpleReplace("{0}", ""));
        $("input[name='file']:eq(0)").before($(gv_InputFile.simpleReplace("{0}", "")).css({"display": ""}));
        while ($("input[name='file']").size() > 1)
            $("input[name='file']:eq(" + ($("input[name='file']").size() - 1) + ")").remove();
    } else {
        gv_Files = new Array();
        $("input[type='file'][name='file']").value = "";
    }

    if (gf_IsNull(gv_FileAtchId)) {

        var tbody = $("table[name='fileTable']").find("tbody");
        var tableTr = $("table[name='fileTable']").find("tbody").find("tr");

        // 이전에 유지되던 리스트 삭제
        for (var i = tableTr.length - 1; i > 0; i--) {
            $(tableTr[i]).remove();
        }

        if (!gf_IsNull(gv_UploadCompleteCallFunc)) {
            // 설정된 callback 이 함수 인지 검증
            var callFunction = eval(gv_UploadCompleteCallFunc);
            if (typeof callFunction != "function") {
                gf_AlertMsg('sg.inf.undefCallback', [gv_UploadCompleteCallFunc]);
                return;
            }
            // callback 함수 수행 callback 으로 전달되는 인자는 file atch id 하나이다.
            eval(gv_UploadCompleteCallFunc + "();");
        }
        return;
    }
    // 저장된 첨부 조회 수행
    gf_retrieveFileList(gv_FileAtchId);
}


/**
 * @function
 * @param  N/A
 * @see    컴포넌트 reset 함수
 * @return N/A
 * @author Jun.
 * @since 2013-03-20
 * @version 1.0
 */
function gf_onResetComponnent() {
    var componentDiv = $("div[name='fileComponent']");
    componentDiv.empty();
    gf_InitFileUploadComponent();
}


/**
 * @function
 * @param  N/A
 * @see    파일이 업로드 함수
 * @return N/A
 * @author Jun.
 * @since 2013-03-20
 * @version 1.0
 */
function gf_onFileUpload(type) {


    if (typeof(FileList) == "undefined") { //file single만 지원시
        if ($("input[name='file']").size < 2) {
            gf_Trace("업로드할 파일이 없습니다.");
            gf_UploadCallback(gv_FileAtchId);
            return false;
        }
        var form = $("#uploadForm");
        if (form.find("[name='type']").size() < 1)
            form.append("<input type='hidden' name='type' value='frame'>");

        $("[name='file']:eq(0)").remove();
        $("#uploadForm").submit();
    } else {

        if (gv_Files.length == 0) {
            gf_Trace("업로드할 파일이 없습니다.");
            gf_UploadCallback(gv_FileAtchId);
            return false;
        }

        // form data used XHRequest
        var formData = new FormData();
        // Since this is the file only, we send it to a specific location
        var action = gv_ContextPath + '/file/uploadWebFile.xpl';
        if (typeof(type) != "undefined")
            formData.append("type", type);

        // FormData only has the file
        //$("input[type='file'][name='file']").files = gv_Files;

        // upload file list set in form data
        for (var i = 0; i < gv_Files.length; i++) {
            formData.append("file", gv_Files[i]);
        }

        // file atch id set in form data
        if (gf_IsNull(gv_FileAtchId)) {
            formData.append("fileAtchId", "");
        } else {
            formData.append("fileAtchId", gv_FileAtchId);
        }

        if (gf_IsNull(gv_Policy)) {
            formData.append("policy", "default");
        } else {
            formData.append("policy", gv_Policy);
        }
        var deleteIds = [];
        var updateList = gds_FileList.getAllData("U");
        for (var i = 0; i < updateList.length; i++) {
            if (updateList.rowStatus == "DELETE")
                deleteIds[deleteIds.length] = updateList.fileId;
        }
        if (deleteIds.length > 0) {
            formData["DEXTUploadX_Deleted_Uploaded"] = deleteIds;
        }


        gf_sendXHRequest(formData, action);
    }
}

/**
 * @function
 * @param  N/A
 * @see    file upload를 위한 xmlhttprequest 생성 함수 & 프로그래스를 위한 이벤트 등록 함수
 * @return N/A
 * @author Jun.
 * @since 2013-03-20
 * @version 1.0
 */
function gf_sendXHRequest(formData, uri) {
    // Get an XMLHttpRequest instance
    var xhr = new XMLHttpRequest();

    // Set up events
    xhr.addEventListener('loadstart', onloadstartHandler, false);
    xhr.upload.addEventListener('progress', onprogressHandler, false);
    xhr.addEventListener('load', onloadHandler, false);
    xhr.addEventListener('loadend', onloadEndHandler, false);
    xhr.addEventListener('readystatechange', onreadystatechangeHandler, false);

    // Set up request
    xhr.open('POST', uri, true);

    // Fire!
    xhr.send(formData);
}


/**
 * @function
 * @param  callBackFunc<String> callback 함수명
 * @see    파일 업로드 실행후 수행될 business callback 함수 설정
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
 * @param  callBackFunc<String> callback 함수명
 * @see    파일 업로드 실행후 수행될 business callback 함수 설정
 * @return N/A
 * @author Jun.
 * @since 2013-03-20
 * @version 1.0
 */
function gf_SetFileChangeCallback(callBackFunc) {
    gv_ChangeCallFunc = callBackFunc;
}

/**
 * @function
 * @param  callBackFunc<String> callback 함수명
 * @see    파일 업로드 실행후 수행될 business callback 함수 설정
 * @return N/A
 * @author Jun.
 * @since 2013-03-20
 * @version 1.0
 */
function gf_SetUploadCompleteCallback(callBackFunc) {
    gv_UploadCompleteCallFunc = callBackFunc;
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
    var dbox = $("div[name='dropbox']");

    if (gv_Mode == "upload") {
        $("span[name='divBtnArea'] a").show();
        $(".filedelete").show();
        $(".dndRow").show();
        $(".emptyRow").hide();

        if (typeof(FileList) == "undefined")
            $("span[name='divBtnArea'] a").hide();

    } else if (gv_Mode == "download") {
        $("[name='fileComponent'] div.title>span").hide();
        $(".filedelete").hide();
        $(".dndRow").hide();
        var trObjs = $("table[name=fileTable]").find("tbody").find("tr");
        if (trObjs.length == 3) {
            $(".emptyRow").show();
        } else {
            $(".emptyRow").hide();
        }

        if (typeof(FileList) == "undefined")
            $("[name='file']").hide();

    } else if (gv_Mode == "all") {
        $("span[name='divBtnArea'] a").show();
        $(".filedelete").show();
        $(".dndRow").show();
        $(".emptyRow").hide();

        if (typeof(FileList) == "undefined")
            $("span[name='divBtnArea'] a").hide();

    } else {
        gf_AlertMsg('gw.warn.nofilemode');
    }
    if (dbox.size() > 0 && typeof(dbox[0].draggable) == "undefined") {
        dbox.find(".dndRow").hide();
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


}


/**
 * @function
 * @param  fileAtchId<String> file atch id
 * @see   파일 업로드 실행후 수행되는 callback
 * @return N/A
 * @author Jun.
 * @since 2013-03-20
 * @version 1.0
 */
function gf_UploadCallback(fileAtchId) {

    // gf_SetUploadCallback 를 통해 설정된 callback function 있는지 검증
    if (!gf_IsNull(gv_UploadCallFunc)) {
        // 설정된 callback 이 함수 인지 검증
        var callFunction = eval(gv_UploadCallFunc);
        if (typeof callFunction != "function") {
            gf_AlertMsg('sg.inf.undefCallback', [gv_UploadCallFunc]);
            return;
        }
        // callback 함수 수행 callback 으로 전달되는 인자는 file atch id 하나이다.
        eval(gv_UploadCallFunc + "('" + fileAtchId + "');");
    }
    // uploadform 에 fileatchid 설정
    $("#uploadForm > input[name$='fileAtchId']")[0].value = fileAtchId;
    if(!fileAtchId == '') {
    	$('input[name="fileAtchId"]').val(fileAtchId);
    }

    if (gf_IsNull(gv_FileAtchId)) {
        gv_FileAtchId = fileAtchId;
    }

    // 첨부 완료후 전역 파일 변수 초기화

    if (typeof(FileList) == "undefined") { //file single만 지원시fileForm.append(gv_InputFile.simpleReplace("{0}", ""));
        $("input[name='file']:eq(0)").before($(gv_InputFile.simpleReplace("{0}", "")).css({"display": ""}));
        while ($("input[name='file']").size() > 1)
            $("input[name='file']:eq(" + ($("input[name='file']").size() - 1) + ")").remove();
    } else {
        gv_Files = new Array();
    }
    if (gf_IsNull(fileAtchId)) {
        return;
    }
    // 저장된 첨부 조회 수행
    gf_retrieveFileList(fileAtchId);


}
function gf_UploadUrlCallback(url) {
    if (!gf_IsNull(gv_UploadCallFunc)) {
        // 설정된 callback 이 함수 인지 검증
        var callFunction = eval(gv_UploadCallFunc);
        if (typeof callFunction != "function") {
            gf_AlertMsg('sg.inf.undefCallback', [callBackFunc]);
            return;
        }
        // callback 함수 수행 callback 으로 전달되는 인자는 file atch id 하나이다.
        eval(gv_UploadCallFunc + "('" + url + "');");
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
function gf_setFileAtchId(fleAtchId) {
    gf_retrieveFileList(fileAtchId);
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
        fileAtchId = "";
        gv_FileAtchId = "";
        $("#uploadForm > input[name$='fileAtchId']")[0].value = fileAtchId;
        return;
    } else {
        gv_FileAtchId = fileAtchId;
    }
    // form의 hidden 필드에 fileAtchId 설정
    $("#uploadForm > input[name$='fileAtchId']")[0].value = fileAtchId;

    // 조회 transaction 수행
    var fileInfo = {
        "fileAtchId": fileAtchId
    };
    gf_Transaction("SELECT_FILELIST", "/file/retrieveWebFileList.xpl", fileInfo, {}, "gf_FileList_Callback", true);
}


/**
 * @function
 * @param fileAtchId<String> 파일 첨부 아이디
 *        fileId<String> 파일 순번
 * @see   파일 다운로드 함수
 * @return N/A
 * @author Jun.
 * @since 2013-03-20
 * @version 1.0
 */
function gf_DownloadFile(fileAtchId, fileId) {

    var downFileAtchId = $("form[name='downForm'] > input[name$='fileAtchId']")[0];
    var downFileId = $("form[name='downForm'] > input[name$='fileId']")[0];

    $(downFileAtchId).val(fileAtchId);
    $(downFileId).val(fileId);

    $("form[name='downForm']")[0].submit();

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
//function gf_FileList_Callback(strSvcId, obj, resultData) {
function gf_FileList_Callback(strSvcId, resultData) {

    // transaction determines whether the normal processing.
    if (!gf_ChkTransaction(strSvcId, resultData, true)) {
        return;
    }

    // 조회 transaction 후 callback
    if (strSvcId == "SELECT_FILELIST") {
        var tbody = $("table[name='fileTable']").find("tbody");
        var tableTr = $("table[name='fileTable']").find("tbody").find("tr");

        // 이전에 유지되던 리스트 삭제
        /*for (var i = tableTr.length - 1; i > 0; i--) {
         $(tableTr[i]).remove();
         }*/
        tbody.empty();
        // gloval file list dataset
        gds_FileList.setAllData(resultData["fileList"]);
        //gds_Test() ;
        // file list draw
        //gf_MakeFileTable()


        if (gds_FileList.size() > 0) {
            $.each(resultData, function (i, itemAry) {
                if (i == "fileList") {
                    $.each(itemAry, function (j, item) {
                        tbody.append("<tr> 			     																									\r\n" +
                            "	<td>" + item.rownum + "</td>																								\r\n" +
                            "	<td style=\"text-align:left\"> <a style=\"text-decoration:none;text-align:center\" href='#' onclick='gf_DownloadFile(" + item.fileAtchId + "," + item.fileId + ")'>" + item.fileNm + "</a></td>	\r\n" +
                            "  <td>" + Math.round((item.fileSize / 1024)) + "KB</td>																		\r\n" +
                            "	<td>" + item.fstRegUserId + "</td>																						\r\n" +
                            "  <td>" + item.fstRegDt + "</td>																							\r\n" +
                            "  <td>																												\r\n" +
                            " 		<div class=\"btn_area filedelete\" style=\"padding:0 10px;\">																				\r\n" +
                            "			<a class=\"btn s6\" onclick='gf_deleteFile(this, " + item.fileId + ")' style=\"padding: 6px 0px;\">															\r\n" +
                            "				<span>delete</span>																										\r\n" +
                            "			</a>																														\r\n" +
                            "		</div> 																															\r\n" +
                            "</tr>																																	\r\n ");
                    });
                    tbody.append(gv_FileListDnDInfo);
                    tbody.append(gv_FileListEmptyRow);
                    gf_setMode();
                    $(".emptyRow").hide();

                }
                ;
            });
        }

        if (typeof(FileList) == "undefined") {
            gf_MakeFileTable($("input[name='file']"));
        } else {
            gf_MakeFileTable(gv_Files);
        }

        if (!gf_IsNull(gv_UploadCompleteCallFunc)) {
            // 설정된 callback 이 함수 인지 검증
            var callFunction = eval(gv_UploadCompleteCallFunc);
            if (typeof callFunction != "function") {
                gf_AlertMsg('sg.inf.undefCallback', [gv_UploadCompleteCallFunc]);
                return;
            }
            // callback 함수 수행 callback 으로 전달되는 인자는 file atch id 하나이다.
            eval(gv_UploadCompleteCallFunc + "();");
        }

    } else if (strSvcId == "FILEDELETE") {
        // 삭제 transaction후 callback;
        gf_retrieveFileList(gv_FileAtchId);
    } else if (strSvcId == "FILEDELETEALL") {
        // 삭제 transaction후 callback;
        gv_FileAtchId = "";
        gf_retrieveFileList(gv_FileAtchId);
    }
    gf_RepositionProgressBar();

}

// Handle the start of the transmission
/**
 * @function
 * @param  evt<ProgressEventObj> 프로그래스 이벤트 개체
 * @see    Handle the start of the transmission
 * @return N/A
 * @author Jun.
 * @since 2013-03-20
 * @version 1.0
 */
function onloadstartHandler(evt) {
    var div = document.getElementById('divStatus');
    div.innerHTML = 'Upload started!';
}

// Handle the end of the transmission
/**
 * @function
 * @param  evt<ProgressEventObj> 프로그래스 이벤트 개체
 * @see    Handle the end of the transmission
 * @return N/A
 * @author Jun.
 * @since 2013-03-20
 * @version 1.0
 */
function onloadHandler(evt) {
    /*var div = document.getElementById('divStatus');
     div.innerHTML = 'Upload successful!';*/
}

/**
 * @function
 * @param  evt<ProgressEventObj> 프로그래스 이벤트 개체
 * @see    업로드가 완료되면 프로그래스바를 가린다.
 * @return N/A
 * @author Jun.
 * @since 2013-03-20
 * @version 1.0
 */
function onloadEndHandler(evt) {

    if (gf_IsNull(evt.target.responseText)) {
        alert(evt.target.responseText);
    }
    else {
        var returnObj = typeof(evt.target.responseText) == "string" ? JSON.parse(evt.target.responseText) : evt.target.responseText;

        if (evt.target.status != '200') {
            gf_AlertMsg('Error catched during file upload');
            return;
        }

        if (!gf_IsNull(returnObj['fileAtchId'])) {
            // 프로그래스바 가리기
            $("#progressbar").hide();
            $(".progress-label").hide();
            gf_UploadCallback(returnObj['fileAtchId']);

        } else if (!gf_IsNull(returnObj['callFunc'])) {
            // 프로그래스바 가리기
            $("#progressbar").hide();
            $(".progress-label").hide();
            eval(returnObj['callFunc']);
        }
    }

}


// Handle the progress
/**
 * @function
 * @param  evt<ProgressEventObj> 프로그래스 이벤트 개체
 * @see    업로드진행중 프로그래스바 무빙 이벤트
 * @return N/A
 * @author Jun.
 * @since 2013-03-20
 * @version 1.0
 */
function onprogressHandler(evt) {
    // upload progress bar present
    var progressbar = $("#progressbar");

    var percent = Math.round(evt.loaded / evt.total * 100);
    $("#progressbar").show();
    $(".progress-label").show();

    progressbar.progressbar("option", {
        value: percent
    });

}


/**
 * @function
 * @param  evt<ProgressEventObj> 프로그래스 이벤트 개체
 * @see    Handle the response from the server
 * @return N/A
 * @author Jun.
 * @since 2013-03-20
 * @version 1.0
 */
function onreadystatechangeHandler(evt) {

}