'use strict';

//config
const conf = require(REQUIRE_PATH.configure);
const code = conf.status_code
const status = conf.status

//express
var express = require('express')
var router = express.Router()
const express_res = conf.express_res

//moduler
const moduler = require(REQUIRE_PATH.moduler)

//System module
const valid = moduler.validation
const { firstSet, validation, loggingParams, getStaffByEmail, getOwnByToken, getStaffById, } = require(`${REQUIRE_PATH.modules}/api_default_func`).apiDefaultFunc
const fr = moduler.recorder.FlightRecorder  //flight-recorder

//[routes modules]
const { postInitOwner } = require(`./bwing/post_init_owner`)
const { postStaff } = require(`./bwing/post_staff`)
const { putStaff } = require(`./bwing/put_staff`)
const { putLogin } = require(`./bwing/put_login`)
const { getOwn } = require(`./bwing/get_own`)
const { getStaff } = require(`./bwing/get_staff`)
const { getStaffs } = require(`./bwing/get_staffs`)
const { deleteStaff } = require(`./bwing/delete_staff`)

/**
 * ///////////////////////////////////////////////////
 * Error Response
 * @param {*} err 
 * @param {*} next 
 */
function errHandle2Top(err, next) {
  const result = {
    type: "API",
    status_code: code.ERR_S_API_REQ_902,
    status_msg : status.ERR_S_API_REQ_902,
    approval: false,
    status: err.status,
    message: err.message,
    stack: err.stack,
  }
  next(result)
}

/**
 * ///////////////////////////////////////////////////
 * [[[For Developement]]]
 * Get Node process env
 */
router.get('/get/env', firstSet, loggingParams, async (req, res, next) => {
  let result = process.env
  result.node_version = process.version
  express_res.func({res, content: result})
})

/**
 * ///////////////////////////////////////////////////
 * Get config
 */
router.get('/get/config', firstSet, validation, loggingParams, async (req, res, next) => {

  //Token validation
  const valid_result = valid.tokenAuthKeel(req.params.token)
  if (!valid_result.approval) {
    express_res.funcErr({res, status_msg: valid_result.status_msg, status_code: valid_result.status_code});
    return 'Token valid error.'
  }
  
  //Response configures
  express_res.func({res, content: conf})

  return true
})

/**
 * ///////////////////////////////////////////////////
 * Create owner staff
 * !!!システム管理者のみの特殊API!!!
 * クライアンへの提供前に実行。オーナースタッフを作成する
 * クライアントからオーナーとなるアカウントのヒアリング必須
 * 必須パラメーター：version, client, email
 * 非必須パラメーター: staff属性項目（なければデフォルト値適用)
 */
router.post('/post/init/owner', firstSet, validation, loggingParams, getStaffByEmail, async (req, res, next) => {

  //Gard staff(emailで検索出来た)
  if (req.staff) {
    express_res.funcErr({res, errmsg: "ERR_V_STAFF_EXISTS_210"});
    return 'Staff Already exists Error.';
  }

  //Create Staff
  const result = await postInitOwner({req, res})
  .catch(err => {
    errHandle2Top(err, next)
    return 'postInitOwner error'
  });
})

/**
 * ///////////////////////////////////////////////////
 * Create new staff
 * CW画面からStaffの新規登録を行う
 * 必須パラメーター：version, token, email, 
 * ※ここで指定するtokenは、登録用ではなく、操作者の持つtoken(認証用)
 * 非必須パラメーター：staff属性項目(無い場合、デフォルト値)
 */
router.post('/post/staff', firstSet, validation, loggingParams, getOwnByToken, getStaffByEmail, async (req, res, next) => {

  //staff情報あり=emailで検索出来ているので、登録NG
  if (req.staff) {
    express_res.funcErr({res, errmsg: "ERR_V_STAFF_EXISTS_210"});
    return 'Staff Already exists Error.';
  }

  //Create Staff
  const result = await postStaff({req, res})
  .catch(err => {
    errHandle2Top(err, next)
    return 'postStaff up error'
  });
})

/**
 * ///////////////////////////////////////////////////
 * CW画面よりにStaffの更新を行う
 * 前提条件：Firebase Auth認証後
 * 必須パラメーター：version, token, email, 更新するstaff id(dsのkey)
 * 非必須パラメーター：staff属性項目(無い場合、デフォルト値)
 */
 router.put('/put/staff', firstSet, validation, loggingParams, getOwnByToken, getStaffByEmail, async (req, res, next) => {

  //key idと、emailで検索したstaffのidが異なる場合、更新しようとしているEmailを使用済のためエラー
  if (req.staff && Number(req.params.id) !== Number(req.staff?.key_id)) {
    express_res.funcErr({res, errmsg: "ERR_V_ALREADY_USE_EMAIL_214"});
    return "Already use email.";      
  }

  //Update Staff
  const result = await putStaff({req, res})
  .catch(err => {
    errHandle2Top(err, next)
    return 'putStaff up error'
  });

})

/**
 * ///////////////////////////////////////////////////
 * Login 認証画面より問い合わせ
 * 前提条件：FBでAuth済、FBでidTokenの取得済、CW側でStaffの登録済であること
 * WEP認証からのみCallを許すAPI
 * 必須パラメーター：version, client, email, fb_uid
 */
router.put('/put/login', firstSet, validation, loggingParams, /*getStaffByEmail,*/ async (req, res, next) => {

  /*
  //Gard staff(emailで検索出来なかった)
  if (!req.staff) {
    express_res.funcErr({res, errmsg: "ERR_V_NOT_STAFF_212"});
    return "Your not staff.";
  }*/

  //Create Staff
  const result = await putLogin({req, res})
  .catch(err => {
    errHandle2Top(err, next)
    return 'putLogin up error'
  });

})

/**
 * ///////////////////////////////////////////////////
 * CW画面から自分情報の問い合わせ
 * 必須パラメーター：version, token
 */
router.get('/get/own', firstSet, validation, loggingParams, getOwnByToken, async (req, res, next) => {

  //Get Own
  const result = await getOwn({req, res})
  .catch(err => {
    errHandle2Top(err, next)
    return 'getOwn error'
  });
})

/**
 * ///////////////////////////////////////////////////
 * CW画面からスタッフ情報を取得する
 * 必須パラメーター：version, token
 */
 router.get('/get/staff', firstSet, validation, loggingParams, getOwnByToken, getStaffByEmail, async (req, res, next) => {

  //Gard staff(emailで検索出来なかった)
  if (!req.staff) {
    express_res.funcErr({res, errmsg: "ERR_V_NOT_STAFF_212"});
    return "Your not staff.";
  }

  //Get Staff
  const result = await getStaff({req, res})
  .catch(err => {
    errHandle2Top(err, next)
    return 'getStaff error'
  });
})

/**
 * ///////////////////////////////////////////////////
 * CW画面からスタッフ情報一覧を取得する
 * 必須パラメーター：version, token
 */
 router.get('/get/staffs', firstSet, validation, loggingParams, getOwnByToken, async (req, res, next) => {

  //Get Staffs
  const result = await getStaffs({req, res})
  .catch(err => {
    errHandle2Top(err, next)
    return 'getStaffs error'
  });
})

/**
 * ///////////////////////////////////////////////////
 * CW画面よりにStaffの削除を行う
 * 前提条件：Firebase Auth認証後
 * 必須パラメーター：version, token, 更新するstaff id(dsのkey)
 */
 router.delete('/delete/staff', firstSet, validation, loggingParams, getOwnByToken, getStaffById, async (req, res, next) => {

  //ADFでkey id検索

  //Update Staff
  const result = await deleteStaff({req, res})
  .catch(err => {
    errHandle2Top(err, next)
    return 'deleteStaff error'
  });

})

module.exports = router;
