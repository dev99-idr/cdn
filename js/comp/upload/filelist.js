/*******************************************************************
 * 01. 업무구분            : 공통
 * 02. 스크립트 설명    : Attachment 목록 조회 컴포넌트
 * 03. 작성자            : Jun.
 * 04. 작성일            : 2013.05.06
 ******************************************************************/

/**
 * @class Attachment 목록 조회 컴포넌트 class
 * @constructor
 * @param divNm<String> 파일 업로드 컴포넌트가 위치할 div name
 * @param classNm<String> 컴포넌트를 사용하기위한 class명
 * @see   classNm은 이 컴포넌트를 사용하는 화면단에서
 *        var comp1 = new uploadlist("divFList", "comp1"); 의 코딩처럼 해당 클래스를 선언해서 사용할때 var comp1 이라는 변수의 이름을 뜻한다.
 * @author Jun.
 * @since 2013-05-06
 * @version 1.0
 */
var uploadlist = function (divNm, classNm) {
    uploadlist.prototype.dispDivNm = divNm;
    uploadlist.prototype.className = classNm;
};

/**
 * @see    컴포넌트가 위치할 Div 명
 * @author Jun.
 * @since 2013-05-06
 * @version 1.0
 */
uploadlist.prototype.className;

/**
 * @see    컴포넌트가 위치할 Div 명
 * @author Jun.
 * @since 2013-05-06
 * @version 1.0
 */
uploadlist.prototype.dispDivNm = "divFileList";

/**
 * @see    Attachment 묶음 번호
 * @author Jun.
 * @since 2013-05-06
 * @version 1.0
 */
uploadlist.prototype.fileAtchId;

/**
 * @see    다운로드를 위한 form
 * @author Jun.
 * @since 2013-05-06
 * @version 1.0
 */
uploadlist.prototype.dFormStr = "<form name=\"downForm\" id=\"downForm\" target=\"fileUploader\" method=\"post\" action=\"" + gv_ContextPath + "/file/downloadUploadedFile.xpl\"></form>";

/**
 * @see    다운로드시 화면 redirect를 막기 위한 download form target
 * @author Jun.
 * @since 2013-05-06
 * @version 1.0
 */
uploadlist.prototype.iframe4DownTarget = "<iframe name=\"fileUploader\" style=\"display:none\"></iframe>";


/**
 * @see    파일 목록을 위한 테이블 string
 * @author Jun.
 * @since 2013-05-06
 * @version 1.0
 */
uploadlist.prototype.fileListTable = "<table id=\"fileListTable{0}\" name=\"fileListTable{0}\" border=\"0\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\"> \r\n" +
    "	<colgroup> 								\r\n" +
    "		<col width=\"41\"> 					\r\n" +
    "		<col width=\"\"> 					\r\n" +
    "		<col width=\"98\"> 					\r\n" +
    "		<col width=\"124\"> 				\r\n" +
    "		<col width=\"153\"> 				\r\n" +
    "	</colgroup> 							\r\n" +
    "  <tbody>									\r\n" +
    "		<tr> 								\r\n" +
    "			<th>순번</th>					\r\n" +
    "			<th>파일명</th> 					\r\n" +
    "			<th>파일크기</th> 				\r\n" +
    " 			<th>생성자</th> 					\r\n" +
    " 			<th>생성일</th> 					\r\n" +
    "		</tr> 								\r\n" +
    " 	</tbody>  								\r\n" +
    "</table>										";

/**
 * @see    파일 목록을 위한 테이블 header
 * @author Jun.
 * @since 2013-05-06
 * @version 1.0
 */
uploadlist.prototype.fileListTableHeader = "<tr><td>순번</td><td>파일명</td><td>파일크기</td><td>생성자</td><td>생성일</td></tr>";

/**
 * @see    파일 목록을 위한 empty row
 * @author Jun.
 * @since 2013-05-06
 * @version 1.0
 */
uploadlist.prototype.fileListTableEmptyRow = "<tr><td class=\"din\" colspan=\"5\">첨부된 파일이 없습니다.</td></tr>";

/**
 * @see   Attachment 묶음 번호 hidden field string
 * @author Jun.
 * @since 2013-05-06
 * @version 1.0
 */
uploadlist.prototype.hidden4FileAtchId = "<input type=\"hidden\" name=\"fileAtchId\" id=\"fileAtchId\">";


/**
 * @see   파일 아이디  hidden field string
 * @author Jun.
 * @since 2013-05-06
 * @version 1.0
 */
uploadlist.prototype.hidden4FileId = "<input type=\"hidden\" name=\"fileId\" id=\"fileId\">";

/**
 * @see   파일목록 데이터셑
 * @author Jun.
 * @since 2013-05-06
 * @version 1.0
 */
uploadlist.prototype.dsFileList = new DataSet();


/**
 * @see    업로드 컴포넌트를 화면에 배치하기위한 초기화 함수
 * @param  aFileAtchId<String> Attachment 묶음 번호
 * @return true/false<bool> 컴포넌트 생성 성공 여부
 * @author Jun.
 * @since 2013-05-06
 * @version 1.0
 */
uploadlist.prototype.initFileListComponent = function (aFileAtchId) {

    // 파일업로드 UI 를 생성하기 위한 div 체크
    var componentDiv = $("div[name='" + uploadlist.prototype.dispDivNm + "']");
    componentDiv.addClass("list_st3");

    uploadlist.prototype.fileListTable = uploadlist.prototype.fileListTable.simpleReplace("{0}", uploadlist.prototype.dispDivNm);

    if (componentDiv.length == 0) {
        gf_Trace(' file List 위한 div가 없기때문에 컴포넌트 UI를 생성하지 않는다. ');
        return false;
    }

    // 파일 목록 ui를 빈 상태로 생성한다.
    componentDiv.append(uploadlist.prototype.fileListTable);
    var fileTbody = $("table[name='fileListTable" + uploadlist.prototype.dispDivNm + "']").find("tbody");
    fileTbody.append(uploadlist.prototype.fileListTableEmptyRow);

    var downiFrm = $("iframe[name='fileUploader']");
    // 다운로드용 iframe 이 이미 있다면 생성하지 않는다.
    // 없다면 생성한다.
    if (downiFrm.length == 0) {
        componentDiv.append(uploadlist.prototype.iframe4DownTarget);
    }

    // 다운로드용 폼이 이미 있다면 생성하지 않고 없다면 생성한다.
    var downForm = $("form[name='downForm']");
    if (downForm.length == 0) {
        componentDiv.append(uploadlist.prototype.dFormStr);
        // form 내에 hidden field 배치
        downForm = $("form[name='downForm']");
        downForm.append(uploadlist.prototype.hidden4FileAtchId);
        downForm.append(uploadlist.prototype.hidden4FileId);
    }


    if (!gf_IsNull(aFileAtchId)) {
        uploadlist.prototype.setFileAtchId(aFileAtchId);
    }
};

/**
 * @see    Attachment묶음 번호를 컴포넌트에 setting 함 set과 동시에 조회를 수행한다.
 * @param  aFileAtchId<String> Attachment 묶음 번호
 * @author Jun.
 * @since 2013-05-06
 * @version 1.0
 */
uploadlist.prototype.setFileAtchId = function (aFileAtchId) {
    uploadlist.prototype.retrieveFileList(aFileAtchId);
};

/**
 * @see    업로드된 파일 목록을 조회
 * @param  aFileAtchId<String> Attachment 묶음 번호
 * @author Jun.
 * @since 2013-05-06
 * @version 1.0
 */
uploadlist.prototype.retrieveFileList = function (aFileAtchId) {

    if (gf_IsNull(aFileAtchId)) {
        aFileAtchId = uploadlist.prototype.fileAtchId;
    }
    else {
        uploadlist.prototype.fileAtchId = aFileAtchId;
    }

    // 조회 transaction 수행
    var fileInfo = {"fileAtchId": aFileAtchId};
    gf_Transaction("SELECT_FILELIST", "/file/retrieveWebFileList.xpl", fileInfo, {}, uploadlist.prototype.className + ".fileList_Callback", false);
};

/**
 * @see    업로드된 파일 목록을 조회
 * @param  aFileAtchId<String> Attachment 묶음 번호
 * @author Jun.
 * @since 2013-05-06
 * @version 1.0
 */
uploadlist.prototype.fileList_Callback = function (strSvcId, obj, resultData) {
    gf_Trace('upload list callback called');
    // transaction determines whether the normal processing.
    if (!gf_ChkTransaction(strSvcId, resultData, true)) {
        return;
    }

    // 조회 transaction 후 callback
    if (strSvcId == "SELECT_FILELIST") {
        var tbody = $("table[name='fileListTable" + uploadlist.prototype.dispDivNm + "']").find("tbody");
        var tableTr = $("table[name='fileListTable" + uploadlist.prototype.dispDivNm + "']").find("tbody").find("tr");

        // 이전에 유지되던 리스트 삭제
        for (var i = tableTr.length - 1; i > 0; i--) {
            if ($(tableTr[i]).find("th").length > 0) {
                continue;
            }
            $(tableTr[i]).remove();
        }
        // gloval file list dataset
        uploadlist.prototype.dsFileList.setAllData(resultData["fileList"]);
        //gds_Test() ;

        // file list draw
        $.each(resultData, function (i, itemAry) {
            if (i == "fileList") {
                $.each(itemAry, function (j, item) {
                    tbody.append("<tr class=\"f1\"> " +
                        "	<td class=\"din\" >" + item.rownum + "</td>" +
                        "	<td class=\"din t\" style=\"background-color:white\" > <a style=\"text-decoration:none;\" href='#' onclick='" + uploadlist.prototype.className + ".downloadFile(" + item.fileAtchId + "," + item.fileId + ")'>" + item.fileNm + "</a></td>" +
                        "	<td class=\"din\">" + Math.round((item.fileSize / 1024)) + "KB</td> " +
                        "	<td class=\"din\">" + item.fstRegUserId + "</td>" +
                        "	<td class=\"din last\">" + item.fstRegDt + "</td>" +
                        "</tr>");
                });
            }
            ;
        });

        tableTr = $("table[name='fileListTable" + uploadlist.prototype.dispDivNm + "']").find("tbody").find("tr");

        // 만약 헤더만 있는 상태라면

        if (tableTr.length == 1) {
            tbody.append(uploadlist.prototype.fileListTableEmptyRow);
        }
    }
};


/*----------------------------------------------------------------------------------
 * 설명   	: 파일 다운로드 함수
 * 파라미터 	: fileAtchId, fileId
 * 리턴값   	: N/A
 * 작성자 	: Jun.
 * 작성일 	: 2013.03.20
 ----------------------------------------------------------------------------------*/
uploadlist.prototype.downloadFile = function (aFileAtchId, aFileId) {

    var downFileAtchId = $("form[name='downForm'] > input[name$='fileAtchId']")[0];
    var downFileId = $("form[name='downForm'] > input[name$='fileId']")[0];

    $(downFileAtchId).val(aFileAtchId);
    $(downFileId).val(aFileId);

    $("form[name='downForm']").submit();

};


/**
 * @see    파일 목록을 위한 테이블 string
 * @author Jun.
 * @since 2013-05-06
 * @version 1.0
 */
uploadlist.prototype.simplefileList = "<table  id=\"simpleFileListTable{0}\" name=\"simpleFileListTable{0}\" width=\"100%\" cellspacing=\"2\" cellpadding=\"0\"> \r\n" +
    "		<tr style = \"color:#6e8cb8; font-size:12px; background-color: #c2d3ff\" > 								\r\n" +
    "			<td style=\"border:1px solid #a8aebd;text-align:center\">순번</td>					\r\n" +
    "			<td style=\"border:1px solid #a8aebd;text-align:center\">파일명</td> 					\r\n" +
    "			<td style=\"border:1px solid #a8aebd;text-align:center\">파일크기</td> 				\r\n" +
    "		</tr>\r\n" +
    "{1}" +
    "</table>";


/**
 * @see    업로드된 파일 목록을 조회
 * @param  aFileAtchId<String> Attachment 묶음 번호
 * @author Jun.
 * @since 2013-05-06
 * @version 1.0
 */
uploadlist.prototype.retrieveSimpleFileList = function (aFileAtchId) {

    if (gf_IsNull(aFileAtchId)) {
        aFileAtchId = uploadlist.prototype.fileAtchId;
    }
    else {
        uploadlist.prototype.fileAtchId = aFileAtchId;
    }

    if (gf_IsNull(aFileAtchId)) {
        gf_AlertMsg("bqs.err.nofileatchid");
        return;
    }

    // 조회 transaction 수행
    var fileInfo = {"fileAtchId": aFileAtchId};
    gf_Transaction("SELECT_SIMPLEFILELIST", "/file/retrieveWebFileList.xpl", fileInfo, {}, uploadlist.prototype.className + ".simpleFileList_Callback", false);
};

/**
 * @see    업로드된 파일 목록을 조회
 * @param  aFileAtchId<String> Attachment 묶음 번호
 * @author Jun.
 * @since 2013-05-06
 * @version 1.0
 */
uploadlist.prototype.simpleFileList_Callback = function (strSvcId, obj, resultData) {

    gf_Trace('upload list callback called');

    // transaction determines whether the normal processing.
    if (!gf_ChkTransaction(strSvcId, resultData, true)) {
        return;
    }

    // 조회 transaction 후 callback
    if (strSvcId == "SELECT_SIMPLEFILELIST") {
        uploadlist.prototype.dsFileList.setAllData(resultData["fileList"]);
    }
};

uploadlist.prototype.getList = function () {
    var tbodyStr = "";
    var fileList = uploadlist.prototype.simplefileList.simpleReplace("{0}", "");
    var dsFileList = uploadlist.prototype.dsFileList;
    // file list draw
    for (var i = 0; i < dsFileList.size(); i++) {
        tbodyStr += "<tr class=\"f1\" style=\"background-color : #e7ebf7 \">"
            + "<td class=\"din\" style=\"border:1px solid #a8aebd;text-align:center\">" + dsFileList.get(i, "rownum") + "</td>"
            + "<td class=\"din title\" style=\"border:1px solid #a8aebd;\">"
            + "<a style=\"text-decoration:none;\" href='" + gv_ContextPath + "/file/downloadUploadedFile.xpl?fileAtchId=" + dsFileList.get(i, "fileAtchId") + "&fileId=" + dsFileList.get(i, "fileId") + "' onclick='" + uploadlist.prototype.className + ".downloadFile(" + dsFileList.get(i, "fileAtchId") + "," + dsFileList.get(i, "fileId") + "); return false;'>" + dsFileList.get(i, "fileNm")
            + "</a>"
            + "</td>"
            + "<td class=\"din\" style=\"border:1px solid #a8aebd;text-align:center\">" + Math.round(dsFileList.get(i, "fileSize") / 1024) + "KB</td>"
            + "</tr>";

    }

    fileList = fileList.simpleReplace("{1}", tbodyStr);
    return fileList;
}


