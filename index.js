const admin = require('firebase-admin')
const { google } = require('googleapis')
const axios = require('axios')

const MESSAGING_SCOPE = 'https://www.googleapis.com/auth/firebase.messaging'
const SCOPES = [MESSAGING_SCOPE]

const serviceAccount = require('./fcm-ba434-firebase-adminsdk-1kca3-735aefdfa4.json')
const databaseURL = 'https://fcm-ba434.firebaseio.com'
const URL =
  'https://fcm.googleapis.com/v1/projects/fcm-ba434/messages:send'
const deviceToken =
  'feEOI67tZP6ywsUhvk-CY7:APA91bFuHFsMpuoZiN8cTlOm8GAd3n4fV-sPuGrCvUjbD4EyMN6Qjwui-C-fnwEvAqUYh8Q8_oIAQssPjlXk2SpkTNerJw0Dia69Dq3o1hlAB3iCstuHhngbavgWvLd52nbCnLrfsICP'

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: databaseURL
})

function getAccessToken() {
  return new Promise(function(resolve, reject) {
    var key = serviceAccount
    var jwtClient = new google.auth.JWT(
      key.client_email,
      null,
      key.private_key,
      SCOPES,
      null
    )
    jwtClient.authorize(function(err, tokens) {
      if (err) {
        reject(err)
        return
      }
      resolve(tokens.access_token)
    })
  })
}

async function init() {
  const body = {
    message: {
      data: { key: 'value' },
      notification: {
        title: 'Notification title',
        body: 'Notification body'
      },
      webpush: {
        headers: {
          Urgency: 'high'
        },
        notification: {
          requireInteraction: 'true'
        }
      },
      token: deviceToken
    }
  }

  try {
    const accessToken = await getAccessToken()
    console.log('accessToken: ', accessToken)
    const { data } = await axios.post(URL, JSON.stringify(body), {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      }
    })
    console.log('name: ', data.name)
  } catch (err) {
    console.log('err: ', err.message)
  }
}

init()