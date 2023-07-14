'use strict';

//config
const conf = require(REQUIRE_PATH.configure);
const code = conf.status_code

//role number
const ROLE = conf.ROLE

//express
const express_res = conf.express_res

//moduler
const moduler = require(REQUIRE_PATH.moduler)

//System modules
const { createStaff } = moduler.kvs.staffs
const { checkUpdateRole, createToken, setNextTokenExpireTime } = require(`${REQUIRE_PATH.modules}/utils`)
const { createUser } = require(`${REQUIRE_PATH.modules}/firebase_admin`)


/**
 * Create new staff 
 * CW画面からStaffの新規登録を行う
 * @param {*} req 
 * @param {*} res 
 */
const postStaff = async ({req, res}) => {
  try {

    //更新可能権限値を確認する
    if (!checkUpdateRole(req.own.role, req.params.role)) {
      express_res.funcErr({res, errmsg: "ERR_V_PERMISSION_STAFF_213"});
      return 'Put Staff permission Error.';
    }

    //Set Staff props
    const props = {
      token: createToken(req.client),
      token_expire_time: setNextTokenExpireTime(req.client),
      token_duration_time: conf.token_duration_time[req.client] || conf.token_duration_time['default'],
      client: req.client,
      email: req.params.email,
      uid: null,
      name_first: req.params.name_first || 'noname',
      name_last: req.params.name_last || 'noname',
      name_nick: req.params.name_nick || 'noname',
      role: req.params.role || 'Guest',
      role_number: ROLE[req.params.role] || 0,
    }   

    //Create firebase user
    const user = await createUser({email: props.email, name: props.name_first});
    if (!user) {
      express_res.funcErr({res, errmsg: "ERR_A_SYSTEM_990"});
      return 'Post Staff Error.(faild create User)';
    } else {
      console.log(user)
      props.fb_uid = user.uid
    }

    //Create staff entity
    const staff = await createStaff({ns: req.ns, props});
    if (!staff || !staff.key) {
      express_res.funcErr({res, errmsg: "ERR_A_SYSTEM_990"});
      return 'Post Staff Error.(faild create Staff)';
    }

    //Result
    const result =  {
      type : "API",
      status_code : code.SUCCESS_ZERO,
      status_msg : "Post Staff Success",
      staff : props,
      role_numbers : ROLE,
      approval: true
    }

    //Response
    express_res.func({res, content: result})

    return result;
  } catch(err) {
    throw err
  }
};
module.exports = {
  postStaff,
}
