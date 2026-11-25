import { z } from 'zod'

const personName = z.string().trim().min(2).max(120)
const email = z.string().trim().email().max(190)
const phone = z.string().trim().min(6).max(50)

export const loginSchema = z.object({
  email,
  password: z.string().min(8).max(200)
})

export const quoteSchema = z.object({
  name: personName,
  email,
  phone,
  service: z.string().trim().min(2).max(180),
  budget: z.string().trim().max(120).optional().default(''),
  details: z.string().trim().min(10).max(5000)
})

export const contactSchema = z.object({
  name: personName,
  email,
  phone: z.string().trim().max(50).optional().default(''),
  subject: z.string().trim().min(2).max(180),
  message: z.string().trim().min(10).max(5000)
})

const contentFields = {
  title: z.string().trim().min(2).max(180).optional(),
  slug: z.string().trim().min(2).max(190).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
  description: z.string().trim().min(2).max(10000).optional(),
  excerpt: z.string().trim().max(5000).optional(),
  content: z.string().trim().max(50000).optional(),
  icon: z.string().trim().max(60).optional(),
  price: z.string().trim().max(120).nullable().optional(),
  image_url: z.string().trim().max(500).nullable().optional(),
  technologies: z.string().trim().max(500).nullable().optional(),
  category: z.string().trim().max(100).optional(),
  project_url: z.string().trim().max(500).nullable().optional(),
  featured: z.coerce.boolean().optional(),
  active: z.coerce.boolean().optional(),
  published: z.coerce.boolean().optional(),
  duration: z.string().trim().max(100).optional(),
  audience: z.string().trim().max(180).nullable().optional(),
  client_name: z.string().trim().max(120).optional(),
  role: z.string().trim().max(160).nullable().optional(),
  quote: z.string().trim().max(5000).optional(),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  sort_order: z.coerce.number().int().min(0).optional()
}

const contentSchema = z.object(contentFields)
const title = z.string().trim().min(2).max(180)
const slug = z.string().trim().min(2).max(190).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
const description = z.string().trim().min(2).max(10000)

export const contentSchemas = {
  services: contentSchema.extend({ title, slug, description }),
  projects: contentSchema.extend({ title, slug, description }),
  trainings: contentSchema.extend({
    title,
    description,
    duration: z.string().trim().min(1).max(100)
  }),
  news: contentSchema.extend({
    title,
    slug,
    excerpt: z.string().trim().min(1).max(5000),
    content: z.string().trim().min(1).max(50000)
  }),
  testimonials: contentSchema.extend({
    client_name: z.string().trim().min(2).max(120),
    quote: z.string().trim().min(1).max(5000),
    rating: z.coerce.number().int().min(1).max(5)
  })
}
