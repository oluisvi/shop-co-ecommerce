import type { LoggerService } from "@nestjs/common";

export class JsonLogger implements LoggerService {
  private write(level: string, message: unknown, context?: string) {
    const payload = {
      timestamp: new Date().toISOString(),
      level,
      context,
      message: typeof message === "string" ? message : String(message),
    };
    const serialized = JSON.stringify(payload);
    if (level === "error") console.error(serialized);
    else if (level === "warn") console.warn(serialized);
    else console.log(serialized);
  }

  log(message: unknown, context?: string) {
    this.write("info", message, context);
  }

  error(message: unknown, trace?: string, context?: string) {
    this.write("error", trace ? `${String(message)} | ${trace}` : message, context);
  }

  warn(message: unknown, context?: string) {
    this.write("warn", message, context);
  }

  debug(message: unknown, context?: string) {
    this.write("debug", message, context);
  }

  verbose(message: unknown, context?: string) {
    this.write("verbose", message, context);
  }
}
