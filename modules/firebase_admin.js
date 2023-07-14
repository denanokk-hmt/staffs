'use strict';

const admin = require(`firebase-admin`)
admin.initializeApp()


/**
 *  Verify用にクライアント側で発行されたIDトークンを利用して、Firebase側の
 * ユーザー情報を取得し、メールアドレスを割り出す
 * @param {text} idToken 
 * @returns {text} email 
 */
const getUserEmailByVerifyUid = async idToken => {
  try {
    // idToken comes from the client app
    const verify_uid = await admin.auth().verifyIdToken(idToken)
    .then((decodedToken) => {
      const uid = decodedToken.uid;
      // ...
      //console.log("IDTOKEN UID", uid)
      return uid
    })

    const user_email = await admin.auth().getUser(verify_uid)
    .then((userRecord) => {
      // See the UserRecord reference doc for the contents of userRecord.
      console.log(JSON.stringify(userRecord));
      return userRecord.email
    })

    return user_email
  } catch(err) {
    throw err
  }
}

/**
 * EmailからFrirebaseユーザーを取得する
 * @param {text} email 
 * @returns 
 */
const getUserByEmail = async email => {
  try {
    //
    return await admin.auth().getUserByEmail(email)
    .then((userRecord) => {
      // ...
      console.log("USER RECORD", userRecord)
      return userRecord
    })
  } catch(err) {
    throw err
  }
}

/**
 * カスタムトークンを生成
 * @param {*} fb_uid 
 * @returns 
 */
const createCustomToken = async fb_uid => {
  try {
    //クライアント認証用のカスタムトークン
    const customToken = await admin.auth().createCustomToken(fb_uid)
    .then(token => {
        console.log(token);
        return token
    })
    return customToken
  } catch(err) {
    throw err
  }    
}

/**
 * Firebase userを作成する
 * @param {*} user.email, user.first_name
 * @returns {*} user
 */
const createUser = async ({email, password='1234567', name='noname'}) => {
  
  try {
    const userRecord = await admin.auth().createUser({
      email: email,
      emailVerified: false,
      password: password,
      displayName: name,
      disabled: false,
    })
    .then((userRecord) => {
      // See the UserRecord reference doc for the contents of userRecord.
      console.log('Successfully created new user:', userRecord.uid);
      return userRecord
    })
    return userRecord
  } catch(err) {
    if (err.code == 'auth/email-already-exists') {
      return getUserByEmail(email)
    } else {
      throw err
    }
  }    
}

/**
 * Firebase userを削除する
 * @param {text} uid
 * @returns {boolean} true
 */
 const deleteUser = async fb_uid => {
  try {
    return await admin.auth().deleteUser(fb_uid)
    .then(() => {
      console.log(`Successfully deleted user ::${fb_uid}`);
      return true
    })
  } catch(err) {
    //エラーをログへ処理はとめない
    console.log(err)
    return false
  }    
}

module.exports = {
  getUserEmailByVerifyUid,
  getUserByEmail,
  createCustomToken,
  createUser,
  deleteUser,
}