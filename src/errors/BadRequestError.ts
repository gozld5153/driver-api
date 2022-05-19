import ErrorBase from './ErrorBase'

export default class BadRequestError extends ErrorBase {
  constructor(message: string = 'seems like you missed something') {
    super(message)

    this.reason = 'bad request'
    this.code = 400

    Object.setPrototypeOf(this, BadRequestError.prototype)
  }
}
