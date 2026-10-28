export class ApiError extends Error {
    constructor(status, message, fieldErrors = null, options) {
        super(message, options)
        this.name = 'ApiError'
        this.status = status
        this.fieldErrors = fieldErrors
    }
}
