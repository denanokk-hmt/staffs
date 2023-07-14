'use strict'

//config
const conf = require(REQUIRE_PATH.configure);

//moduler
const moduler = require(REQUIRE_PATH.moduler)

//System modules
const crypto = moduler.crypto

//role number
const ROLE = conf.ROLE

/**
 * トークンを作成する
 * (ランダムな16文字x2 + ランダムな8文字 + クライアントコードを暗号化)
 * @returns {string} token
 */
const createToken = client => {
  const token = crypto.encrypt(crypto.seedRandom16() + crypto.seedRandom16() + crypto.seedRandom8() + client)
  return token.crypt
}

/**
 * トークンを複合化し、クライアントコードを取得する
 * @param {*string} token 
 * @returns {string} client
 */
 const getClientFromDecryptToken = async token => {

  //Get client code
  const decrypt = await crypto.decrypt(token)
  const client = decrypt.crypt.slice(40,)
  return client
}

/**
 * 次のトークン期限を算出する
 * @param {*} client 
 * @returns {int} unixtime
 */
const setNextTokenExpireTime = client => {
  const dt = new Date().getTime()
  const time = dt + (conf.token_duration_time[client] || conf.token_duration_time['default'])
  return time
}

/**
 * トークン、トークン期限をリフレッションする
 * @param {*} client 
 * @param {*} token_expire_time 期限日時(unixtime) 
 * @returns {*}
 */
const refreshToken = (client, token_expire_time=0) => {

  const dt = new Date().getTime()

  if (token_expire_time < dt) {
    return {
      refresh : true,
      token : createToken(client),
      token_expire_time : setNextTokenExpireTime(client)
    }
  } else {
    return { refresh : false}
  }
}

/**
 * 更新権限を確認する
 * @param {string} own_role('Owner', 'Admin')
 * @param {string} staff_role('Owner', 'Admin') 
 * @returns {boolean}
 */
const checkRole = (own_role='Guest', staff_role='Guest') => {
  const own = ROLE[own_role]
  const staff = ROLE[staff_role]
  if (own >= staff && own > 0) {
    return true
  } else {
    return false
  }
}


/**
 * 権限更新値を確認する
 * @param {string} own_role('Owner', 'Admin')
 * @param {string} staff_role('Owner', 'Admin')
 * @returns {boolean}
 */
 const checkUpdateRole = (own_role='Guest', update_role='Guest') => {
  const own = ROLE[own_role]
  const update = ROLE[update_role]
  if (own >= update) {
    return true
  } else {
    return false
  }
}

/**
 * 更新権限を一致させる
 * @param {string} own_role('Owner', 'Admin')
 * @param {string} staff_role('Owner', 'Admin') 
 * @returns {string} role
 */
 const convertToOwnRole = (own_role='Guest', staff_role='Guest') => {
  const own = ROLE[own_role]
  const staff = ROLE[staff_role]
  if (own < staff) {
   for (let idx in ROLE) {
     if (idx === own) {
       return own
     }
   }
  } else {
    return staff
  }
}


module.exports = {
  createToken,
  setNextTokenExpireTime,
  refreshToken,
  checkRole,
  checkUpdateRole,
  getClientFromDecryptToken,
  convertToOwnRole,
}