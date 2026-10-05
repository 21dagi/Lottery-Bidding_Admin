import { z } from 'zod'

declare global {
  interface Window {
    __ENV__?: Record<string, string | undefined>
  }
}

const envSchema = z.object({
  VITE_API_BASE_URL: z.string().min(1),
  VITE_WS_URL: z.string().min(1),
  VITE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  VITE_USE_MOCKS: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),
})

export type AppEnv = z.infer<typeof envSchema>

function runtimeValue(key: string): string | undefined {
  return window.__ENV__?.[key] ?? import.meta.env[key]
}

function readEnv(): AppEnv {
  const parsed = envSchema.safeParse({
    VITE_API_BASE_URL: runtimeValue('VITE_API_BASE_URL'),
    VITE_WS_URL: runtimeValue('VITE_WS_URL'),
    VITE_ENV: runtimeValue('VITE_ENV') ?? 'development',
    VITE_USE_MOCKS: runtimeValue('VITE_USE_MOCKS') ?? 'false',
  })

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ')
    console.error(`Invalid environment configuration: ${details}`)
  }

  return (
    parsed.data ?? {
      VITE_API_BASE_URL: String(runtimeValue('VITE_API_BASE_URL') ?? ''),
      VITE_WS_URL: String(runtimeValue('VITE_WS_URL') ?? ''),
      VITE_ENV: 'development',
      VITE_USE_MOCKS: false,
    }
  )
}

export const env = readEnv()
