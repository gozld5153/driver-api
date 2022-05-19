export default class ErrorDTO {
  constructor(error?: Partial<ErrorDTO>) {
    if (error?.message) {
      Object.assign(this, error)
      this.message = error.message
    }
  }

  error: boolean = true
  reason: string = 'unexpected error'
  message: string = 'something went wrong'
}
