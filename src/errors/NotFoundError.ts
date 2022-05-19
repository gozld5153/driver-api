import ErrorBase from './ErrorBase'

export default class NotFoundError extends ErrorBase {
  constructor(message: string = 'cannot find that') {
    super(message)

    Object.setPrototypeOf(this, NotFoundError.prototype)

    console.log(this.message)
    this.reason = 'not found'
    this.code = 404
  }
}
