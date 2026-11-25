import 'dotenv/config'
import bcrypt from 'bcryptjs'
import readline from 'node:readline/promises'
import { stdin, stdout } from 'node:process'
import pool from '../db.js'

const rl = readline.createInterface({ input: stdin, output: stdout })
try {
  const name = (await rl.question('Nom de l’administrateur : ')).trim()
  const email = (await rl.question('Adresse e-mail : ')).trim().toLowerCase()
  const password = await rl.question('Mot de passe (12 caractères minimum) : ')
  if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 12) {
    throw new Error('Nom, adresse e-mail ou mot de passe invalide.')
  }
  const hash = await bcrypt.hash(password, 12)
  await pool.execute('INSERT INTO admins (name, email, password_hash) VALUES (?, ?, ?)', [name, email, hash])
  console.log('Compte administrateur créé.')
} catch (error) {
  console.error(`Création du compte impossible : ${error.message}`)
  process.exitCode = 1
} finally {
  rl.close()
  await pool.end()
}
