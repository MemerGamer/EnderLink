import { createFileRoute } from '@tanstack/react-router'
import { Copy, ExternalLink, Lock, Globe, Server, Users, Clock, Activity, Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter } from '@tanstack/react-router'
import { getSummaryFn, clearSummaryCacheFn, type ServerSummary } from '../functions/summary'

export const Route = createFileRoute('/')({
  loader: async () => {
    await clearSummaryCacheFn()
    return await getSummaryFn()
  },
  component: Dashboard,
})

function Dashboard() {
  const data = Route.useLoaderData()
  const router = useRouter()
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      router.invalidate()
    }, 5000)
    return () => clearInterval(interval)
  }, [router])

  const copyToClipboard = async (text: string, serverId: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text)
      } else {
        const textArea = document.createElement('textarea')
        textArea.value = text
        textArea.style.position = 'fixed'
        textArea.style.opacity = '0'
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
      }
      setCopiedId(serverId)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const joinAddress = (server: ServerSummary) => `${server.host}${server.port !== 25565 ? `:${server.port}` : ''}`

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 w-full">
        <div className="text-center mb-8 sm:mb-12 px-2">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 dark:from-blue-400 dark:via-purple-400 dark:to-blue-400 bg-clip-text text-transparent mb-4 animate-gradient break-words hyphens-auto leading-tight">
            {data.title}
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 font-medium">Real-time Minecraft Server Status</p>
        </div>

        {data.message && (
          <div className={`mb-8 rounded-2xl border-2 backdrop-blur-xl shadow-xl overflow-hidden ${
            data.message.type === 'info' 
              ? 'bg-blue-50/80 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/50'
              : data.message.type === 'warning'
              ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50'
              : data.message.type === 'success'
              ? 'bg-green-50/80 dark:bg-green-950/30 border-green-200 dark:border-green-900/50'
              : 'bg-red-50/80 dark:bg-red-950/30 border-red-200 dark:border-red-900/50'
          }`}>
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 p-2.5 rounded-xl ${
                  data.message.type === 'info'
                    ? 'bg-blue-500 dark:bg-blue-600'
                    : data.message.type === 'warning'
                    ? 'bg-amber-500 dark:bg-amber-600'
                    : data.message.type === 'success'
                    ? 'bg-green-500 dark:bg-green-600'
                    : 'bg-red-500 dark:bg-red-600'
                }`}>
                  {data.message.type === 'info' && <Info className="w-5 h-5 text-white" />}
                  {data.message.type === 'warning' && <AlertTriangle className="w-5 h-5 text-white" />}
                  {data.message.type === 'success' && <CheckCircle className="w-5 h-5 text-white" />}
                  {data.message.type === 'error' && <XCircle className="w-5 h-5 text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  {data.message.title && (
                    <h3 className={`text-lg font-bold mb-2 ${
                      data.message.type === 'info'
                        ? 'text-blue-900 dark:text-blue-100'
                        : data.message.type === 'warning'
                        ? 'text-amber-900 dark:text-amber-100'
                        : data.message.type === 'success'
                        ? 'text-green-900 dark:text-green-100'
                        : 'text-red-900 dark:text-red-100'
                    }`}>
                      {data.message.title}
                    </h3>
                  )}
                  <p className={`text-sm leading-relaxed ${
                    data.message.type === 'info'
                      ? 'text-blue-800 dark:text-blue-200'
                      : data.message.type === 'warning'
                      ? 'text-amber-800 dark:text-amber-200'
                      : data.message.type === 'success'
                      ? 'text-green-800 dark:text-green-200'
                      : 'text-red-800 dark:text-red-200'
                  }`}>
                    {data.message.content}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="group relative overflow-hidden rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 shadow-lg">
                  <Server className="w-6 h-6 text-white" />
                </div>
                <div className={`h-3 w-3 rounded-full ${data.totals.serversOnline > 0 ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              </div>
              <div className="text-4xl font-bold text-slate-900 dark:text-white mb-1">{data.totals.serversOnline}</div>
              <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Servers Online</div>
              <div className="text-xs text-slate-500 dark:text-slate-500 mt-2">of {data.totals.serverCount} total</div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700 shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className={`h-3 w-3 rounded-full ${data.totals.playersOnline > 0 ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`} />
              </div>
              <div className="text-4xl font-bold text-slate-900 dark:text-white mb-1">{data.totals.playersOnline}</div>
              <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Players Online</div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 dark:from-purple-600 dark:to-pink-700 shadow-lg">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <Activity className="w-5 h-5 text-purple-500 animate-pulse" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                {new Date(data.updatedAt).toLocaleTimeString()}
              </div>
              <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Last Updated</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.servers.map((server, index) => (
            <div
              key={server.id}
              className="group relative overflow-hidden rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:border-blue-300 dark:hover:border-blue-600"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className={`absolute top-0 left-0 right-0 h-1 ${server.online ? 'bg-gradient-to-r from-green-500 via-emerald-500 to-green-500' : 'bg-gradient-to-r from-slate-400 via-slate-500 to-slate-400'}`} />
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {server.icon && server.online ? (
                      <div className="relative flex-shrink-0">
                        <img
                          src={server.icon}
                          alt={`${server.displayName} icon`}
                          className="w-14 h-14 rounded-xl ring-2 ring-slate-200 dark:ring-slate-700 shadow-md"
                        />
                        <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white dark:border-slate-800 animate-pulse" />
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-300 to-slate-400 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center flex-shrink-0">
                        <Server className="w-7 h-7 text-slate-500 dark:text-slate-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white truncate mb-1">{server.displayName}</h3>
                      {server.description && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-1">{server.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    {server.private && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        <Lock className="w-3 h-3 mr-1" />
                        Private
                      </span>
                    )}
                    <span
                      className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold ${
                        server.online
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800'
                          : 'bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-600'
                      }`}
                    >
                      <div className={`h-2 w-2 rounded-full mr-2 ${server.online ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`} />
                      {server.online ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Players</div>
                    <div className="text-lg font-bold text-slate-900 dark:text-white">
                      {server.online ? `${server.playersOnline} / ${server.playersMax}` : '—'}
                    </div>
                  </div>
                  {server.version && (
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
                      <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Version</div>
                      <div className="text-lg font-bold text-slate-900 dark:text-white truncate">{server.version}</div>
                    </div>
                  )}
                  {server.online && (
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
                      <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Ping</div>
                      <div className="text-lg font-bold text-slate-900 dark:text-white">{server.latencyMs}ms</div>
                    </div>
                  )}
                </div>

                {server.motd && server.online && (
                  <div className="mb-4 p-3 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border border-blue-100 dark:border-blue-900/30">
                    <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1.5">MOTD</div>
                    <div className="text-sm text-slate-900 dark:text-slate-100 line-clamp-2">{server.motd}</div>
                  </div>
                )}

                {server.online && !server.private && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
                      <code className="flex-1 text-sm text-slate-900 dark:text-slate-100 font-mono truncate">
                        {joinAddress(server)}
                      </code>
                      <button
                        onClick={() => copyToClipboard(joinAddress(server), server.id)}
                        className="p-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-all duration-200 flex-shrink-0"
                        title="Copy to clipboard"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    {copiedId === server.id && (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-2 font-medium animate-in fade-in">✓ Copied!</p>
                    )}
                  </div>
                )}

                {server.online && server.private && (
                  <div className="mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30">
                    <div className="flex items-center text-sm text-amber-800 dark:text-amber-300">
                      <Lock className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="text-xs">This server is private. Contact an administrator for access.</span>
                    </div>
                  </div>
                )}

                {server.tags && server.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {server.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  {server.bluemapUrl && (
                    <a
                      href={server.bluemapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 dark:from-blue-600 dark:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800 text-white rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                    >
                      <Globe className="w-4 h-4 mr-2" />
                      BlueMap
                    </a>
                  )}
                  {server.websiteUrl && (
                    <a
                      href={server.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 dark:from-purple-600 dark:to-purple-700 dark:hover:from-purple-700 dark:hover:to-purple-800 text-white rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Website
                    </a>
                  )}
                </div>

                {server.error && !server.online && (
                  <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30">
                    <div className="text-sm text-red-800 dark:text-red-300 font-medium">
                      <strong>Error:</strong> {server.error}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
