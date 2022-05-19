import ErrorDTO from '../dtos/ErrorDTO'

export default class ErrorBase extends Error {
  constructor(message?: string) {
    super(message)

    if (message) this.message = message

    Object.setPrototypeOf(this, ErrorBase.prototype)
  }

  error: boolean = true
  code: number = 500
  reason: string = 'unexpected error'

  get dto() {
    return new ErrorDTO(this)
  }
}
