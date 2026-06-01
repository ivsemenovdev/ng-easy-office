import 'dotenv/config';

function envInt(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw === '') {
    return fallback;
  }
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? n : fallback;
}

export const config = {
  port: envInt('PORT', 3000),
  databaseUrl:
    process.env.DATABASE_URL ?? 'postgresql://localhost:5432/donetsk_test',
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:4200',
};
