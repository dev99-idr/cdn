/*----------------------------------------------------------------------------------
 * 설명   : DB SQL을 이용한 리포팅 뷰어(미리보기)를 오픈한다.
 * 파라미터 : aUrl : 레포트파일 경로
 *             rexParams : 레포트출력시 사용될 인자
 *             buttonPriv : 버튼 사용여부
 *             formType : 양식 형식 (사용되지 않음 삭제 고려중)
 *             custBtn : 임의로 사용할수 있는 함수{name : "버튼명", func : ""}
 * 리턴값   : boolean
 * 작성자 : Jun.
 * 작성일 : 2012.04.22
 ----------------------------------------------------------------------------------*/
function gf_RexReportByDB(aUrl, rexParams, buttonPriv, formType, custBtn) {
    //H : 가로양식, V : 세로양식 (Default)
    if (formType) aUrl += "&formType=" + formType;
    var url = gf_RexReportUrl(aUrl, rexParams);
    var formUrl = "com::COMPREVIEW.xfdl";
    gf_Dialog("REPORTVIEWER", formUrl, 60, 210, 986, 575, false, "left top", {
        av_url: url, av_buttonPriv: buttonPriv, custBtn: custBtn
    }, false, false, true);
}


/*----------------------------------------------------------------------------------
 * 설명   : XML 파일을 이용한 리포팅 뷰어(미리보기)를 오픈한다.
 * 파라미터 : aUrl : 레포트파일 경로
 *             xmlUri : XML파일 경로
 *             rexParams : 레포트출력시 사용될 인자
 *             buttonPriv : 버튼 사용여부
 *             formType : 양식 형식 (사용되지 않음 삭제 고려중)
 *             custBtn : 임의로 사용할수 있는 함수{name : "버튼명", func : ""}
 * 리턴값   : boolean
 * 작성자 : Jun.
 * 작성일 : 2012.04.22
 ----------------------------------------------------------------------------------*/
function gf_RexReportByXF(aUrl, xmlUri, rexParams, buttonPriv, formType, custBtn) {
    //H : 가로양식, V : 세로양식 (Default)
    rexParams.type = "file";
    rexParams.path = xmlUri.search(/^http[s]?:/gi) == 0 ? xmlUri : gf_getAppUrl('/') + xmlUri;
    if (formType) aUrl += "&formType=" + formType;
    var url = gf_RexReportUrl(aUrl, rexParams);
    gf_Trace("url : " + url);
    var formUrl = "com::COMPREVIEW.xfdl";
    gf_Dialog("REPORTVIEWER", formUrl, 60, 210, 986, 575, false, "left top", {
        av_url: url, av_buttonPriv: buttonPriv, custBtn: custBtn
    }, false, false, true);
}

/*----------------------------------------------------------------------------------
 * 설명   : DATASET를 이용한 리포팅 뷰어(미리보기)를 오픈한다.
 * 파라미터 : aUrl : 레포트파일 경로
 *             rexParams : 레포트출력시 사용될 인자
 *             dataSet : 레포트에 출력할 데이터셋
 *             buttonPriv : 버튼 사용여부
 *             formType : 양식 형식 (사용되지 않음 삭제 고려중)
 *             custBtn : 임의로 사용할수 있는 함수{name : "버튼명", func : ""}
 * 리턴값   : boolean
 * 작성자 : Jun.
 * 작성일 : 2012.04.22
 ----------------------------------------------------------------------------------------------*/
function gf_RexReportByDS(aUrl, rexParams, dataSet, buttonPriv, formType, custBtn) {
    // XSL을 이용하여 XML포맷을 변경함
    var dataSets = new Array();
    var dataSetNames = new Array();
    if (typeof(dataSet) != "undefined") {
        dataSets = gf_IsArray(dataSet) ? dataSet : [dataSet];
        dataSetNames = function (e) {
            var r = [];
            for (i in e) {
                r[r.length] = e[i].name
            }
            return r
        }(dataSets);
    }
    var rexpertXml = "";
    var rexpertXmls = new Array();
    for (var i = 0; i < dataSets.length; i++) {
        rexpertXmls[i] = gf_DataSetToXml(dataSets[i]);
    }
    rexpertXml = gf_ToRexpertXmlBody(rexpertXmls, dataSetNames);
    gf_Trace(rexpertXml)
    //rexpertXml = rexpertXml.replace("><",">\r\n<");
    system.clearClipboard();
    system.setClipboard("CF_UNICODETEXT", rexpertXml);
    //gf_Trace(rexpertXml);
    //H : 가로양식, V : 세로양식 (Default)
    if (formType) aUrl += "&formType=" + formType;
    aUrl += "&dataType=XML";
    var url = gf_RexReportUrl(aUrl, rexParams);
    var formUrl = "com::COMPREVIEW.xfdl";
    gf_Dialog("REPORTVIEWER", formUrl, 60, 210, 986, 575, false, "left top", {
        av_url: url, av_buttonPriv: buttonPriv, custBtn: custBtn
    }, false, false, true);
}

/*----------------------------------------------------------------------------------
 * 설명   : 리포트를 화면에 출력하지 않고 바로 출력
 * 파라미터 : aUrl : 레포트파일 경로
 *             rexParams : 레포트출력시 사용될 인자
 * 리턴값   : boolean
 * 작성자 : Jun.
 * 작성일 : 2012.04.22
 ----------------------------------------------------------------------------------------------*/
function gf_RexReportPrint(aUrl, rexParams) {
    //aUrl += "&print=true";
    rexParams.direct_print = "true";
    var url = gf_RexReportUrl(aUrl, rexParams);
    gf_Trace(url);
    var linkUrl = url.substr(0, url.indexOf("?"));
    var params = url.substr(url.indexOf("?") + 1, url.length);
    var Headers = "Content-Type: application/x-www-form-urlencoded";
    var paramArr = params.split("&");
    for (var param in paramArr) {
        if (paramArr[param].indexOf("rex_rptname") == 0) {
            linkUrl += "?" + paramArr[param];
            break;
        }
    }
    var buffer = new Buffer(params);
    gf_GetPoppyFrame().Navigate(linkUrl, "", "_self", buffer.data, Headers);
}

/*----------------------------------------------------------------------------------
 * 설명   : 리포팅 뷰어용 url 얻어오기
 * 파라미터 : reportFileNm : 레포트파일 경로
 *             rexParams : 레포트출력시 사용될 인자
 * 리턴값   : string
 * 작성자 : Jun.
 * 작성일 : 2012.04.22
 ----------------------------------------------------------------------------------------------*/
function gf_RexReportUrl(reportFileNm, rexParams) {
    //해외 분산환경 Request 처리 : jsko : 2012.07.30
    var rexDb = "oracle1";//gf_getRexDB(reportFileNm);
    //var url = gf_getAppUrl('/rex') + '/RexServer30/viewer.jsp?rex_rptname=' + reportFileNm + '&connectname='+rexDb+'&isOpenWindow=true&option=1&';
    var url = gv_ContextPath + '/RexServer30/viewer.jsp?rex_rptname=' + reportFileNm + '&connectname=' + rexDb + '&isOpenWindow=true&option=1&';
    //TODO : 향후 세션 처리되면 rexParams = gf_RexDefaultParam(rexParams);

    if (rexParams.programCode.indexOf("C51X") == 0)	// e-HR
        rexDb = "oracleHR";
    else if (rexParams.programCode.indexOf("POMS") == 0)	// 분양관리
        rexDb = "oraclePOMS";
    else if (rexParams.programCode.indexOf("C20X") == 0)	// 광고비정산
        rexDb = "oracleC20X";
    else if (rexParams.programCode.indexOf("ACPF") == 0)	// PJ수지
        rexDb = "oracleACPF";
    else if (rexParams.programCode.indexOf("VOCS") == 0)	// 고객의소리
        rexDb = "oracleVOCS";
    else if (rexParams.programCode.indexOf("ADVS") == 0)	// 자문관리 시스템
        rexDb = "oracleADVS";

    if (!rexParams.rex_db)
        url += "rex_db=" + rexDb + "&";
    if (rexParams)
        url += gf_GetUrlWithParam(rexParams, '&');

    //TODO : 향후 세션 처리되면 url += "&printUserId=" + gf_getSession("UserId");
    //TODO : 향후 세션 처리되면 url += "&printUserNm=" + gf_getSession("UserNm");
    return url;
}

/*----------------------------------------------------------------------------------
 * 설명   : 리포팅 변환용 url 얻어오기
 * 파라미터 : reportFileNm : 레포트파일 경로
 *             rexParams : 레포트출력시 사용될 인자
 * 리턴값   : string
 * 작성자 : Jun.
 * 작성일 : 2012.04.22
 ----------------------------------------------------------------------------------------------*/
function gf_RexReportConvertUrl(reportFileNm, rexParams) {
    //해외 분산환경 Request 처리 : jsko : 2012.07.30
    var rexDb = gf_getRexDB(reportFileNm);
    var url = gf_getAppUrl('/rex') + '/RexServer30/convert.jsp?rex_rptname=' + reportFileNm + '&connectname=' + rexDb + '&isOpenWindow=true&option=1&';
    rexParams = gf_RexDefaultParam(rexParams);
    if (!rexParams.rex_db)
        url += "rex_db=" + rexDb + "&"
    if (rexParams)
        url += gf_GetUrlWithParam(rexParams, '&');
    url += "&printUserId=" + gf_getSession("UserId");
    url += "&printUserNm=" + gf_getSession("UserNm");
    return url;
}

/*----------------------------------------------------------------------------------
 * 설명   : rexParam에 기본 정보를 추가한다.
 * 파라미터 : rexParams    - 조건 파라메터
 * 리턴값   : rexParams
 * 작성자 : Jun.
 * 작성일 : 2012.04.22
 ----------------------------------------------------------------------------------------------*/
function gf_RexDefaultParam(rexParams) {
    rexParams.userId = gf_getSession('UserId');
    rexParams.userNm = gf_getSession('UserNm');
    rexParams.ipAddress = gf_getSession('IpAddress');
    rexParams.orgCd = typeof(rexParams.orgCd) == "undefined" ? gf_getSValue('OrgInfo', 'orgCd') : rexParams.orgCd;
    rexParams.orgNm = typeof(rexParams.orgNm) == "undefined" ? gf_getSValue('OrgInfo', 'orgNm') : rexParams.orgNm;
    rexParams.siteCd = typeof(rexParams.siteCd) == "undefined" ? gf_getSValue('CurSite', 'siteCd') : rexParams.siteCd;
    rexParams.siteNm = typeof(rexParams.siteNm) == "undefined" ? gf_getSValue('CurSite', 'siteNm') : rexParams.siteNm;
    rexParams.ees_url = "http://eesdev.dwconst.co.kr"; // TODO : 프로퍼티에서 정보를 받아와야함.
    return rexParams;
}

/*----------------------------------------------------------------------------------
 * 설명   : 쿼리를 포함한 챠트 호출
 * 파라미터 : reportPath   - 레포트 파일 위치
 *            rexParams    - 조건 파라메터
 * 리턴값   : PDF파일 생성
 * 작성자 : Jun.
 * 작성일 : 2012.04.22
 ----------------------------------------------------------------------------------------------*/
function gf_RexConvertPDF(reportPath, rexParams) {
    var url = '';
    if (rexParams) {
        var url = 'sys/common/util/ConverterRexXP.xpl?exportFormat=pdf&reportPath=' + reportPath;
        rexParams = gf_RexDefaultParam(rexParams);
        if (rexParams)
            url += '&' + gf_GetUrlWithParam(rexParams);
        //gf_Trace(url);
        gf_Transaction("RexConvertPDF", url, "", "", "", "", false);
    } else {
        var url = gf_getAppUrl('/rex') + reportPath;
        //gf_Trace(url);
        gf_GetPoppyFrame().Navigate(url);
    }
}

/*----------------------------------------------------------------------------------
 * 설명   : 쿼리를 포함한 챠트 호출
 * 파라미터 : url          - 레포트 파일 위치
 *            rexParams    - 조건 파라메터
 *            chart        - 챠트가 들어갈 ActiveX 이름
 * 리턴값   : rexpert 파일의 ActiveX의 OpenOOF 실행
 * 작성자   : Jun.
 * 작성일   : 2012-01-19
 ----------------------------------------------------------------------------------------------*/
function gf_RptChart(url, rexParams, chart) {
    var url = gf_RexReportUrl(url, rexParams); //레포트위치 및 파일명
    chart.Navigate2(url); // 해당 뷰어(엑티브X)를 네비게이트 실행
}

/*----------------------------------------------------------------------------------
 * 설명   : XSL을 이용하여 XML포맷을 변경함
 * 파라미터 : dataSet     - 데이터셋 이름
 *            url         - 레포트 파일 위치
 *            chart       - 챠트가 들어갈 ActiveX 이름
 * 리턴값   : 반환된 xml형식의 OOF문구를  ActiveX의 OpenOOF 실행
 * 작성자   : Jun.
 * 작성일   : 2012-01-19
 ----------------------------------------------------------------------------------------------*/
//gf_RptChartByDS를 사용하지마시고 아래쪽의
function gf_RptChartByDS(dataSet, url, chart, rexparams) {
    var dataSets = new Array();
    var dataSetNames = new Array();
    if (typeof(dataSet) != "undefined") {
        dataSets = gf_IsArray(dataSet) ? dataSet : [dataSet];
        dataSetNames = function (e) {
            var r = [];
            for (i in e) {
                r[r.length] = e[i].name
            }
            return r
        }(dataSets);
    }
    var rexpertXml = "";
    var rexpertXmls = new Array();
    for (var i = 0; i < dataSets.length; i++) {
        rexpertXmls[i] = gf_DataSetToXml(dataSets[i]);
    }
    rexpertXml = gf_ToRexpertXml(rexpertXmls, url, dataSetNames, rexparams);
    //gf_Trace(rexpertXml);
    //rexpertXml = rexpertXml.replace("><",">\r\n<");
    system.clearClipboard();
    system.setClipboard("CF_UNICODETEXT", rexpertXml);
    //gf_Trace(rexpertXml);
    chart.OpenOOF(rexpertXml); // 반환된 xml형식의 OOF문구를  ActiveX의 OpenOOF 실행한다.
}

/*----------------------------------------------------------------------------------
 * 설명   : XSL을 이용하여 XML포맷을 변경함
 * 파라미터 : actObj     - 레포트가 출력될 ActiveX
 *            url         - 레포트 파일 위치
 *            dataSet         - 레포트 출력될 데이터셋
 *            rexparams       - 조건 파라메터
 * 리턴값   : 반환된 xml형식의 OOF문구를  ActiveX의 OpenOOF 실행
 * 작성자   : Jun.
 * 작성일   : 2012-01-19
 ----------------------------------------------------------------------------------------------*/
function gf_RptOpenOof(actObj, url, dataSet, rexparams) {
    var dataSets = new Array();
    var dataSetNames = new Array();
    if (typeof(dataSet) != "undefined") {
        dataSets = gf_IsArray(dataSet) ? dataSet : [dataSet]; // 배열인지를 확인하여 배열이아닐경우 배열로 변경함.
        dataSetNames = function (e) {
            var r = new Array();
            for (i in e) {
                r[r.length] = e[i].name
            }
            return r
        }(dataSets); //데이터셋명을 추출하여 배열에 담는다.
    }
    var oofXml = "";	// oof규격의 xml
    var dataXmls = new Array();	//데이터셋의 항목을 렉스포트 데이터셋으로 변환
    for (var i = 0; i < dataSets.length; i++) {
        dataXmls[i] = gf_DataSetToXml(dataSets[i]);
    }
    oofXml = gf_ToRexpertXml(dataXmls, url, dataSetNames, rexparams);
    actObj.OpenOOF(oofXml); // 반환된 xml형식의 OOF문구를  ActiveX의 OpenOOF 실행한다.
}

/*----------------------------------------------------------------------------------
 * 설명   : rexpert가 지원하는 Xml 변환
 * 파라미터 : xmlStr       -
 *            url          - 레포트 파일 위치
 *            dataset      - 데이터셋 이름
 * 리턴값   : string(레포트출력XML)
 * 작성자   : Jun.
 * 작성일   : 2012-01-19
 ----------------------------------------------------------------------------------------------*/
function gf_ToRexpertXml(xmlStr, url, datasetName, rexparams) {
    var sData = "";
    var xmlStrs = gf_IsArray(xmlStr) ? xmlStr : [xmlStr];
    var datasetNames = gf_IsArray(datasetName) ? datasetName : [datasetName];
    rexparams = typeof(rexparams) == "undefined" ? {} : rexparams;
    sData = "<?xml version='1.0' encoding='utf-8'?>";
    sData += "<oof version ='3.0'>";
    sData += "<document title='report' enable-thread='0'>";
    sData += "<file-list>";
    sData += "<file type='reb' path='" + gf_getAppUrl('/rex') + "RexServer30/rebfiles/" + url + ".reb'></file>";
    sData += "</file-list>";
    sData += "<connection-list>";
    sData += "<connection type='memo' namespace='*'>";
    sData += "<config-param-list>";
    sData += "<config-param name='data'>";
    sData += "<gubun>";
    for (var i = 0; i < datasetNames.length; i++) {
        sData += "<" + datasetNames[i] + ">";
        sData += xmlStrs[i];
        sData += "</" + datasetNames[i] + ">";
    }
    sData += "</gubun>";
    sData += "</config-param>";
    sData += "</config-param-list>";
    for (var i = 0; i < datasetNames.length; i++) {
        sData += "<content content-type='xml' namespace='" + datasetNames[i] + "'>";
        sData += "<content-param name='root'>gubun/";
        sData += datasetNames[i] + "/Rows/Row</content-param>";
        sData += "<content-param name='preservedwhitespace'>1</content-param><content-param name='bindmode'>name</content-param></content>";
    }
    sData += "</connection>";
    sData += "</connection-list>";
    sData += "<field-list>";
    for (key in rexparams) {
        sData += "<field name=\"" + key + "\"><![CDATA[" + rexparams[key] + "]]]]><![CDATA[></field>";
    }
    sData += "</field-list>";
    sData += "<plugin-list>";
    sData += "</plugin-list>";
    sData += "</document>";
    sData += "</oof>";
    return sData;
}

/*----------------------------------------------------------------------------------
 * 설명   : rexpert가 지원하는 Xml 변환
 * 파라미터 : xmlStr       -
 *            url          - 레포트 파일 위치
 *            dataset      - 데이터셋 이름
 * 리턴값   : string(레포트출력 XML)
 * 작성자   : Jun.
 * 작성일   : 2012-01-19
 ----------------------------------------------------------------------------------------------*/
function gf_ToRexpertXmlBody(xmlStr, datasetName) {
    var sData = "";
    var xmlStrs = gf_IsArray(xmlStr) ? xmlStr : [xmlStr];
    var datasetNames = gf_IsArray(datasetName) ? datasetName : [datasetName];
    sData += "<gubun>";
    for (var i = 0; i < datasetNames.length; i++) {
        sData += "<" + datasetNames[i] + ">";
        sData += xmlStrs[i];
        sData += "</" + datasetNames[i] + ">";
    }
    sData += "</gubun>";
    return sData;
}

/*----------------------------------------------------------------------------------
 * 설명   : convert용 jsp 호출, 차트 사용하는 FORM에 선언되어야 함
 * 파라미터 : 없음
 * 리턴값   : string(레포트출력 XML)
 * 작성자   : Jun.
 * 작성일   : 2012-01-19
 ----------------------------------------------------------------------------------------------*/
function gf_LoadConverter() {
    var url = gf_getAppUrl('/rex') + 'jsp/common/xsl/ConvertXml.jsp';
    var scriptFrm = gf_GetPoppyFrame();
    scriptFrm.Navigate(url);
    return scriptFrm;
}

/*----------------------------------------------------------------------------------
 * 설명   : 레포트 뷰어용 DATASET을 XML로 변경함.
 * 파라미터 : dataSet : XML로 변경할 데이터셋
 * 리턴값   : string(레포트출력 XML)
 * 작성자   : Jun.
 * 작성일   : 2012-01-19
 ----------------------------------------------------------------------------------------------*/
function gf_DataSetToXml(dataSet) {
    var poppyFrame = gf_GetPoppyFrame();
    var result = "";
    try {
        throw "잠시 수정함."
        if (poppyFrame.Document == null || poppyFrame.Document.Script == null)
            throw "poppyFrame이 로드되지 않았습니다.";
        result = gf_DataSetToXmlJspParser(dataSet);	// xsl트랜스폼 모듈을 이용한
    } catch (e) {
        gf_Trace(e);
        result = gf_DataSetToXmlScriptParser(dataSet);	// xsl트랜스폼 모듈 로드 실패시 스크립트로 처리
    }
    return result;
}

/*----------------------------------------------------------------------------------
 * 설명   : java를 이용한데이터셋에서 rexpert가 인식하는 XML 형태로 변형
 * 파라미터 : dataSet    - 데이터셋 이름
 * 리턴값   : string(rexpertXml)
 * 작성자   : Jun.
 * 작성일   : 2012-01-19
 ----------------------------------------------------------------------------------------------*/
function gf_DataSetToXmlJspParser(dataSet) {
    var xml = dataSet.saveXML().replace("\r\n", "").replace("\\", "\\\\");
    gf_GetPoppyFrame().Document.Script.ExecScript("fncConvertXml('" + xml + "');");
    var rexpertXml = system.getClipboard("CF_UNICODETEXT");
    rexpertXml = rexpertXml.substring(rexpertXml.indexOf('<Rows>'), rexpertXml.length);
    rexpertXml = rexpertXml.substring(0, rexpertXml.indexOf('</Dataset>'));
    return rexpertXml;
}

/*----------------------------------------------------------------------------------
 * 설명   : 스크립트를 이용한 데이터셋에서 rexpert가 인식하는 XML 형태로 변형
 * 파라미터 : dataSet    - 데이터셋 이름
 * 리턴값   : string(rexpertXml)
 * 작성자   : Jun.
 * 작성일   : 2012-01-19
 *----------------------------------------------------------------------------------------------*/
function gf_DataSetToXmlScriptParser(dataSet) {
    var colNames = gf_GetColNames(dataSet);
    var resultXml = "";
    resultXml += "<Rows>";
    resultXml += gf_GetRowXmls(dataSet, colNames);
    resultXml += "</Rows>";
    return resultXml;
}

/*----------------------------------------------------------------------------------
 * 설명      : 데이터셋에서 결과값 row를 재배치
 * 파라미터 : dataSet : XML로 변경할 데이터셋
 *             colNames : 데이터셋에 지정되어 있는 컬럼명들
 * 리턴값   : string(rowXmls)
 * 작성자   : Jun.
 * 작성일   : 2012-01-19
 ----------------------------------------------------------------------------------------------*/
function gf_GetRowXmls(dataSet, colNames) {
    var rowCount = dataSet.getRowCount();
    var rowXmls = "";
    for (var i = 0; i < rowCount; i++) {
        var rowXml = "<Row>";
        rowXml += gf_GetColXmls(dataSet, colNames, i);
        rowXml += "</Row>";
        rowXmls += rowXml;
    }
    return rowXmls;
}

/*----------------------------------------------------------------------------------
 * 설명      : 데이터셋에서 column명 추출해서 재배치
 * 파라미터 : dataSet : XML로 변경할 데이터셋
 *             colNames : 데이터셋에 지정되어 있는 컬럼명들
 *             rowIdx : 해당 데이터가 존재하는 ROW위치
 * 리턴값   : string(colXmls)
 * 작성자   : Jun.
 * 작성일   : 2012-01-19
 ----------------------------------------------------------------------------------------------*/
function gf_GetColXmls(dataSet, colNames, rowIdx) {
    var colXmls = "";
    for (var i = 0; i < colNames.length; i++) {
        var colXml = "<" + colNames[i] + ">";
        var value = dataSet.getColumn(rowIdx, colNames[i]);
        value = typeof(value) == "undefined" ? "" : value;
        colXml += gf_ValueToCdata(value);
        colXml += "</" + colNames[i] + ">";
        colXmls += colXml;
    }
    return colXmls;
}

/*----------------------------------------------------------------------------------
 * 설명      : 특수문자로 인해 XML파일이 깨지는 것을 막기위해 CDATA태그를 이용해 값을 감싼다.
 * 파라미터 : value : 문자열
 * 리턴값   : string
 * 작성자   : Jun.
 * 작성일   : 2012-01-19
 ----------------------------------------------------------------------------------------------*/
function gf_ValueToCdata(value) {
    return "<" + "![" + "CDATA[" + value + "]" + "]" + ">";
}

/*----------------------------------------------------------------------------------
 * 설명      : 데이터셋에서 column 갯수 확인
 * 파라미터 : dataSet : 데이터셋
 * 리턴값   : string[](colNames)
 * 작성자   : Jun.
 * 작성일   : 2012-01-19
 ----------------------------------------------------------------------------------------------*/
function gf_GetColNames(dataSet) {
    var colNames = new Array();
    var colCount = dataSet.getColCount();
    for (var i = 0; i < colCount; i++) {
        colNames[i] = dataSet.getColID(i);
    }
    return colNames;
}

/*----------------------------------------------------------------------------------
 * 설명      : object 복사
 * 파라미터 : obj : 복사 대상 Object
 * 리턴값   : Object
 * 작성자   : Jun.
 * 작성일   : 2012-01-19
 ----------------------------------------------------------------------------------------------*/
function gf_cloneObject(obj) {
    var clone = {};
    if (gf_IsNull(obj))
        return null;
    for (var key in obj) {
        clone[key] = obj[key];
    }
    return clone;
}

/*----------------------------------------------------------------------------------
 * 설명   : 레포트를 PDF로 변환후 서버로 전송함.
 * 파라미터 : reportPath - 확장자를 뺀 레포트 경로
 *             rexParams - 레포트를 출력하기 위해 필요한 요소.
 *             uploadOption - 서버로 전송시 필요한 속성값.
 *             callback - 업로드가 완료된후 실행될 콜백함수(전송여부, 업로드속성, 레포트경로).
 * 리턴값   : void
 * 작성자   : Jun.
 * 작성일   : 2012-04-03
 ----------------------------------------------------------------------------------*/
function gf_RexToPDFUpload(reportPath, rexParams, uploadOption, callback) {
    // 임시 폴더 생성
    gf_Trace("gf_RexToPDFUpload Start.!!");
    gf_MakeTempDir();
    var _callbackName = 'gf_RexToPDFUpload_' + (new Date()).getTime();
    this[_callbackName] = callback;
    var _runCallback = function (callbackInfo) {
        if (gf_IsNull(callbackInfo)) {
            this[_callbackName](false, uploadOption, reportPath)
        }
        var flag = callbackInfo.flag;
        var uploadOption = callbackInfo.uploadOption;
        var reportPath = callbackInfo.reportPath;
        this[_callbackName](flag, uploadOption, reportPath);
    }
    var _RexToPDFUpload = function (reportPath, rexParams, uploadOption, callback) {
        var _callback = callback;
        var _uploadOption = uploadOption;
        var _reportPath = reportPath;
        var _progressActive = function (msg, pos) {
            msgBox.text = msg;
            PDFProgress.pos = pos;
        }
        var _getCallbackInfo = function (flag, uploadOption, reportPath) {
            var callbackInfo = {
                flag: flag
                , uploadOption: uploadOption
                , reportPath: reportPath
            };
            return callbackInfo;
        }
        PDFProgress.min = 0;
        PDFProgress.max = 1;
        gf_Trace("PDF Export Start!");
        _progressActive("PDF Export Start!", 0);
        // 분류기준이 존재하지 않을 경우 파일을 우선 삭제함
        gf_Trace("Old File Delete!");
        _progressActive("Old File Delete!", 0);
        if (!gf_IsNull(_uploadOption.docclsCd)
            || (!gf_IsNull(_uploadOption.coverYn) && _uploadOption.coverYn == "Y")) {
            var fileAtchIds = gf_setNullInit(_uploadOption.fileAtchId, "");
            var progIds = gf_setNullInit(_uploadOption.progId, "");
            var atchGrps = gf_setNullInit(_uploadOption.atchGrp, "");
            var atchFileSeqs = gf_setNullInit(_uploadOption.atchFileSeq, "");
            var siteCds = gf_setNullInit(_uploadOption.siteCd, "");
            var docnos = gf_setNullInit(_uploadOption.docno, "");
            if (docnos != "")
                docnos = docnos + "_" + progIds + "_" + atchGrps;
            gf_DeleteAtchFileSeqs(fileAtchIds, progIds, atchGrps, atchFileSeqs, siteCds, docnos);
        }

        //_that.setWaitCursor(true);
        gf_Trace("PDF Export (0/1)");
        _progressActive("PDF Export (0/1)", 0);
        gf_RexToPDFDownload(reportPath, rexParams, function (isDownload, fileName, filePath) {
            if (!isDownload) {
                gf_Trace("PDF Export Fail (1/1)");
                _progressActive("PDF Export Fail (1/1)", 1);
                close(_getCallbackInfo(false, _uploadOption, _reportPath));
                return;
            }

            gf_Trace("PDF Export Complete (1/1)");
            _progressActive("PDF Export Complete (1/1)", 1);
            var upOptClone = gf_cloneObject(_uploadOption);
            if ((!gf_IsNull(upOptClone.docclsCd) && upOptClone.docclsCd != "")  // 문서로 이관될 경우 분류코드가 존재하거나
                || (!gf_IsNull(upOptClone.coverYn) && upOptClone.coverYn == "Y")) // 혹은 갑지인 경우.
                upOptClone.docno = upOptClone.docno + "_" + upOptClone.progId + "_" + upOptClone.atchGrp;

            gf_Trace("PDF Upload (1/1)");
            _progressActive("PDF Upload (1/1)", 1);
            var fileAtchId = gf_FileUpload(filePath, upOptClone);
            if (!fv_UploadFlag)
                fileAtchId = "";
            //_that.setWaitCursor(false);
            if (fileAtchId != "") {
                //_uploadOption.docno = _uploadOption.siteCd + "_" + fileName
                gf_Trace("PDF Upload (1/1)");
                _progressActive("PDF Upload Complete (1/1)", 0);
                close(_getCallbackInfo(true, _uploadOption, _reportPath));
                return;
            } else {
                gf_Trace("PDF Upload Fail (1/1)");
                _progressActive("PDF Upload Fail (1/1)", 1);
                close(_getCallbackInfo(false, _uploadOption, _reportPath));
                return;
            }
        });
    }
    var popNm = 'PDFUpload_' + (new Date()).getTime();

    gf_Trace("Progress Popup Call.!!");
    var callbackInfo = gf_Dialog(popNm, "cof::COF_PDFUpload_P01.xfdl", -1, -1, 300, 100, false, "-1"
        , {
            func: _RexToPDFUpload
            , reportPaths: reportPath
            , rexParams: rexParams
            , uploadOptions: uploadOption
            , callback: callback
        }, false, true);
    _runCallback(callbackInfo);
}

/*----------------------------------------------------------------------------------
 * 설명   : 다수의 레포트를 PDF로 변환후 서버로 전송함.
 * 파라미터 : reportPaths - 확장자를 뺀 레포트 경로
 *             rexParams - 레포트를 출력하기 위해 필요한 요소.
 *             uploadOptions - 서버로 전송시 필요한 속성값.
 *             callback - 업로드가 완료된후 실행될 콜백함수(전송여부, 업로드속성, 레포트경로).
 * 리턴값   : void
 * 작성자   : Jun.
 * 작성일   : 2012-04-03
 ----------------------------------------------------------------------------------*/
function gf_RexToPDFUploads(reportPaths, rexParams, uploadOptions, callback) {
    // 임시 폴더 생성
    gf_Trace("gf_RexToPDFUploads Start.!!");
    gf_MakeTempDir();
    var _callbackName = 'gf_RexToPDFUploads_' + (new Date()).getTime();
    this[_callbackName] = callback;

    var _runCallback = function (callbackInfo) {
        if (gf_IsNull(callbackInfo)) {
            this[_callbackName](false, uploadOptions[uploadOptions.length - 1], reportPaths[reportPaths.length - 1])
        }
        var flag = callbackInfo.flag;
        var uploadOption = callbackInfo.uploadOption;
        var reportPath = callbackInfo.reportPath;
        this[_callbackName](flag, uploadOption, reportPath);
    }

    var _RexToPDFUploads = function (reportPaths, rexParams, uploadOptions, callback) {
        var _callback = callback;
        var _uploadOptions = uploadOptions;
        var _reportPaths = reportPaths;
        var _rexParams = rexParams;
        var _callCnt = 0;
        var _filePaths = new Array();
        //_that.setWaitCursor(true);
        PDFProgress.min = 0;
        PDFProgress.max = reportPaths.length;
        var _progressActive = function (msg, pos) {
            msgBox.text = msg;
            PDFProgress.pos = pos;
        }
        var _getCallbackInfo = function (flag, uploadOption, reportPath) {
            var callbackInfo = {
                flag: flag
                , uploadOption: uploadOption
                , reportPath: reportPath
            };
            return callbackInfo;
        }
        var _downloadCheck = function (isDownload, fileName, filePath) {
            _callCnt++;
            gf_Trace("_callCnt : " + _callCnt);
            _filePaths[_filePaths.length] = filePath;
            if (!isDownload) {
                //_that.setWaitCursor(false);
                gf_Trace("PDF Export Fail (" + _callCnt + "/" + _reportPaths.length + ")");
                _progressActive("PDF Export Fail (" + _callCnt + "/" + _reportPaths.length + ")", _callCnt);
                close(_getCallbackInfo(false, _uploadOptions[_callCnt], _reportPaths[_callCnt]));
                return;
            }

            gf_Trace("PDF Export Complete (" + _callCnt + "/" + _reportPaths.length + ")");
            _progressActive("PDF Export Complete (" + _callCnt + "/" + _reportPaths.length + ")", _callCnt);
            if (_callCnt == _reportPaths.length) {
                gf_Trace("gf_FileUpload !!");
                if (_filePaths.length < 1) {
                    //_that.setWaitCursor(false);
                    gf_Trace("PDF Export Fail (" + (_callCnt + 1) + "/" + _reportPaths.length + ")");
                    _progressActive("PDF Export Fail (" + (_callCnt + 1) + "/" + _reportPaths.length + ")", _callCnt);
                    //_callback(false, _uploadOptions[_callCnt-1], _reportPaths[_callCnt-1]);
                    close(_getCallbackInfo(false, _uploadOptions[_callCnt - 1], _reportPaths[_callCnt - 1]));
                    return;
                }

                gf_Trace("PDF Upload Start (" + 0 + "/" + _reportPaths.length + ")");
                _progressActive("PDF Upload Start (" + 0 + "/" + _reportPaths.length + ")", 0);
                for (var i = 0; i < _filePaths.length; i++) {
                    gf_Trace("PDF Upload (" + (i + 1) + "/" + _reportPaths.length + ")");
                    _progressActive("PDF Upload (" + (i + 1) + "/" + _reportPaths.length + ")", (i + 1));
                    var upOptClone = gf_cloneObject(_uploadOptions[i]);
                    if ((!gf_IsNull(upOptClone.docclsCd) && upOptClone.docclsCd != "")  // 문서로 이관될 경우 분류코드가 존재하거나
                        || (!gf_IsNull(upOptClone.coverYn) && upOptClone.coverYn == "Y")) // 혹은 갑지인 경우.
                        upOptClone.docno = upOptClone.docno + "_" + upOptClone.progId + "_" + upOptClone.atchGrp;
                    var fileAtchId = gf_FileUpload(_filePaths[i], upOptClone);
                    if (!fv_UploadFlag)
                        fileAtchId = "";
                    if (fileAtchId == "") {
                        //_that.setWaitCursor(false);
                        gf_Trace("PDF Upload Fail (" + (i + 1) + "/" + _reportPaths.length + ")");
                        _progressActive("PDF Upload Fail (" + (i + 1) + "/" + _reportPaths.length + ")", (i + 1));
                        //_callback(false, _uploadOptions[_callCnt-1], _reportPaths[_callCnt-1]);
                        close(_getCallbackInfo(false, _uploadOptions[_callCnt - 1], _reportPaths[_callCnt - 1]));
                        return;
                    }
                }
                //_that.setWaitCursor(false);
                gf_Trace("PDF Upload Complete (" + _filePaths.length + "/" + _reportPaths.length + ")");
                _progressActive("PDF Upload Complete (" + _filePaths.length + "/" + _reportPaths.length + ")", _filePaths.length);
                //_callback(true, _uploadOptions[_callCnt-1], _reportPaths[_callCnt-1]);
                close(_getCallbackInfo(true, _uploadOptions[_callCnt - 1], _reportPaths[_callCnt - 1]));
                return;
            } else {
                gf_Trace("gf_RexToPDFDownload : load!! ");
                _progressActive("PDF Export (" + (_callCnt + 1) + "/" + _reportPaths.length + ")", (_callCnt + 1));
                gf_RexToPDFDownload(_reportPaths[_callCnt], _rexParams[_callCnt], _downloadCheck, _uploadOptions[_callCnt]);
                return;
            }
        }

        _progressActive("PDF Export Start!", 0);
        // 분류기준이 존재하지 않을 경우 파일을 우선 삭제함
        _progressActive("Old File Delete!", 0);
        var fileAtchIds = "";
        var progIds = "";
        var atchGrps = "";
        var atchFileSeqs = "";
        var siteCds = "";
        var docnos = "";

        gf_Trace("old_File delete Setting.!!");
        for (var i = 0; i < _uploadOptions.length; i++) {
            var uploadOption = _uploadOptions[i];
            if (!gf_IsNull(uploadOption.docclsCd)
                || (!gf_IsNull(uploadOption.coverYn) && uploadOption.coverYn == "Y")) {
                var fileAtchId = uploadOption.fileAtchId;
                var progId = uploadOption.progId;
                var atchGrp = uploadOption.atchGrp;
                var atchFileSeq = uploadOption.atchFileSeq;
                var siteCd = uploadOption.siteCd;
                var docno = uploadOption.docno;
                if (docno != "")
                    docno = docno + "_" + progId + "_" + atchGrp;
                if (fileAtchIds != "") {
                    fileAtchIds += ",";
                    progIds += ",";
                    atchGrps += ",";
                    atchFileSeqs += ",";
                    siteCds += ",";
                    docnos += ",";
                }
                fileAtchIds += gf_setNullInit(fileAtchId, "");
                progIds += gf_setNullInit(progId, "");
                atchGrps += gf_setNullInit(atchGrp, "");
                atchFileSeqs += gf_setNullInit(atchFileSeq, "");
                siteCds += gf_setNullInit(siteCd, "");
                docnos += gf_setNullInit(docno, "");
            }
        }

        gf_Trace("old_File Delete.!!");
        if (fileAtchIds != "") {
            gf_DeleteAtchFileSeqs(fileAtchIds, progIds, atchGrps, atchFileSeqs, siteCds, docnos);
        }
        _progressActive("PDF Export (" + (_callCnt + 1) + "/" + _reportPaths.length + ")", (_callCnt + 1));
        gf_RexToPDFDownload(_reportPaths[_callCnt], _rexParams[_callCnt], _downloadCheck, _uploadOptions[_callCnt]);
    };

    var popNm = 'PDFUploads_' + (new Date()).getTime();

    gf_Trace("Progress Popup Call.!!");
    var callbackInfo = gf_Dialog(popNm, "cof::COF_PDFUpload_P01.xfdl", -1, -1, 300, 100, false, "-1"
        , {
            func: _RexToPDFUploads
            , reportPaths: reportPaths
            , rexParams: rexParams
            , uploadOptions: uploadOptions
            , callback: callback
        }, false, true);
    _runCallback(callbackInfo);
}

/*----------------------------------------------------------------------------------
 * 설명   : 이미 열려있는 레포트 뷰어를 이용하여 PDF로 변환후 서버로 전송함.
 * 파라미터 : reportPath - 확장자를 뺀 레포트 경로
 *             viewer - 출력된 레포트 ActiveX.
 *             uploadOption - 서버로 전송시 필요한 속성값.
 *             callback - 업로드가 완료된후 실행될 콜백함수(전송여부, 업로드속성, 레포트경로).
 * 리턴값   : void
 * 작성자   : Jun.
 * 작성일   : 2012-04-03
 ----------------------------------------------------------------------------------*/
function gf_RexViewToPDFUpload(reportPath, viewer, uploadOption, callback) {
    // 임시 폴더 생성
    gf_MakeTempDir();
    var _callback = callback;
    var _uploadOption = uploadOption;
    var _reportPath = reportPath;
    gf_RexViewToPDFDownload(reportPath, viewer, function (isDownload, fileName, filePath) {
        if (!isDownload) {
            _callback(false, _uploadOption, _reportPath);
        }
        var upOptClone = gf_cloneObject(_uploadOption);
        if ((!gf_IsNull(upOptClone.docclsCd) && upOptClone.docclsCd != "")  // 문서로 이관될 경우 분류코드가 존재하거나
            || (!gf_IsNull(upOptClone.coverYn) && upOptClone.coverYn == "Y")) // 혹은 갑지인 경우.
            upOptClone.docno = upOptClone.docno + "_" + upOptClone.progId + "_" + upOptClone.atchGrp;
        var fileAtchId = gf_FileUpload(filePath, upOptClone);
        if (fileAtchId != "") {
            //_uploadOption.docno = _uploadOption.siteCd + "_" + fileName
            _callback(true, _uploadOption, _reportPath);
        } else
            _callback(false, _uploadOption, _reportPath);
    });
}

/*----------------------------------------------------------------------------------
 * 설명   : 레포트파일을 PDF로 변환하여 다운로드한다.
 * 파라미터 : reportPath - 확장자를 뺀 레포트 경로
 *             rexParams - 레포트를 출력하기 위해 필요한 요소.
 *             callback - 다운로드가 완료된후 실행될 콜백함수(파일명, 파일경로).'
 *			   fileOption - {fileName : "", fileType:"xls"}
 * 리턴값   : void
 * 작성자   : Jun.
 * 작성일   : 2012-04-03
 ----------------------------------------------------------------------------------*/
var exportActiveName = "EXPORT_ACTIVE_NAME";
/*function gf_RexToPDFDownload(reportPath, rexParams, callback, fileOption){
 gf_Trace("Report => PDF Start.!!");
 // 임시 폴더 생성
 gf_MakeTempDir();
 var url = gf_RexReportConvertUrl(reportPath, rexParams);
 var _fileName = reportPath.substring(reportPath.lastIndexOf("/")+1, reportPath.length);
 var timeline = (gf_GetServerDate()).getTime();
 var _fileType = "pdf";
 var _callback = callback;
 var _fileOption = fileOption;
 _fileName = _fileName + "_" + timeline;
 if(typeof(_fileOption) != "undefined"){
 if(typeof(_fileOption.fileName) != "undefined"){
 _fileName = _fileOption.fileName;
 }
 if(typeof(_fileOption.fileType) != "undefined"){
 _fileType = _fileOption.fileType;
 }
 }
 var actObj;
 if(this.components[exportActiveName] == null){
 actObj = new ActiveX();
 actObj.progid = "shell.explorer"; // Shell.Explorer.2 모두 가능
 //actObj.name = exportActiveName;
 actObj.windowed = true;
 actObj.init(exportActiveName , 0, 0, 300, 300);
 this.addChild(exportActiveName, actObj);
 actObj.visible = false;
 actObj.show();
 actObj.TitleChange.addHandler(function(obj:ActiveX, e){
 if(e.Text == "REX_LOAD"){
 gf_Trace("1 번 콜백(Report => PDF)  : " + e.Text);
 var fileRoot = FV_TMP_FILE_SAVE_PATH+"";
 //var fileRoot = "c:\\temp\\download\\";
 var fileName = _fileName + "." + _fileType;
 var filefullPath = fileRoot + fileName;
 filefullPath = filefullPath.replace("/", "\\").replace("\\", "\\\\");
 obj.Document.Script.ExecScript("fnFileDownload('" + _fileType + "', '"+ filefullPath + "');");
 }else if(e.Text.indexOf("FILE_EXPORT") > -1 ){
 gf_Trace("2 번 콜백(Report => PDF) : " + e.Text);
 var fileName = _fileName;
 var filePath = e.Text.split("|")[1];
 //obj.Document.Script.ExecScript("closeWindow();");
 //var formObj = obj.parent;
 //formObj.removeChild(obj.name);
 //obj.destroy();
 gf_Trace("_callback(Report => PDF) start : " + _callback);
 _callback(VirtualFile.isExist(filePath), fileName, filePath);
 //_callback(true, fileName, filePath);
 gf_Trace("_callback(Report => PDF) end : " + _callback);
 }
 });
 }else{
 actObj = this.components[exportActiveName];
 }
 gf_Trace("url : " + url);
 var linkUrl = url.substr(0, url.indexOf("?"));
 var params = url.substr(url.indexOf("?")+1, url.length);
 var Headers = "Content-Type: application/x-www-form-urlencoded";
 var paramArr = params.split("&");
 for(var param in paramArr){
 if(paramArr[param].indexOf("rex_rptname") == 0 ){
 linkUrl += "?"+paramArr[param];
 break;
 }
 }
 var buffer = new Buffer(params );
 actObj.Navigate2(linkUrl, "", "_self", buffer.data, Headers);
 }
 */
/*----------------------------------------------------------------------------------
 * 설명   : 이미 열려있는 레포트 뷰어를 이용해 PDF로 변환하여 다운로드한다.
 * 파라미터 : reportPath - 확장자를 뺀 레포트 경로
 *             viewer - 레포트가 출력되어 있는 ActiveX.
 *             callback - 다운로드가 완료된후 실행될 콜백함수(파일명, 파일경로).'
 *			   fileOption - {fileName : "", fileType:"xls"}
 * 리턴값   : void
 * 작성자   : Jun.
 * 작성일   : 2012-04-03
 ----------------------------------------------------------------------------------*/
/*function gf_RexViewToPDFDownload(reportPath, viewer, callback, fileOption){
 // 임시 폴더 생성
 gf_MakeTempDir();
 var _fileName = reportPath.substring(reportPath.lastIndexOf("/")+1, reportPath.length);
 var timeline = (gf_GetServerDate()).getTime();
 var _fileName = _fileName + "_" + timeline;
 var _fileType = "pdf";
 var _callback = callback;
 var _fileOption = fileOption;
 if(typeof(_fileOption) != "undefined"){
 if(typeof(_fileOption.fileName) != "undefined"){
 _fileName = _fileOption.fileName;
 }
 if(typeof(_fileOption.fileName) != "undefined"){
 _fileType = _fileOption.fileType;
 }
 }
 viewer.TitleChange.addHandler(function(obj:ActiveX, e){
 if(e.Text.indexOf("FILE_EXPORT") > -1 ){
 var fileName = _fileName;
 var filePath = e.Text.split("|")[1];
 _callback(VirtualFile.isExist(filePath), fileName, filePath);
 }
 });
 var fileRoot = FV_TMP_FILE_SAVE_PATH+"";
 var fileName = _fileName + "." + _fileType;
 var filefullPath = fileRoot + fileName;
 filefullPath = filefullPath.replace("/", "\\").replace("\\", "\\\\");
 viewer.Document.Script.ExecScript("fnFileDownload('" + _fileType + "', '"+ filefullPath + "')");
 }
 */
/*----------------------------------------------------------------------------------
 * 설명   : 다수의 레포트파일을 인쇄용지에 출력한다.
 * 파라미터 : reportPaths - 확장자를 뺀 레포트 경로
 *             rexParams - 레포트를 출력하기 위해 필요한 요소.
 *             callback - 다운로드가 완료된후 실행될 콜백함수(파일명, 파일경로).'
 * 리턴값   : void
 * 작성자   : Jun.
 * 작성일   : 2012-04-03
 ----------------------------------------------------------------------------------*/
function gf_RexToPrints(reportPaths, rexParams, callback) {
    var _callbackName = 'gf_RexToPrints_' + (new Date()).getTime();
    this[_callbackName] = callback;
    var _runCallback = function (callbackInfo) {
        if (gf_IsNull(callbackInfo)) {
            this[_callbackName](false, reportPaths[reportPaths.length - 1])
        }
        var flag = callbackInfo.flag;
        var reportPath = callbackInfo.reportPath;
        this[_callbackName](flag, reportPath);
    }
    var _RexToPrints = function (reportPaths, rexParams, callback) {
        var _callback = callback;
        var _reportPaths = reportPaths;
        var _rexParams = rexParams;
        var _callCnt = 0;
        var _filePaths = new Array();
        //_that.setWaitCursor(true);
        PrintProgress.min = 0;
        PrintProgress.max = reportPaths.length;
        var _progressActive = function (msg, pos, page) {
            msgBox.text = msg;
            PrintProgress.pos = pos;
        }
        var _getCallbackInfo = function (flag, reportPath) {
            var callbackInfo = {
                flag: flag
                , reportPath: reportPath
            };
            return callbackInfo;
        }
        var _printCheck = function (isPrint) {
            _callCnt++;
            gf_Trace("_callCnt : " + _callCnt);
            if (!isPrint) {
                //_that.setWaitCursor(false);
                _progressActive("Print Fail (" + _callCnt + "/" + _reportPaths.length + ")", _callCnt);
                close(_getCallbackInfo(false, _reportPaths[_callCnt]));
                return;
            }
            _progressActive("Print Complete (" + _callCnt + "/" + _reportPaths.length + ")", _callCnt);
            if (_callCnt == _reportPaths.length) {
                gf_Trace("gf_FileUpload !!");
                _progressActive("Print Complete (" + _filePaths.length + "/" + _reportPaths.length + ")", _filePaths.length);
                close(_getCallbackInfo(true, _reportPaths[_callCnt - 1]));
                return;
            } else {
                gf_Trace("gf_RexToPDFDownload : load!! ");
                _progressActive("PDF Export (" + (_callCnt + 1) + "/" + _reportPaths.length + ")", (_callCnt + 1));
                gf_RexToPrint(_reportPaths[_callCnt], _rexParams[_callCnt], _printCheck);
                return;
            }
        }
        _progressActive("Print Start!", 0);
        _progressActive("Print (" + (_callCnt + 1) + "/" + _reportPaths.length + ")", (_callCnt + 1));
        gf_RexToPrint(_reportPaths[_callCnt], _rexParams[_callCnt], _printCheck);
    };
    var popNm = 'Prints_' + (new Date()).getTime();
    var callbackInfo = gf_Dialog(popNm, "com::COMPrints_P01.xfdl", -1, -1, 300, 100, false, "-1"
        , {
            func: _RexToPrints
            , reportPaths: reportPaths
            , rexParams: rexParams
            , callback: callback
        }, false, true);
    _runCallback(callbackInfo);
}

/*----------------------------------------------------------------------------------
 * 설명   : 레포트파일을 인쇄용지에 출력한다.
 * 파라미터 : reportPath - 확장자를 뺀 레포트 경로
 *             rexParams - 레포트를 출력하기 위해 필요한 요소.
 *             callback - 다운로드가 완료된후 실행될 콜백함수(파일명, 파일경로).'
 * 리턴값   : void
 * 작성자   : Jun.
 * 작성일   : 2012-04-03
 ----------------------------------------------------------------------------------*/
/*function gf_RexToPrint(reportPath, rexParams, callback, progressFunc){
 var url = gf_RexReportConvertUrl(reportPath, rexParams);
 var _callback = callback;
 var _progressFunc = progressFunc;
 var actObj;
 if(this.components[exportActiveName] == null){
 actObj = new ActiveX();
 actObj.progid = "shell.explorer"; // Shell.Explorer.2 모두 가능
 actObj.windowed = true;
 actObj.init(exportActiveName , 0, 0, 300, 300);
 this.addChild(exportActiveName, actObj);
 actObj.visible = false;
 actObj.show();
 actObj.TitleChange.addHandler(function(obj:ActiveX, e){
 gf_Trace(e.Text);
 if(e.Text == "REX_LOAD"){
 obj.Document.Script.ExecScript("RexCtl.Print(false, 1, -1, 1, '');");
 }else if(e.Text == "FINISH_PRINT"){
 _callback(true);
 }
 });
 }else{
 actObj = this.components[exportActiveName];
 }
 var linkUrl = url.substr(0, url.indexOf("?"));
 var params = url.substr(url.indexOf("?")+1, url.length);
 var Headers = "Content-Type: application/x-www-form-urlencoded";
 var paramArr = params.split("&");
 for(var param in paramArr){
 if(paramArr[param].indexOf("rex_rptname") == 0 ){
 linkUrl += "?"+paramArr[param];
 break;
 }
 }
 var buffer = new Buffer(params );
 actObj.Navigate2(linkUrl, "", "_self", buffer.data, Headers);
 }*/
