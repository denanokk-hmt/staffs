'use strict';

//config
const conf = require(REQUIRE_PATH.configure);
const code = conf.status_code

//express
const express_res = conf.express_res

//moduler
const moduler = require(REQUIRE_PATH.moduler)

//System modules


/**
 * Get own staff info
 * 自分Staff情報の問い合せに回答する
 * @param {*} req 
 * @param {*} res 
 */
const getOwn = async ({req, res}) => {
  try {

    //Set Staff props
    const props = {
      id: req.own.key_id,
      ...req.own,
      client: req.client,
    }

    //Result
    const result =  {
      type : "API",
      status_code : code.SUCCESS_ZERO,
      status_msg : "Get own Success",
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
  getOwn,
}
