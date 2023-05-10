/**********************************************************************************
 * Transaction 관련 공통 라이브러리
 ***********************************************************************************/

/**
 * @class
 * @param strSvcID(String) transaction 을 구분할 ID
 * @param strSvcAct(String) transaction URL
 * @param params(JSONObject) controller에서 getParam 으로 전달받을 인자값
 * @param jsonParameter(JSONObjectArray) controller에서 request.getMapList로 전달받을 data
 * @param strCallbackFunc(String) transaction 수행후 실행될 callback 함수
 * @param bAsync(bool) 비동기 처리 여부 true(비동기), false(동기_
 * @return
 * @see   서버의 controller 를 호출하기 위한 함수
 * @author Jun.
 * @since  2013-02-27
 * @version 1.0
 */

function gf_Transaction(strSvcID, strSvcAct, params, jsonParameter, strCallbackFunc, bAsync, isBlock) {
    if (!(this instanceof gf_Transaction)) {
        return new gf_Transaction(strSvcID, strSvcAct, params, jsonParameter, strCallbackFunc, bAsync, isBlock);
    }

    var callbacks = $.Callbacks();
    var callFunction = null;
    var ajaxUrl = gv_ContextPath + "/" + (strSvcAct.substr(0, 1) == "/" ? strSvcAct.substr(1) : strSvcAct);
    var parameter = {};

    isBlock = typeof(isBlock) == "undefined" ? true : isBlock;
    ajaxUrl = ajaxUrl.substr(0, 2) == "//" ? ajaxUrl.substr(1) : ajaxUrl;


    //Docbaro프레임웍의 jsonDataSetReader에서 decode를 한번더 하면서 "%"값이 디코더오류가 일어남.
    for (var key in params) {
        if (typeof(params[key]) == "undefined" || params[key] == null) {
            params[key] = "";
        } else if (params[key].length > 0) {
            params[key] = params[key].replaceAll("%", encodeURIComponent("%"));
        }
    }

    if (ajaxUrl.indexOf("?") >= 0) {
        ajaxUrl += "&" + $.param(params);
    }
    else {
        ajaxUrl += "?" + $.param(params);
    }

    if (gf_IsNull(jsonParameter)) {
        parameter = jsonParameter;
    }

    var dataSetCnt = 0;
    for (var key in jsonParameter) {
        if (jsonParameter[key].length > 0) {
            parameter[key] = jsonParameter[key];
            dataSetCnt++;
        }
    }
    if (dataSetCnt == 0)
        parameter["dummyObject"] = [{"a": "a"}]; // JsonReader의 오류 때문에 빈 Array를 실어보냄.

    parameter = JSON.stringify(parameter);

    if (!gf_IsNull(strCallbackFunc)) {
        if (typeof(strCallbackFunc) == "string") {
            callFunction = eval(strCallbackFunc);

            if (typeof callFunction != "function") {
                gf_AlertMsg("call back function " + strCallbackFunc + "is not defined!!");
                return;
            }
        } else {
            callFunction = strCallbackFunc;
        }
    }

    // ajax 호출
    /* 통신중 로딩 이미지 출력*/
    if (isBlock) {
        top.$.blockUI({
            message: $("<img src='" + gv_ContextPath + "/images/common/ajax-loader.gif'>"),
            css: {
                top: ($(top).height() - 100) / 2 + 'px',
                left: ($(top).width() - 100) / 2 + 'px',
                width: '100px',
                height: '100px'
            }
        });
    }

    $.ajax({
        type: "post",
        url: ajaxUrl,
        data: parameter,
        dataType: "json",
        headers: {
            Accept: "application/json+core; charset=utf-8",
            "Content-Type": "application/json+core; charset=utf-8"
        },
        success: function (data) {
            /* 통신후 로딩이미지 제거*/
            if (isBlock) {
                top.$.unblockUI();
            }

            //  call callback function
            if (!gf_IsNull(callFunction)) {
                callbacks.add(callFunction);
                callbacks.fire(strSvcID, data);
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            if (xhr.status != 0) {
                gf_AlertMsg(xhr.status);
                gf_AlertMsg(thrownError);
            }
            if (isBlock) {
                top.$.unblockUI();
            }
        },
        async: bAsync
    });


}

/**
 * @class
 * @param strSvcID(String) transaction 을 구분할 ID
 * @param resultData(JSONObject) json 형태의 ajax response 데이터
 * @param bDispMsg(bool) message alert여부  true(alert), false(don't alert)
 * @return true / false ( transaction 성공 여부 )
 * @see Transaction 호출 후 정리 처리등의 메세지 처리.
 * @author Jun.
 * @since  2013-02-27
 * @version 1.0
 */
function gf_ChkTransaction(strSvcId, resultData, bDispMsg) {
    var tranRslt = true;
    // 서버 실행 결과가 exception throw 일 경우의 처리
    if (resultData.exception != undefined) {
        tranRslt = false;
        var errMsg = resultData.exception.split("//DETAIL//");
        var errSvrMsg = "" ;
        if (bDispMsg) {
        	if(errMsg[1].indexOf("SQLServerException") > 0) {
        		errSvrMsg = errMsg[1].substr(errMsg[1].indexOf("SQLServerException"), 500) ;
        	} else {
        		errSvrMsg = errMsg[1] ;
        	}
            gf_AlertMsg(errMsg[0] + " : " + errSvrMsg );
        }
        else {
            // consol log 에 exception 사용자 메세지 출력
            gf_Trace("%s: %o", errMsg[0], this);
        }
        // consol log 에 상세 exception 메세지 출력
        gf_Trace("%s: %o", errMsg[1], this);
    }
    else {
        if (strSvcId.startsWith("SEL_") || strSvcId.startsWith("SELECT_") || strSvcId.startsWith("RETRIEVE_") || strSvcId.startsWith("RET_")) {

        }
        else {
            /*gf_Trace("success message alert service id is " + strSvcId );
             gf_AlertMsg("co.suc.work", [" "]);*/
        }
    }
    return tranRslt;

}

function gf_Validation($elm, callback, msgCallback) {
    $elm.validate({
        submitHandler: function (form) {
            try {
                //callback(true);
            } catch (e) {
            }
        },
        invalidHandler: function (event, validator) {
            // 'this' refers to the form
            var errors = validator.numberOfInvalids();
            var errorList = validator.errorList;
            if (errors) {
                if (typeof(msgCallback) != "undefined")
                    msgCallback(validator.errorList);
                else
                    gf_AlertMsg(errorList[0].message);

                //callback(false);

            }
        },
        showErrors: function (errorMap, errorList) {
        }
    });
}


