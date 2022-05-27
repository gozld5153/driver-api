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
    await notifyByPush({ token, data, notification })
    return 'notifyByPush error'
  }
}

export default notifyByPush
