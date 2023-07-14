'use strict';

/**
 * Error Response
 * @param {*} res 
 * @param {*} content
 */
const res = ({
  res,
  content,
  responded = null,
  haederKey='Access-Control-Allow-Origin',
  headerValue='*',
  contextType='application/json',
  cookie_staff_token,
}) => {
  const conf = require(REQUIRE_PATH.configure);
  const env = conf.env

  if (res.finished) return

  //Header set
  res.set(haederKey, headerValue)
  res.fr_headers = res.getHeaders() //for flight recorder

  //Cookie set
  if (cookie_staff_token) {
    res.cookie('staff_token', cookie_staff_token, {
      domain: (env.environment === 'dev')? '.svc.app' : 'bwing.app',
      path: '/',
      secure: true
    })
  }

  //Response
  //Basic is retrun body is JSON value.--> use 'send'
  switch (contextType) {
    case 'send':
      res.send(content);
      res.fr_response = null; //for flight recorder
      break;
    case 'application/json':
    default:
      res.json(content);

       //for flight recorder
      res.fr_responded = responded;
      res.fr_response = content;
  }
}
module.exports.func = res


/**
 * Error Response
 * @param {*} res 
 * @param {*} status 
 * @param {*} status_code 
 */
const errRes = ({
  type="SYSTEM",
  res, 
  status_msg, 
  status_code,
  errmsg,
  haederKey='Access-Control-Allow-Origin', 
  headerValue='*', 
  contextType='application/json'
}) => {
  const conf = require(REQUIRE_PATH.configure);
  const common = conf.common

  const code = (errmsg)? common.status_code[errmsg] : status_code
  const msg = (errmsg)? common.status_msg[errmsg] : status_msg

  //Response array set
  const content = {
    type : type,
    status_code : code,
    status_msg : msg,
    approval : false
  }

  if (res.finished) return
  res.set(haederKey, headerValue)
  switch (contextType) {
    case 'application/json':
    default:
      res.json(content);
  }
  return true
}
module.exports.funcErr = errRes