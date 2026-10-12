import { createServerFn } from '@tanstack/react-start'
import { loadConfig } from './config'
import { getServerStatus } from './minecraft'
import type { Server } from '../config/schema'
import type { ServerStatus } from './minecraft'

// Everything in here is sent to the browser. Private servers only get the fields
// below the first block; connection details and live probe data are omitted.
export interface ServerSummary {
  id: string
  displayName: string
  description?: string
  version?: string
  tags: string[]
  private: boolean
  online: boolean
  playersOnline: number
  playersMax: number
  // Public servers only
  host?: string
  port?: number
  bluemapUrl?: string
  websiteUrl?: string
  motd?: string
  icon?: string
  latencyMs?: number
  error?: string
}

export interface Link {
  title: string
  url: string
}

export interface Message {
  title?: string
  content: string
  type?: 'info' | 'warning' | 'success' | 'error'
}

export interface SummaryResponse {
  title: string
  updatedAt: string
  pollIntervalMs: number
  totals: {
    serversOnline: number
    serverCount: number
    playersOnline: number
  }
  links: Link[]
  message?: Message
  servers: ServerSummary[]
}

function toSummary(server: Server, status: ServerStatus): ServerSummary {
  const base: ServerSummary = {
    id: server.id,
    displayName: server.displayName,
    description: server.description,
    tags: server.tags || [],
    private: server.private || false,
    online: status.online,
    playersOnline: status.playersOnline,
    playersMax: status.playersMax,
  }

  if (server.private) {
    return { ...base, version: server.version }
  }

  return {
    ...base,
    version: server.version || status.version,
    host: server.host,
    port: server.port,
    bluemapUrl: server.bluemapUrl,
    websiteUrl: server.websiteUrl,
    motd: status.motd,
    icon: status.icon,
    latencyMs: status.latencyMs,
    error: status.error,
  }
}

async function buildSummary(): Promise<SummaryResponse> {
  const config = await loadConfig()

  const servers = await Promise.all(
    config.servers.map(async (server) => toSummary(server, await getServerStatus(server))),
  )
  servers.sort((a, b) => {
    if (a.online !== b.online) {
      return a.online ? -1 : 1
    }
    return a.displayName.localeCompare(b.displayName)
  })

  const serversOnline = servers.filter((s) => s.online).length
  const playersOnline = servers.reduce((sum, s) => sum + s.playersOnline, 0)

  return {
    title: config.title,
    updatedAt: new Date().toISOString(),
    pollIntervalMs: config.pollIntervalMs,
    totals: {
      serversOnline,
      serverCount: servers.length,
      playersOnline,
    },
    links: config.links || [],
    message: config.message,
    servers,
  }
}

let cachedSummary: SummaryResponse | null = null
let cachedUntil: number = 0
let inFlight: Promise<SummaryResponse> | null = null

// Every visitor polls this, so all of them share one probe per poll interval.
export const getSummaryFn = createServerFn({ method: 'GET' }).handler(async () => {
  if (cachedSummary && Date.now() < cachedUntil) {
    return cachedSummary
  }

  if (!inFlight) {
    inFlight = buildSummary()
      .then((summary) => {
        cachedSummary = summary
        cachedUntil = Date.now() + summary.pollIntervalMs
        return summary
      })
      .finally(() => {
        inFlight = null
      })
  }

  return inFlight
})
