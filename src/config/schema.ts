import { z } from 'zod'

const urlSchema = z.string().url()

const serverSchema = z.object({
  id: z.string().min(1),
  displayName: z.string().min(1),
  description: z.string().optional(),
  host: z.string().min(1),
  port: z.number().int().positive().max(65535).optional().default(25565),
  version: z.string().optional(),
  bluemapUrl: urlSchema.optional(),
  websiteUrl: urlSchema.optional(),
  tags: z.array(z.string()).optional().default([]),
  private: z.boolean().optional().default(false),
})

const linkSchema = z.object({
  title: z.string().min(1),
  url: urlSchema,
})

const messageSchema = z.object({
  title: z.string().optional(),
  content: z.string().min(1),
  type: z.enum(['info', 'warning', 'success', 'error']).optional().default('info'),
})

export const configSchema = z.object({
  title: z.string().min(1),
  pollIntervalMs: z.number().int().min(1000).max(60000).default(5000),
  links: z.array(linkSchema).optional().default([]),
  message: messageSchema.optional(),
  servers: z.array(serverSchema).min(1),
})

export type Config = z.infer<typeof configSchema>
export type Server = z.infer<typeof serverSchema>
