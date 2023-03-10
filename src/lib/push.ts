import { messaging } from 'firebase-admin'

export type NotifyByPushType = { token: string; data: any; notification: any }
const notifyByPush = async ({ token, data, notification }: NotifyByPushType) => {
  try {
    const pushResult = await messaging().send({
      token: token,
      notification,
      data,
      android: {
        notification: {
          channelId: 'riders',
          vibrateTimingsMillis: [0, 500, 500, 500],
          priority: 'high',
          defaultVibrateTimings: false,
          defaultLightSettings: true,
          lightSettings: {
            color: '#ff0000',
            lightOffDurationMillis: 100,
            lightOnDurationMillis: 100,
          },
          defaultSound: true,
        },
        priority: 'high',
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            category: 'riders',
            contentAvailable: true,
          },
        },
      },
    })

    return pushResult
  } catch (error) {
    console.log({ 'notifyByPush error': error })
    if (error.errorInfo.code === 'messaging/registration-token-not-registered') return 'notifyByPush error'
    notifyByPush({ token, data, notification })
    return 'notifyByPush error'
  }
}

export type FibaseMultiPushType = { tokens: string[]; data: any; notification: any }
export const fibaseMultiPush = async ({ tokens, data, notification }: FibaseMultiPushType) => {
  try {
    const pushResult = await messaging().sendMulticast({
      tokens,
      notification,
      data,
      android: {
        notification: {
          channelId: 'riders',
          vibrateTimingsMillis: [0, 500, 500, 500],
          priority: 'high',
          defaultVibrateTimings: false,
        },
        priority: 'high',
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            category: 'riders',
            contentAvailable: true,
          },
        },
      },
    })

    return pushResult
  } catch (error) {
    console.log({ 'notifyByPush error': error })
    return 'notifyByPush error'
  }
}

export default notifyByPush
