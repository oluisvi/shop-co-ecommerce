import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { json, raw, urlencoded } from "express";
import helmet from "helmet";
import { AppModule } from "./app.module.js";
import { ApiExceptionFilter } from "./common/filters/api-exception.filter.js";
import { JsonLogger } from "./common/logging/json-logger.js";
import { getEnv } from "./config/env.js";

async function bootstrap() {
  const env = getEnv();
  const logger = new JsonLogger();
  const app = await NestFactory.create(AppModule, {
    logger,
    bodyParser: false,
  });

  app.use(helmet());
  app.use("/webhooks/stripe", raw({ type: "application/json", limit: "1mb" }));
  app.use(json({ limit: "100kb" }));
  app.use(urlencoded({ extended: false, limit: "100kb" }));
  app.enableCors({
    origin: env.FRONTEND_URLS,
    methods: ["GET", "POST", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Stripe-Signature"],
    credentials: false,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new ApiExceptionFilter());
  app.enableShutdownHooks();

  await app.listen(env.PORT, "0.0.0.0");
  logger.log(`Commerce API listening on port ${env.PORT}`, "Bootstrap");
}

void bootstrap();
