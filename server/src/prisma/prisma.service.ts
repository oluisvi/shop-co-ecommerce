import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";
import { getEnv } from "../config/env.js";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const env = getEnv();
    super({
      adapter: new PrismaPg({ connectionString: env.DATABASE_URL }),
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
    } catch (error) {
      console.error(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "error",
        context: "PrismaService",
        message: "Database connection failed",
        error: error instanceof Error ? error.name : "UnknownError",
      }));
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
