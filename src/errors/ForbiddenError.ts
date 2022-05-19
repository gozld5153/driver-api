import ErrorBase from './ErrorBase'

export default class ForbiddenError extends ErrorBase {
  constructor(message: string = 'you cannot do that') {
    super(message)

    this.reason = 'forbidden'
    this.code = 403

    Object.setPrototypeOf(this, ForbiddenError.prototype)
  }
}
