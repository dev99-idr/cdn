// RSA keY 가져오기

function gf_GetRSAKey(frm) {
    $.ajax({
        type: "post",
        url: gv_ContextPath + '/login/loginRSAKey.xpl',
        data: {},
        datatype: "json",
        contentType: "application/json+core; charset=utf-8",
        success: function (data) {
            var msg;
            if (data && data.success) {
                msg = data.success[0];
                if (msg && msg != '') {
                } else {
                    msg = "|";
                }
            } else {
                msg = "|";
            }
            var key = msg.split("|");

            frm.publicKeyModulus.value = key[0];
            frm.publicKeyExponent.value = key[1];
        },
        async: false
    });
}

//RSA 암호화 후 인증 요청
function gf_EncryptedLogin(user_id, pass_wd, frm, loclCd) {
    var userId = gf_Hangle(user_id);
    var passwd = gf_Hangle(pass_wd);

    var rsaPublicKeyModulus = frm.publicKeyModulus.value;
    var rsaPpublicKeyExponent = frm.publicKeyExponent.value;
    var rsa = new RSAKey();

    rsa.setPublic(rsaPublicKeyModulus, rsaPpublicKeyExponent);

    // 사용자ID와 비밀번호를 RSA로 암호화한다.
    var securedUserId = rsa.encrypt(userId);
    var securedPasswd = rsa.encrypt(passwd);

    // POST 로그인 폼에 값을 설정하고 발행(submit) 한다.
    /*var ifm = cfGetPoppyFrame(document);
     frm.target = ifm.name;*/
    frm.loclCd.value = gf_IsNull(loclCd) ? "en_US" : loclCd;
    frm.j_username.value = securedUserId;
    frm.j_password.value = securedPasswd;

    frm.submit();
}

//RSA 암호화 후 인증 요청
function gf_Encrypted(text, frm) {
    var encryptText = text; //gf_Hangle(text);	// 특수문자 인코딩 제거

    var rsaPublicKeyModulus = frm.publicKeyModulus.value;
    var rsaPpublicKeyExponent = frm.publicKeyExponent.value;
    var rsa = new RSAKey();

    rsa.setPublic(rsaPublicKeyModulus, rsaPpublicKeyExponent);

    // 사용자ID와 비밀번호를 RSA로 암호화한다.
    encryptText = rsa.encrypt(encryptText);

    return encryptText
}