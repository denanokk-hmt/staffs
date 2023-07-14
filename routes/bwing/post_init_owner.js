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
const { createToken, setNextTokenExpireTime } = require(`${REQUIRE_PATH.modules}/utils`)
const { createUser } = require(`${REQUIRE_PATH.modules}/firebase_admin`)


/**
 * Create Owner staff 
 * 公開に際し、初期設定に必要なオーナースタッフの登録
 * @param {*} req 
 * @param {*} res 
 */
const postInitOwner = async ({req, res}) => {
  try {

    //Set Staff props
    const props = {
      token: createToken(req.client),
      token_expire_time: setNextTokenExpireTime(req.client),
      token_duration_time: conf.token_duration_time[req.client] || conf.token_duration_time['default'],
      client: req.client,
      email: req.params.email,
      uid: null,
      name_first: req.params.name_first || 'OWNER',
      name_last: req.params.name_last || 'OWNER', 
      name_nick: req.params.name_nick || 'OWNER',
      role: req.params.role || 'Owner',
      role_number: ROLE[req.params.role] || ROLE['Owner'],
    }

    //Create firebase user
    const user = await createUser({email: props.email, name: props.name_first});
    if (!user) {
      express_res.funcErr({res, errmsg: "ERR_A_SYSTEM_990"});
      return 'Post init owner Error.(faild create User)';
    } else {
      console.log(user)
      props.fb_uid = user.uid
    }

    //Create staff entity
    const staff = await createStaff({ns: req.ns, props});
    if (!staff || !staff.key) {
      express_res.funcErr({res, errmsg: "ERR_A_SYSTEM_990"});
      return 'Post init owner Error. (faild create Staff)';
    }

    //Result
    const result =  {
      type : "API",
      status_code : code.SUCCESS_ZERO,
      status_msg : "Post Init Owner Success",
      staff : props,
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
  postInitOwner,
}
