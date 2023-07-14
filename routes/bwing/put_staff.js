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
const ds = moduler.kvs
const { checkRole, checkUpdateRole } = require(`${REQUIRE_PATH.modules}/utils`)


/**
 * Update some staff props
 * CWの画面からStaffの更新を行う
 * @param {*} req 
 * @param {*} res 
 */
const putStaff = async ({req, res}) => {
  try {

    //Get staff by id
    let staff = await ds.store.getEntityByKey({ns: req.ns, kind: ds.KIND.STAFFS, key: req.params.id});
    if (staff?.length !== 1) {
      express_res.funcErr({res, errmsg: "ERR_V_DID_NOT_STAFF_EXISTS_211"});
      return 'Staff did not exists Error.';
    }

    //更新可能権限を確認する
    if (!checkRole(req.own.role, staff[0].role)) {
      express_res.funcErr({res, errmsg: "ERR_V_PERMISSION_STAFF_213"});
      return 'Put Staff permission Error.';
    }
    
    //更新可能権限値を確認する
    if (!checkUpdateRole(req.own.role, req.params.role)) {
      express_res.funcErr({res, errmsg: "ERR_V_PERMISSION_STAFF_213"});
      return 'Put Staff permission Error.';
    }

    //Set Staff props
    const props = {
      id: req.params.id,
      fb_uid: staff[0].fb_uid,
      token: staff[0].token,
      token_duration_time: staff[0].token_duration_time,
      client: req.client,
      token_expire_time: staff[0].token_expire_time,
      email: req.params.email || staff[0].email,
      name_first: req.params.name_first || staff[0].name_first,
      name_last: req.params.name_last || staff[0].name_last,
      name_nick: req.params.name_nick || staff[0].name_nick,
      role: req.params.role || staff[0].role,
      role_number: ROLE[req.params.role] || ROLE[staff[0].role],
      active: req.params.active || true,
      dflg: req.params.dflg || null,
      cdt: staff[0].cdt,
      udt: new Date(),
    }

    //Update staff entity
    staff = await ds.staffs.updateStaff({ns: req.ns, props});
    if (!staff || !staff.key) {
      express_res.funcErr({res, errmsg: "ERR_A_SYSTEM_990"});
      return 'Put Staff Error.';
    }

    //Result
    const result =  {
      type : "API",
      status_code : code.SUCCESS_ZERO,
      status_msg : "Put Staff Success",
      staff: props,
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
  putStaff,
}
