import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import type { Request, Response } from "express";
import { ApiError } from "../errors/api-error.js";

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const http = host.switchToHttp();
    const response = http.getResponse<Response>();
    const request = http.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = "INTERNAL_ERROR";
    let message = "Unexpected server error";
    let details: unknown;

    if (exception instanceof ApiError) {
      statusCode = exception.statusCode;
      code = exception.code;
      message = exception.message;
      details = exception.details;
    } else if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const payload = exception.getResponse();
      code = statusCode === HttpStatus.BAD_REQUEST ? "VALIDATION_ERROR" : "HTTP_ERROR";
      if (typeof payload === "string") message = payload;
      else if (payload && typeof payload === "object") {
        const value = payload as { message?: string | string[]; error?: string };
        message = Array.isArray(value.message)
          ? value.message.join("; ")
          : value.message ?? value.error ?? exception.message;
        details = value.message;
      }
    }

    if (statusCode >= 500) {
      console.error(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          level: "error",
          event: "unexpected_exception",
          method: request.method,
          path: request.path,
          statusCode,
          error: exception instanceof Error ? exception.name : "UnknownError",
        }),
      );
    }

    response.status(statusCode).json({
      statusCode,
      code,
      message,
      ...(details === undefined ? {} : { details }),
    });
  }
}
