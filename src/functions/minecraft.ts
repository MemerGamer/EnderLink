import { createServerFn } from '@tanstack/react-start'
import type { Server } from '../config/schema'

export interface ServerStatus {
  online: boolean
  playersOnline: number
  playersMax: number
  version: string
  motd: string
  latencyMs: number
  icon?: string
  error?: string
}

const TIMEOUT_MS = 2000

export const getServerStatusFn = createServerFn({ method: 'GET' })
  .inputValidator((data: { server: Server }) => data)
  .handler(async ({ data }) => {
    const { server } = data
    const startTime = Date.now()

    try {
      const { statusJava } = await import('node-mcstatus')
      
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), TIMEOUT_MS)
      })
      
      const response = await Promise.race([
        statusJava(server.host, server.port),
        timeoutPromise,
      ])

      const latencyMs = Date.now() - startTime

      if (!response.online) {
        return {
          online: false,
          playersOnline: 0,
          playersMax: 0,
          version: '',
          motd: '',
          latencyMs,
        } as ServerStatus
      }

      const cleanMotd = (response.motd?.raw || response.motd?.clean || '')
        .replace(/§[0-9a-fk-or]/gi, '')
        .replace(/\s+/g, ' ')
        .trim()

      return {
        online: true,
        playersOnline: response.players?.online ?? 0,
        playersMax: response.players?.max ?? 0,
        version: response.version?.name_clean ?? '',
        motd: cleanMotd,
        latencyMs,
        icon: response.icon ?? undefined,
      } as ServerStatus
    } catch (error) {
      const latencyMs = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      return {
        online: false,
        playersOnline: 0,
        playersMax: 0,
        version: '',
        motd: '',
        latencyMs,
        error: errorMessage,
      } as ServerStatus
    }
  })
