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


/**
 * Get some staff props
 * CWからのStaff情報の問い合せに回答する
 * @param {*} req 
 * @param {*} res 
 */
const getStaff = async ({req, res}) => {
  try {

    //Set Staff props
    const props = {
      id: req.staff.key_id,
      ...req.staff,
      role_number: ROLE[req.staff.role],
    }

    //Result
    const result =  {
      type : "API",
      status_code : code.SUCCESS_ZERO,
      status_msg : "Get Staff Success",
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
  getStaff,
}
