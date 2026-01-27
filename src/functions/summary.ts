import { createServerFn } from '@tanstack/react-start'
import { loadConfigFn } from './config'
import { getServerStatusFn, type ServerStatus } from './minecraft'

export interface ServerSummary extends Omit<ServerStatus, 'version'> {
  id: string
  displayName: string
  description?: string
  host: string
  version?: string
  port: number
  bluemapUrl?: string
  websiteUrl?: string
  tags: string[]
  private: boolean
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
  totals: {
    serversOnline: number
    serverCount: number
    playersOnline: number
  }
  links: Link[]
  message?: Message
  servers: ServerSummary[]
}

let cachedSummary: SummaryResponse | null = null
let cachedUntil: number = 0

export const getSummaryFn = createServerFn({ method: 'GET' }).handler(async () => {
  const now = Date.now()

  if (cachedSummary && now < cachedUntil) {
    return cachedSummary
  }

  const config = await loadConfigFn()
  const pollIntervalMs = config.pollIntervalMs

  const serverPromises = config.servers.map(async (server) => {
    const status = await getServerStatusFn({ data: { server } })
    return {
      ...status,
      id: server.id,
      displayName: server.displayName,
      description: server.description,
      host: server.host,
      port: server.port,
      version: server.version || status.version,
      bluemapUrl: server.bluemapUrl,
      websiteUrl: server.websiteUrl,
      tags: server.tags || [],
      private: server.private || false,
    } as ServerSummary
  })

  const servers = await Promise.all(serverPromises)
  servers.sort((a, b) => {
    if (a.online !== b.online) {
      return a.online ? -1 : 1
    }
    return a.displayName.localeCompare(b.displayName)
  })

  const serversOnline = servers.filter((s) => s.online).length
  const playersOnline = servers.reduce((sum, s) => sum + s.playersOnline, 0)

  const summary: SummaryResponse = {
    title: config.title,
    updatedAt: new Date().toISOString(),
    totals: {
      serversOnline,
      serverCount: servers.length,
      playersOnline,
    },
    links: config.links || [],
    message: config.message,
    servers,
  }

  cachedSummary = summary
  cachedUntil = now + pollIntervalMs

  return summary
})

export const clearSummaryCacheFn = createServerFn({ method: 'POST' }).handler(async () => {
  cachedSummary = null
  cachedUntil = 0
  return { success: true }
})
