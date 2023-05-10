/*******************************************************************
 * 01. 업무구분            : 공통
 * 02. 스크립트 설명    : 사용자 / 부서 그리드 컴포넌트
 * 03. 작성자            : Jun.
 * 04. 작성일            : 2013.04.24
 ******************************************************************/

// GRID
var gv_GridStr = "<table id=\"{0}\" name=\"{0}\" style=\"width:100%\" ></table>";


/*----------------------------------------------------------------------------------------------
 * 설명   	: Component Init
 * 파라미터 	: N/A
 * 리턴값   	: N/A
 * 작성자 	: Jun.
 * 작성일 	: 2013.04.24
 ----------------------------------------------------------------------------------------------*/
function gf_InitOrgUserComponent(divName, kind, width, height, grdHeader, grdColInfo, sortColNm) {

    if (gf_IsNull(kind)) {
        gf_AlertMsg("kind 인자값은 org, user 둘중 하나로 전달해주어야 합니다. 초기화를 실패하였습니다.");
        return;
    }

    if (gf_IsNull(divName)) {
        divName = 'orguserComponent';
    }

    var componentDiv = $("div[name='" + divName + "']");


    if (componentDiv.length == 0) {
        gf_Trace(' 컴포넌트를 위한 div가 없기때문에 컴포넌트 UI를 생성하지 않는다. ');
        return;
    }

    if (componentDiv.length > 1) {
        gf_AlertMsg(divName + ' 라는 ID 를 가진 html 개체가 이미 있습니다. 업무화면에서 삭제 하여 주시기 바랍니다. ');
        return;
    }


    var grid = $("#" + divName + "Grd");
    if (grid.length > 1) {
        gf_AlertMsg(divName + 'Grd 라는 ID 를 가진 html 개체가 이미 있습니다. 업무화면에서 삭제 하여 주시기 바랍니다. ');
        return;
    }
    componentDiv.append(gv_GridStr.simpleReplace("{0}", divName + "Grd"));
    gf_InitCompGrid(divName, kind, width, height, grdHeader, grdColInfo, sortColNm);


}

function gf_ClearComponent(divName) {
    if (gf_IsNull(divName)) {
        divName = 'orguserComponent';
    }
    var componentDiv = $("div[name='" + divName + "']");
    componentDiv.empty();
    //componentDiv.append(gv_GridStr);
}

function gf_SetDataBind(divName, ds_OrgUserData) {
    if (gf_IsNull(divName)) {
        divName = 'orguserComponent';
    }

    ds_OrgUserData.bind($("#" + divName + "Grd"));
}

function gf_InitCompGrid(divName, kind, grdWidth, grdHeight, grdHeader, grdColInfo, sortColNm) {
    if (gf_IsNull(divName)) {
        divName = 'orguserComponent';
    }
    var $grid = $("#" + divName + "Grd");

    if (kind == "user") {
        if (gf_IsNull(grdHeader)) {
            grdHeader = [gf_FindLang('부서/현장'), gf_FindLang('직위'), gf_FindLang('이름')];
        }
        if (gf_IsNull(grdColInfo)) {
            grdColInfo = [
                {name: 'orgNm', index: 'orgNm', width: 70, align: 'center'},
                {name: 'positNm', index: 'positNm', width: 65, align: 'center'},
                {name: 'rpswrkNm', index: 'rpswrkNm', width: 65, align: 'center'}
            ];
        }
    }
    else {
        if (gf_IsNull(grdHeader)) {
            grdHeader = [gf_FindLang('부서코드'), gf_FindLang('부서/현장명')];
        }
        if (gf_IsNull(grdColInfo)) {
            grdColInfo = [
                {name: 'orgCd', index: 'orgCd', width: 70},
                {name: 'orgNm', index: 'orgNm', width: 230}
            ];
        }
    }

    if (gf_IsNull(grdWidth)) {
        grdWidth = 400;
    }

    if (gf_IsNull(grdHeight)) {
        grdHeight = 100;
    }

    if (gf_IsNull(sortColNm)) {
        sortColNm = 'orgNm';
    }

    $grid.jqGrid({
        datatype: "local",
        colNames: grdHeader,
        colModel: grdColInfo,
        width: grdWidth,
        height: grdHeight,
        sortname: sortColNm,
        viewrecords: true,
        autoWidth: true,
        shrinkToFit: true,	// 그리드 크기에 컬럼을 비율로 맞출지 여부
        sortorder: "asc"
    });

    /**
     * Window Resize 시 양식목록 DataGrid 크기 조절
     */
    $(window).bind("resize", function () {
        //$grid.setGridWidth($grid.parents(".ui-grid:first").parents.width());
    }).trigger('resize');
}


