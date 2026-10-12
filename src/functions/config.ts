import { createServerOnlyFn } from '@tanstack/react-start'
import { configSchema, type Config } from '../config/schema'

let cachedConfig: Config | null = null
let cachedMtime: number = 0
let cachedPath: string | null = null

// Server-only: the raw config contains private server hosts and must never be sent to the client.
export const loadConfig = createServerOnlyFn(async (): Promise<Config> => {
  const { createRequire } = await import('node:module')
  const require = createRequire(import.meta.url)
  const fs = require('node:fs')
  const path = require('node:path')
  const yaml = require('js-yaml')

  const CONFIG_FILE = process.env.ENDERLINK_CONFIG_FILE || 'config.yaml'
  const CONFIG_DIR = process.env.ENDERLINK_CONFIG_DIR || 
    (process.env.NODE_ENV === 'production' ? '/config' : path.join(process.cwd(), 'config'))
  const configPath = path.join(CONFIG_DIR, CONFIG_FILE)

  const stats = fs.statSync(configPath, { throwIfNoEntry: false })

  if (!stats) {
    throw new Error(
      `Config file not found: ${configPath}. Ensure the config directory is mounted.`
    )
  }

  const currentMtime = stats.mtimeMs

  if (cachedConfig === null || cachedPath !== configPath || cachedMtime !== currentMtime) {
    try {
      const fileContents = fs.readFileSync(configPath, 'utf-8')
      const rawConfig = yaml.load(fileContents)
      const result = configSchema.safeParse(rawConfig)

      if (!result.success) {
        const errors = result.error.issues
          .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
          .join('\n')
        throw new Error(`Config validation failed:\n${errors}`)
      }

      cachedConfig = result.data
      cachedMtime = currentMtime
      cachedPath = configPath
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to load config: ${error.message}`)
      }
      throw error
    }
  }

  return cachedConfig!
})
