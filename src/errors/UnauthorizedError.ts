import ErrorBase from './ErrorBase'

export default class UnauthorizedError extends ErrorBase {
  constructor(message?: string) {
    super(message)

    this.reason = 'unauthorized'
    this.code = 401

    if (!message) this.message = 'you dont have proper authority'

    Object.setPrototypeOf(this, UnauthorizedError.prototype)
  }
}
