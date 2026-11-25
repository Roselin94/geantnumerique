import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import multer from 'multer'
import { mkdirSync } from 'node:fs'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import pool from './db.js'
import { requireAuth } from './middleware/auth.js'
import { validate } from './middleware/validate.js'
import { contactSchema, contentSchemas, loginSchema, quoteSchema } from './schemas.js'

const app = express()
const port = Number(process.env.PORT || 4000)
const dirname = path.dirname(fileURLToPath(import.meta.url))
const uploadDir = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.resolve(dirname, '../uploads')
const clientBuildDir = path.resolve(dirname, '../../client/dist')
mkdirSync(uploadDir, { recursive: true })

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET doit contenir au moins 32 caractères.')
}

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)
app.use(cors({ origin: allowedOrigins }))
app.use(compression())
app.use(express.json({ limit: '1mb' }))
app.use('/uploads', express.static(uploadDir, { maxAge: '7d', immutable: true }))

const publicLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false })
const adminLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false })
const asyncRoute = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next)
const validateContent = (req, res, next) => {
  const schema = contentSchemas[req.params.resource]
  if (!schema) return res.status(404).json({ error: 'Collection introuvable.' })
  return validate(schema)(req, res, next)
}

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))

app.post('/api/admin/login', adminLimiter, validate(loginSchema), asyncRoute(async (req, res) => {
  const [admins] = await pool.execute('SELECT id, name, email, password_hash FROM admins WHERE email = ? LIMIT 1', [req.body.email.toLowerCase()])
  const admin = admins[0]
  if (!admin || !(await bcrypt.compare(req.body.password, admin.password_hash))) {
    return res.status(401).json({ error: 'Adresse e-mail ou mot de passe incorrect.' })
  }
  const token = jwt.sign({ id: admin.id, name: admin.name }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '8h' })
  return res.json({ token, admin: { id: admin.id, name: admin.name, email: admin.email } })
}))

app.get('/api/public/:resource', asyncRoute(async (req, res) => {
  const queries = {
    services: 'SELECT id, title, slug, description, icon, price, featured FROM services WHERE active = 1 ORDER BY sort_order, id',
    trainings: 'SELECT id, title, description, duration, price, audience FROM trainings WHERE active = 1 ORDER BY sort_order, id',
    projects: 'SELECT id, title, slug, description, image_url, technologies, category, project_url, featured FROM projects WHERE active = 1 ORDER BY featured DESC, id DESC',
    news: 'SELECT id, title, slug, excerpt, content, image_url, COALESCE(published_at, created_at) AS published_at FROM news WHERE published = 1 ORDER BY published_at DESC, id DESC',
    testimonials: 'SELECT id, client_name, role, quote, rating FROM testimonials WHERE active = 1 ORDER BY id DESC',
    settings: 'SELECT setting_key, setting_value FROM site_settings'
  }
  const query = queries[req.params.resource]
  if (!query) return res.status(404).json({ error: 'Contenu introuvable.' })
  try {
    const [rows] = await pool.query(query)
    if (req.params.resource === 'settings') return res.json(Object.fromEntries(rows.map((row) => [row.setting_key, row.setting_value])))
    return res.json(rows)
  } catch (error) {
    console.error(`Base de données indisponible pour "${req.params.resource}" :`, error.code || error.message)
    if (req.params.resource === 'settings') {
      return res.json({
        phone: '+242 06 18 20 117 / 06 59 08 694',
        whatsapp: '+242 06 91 18 545',
        facebook: 'GéantNumérique2.0',
        hours: 'Lundi – Samedi : 08h00 – 18h00',
        address: 'Brazzaville, République du Congo'
      })
    }
    return res.json([])
  }
}))

app.post('/api/public/quote', publicLimiter, validate(quoteSchema), asyncRoute(async (req, res) => {
  const { name, email, phone, service, budget, details } = req.body
  const [result] = await pool.execute(
    'INSERT INTO quote_requests (name, email, phone, service, budget, details) VALUES (?, ?, ?, ?, ?, ?)',
    [name, email, phone, service, budget, details]
  )
  return res.status(201).json({ message: 'Votre demande de devis a bien été envoyée.', id: result.insertId })
}))

app.post('/api/public/contact', publicLimiter, validate(contactSchema), asyncRoute(async (req, res) => {
  const { name, email, phone, subject, message } = req.body
  const [result] = await pool.execute(
    'INSERT INTO contact_messages (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)',
    [name, email, phone, subject, message]
  )
  return res.status(201).json({ message: 'Votre message a bien été envoyé.', id: result.insertId })
}))

app.post('/api/public/visit', publicLimiter, asyncRoute(async (req, res) => {
  const schema = (await import('zod')).z.object({ path: (await import('zod')).z.string().trim().min(1).max(500) })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Chemin de page invalide.' })
  await pool.execute('INSERT INTO page_views (path) VALUES (?)', [parsed.data.path])
  return res.status(204).end()
}))

const tables = {
  services: { name: 'services', fields: ['title', 'slug', 'description', 'icon', 'price', 'featured', 'active', 'sort_order'] },
  trainings: { name: 'trainings', fields: ['title', 'description', 'duration', 'price', 'audience', 'active', 'sort_order'] },
  projects: { name: 'projects', fields: ['title', 'slug', 'description', 'image_url', 'technologies', 'category', 'project_url', 'featured', 'active'] },
  news: { name: 'news', fields: ['title', 'slug', 'excerpt', 'content', 'image_url', 'published'] },
  testimonials: { name: 'testimonials', fields: ['client_name', 'role', 'quote', 'rating', 'active'] }
}

app.get('/api/admin/overview', requireAuth, asyncRoute(async (_req, res) => {
  const [[quotes]] = await pool.query('SELECT COUNT(*) AS total, SUM(status = "nouveau") AS pending FROM quote_requests')
  const [[messages]] = await pool.query('SELECT COUNT(*) AS total, SUM(status = "nouveau") AS pending FROM contact_messages')
  const [[views]] = await pool.query('SELECT COUNT(*) AS total FROM page_views WHERE created_at >= CURRENT_DATE')
  const [[content]] = await pool.query('SELECT (SELECT COUNT(*) FROM services) AS services, (SELECT COUNT(*) FROM projects) AS projects')
  return res.json({ quotes, messages, viewsToday: views.total, content })
}))

app.get('/api/admin/collections/:resource', requireAuth, asyncRoute(async (req, res) => {
  if (req.params.resource === 'quotes' || req.params.resource === 'messages') {
    const table = req.params.resource === 'quotes' ? 'quote_requests' : 'contact_messages'
    const [rows] = await pool.query(`SELECT * FROM ${table} ORDER BY created_at DESC LIMIT 200`)
    return res.json(rows)
  }
  if (req.params.resource === 'settings') {
    const [rows] = await pool.query('SELECT setting_key, setting_value FROM site_settings ORDER BY setting_key')
    return res.json(Object.fromEntries(rows.map((row) => [row.setting_key, row.setting_value])))
  }
  const config = tables[req.params.resource]
  if (!config) return res.status(404).json({ error: 'Collection introuvable.' })
  const [rows] = await pool.query(`SELECT * FROM ${config.name} ORDER BY id DESC`)
  return res.json(rows)
}))

app.post('/api/admin/collections/:resource', requireAuth, validateContent, asyncRoute(async (req, res) => {
  const config = tables[req.params.resource]
  if (!config) return res.status(404).json({ error: 'Collection introuvable.' })
  const fields = config.fields.filter((field) => req.body[field] !== undefined)
  if (!fields.length) return res.status(400).json({ error: 'Aucune donnée à enregistrer.' })
  const values = fields.map((field) => req.body[field])
  const [result] = await pool.execute(
    `INSERT INTO ${config.name} (${fields.join(', ')}) VALUES (${fields.map(() => '?').join(', ')})`,
    values
  )
  return res.status(201).json({ id: result.insertId, message: 'Élément créé.' })
}))

app.put('/api/admin/collections/:resource/:id', requireAuth, validateContent, asyncRoute(async (req, res) => {
  const config = tables[req.params.resource]
  if (!config) return res.status(404).json({ error: 'Collection introuvable.' })
  const id = Number(req.params.id)
  if (!Number.isSafeInteger(id) || id < 1) return res.status(400).json({ error: 'Identifiant invalide.' })
  const fields = config.fields.filter((field) => req.body[field] !== undefined)
  if (!fields.length) return res.status(400).json({ error: 'Aucune donnée à enregistrer.' })
  const [result] = await pool.execute(
    `UPDATE ${config.name} SET ${fields.map((field) => `${field} = ?`).join(', ')} WHERE id = ?`,
    [...fields.map((field) => req.body[field]), id]
  )
  if (!result.affectedRows) return res.status(404).json({ error: 'Élément introuvable.' })
  return res.json({ message: 'Élément mis à jour.' })
}))

app.delete('/api/admin/collections/:resource/:id', requireAuth, asyncRoute(async (req, res) => {
  const config = tables[req.params.resource]
  if (!config) return res.status(404).json({ error: 'Collection introuvable.' })
  const id = Number(req.params.id)
  if (!Number.isSafeInteger(id) || id < 1) return res.status(400).json({ error: 'Identifiant invalide.' })
  const [result] = await pool.execute(`DELETE FROM ${config.name} WHERE id = ?`, [id])
  if (!result.affectedRows) return res.status(404).json({ error: 'Élément introuvable.' })
  return res.status(204).end()
}))

app.patch('/api/admin/collections/:resource/:id/status', requireAuth, asyncRoute(async (req, res) => {
  const config = { quotes: ['quote_requests', ['nouveau', 'en_cours', 'traite']], messages: ['contact_messages', ['nouveau', 'lu', 'traite']] }[req.params.resource]
  if (!config) return res.status(404).json({ error: 'Collection introuvable.' })
  const { status } = req.body
  if (!config[1].includes(status)) return res.status(400).json({ error: 'Statut invalide.' })
  const id = Number(req.params.id)
  if (!Number.isSafeInteger(id) || id < 1) return res.status(400).json({ error: 'Identifiant invalide.' })
  const [result] = await pool.execute(`UPDATE ${config[0]} SET status = ? WHERE id = ?`, [status, id])
  if (!result.affectedRows) return res.status(404).json({ error: 'Élément introuvable.' })
  return res.json({ message: 'Statut mis à jour.' })
}))

app.put('/api/admin/settings', requireAuth, asyncRoute(async (req, res) => {
  const schema = (await import('zod')).z.record((await import('zod')).z.string().max(500))
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Paramètres invalides.' })
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    for (const [key, value] of Object.entries(parsed.data)) {
      if (!/^[a-z_]{1,100}$/.test(key)) throw new Error(`Clé de paramètre invalide : ${key}`)
      await connection.execute(
        'INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)',
        [key, value]
      )
    }
    await connection.commit()
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
  return res.json({ message: 'Paramètres enregistrés.' })
}))

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, uploadDir),
  filename: (_req, file, callback) => callback(null, `${randomUUID()}${path.extname(file.originalname).toLowerCase()}`)
})
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => {
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.mimetype)) {
      return callback(new Error('Format d’image non autorisé (JPEG, PNG, WebP ou GIF).'))
    }
    return callback(null, true)
  }
})
app.post('/api/admin/upload', requireAuth, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Aucune image reçue.' })
  return res.status(201).json({ url: `/uploads/${req.file.filename}` })
})

app.use('/api', (_req, res) => res.status(404).json({ error: 'Route API introuvable.' }))
app.use('/uploads', (_req, res) => res.status(404).json({ error: 'Fichier introuvable.' }))

if (process.env.SERVE_CLIENT === 'true') {
  app.use(express.static(clientBuildDir))
  app.get('*', (_req, res, next) => {
    res.sendFile(path.join(clientBuildDir, 'index.html'), (error) => {
      if (error) next(error)
    })
  })
}

app.use((err, _req, res, _next) => {
  console.error(err)
  if (err instanceof multer.MulterError) return res.status(400).json({ error: 'Image invalide ou trop volumineuse (5 Mo maximum).' })
  if (err.message?.startsWith('Format d’image')) return res.status(400).json({ error: err.message })
  return res.status(500).json({ error: 'Une erreur serveur est survenue.' })
})

app.listen(port, () => console.log(`API GÉANT NUMÉRIQUE disponible sur le port ${port}`))
