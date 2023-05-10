/**
 * @class 통합결재 시스템에서 전역으로 사용될 메세지, 코드, 메뉴 클래스
 * @constructor
 * @see   .msg, .code, .menu 세가지의 시스템 리소스를 가진다.
 * @author Jun.
 * @since 2013-04-04
 * @version 1.0
 */
var bqs_comm = function () {

};


/**
 * @see    메세지 데이터를 Locale 별로 가지는 변수
 * @author Jun.
 * @since 2013-04-04
 * @version 1.0
 */
bqs_comm.prototype.msg = {};
/**
 * @see    공통코드 데이터를 Locale 별로 가지는 변수
 * @author Jun.
 * @since 2013-04-04
 * @version 1.0
 */
bqs_comm.prototype.code = {};
/**
 * @see    권한별 메뉴 및 메뉴별 버튼권한등의 데이터 가지는 변수
 * @author Jun.
 * @since 2013-04-04
 * @version 1.0
 */
bqs_comm.prototype.menu = {};

bqs_comm.prototype.auth = {};

bqs_comm.prototype.baroNetUrl = "";

bqs_comm.prototype.baroConUrl = "";

bqs_comm.prototype.a06Url = "";

bqs_comm.prototype.h01xUrl = "";

bqs_comm.prototype.dominoUrl = "";

bqs_comm.prototype.baroNetDomain = "";

bqs_comm.prototype.baroConDomain = "";

bqs_comm.prototype.a06Domain = "";

bqs_comm.prototype.drmdownUrl = "";

bqs_comm.prototype.dnlsUrl = "";

bqs_comm.prototype.userId = "";

bqs_comm.prototype.userNm = "";

bqs_comm.prototype.orgCd = "";


// 전역으로 사용될 bqs_common 클래스 생성
if (typeof(gv_BqsComm) == "undefined")
    gv_BqsComm = new bqs_comm();

var gv_IsProxy = typeof(gv_IsProxy) == "undefined" ? false : gv_IsProxy;

var gf_openSign;

var gf_ChildWindow = new Array();

(function () {
    f_setGlobal();
})();

function f_setGlobal() {
    //var valuePath = window.top == window? window : top.document.getElementsByName("topHidden")[0].contentWindow;
    //var valuePath = top.$('#frmMain').contents().find("frame[name='topHidden']");
    //gv_IsProxy = false; //임시설정

    var opner = opener;
    if (opner && !gv_IsProxy) {
        while (true) {
            if (opner.gv_IsProxy)
                break;

            if (typeof(opner.opener) != "undefined" && typeof(opner.opener) != "unknown" && opner.opener != null) {
                opner = opner.opener;
            }
            else {
                break;
            }
        }
    }


    var valuePath;

    if (gv_IsProxy) {
        valuePath = window;
    } else if (!opner) {
        valuePath = window.top == window ? window : top;
    }
    else {
        valuePath = opner.window.top == opner.window ? opner.window : opner.top;
    }

    //valuePath.f_onPopupPage();

    gf_openSign = valuePath.gf_BaroconOpenSign;

    bqs_comm.prototype.msg.en_US = valuePath.gv_Message_en_US;
    bqs_comm.prototype.msg.ko_KR = valuePath.gv_Message_ko_KR;
    bqs_comm.prototype.code.en_US = valuePath.gv_CommCd_en_US;
    bqs_comm.prototype.code.ko_KR = valuePath.gv_CommCd_ko_KR;
    bqs_comm.prototype.menu.PRIV_MENU = valuePath.gv_MenuPrive;
    bqs_comm.prototype.auth.AUTH_LIST = valuePath.gv_AuthList;

    bqs_comm.prototype.baroNetUrl = valuePath.gv_BaroNetUrl;
    bqs_comm.prototype.baroConUrl = valuePath.gv_BaroConUrl;
    bqs_comm.prototype.a06Url = valuePath.gv_A06Url;
    bqs_comm.prototype.h01xUrl = valuePath.gv_H01xUrl;
    bqs_comm.prototype.dominoUrl = valuePath.gv_DominoUrl;
    bqs_comm.prototype.baroNetDomain = valuePath.gv_BaroNetDomain;
    bqs_comm.prototype.baroConDomain = valuePath.gv_BaroConDomain;
    bqs_comm.prototype.a06Domain = valuePath.gv_A06Domain;
    bqs_comm.prototype.drmdownUrl = valuePath.gv_DrmDownUrl;
    bqs_comm.prototype.dnlsUrl = valuePath.gv_DnlsUrl;

    bqs_comm.prototype.userId = valuePath.gv_userId;

    bqs_comm.prototype.userNm = valuePath.gv_userNm;

    bqs_comm.prototype.orgCd = valuePath.gv_orgCd;
    //var gv_CommCd = top.document.getElementsByName("topHidden")[0].contentWindow.gv_CommCd;

    jquery_lang_js.prototype.lang.en_US = valuePath.gv_mlang_en_US;
    jquery_lang_js.prototype.lang.ko_KR = valuePath.gv_mlang_ko_KR;
}




