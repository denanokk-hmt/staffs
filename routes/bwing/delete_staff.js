'use strict';

//config
const conf = require(REQUIRE_PATH.configure);
const code = conf.status_code

//express
const express_res = conf.express_res

//moduler
const moduler = require(REQUIRE_PATH.moduler)

//System modules
const ds = moduler.kvs
const { checkRole } = require(`${REQUIRE_PATH.modules}/utils`)
const { deleteUser } = require(`${REQUIRE_PATH.modules}/firebase_admin`)


/**
 * Update some staff props
 * CWの画面からStaffの更新を行う
 * @param {*} req 
 * @param {*} res 
 */
const deleteStaff = async ({req, res}) => {
  try {

    //Check role
    if (!checkRole(req.own.role, req.staff[0].role)) {
      express_res.funcErr({res, errmsg: "ERR_V_PERMISSION_STAFF_213"});
      return 'Put Staff permission Error.';
    }

    //Delete staff entity
    const staff = await ds.staffs.deleteStaffById({ns: req.ns, id: req.params.id});
    if (!staff.id) {
      express_res.funcErr({res, errmsg: "ERR_A_SYSTEM_990"});
      return 'Delete Staff Error.(faild delete Staff)';
    }

    //Delete firebase user
    await deleteUser(req.staff[0].fb_uid);

    //Result
    const result =  {
      type : "API",
      status_code : code.SUCCESS_ZERO,
      status_msg : "Delete Staff Success",
      staff_id: staff.id,
      staff_email: req.staff[0].email,
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
  deleteStaff,
}
