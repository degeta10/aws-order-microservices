const HTTP_OK = 200;
const HTTP_CREATED = 201;
const HTTP_NO_CONTENT = 204;
const HTTP_BAD_REQUEST = 400;
const HTTP_UNAUTHORIZED = 401;
const HTTP_FORBIDDEN = 403;
const HTTP_NOT_FOUND = 404;
const HTTP_UNPROCESSABLE_ENTITY = 422;

export class ApiResponse {
  static success(
    data: any = null,
    message: string = "Success",
    code: number = HTTP_OK,
  ) {
    return {
      statusCode: code,
      body: JSON.stringify({
        success: true,
        message: message,
        data: data,
      }),
    };
  }

  static error(
    message: string = "Error",
    code: number = HTTP_BAD_REQUEST,
    errors: any = null,
  ) {
    const response = {
      success: false,
      message: message,
      errors: errors,
    };

    return {
      statusCode: code,
      body: JSON.stringify(response),
    };
  }

  static created(
    data: any = null,
    message: string = "Resource created successfully",
  ) {
    return this.success(data, message, HTTP_CREATED);
  }

  static noContent() {
    return {
      statusCode: HTTP_NO_CONTENT,
      body: "",
    };
  }

  static badRequest(message: string = "Bad request") {
    return this.error(message, HTTP_BAD_REQUEST);
  }

  static notFound(message: string = "Resource not found") {
    return this.error(message, HTTP_NOT_FOUND);
  }

  static unauthorized(message: string = "Unauthorized") {
    return this.error(message, HTTP_UNAUTHORIZED);
  }

  static forbidden(message: string = "Forbidden") {
    return this.error(message, HTTP_FORBIDDEN);
  }

  static validationError(errors: any, message: string = "Validation failed") {
    return this.error(message, HTTP_UNPROCESSABLE_ENTITY, errors);
  }

  static internalError(message: string = "Internal server error") {
    return this.error(message, 500);
  }
}
