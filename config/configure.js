'use strict';

//System modules
//const { getRequest } = require(`${REQUIRE_PATH.moduler}/stand_alone`).wakeup('http')

/**
 * Set configure
 * @param args {*} {  
 * @param {*} appli_name 
 * @param {*} server_code 
 * @param {*} environment
 * } 
 */
 const configuration = async (args) => {

  /////////////////////////
  //Set basic server configs

  //NODE ENV
  const hostname = process.env.HOSTNAME
  console.log(`hostname:${hostname}`)

  //Direcotry pass
  const dirpath =(process.env.NODE_ENV == 'prd')? '/home/dev' : '.'
  module.exports.dirpath = dirpath

  //express response common
  const express_res = require(`../routes/express_res`);
  module.exports.express_res = express_res

  //Application name
  const appli_name = args.appli_name
  module.exports.appli_name = appli_name

  //Server code
  const server_code = args.server_code
  module.exports.server_code = server_code

  //Depoy environmebt
  const environment = args.environment
  module.exports.environment = environment

/*
  //short sha commit id
  const sha_commit_id = process.env.SHA_COMMIT_ID || null;

  //deploy stamp
  const deploy_unixtime = process.env.DEPLOY_UNIXTIME || 0;

  //restart stamp
  const restart_unixtime = process.env.RESTART_UNIXTIME || 0;

  //Set commitid
  //restart is grater than deploy_unixtime --> Restart, using latest revisions :: [sha_commit_id]_[restart_unixtime]
  //Other than that --> Deploy or Restart, using history revisions :: [sha_commit_id]
  const commitid =(deploy_unixtime < restart_unixtime)? `${sha_commit_id}_${restart_unixtime}` : sha_commit_id;

const commitid = process.env.COMMIT_ID || null;

  /////////////////////////
  //Get configure by control tower

  //Set control tower credentials
  const run_domain = 'control-tower2.bwing.app';
  const run_version = '2.0.0';
  const run_token = require('./keel_auth.json').token;
  const domain = (process.env.NODE_ENV == 'prd')? `https://${run_domain}` : `http://localhost:8081`;
  const url = `${domain}/hmt/get/configuration`;
  const params = {
    appli_name : appli_name,
    version : run_version,
    token : run_token,
    server_code : server_code,
    environment : environment,
    hostname: process.env.HOSTNAME || 'localhost',
    commitid: commitid,
    component_version: process.env.VERSION || ((args.series=='v2')? '2.0.0' : '1.1.0'),
  }

  //Get configure
  const result = await getRequest(url, params, )
  .then(response => {
    if (response.data?.status_code != 0) {
      throw Error(`status_code:${response.data?.status_code}`)
    }
    return response.data
  })
  .catch(err => {
    console.error(err)
    process.exit(-1)
  })


  /////////////////////////
  //Exports configure

  //formation
  const formation = result.formation
  module.exports.formation = formation;

  //Regions for multi client
  let regions = []
  for (let idx in formation) {
    regions[formation[idx].client] = `${formation[idx].region}`
  }
  module.exports.regions = regions

  //Project id
  const google_prj_id = result.google_prj_id
  module.exports.google_prj_id = google_prj_id

  //env
  const env = result.env;

  //common(status_code, status_msg, dummy)
  const common = result.common
  const status_code = common.status_code;
  const status = common.status_msg;
  const dummy = common.dummy;
  module.exports.status_code = common.status_code;
  module.exports.status = common.status_msg;
  module.exports.dummy = common.dummy;

  //version
  const version = params.component_version;
*/

  //env & ROLE
  let env = require(`${REQUIRE_PATH.config}/env`)
  module.exports.ROLE = env.ROLE;
  env = {
    service: env.service,
    environment: env.environment,
    port: env.port[env.environment],
  }
  module.exports.env = env;

  //common
  const common = require(`${REQUIRE_PATH.config}/common`)
  module.exports.common = common

  module.exports.version = common.version;
  
  const status_code = common.status_code;
  module.exports.status_code = common.status_code;
  
  const status = common.status_msg;
  module.exports.status = common.status_msg;

  //env_client
  const env_client = require(`${REQUIRE_PATH.config}/env_client`)
  module.exports.env_client = env_client;

  //init interval
  const token_duration_time = await convertTokenDurationTime2Int(env_client)
  module.exports.token_duration_time = token_duration_time
/*
  //api connect
  const api_conn = result.api_conn;
  module.exports.api_conn = api_conn;

  //Tokens for client
  const tokens_client = result.tokens_client
  module.exports.tokens_client = tokens_client

  //keel Auth
  const conf_keel = result.keel_auth;
  module.exports.conf_keel = conf_keel;

  //express response common
  const express_res = require(`../routes/express_res`);
  module.exports.express_res = express_res
*/


  /////////////////////////
  //Return to app
  return {
    server_code,
    //formation,
    env,
    status_code,
    status,
  }
} 
module.exports = { configuration }

/**
 * Set token_duration_time
 * @param env_client
 */
 async function convertTokenDurationTime2Int(env_client) {
  //Calculation expire time
  let token_duration_time = []
  let token_duration_time_str = []
  for (let idx1 in env_client) {
    token_duration_time[idx1] = 0
    token_duration_time_str[idx1] = ''
    if (env_client[idx1].token_duration_time.required) {
      for (let idx in env_client[idx1].token_duration_time.time) {
        if (env_client[idx1].token_duration_time.time[idx]) {
          switch (idx) {
            case "0" :
              token_duration_time[idx1] += env_client[idx1].token_duration_time.time[idx]*1000
              token_duration_time_str[idx1] += `:${idx1}: ${env_client[idx1].token_duration_time.time[idx]} sec`
              break;
            case "1" :
              token_duration_time[idx1] += env_client[idx1].token_duration_time.time[idx]*1000*60
              token_duration_time_str[idx1] += `:${idx1}: ${env_client[idx1].token_duration_time.time[idx]} min`
              break;
            case "2" :
              token_duration_time[idx1] += env_client[idx1].token_duration_time.time[idx]*1000*60*60
              token_duration_time_str[idx1] += `:${idx1}: ${env_client[idx1].token_duration_time.time[idx]} hour`
              break;
            case "3" :
              token_duration_time[idx1] += env_client[idx1].token_duration_time.time[idx]*1000*60*60*24
              token_duration_time_str[idx1] += `:${idx1}: ${env_client[idx1].token_duration_time.time[idx]} Day`
              break;
          }
        }
      }
      if (!token_duration_time[idx1]) {
        console.log(`!!!!Do not set the expire time!!!!${idx1}`)
        process.exit(1);
      }
    }
  }

  for (let idx in token_duration_time_str) {
    console.log(`SESSION EXPIRED TIME IS ${token_duration_time_str[idx]}`)
  }

  return token_duration_time
}