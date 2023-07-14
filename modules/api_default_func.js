//config
const conf = require(REQUIRE_PATH.configure);
const env = conf.env

//express
const express_res = conf.express_res

//moduler
const moduler = require(REQUIRE_PATH.moduler)

//System modules
const valid = moduler.validation
const {getIP} = moduler.getIP
const crypto = moduler.crypto
const ds = moduler.kvs
const { getClientFromDecryptToken } = require(`${REQUIRE_PATH.modules}/utils`)


/**
 * APIを受信した際に、先に行う処理
 * パラメーターや、パラメーターから共通的に引き回す値の格納
 * 共通ログ出力など
 */
const apiDefaultFunc = {

  //End
  Final : (req, res) => {
    try {
      console.log(res.respond)
    } catch(err) {
      console.error(err)
    }
  },

  //Validation
  /**
   * デフォルなバリデーションを行う
   * firstSetでパラメーターを取得したあとに利用する
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   */
  validation : (req, res, next) => {
    try {

      //default::version
      const validations = {
        version: req.params.version,
      }

      //for each api set validations params
      switch (req.api) {
        case "GET_ENV":
        case "GET_CONFIG":
          break;
        case "POST_INIT_OWNER":
          validations.email = req.params.email
          validations.client = req.params.client
          break;
        case "POST_STAFF":
          validations.token = req.params.token
          validations.email = req.params.email
          validations.client = req.params.client
          break;
        case "PUT_STAFF":
          validations.token = req.params.token
          validations.email = req.params.email
          validations.id = req.params.id
          break;
        case "PUT_LOGIN":
          validations.idToken = req.params.idToken
          break;
        case "GET_OWN":
          validations.token = req.params.token
          break;
        case "GET_STAFF":
          validations.token = req.params.token
          validations.email = req.params.email
          break;
        case "GET_STAFFS":
          validations.token = req.params.token
          break;
        case "DELETE_STAFF":
          validations.token = req.params.token
          validations.id = req.params.id
          break;
        default:
          break;
      }

      //Basic validation
      const valid_result = basicValidation(res, validations)
      if (valid_result) {
        console.log(JSON.stringify(valid_result))
        return
      }

      next()
    } catch(err) {
      console.error(err)
      throw err
    }
  },

  //Default Setting
  firstSet: (req, res, next) => {
    try {

      //Create logiD
      req.logiD = `${crypto.seedRandom8()}${(new Date).getTime()}`

      //Set param object
      const paramObj = (req.method == 'GET')? "query" : "body"

      //Set component,
      req.compo = req[paramObj].component

      //Set client
      req.client = req[paramObj].client

      //Set use
      req.environment = env.environment

      //Datastore namespace
      req.ns = `WhatYa-${req.compo || 'Catwalk'}-${req.client}-${req.environment}`

      //API
      req.api = String(req.url.split('?')[0]).split('/').slice(1,).join('_').toUpperCase()

      //Get & set IP
      req.IP = getIP(req)

      //Set mock
      req.mock = req[paramObj].mock

      //body
      req.params = (req.method == 'GET')? req.query : (Object.keys(req.body).length)? req.body : req.query

      next()
    } catch(err) {
      console.error(err)
    }
  },

  //Logging request parameter
  loggingParams : (req, res, next) => {
    try {

      //Logging parameter
      console.log(`======${req.logiD} STAFFS ${req.api}:`, JSON.stringify(req.params))

      //Logging header
      console.log(`======${req.logiD} STAFFS HEADERS:`, JSON.stringify(req.headers))

      //IP
      console.log(`======${req.logiD} STAFFS REQUEST IP:`, req.IP)

      next()
    } catch(err) {
      console.error(err)
    }
  },

  /**
   * 自分自身を取得
   * 本認証明をTokenを使って行う
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   * @returns 
   */
  getOwnByToken : async (req, res, next) => {
    try {

      //Getパラメーターに[+]があると空白に変換されているので、+に戻す
      req.params.token = req.params.token.replace(/ /g, "+")

      //Clientを再設定：Tokenをデコードしてクライアントコードを取り出す
      req.client = await getClientFromDecryptToken(req.params.token)

      //Datastore namespaceを再設定
      req.ns = `WhatYa-${req.compo || 'Catwalk'}-${req.client}-${req.environment}`

      //TokenでStaff検索をして、検索出来なかった場合エラー(あなた誰？)
      const own = await ds.staffs.getStaffByFilter({ns: req.ns, propname: 'token', value: req.params.token});
      if (!own) {
        express_res.funcErr({res, errmsg: "ERR_V_NOT_STAFF_212"});
        return "You are not staff.";
      }

      //Check token expire
      if (own.token_expire_time < new Date().getTime()) {
        express_res.funcErr({res, errmsg: "ERR_V_TOKEN_EXPIRED_215"});
        return "Token expired.";
      }

      //Set own
      req.own = own

      next()
    } catch(err) {
      console.error(err)
      throw err
    }
  },

  //Get staff by email
  getStaffByEmail : async (req, res, next) => {
    try {

      //EmailでStaffを検索（こに時点で、検索結果による判定はしない）
      const staff = await ds.staffs.getStaffByFilter({ns: req.ns, propname: 'email', value: req.params?.email});

      //Set staff
      req.staff = staff

      //Set fb_uid(パラメーターの値を優先する)
      if (staff) {
        req.staff.fb_uid = (req.params?.fb_uid)? req.params.fb_uid : staff.fb_uid
      }

      next()
    } catch(err) {
      console.error(err)
      throw err
    }
  },

  //Get staff by if
  getStaffById : async (req, res, next) => {
    try {

      //idでStaffを検索
      const staff = await ds.store.getEntityByKey({ns: req.ns, kind: ds.KIND.STAFFS, key: req.params.id});
      if (staff?.length !== 1) {
        express_res.funcErr({res, errmsg: "ERR_V_DID_NOT_STAFF_EXISTS_211"});
        return 'Staff did not exists Error.';
      }      

      //Set staff
      req.staff = staff

      next()
    } catch(err) {
      console.error(err)
      throw err
    }
  },
};
module.exports = {
  apiDefaultFunc
};


/**
 * ///////////////////////////////////////////////////
 * Basic validation
 * @param {*} res
 * @param {*} validations
 */
 function basicValidation(res, validations) {

  //Validation IsValue
  let valid_result
  valid_result = valid.isParamValue(validations)
  if (!valid_result.approval) {
    express_res.funcErr({res, status_msg: valid_result.status_msg, status_code: valid_result.status_code});
    return 'IsValue valid error.'
  }

  //Validation Version auth
  valid_result = valid.versionAuth(validations.version)
  if (!valid_result.approval) {
    express_res.funcErr({res, status_msg: valid_result.status_msg, status_code: valid_result.status_code});
    return 'Version valid error.'
  }

  //validation ok --> return nothing
  return
}