import ErrorBase from './ErrorBase'

export default class InternalServerError extends ErrorBase {
  constructor(message: string = 'something went wrong') {
    super(message)

    this.reason = 'unexpected error'
    this.code = 500

    Object.setPrototypeOf(this, InternalServerError.prototype)
  }
}
