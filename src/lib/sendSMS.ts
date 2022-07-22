import axios from 'axios'

export default async function sendSMS(to: string, message: string) {
  const remainResponse = await axios.post<{
    result_code: number
    message: string
    SMS_CNT: number
    LMS_CNT: number
    MMS_CNT: number
  }>(
    'https://apis.aligo.in/remain/',
    {
      key: process.env.ALIGO_KEY,
      user_id: process.env.ALIGO_ID,
    },
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  )

  if (remainResponse.data.SMS_CNT <= 500) {
    await axios.post<{
      result_code: string
      message: 'success' | string
      msg_id: string
      success_cnt: number
      error_cnt: number
      msg_type: string
    }>(
      'https://apis.aligo.in/send/',
      {
        key: process.env.ALIGO_KEY,
        user_id: process.env.ALIGO_ID,
        sender: process.env.SENDER,
        receiver: '01041233333,01062217046,01044797708',
        msg: `[구출이] 알리고문자 잔여 ${remainResponse.data.SMS_CNT}개 남았습니다. 충전바랍니다.`,
      },
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    )
  }

  const response = await axios.post<{
    result_code: string
    message: 'success' | string
    msg_id: string
    success_cnt: number
    error_cnt: number
    msg_type: string
  }>(
    'https://apis.aligo.in/send/',
    {
      key: process.env.ALIGO_KEY,
      user_id: process.env.ALIGO_ID,
      sender: process.env.SENDER,
      receiver: to,
      msg: message,
    },
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  )

  return response.data.message === 'success'
}
