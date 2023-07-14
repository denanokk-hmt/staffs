'use strict';

//config
const conf = require(REQUIRE_PATH.configure);
const code = conf.status_code

//express
const express_res = conf.express_res

//moduler
const moduler = require(REQUIRE_PATH.moduler)

//System modules
const { getStaffByFilter, updateStaff } = moduler.kvs.staffs
const { refreshToken } = require(`${REQUIRE_PATH.modules}/utils`)
const { getUserEmailByVerifyUid } = require(`${REQUIRE_PATH.modules}/firebase_admin`)


/**
 * Login
 * emailを使ってStaff(Own)の確認と、TokenをRefreshする
 * @param {*} req 
 * @param {*} res 
 */
const putLogin = async ({req, res}) => {
  try {

    //Firebase側のメールアドレスを割り出す
    const user_email = await getUserEmailByVerifyUid(req.params.idToken)

    //Firebase側から割り出したメールアドレスをStafffs登録されているかを検証
    let staff = await getStaffByFilter({ns: req.ns, propname: 'email', value: user_email});
    if (!staff) {
      express_res.funcErr({res, errmsg: "ERR_V_NOT_STAFF_212"});
      return "Your not staff.";
    }

    //Set Staff props
    const props = {
      id: staff.key_id,
      ...staff,
    }

    //Refresh token, token exipre time
    const refresh_token = await refreshToken(req.client, props.token_expire_time)
    if (refresh_token.refresh) {
      props.token = refresh_token.token
      props.token_expire_time = refresh_token.token_expire_time
    }

    //Update staff entity
    staff = await updateStaff({ns: req.ns, props});
    if (!staff || !staff.key) {
      express_res.funcErr({res, errmsg: "ERR_A_SYSTEM_990"});
      return 'Put Staff Error.';
    }

    //Result
    const result =  {
      type : "API",
      status_code : code.SUCCESS_ZERO,
      status_msg : "Put login Staff Success",
      props,
      //customToken,
      approval : true
    }

    //Response
    express_res.func({res, content: result})

    return result;
  } catch(err) {
    console.log(err)
    throw err
  }
};
module.exports = {
  putLogin,
}
