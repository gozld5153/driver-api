import { Response } from 'express'
import { TypeORMError } from 'typeorm'
import ErrorDTO from '../dtos/ErrorDTO'
import ErrorBase from './ErrorBase'

const handleErrorAndSendResponse = (error: Error, res: Response) => {
  console.log({ error })
  if (error instanceof TypeORMError)
    return res.status(500).json(new ErrorDTO({ message: 'fail to save changes to db' }))

  if (error instanceof ErrorBase) return res.status(error.code).json(error.dto)

  return res.status(500).json(new ErrorDTO(error))
}

export default handleErrorAndSendResponse
