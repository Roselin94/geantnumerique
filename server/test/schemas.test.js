import assert from 'node:assert/strict'
import test from 'node:test'
import { contentSchemas } from '../src/schemas.js'

test('admin content schemas validate each collection form payload', () => {
  const payloads = {
    services: { title: 'Création web', slug: 'creation-web', description: 'Une description valide.' },
    projects: { title: 'Projet web', slug: 'projet-web', description: 'Une description valide.' },
    trainings: { title: 'Bureautique', description: 'Une description valide.', duration: 'Sur mesure' },
    news: { title: 'Nouvelle', slug: 'nouvelle', excerpt: 'Un résumé.', content: 'Un contenu.' },
    testimonials: { client_name: 'Marie Dupont', quote: 'Une excellente expérience.', rating: 5 }
  }

  for (const [resource, payload] of Object.entries(payloads)) {
    assert.equal(contentSchemas[resource].safeParse(payload).success, true, `${resource} payload should be valid`)
  }
})

test('admin content schemas reject missing collection-specific required fields', () => {
  assert.equal(contentSchemas.trainings.safeParse({
    title: 'Bureautique',
    description: 'Une description valide.'
  }).success, false)

  assert.equal(contentSchemas.testimonials.safeParse({
    client_name: 'Marie Dupont',
    quote: 'Une excellente expérience.'
  }).success, false)
})
