'use strict';

//config
const conf = require(REQUIRE_PATH.configure);
const code = conf.status_code

//role numbers
const ROLE = conf.ROLE

//express
const express_res = conf.express_res

//moduler
const moduler = require(REQUIRE_PATH.moduler)

//System modules
const { getStaffsBy } = moduler.kvs.staffs


/**
 * Get staffs props
 * CWからのStaff一覧情報の問い合せに回答する
 * @param {*} req 
 * @param {*} res 
 */
const getStaffs = async ({req, res}) => {
  try {

    //Get all staffs
    const staffs = await getStaffsBy({ns: req.ns})
    if (!staffs) {
      //express_res.funcErr({res, errmsg: "ERR_V_NOT_STAFF_212"});
      return "No staff.";
    }

    let records = []
    for (let idx in staffs) {
      const porps = {
        id: staffs[idx].key_id,
        email: staffs[idx].email,
        name_first: staffs[idx].name_first,
        name_last: staffs[idx].name_last,
        name_nick: staffs[idx].name_nick,
        fb_auth: (staffs[idx].fb_uid)? 'done' : 'none',
        role: staffs[idx].role,
        role_number: ROLE[staffs[idx].role],
        active: staffs[idx].active,
      }
      records.push(porps)
    }

    //Result
    const result =  {
      type : "API",
      status_code : code.SUCCESS_ZERO,
      status_msg : "Get Staffs Success",
      staffs : records,
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
  getStaffs,
}
