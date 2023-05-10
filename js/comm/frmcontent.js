/**********************************************************************************
 * content frame에 적용되어야할 필수 이벤트 설정 스크립트
 * 모든 content 페이지에 포함되여야 하는 스크립트 이다.
 * 단 팝업에서는 적용할 필요가 없다.
 ***********************************************************************************/

$(window).unload(function () {
    for (var index in gf_ChildWindow) {
        try {
            if (gf_ChildWindow[index].window) {
                if (!gf_ChildWindow[index].closed)
                    gf_ChildWindow[index].close();
                gf_ChildWindow.remove(index);
            }
        } catch (e) {
        }
    }
});
