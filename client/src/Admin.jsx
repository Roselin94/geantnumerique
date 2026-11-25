import { useEffect, useMemo, useState } from 'react'
import {
  ArrowUpRight, BadgeCheck, BookOpen, BriefcaseBusiness, ChevronRight,
  FileText, LayoutDashboard, LogOut, Mail, MessageSquare, Pencil, Plus, RefreshCw, Save,
  Search, Settings, ShieldCheck, Trash2, Users, X
} from 'lucide-react'
import { assetUrl, request } from './api.js'

const navigation = [
  { id: 'overview', label: 'Vue d’ensemble', icon: LayoutDashboard },
  { id: 'services', label: 'Services', icon: BadgeCheck },
  { id: 'projects', label: 'Réalisations', icon: BriefcaseBusiness },
  { id: 'trainings', label: 'Formations', icon: BookOpen },
  { id: 'news', label: 'Actualités', icon: FileText },
  { id: 'testimonials', label: 'Témoignages', icon: Users },
  { id: 'quotes', label: 'Demandes de devis', icon: MessageSquare },
  { id: 'messages', label: 'Messages reçus', icon: Mail },
  { id: 'settings', label: 'Paramètres', icon: Settings }
]

const collections = {
  services: {
    title: 'Services',
    singular: 'service',
    description: 'Gérez les prestations présentées sur le site.',
    fields: [
      { name: 'title', label: 'Nom du service', required: true },
      { name: 'slug', label: 'Identifiant URL', hint: 'Facultatif : généré depuis le nom et normalisé sans accents.' },
      { name: 'description', label: 'Description', type: 'textarea', required: true },
      { name: 'icon', label: 'Icône', placeholder: 'Ex. PanelsTopLeft' },
      { name: 'price', label: 'Tarif indicatif', nullable: true, placeholder: 'Ex. Sur devis' },
      { name: 'sort_order', label: 'Ordre d’affichage', type: 'number', initial: 0 },
      { name: 'featured', label: 'Mettre en avant', type: 'checkbox' },
      { name: 'active', label: 'Visible sur le site', type: 'checkbox', initial: true }
    ]
  },
  projects: {
    title: 'Réalisations',
    singular: 'réalisation',
    description: 'Présentez les sites et projets réalisés.',
    fields: [
      { name: 'title', label: 'Titre du projet', required: true },
      { name: 'slug', label: 'Identifiant URL', hint: 'Facultatif : généré depuis le titre et normalisé sans accents.' },
      { name: 'description', label: 'Description', type: 'textarea', required: true },
      { name: 'image_url', label: 'Adresse de l’image', nullable: true, placeholder: '/uploads/image.webp' },
      { name: 'technologies', label: 'Technologies', nullable: true, placeholder: 'React, Node.js…' },
      { name: 'category', label: 'Catégorie', initial: 'Site web' },
      { name: 'project_url', label: 'Lien du projet', nullable: true, placeholder: 'https://…' },
      { name: 'featured', label: 'Mettre en avant', type: 'checkbox' },
      { name: 'active', label: 'Visible sur le site', type: 'checkbox', initial: true }
    ],
    image: true
  },
  trainings: {
    title: 'Formations',
    singular: 'formation',
    description: 'Mettez à jour les programmes, durées et tarifs.',
    fields: [
      { name: 'title', label: 'Nom de la formation', required: true },
      { name: 'description', label: 'Description', type: 'textarea', required: true },
      { name: 'duration', label: 'Durée', required: true, initial: 'Sur mesure' },
      { name: 'price', label: 'Tarif', nullable: true, placeholder: 'Sur devis' },
      { name: 'audience', label: 'Public concerné', nullable: true },
      { name: 'sort_order', label: 'Ordre d’affichage', type: 'number', initial: 0 },
      { name: 'active', label: 'Visible sur le site', type: 'checkbox', initial: true }
    ]
  },
  news: {
    title: 'Actualités',
    singular: 'actualité',
    description: 'Rédigez et publiez les actualités de l’entreprise.',
    fields: [
      { name: 'title', label: 'Titre', required: true },
      { name: 'slug', label: 'Identifiant URL', hint: 'Facultatif : généré depuis le titre et normalisé sans accents.' },
      { name: 'excerpt', label: 'Résumé', type: 'textarea', required: true },
      { name: 'content', label: 'Contenu', type: 'textarea', required: true },
      { name: 'image_url', label: 'Adresse de l’image', nullable: true, placeholder: '/uploads/image.webp' },
      { name: 'published', label: 'Publier sur le site', type: 'checkbox' }
    ],
    image: true
  },
  testimonials: {
    title: 'Témoignages',
    singular: 'témoignage',
    description: 'Gérez les retours clients affichés sur le site.',
    fields: [
      { name: 'client_name', label: 'Nom du client', required: true },
      { name: 'role', label: 'Fonction / organisation', nullable: true },
      { name: 'quote', label: 'Témoignage', type: 'textarea', required: true },
      { name: 'rating', label: 'Note sur 5', type: 'number', initial: 5, required: true },
      { name: 'active', label: 'Visible sur le site', type: 'checkbox', initial: true }
    ]
  }
}

const settingsFields = [
  { name: 'phone', label: 'Téléphone', placeholder: '+242 …' },
  { name: 'whatsapp', label: 'WhatsApp', placeholder: '+242 …' },
  { name: 'email', label: 'Adresse e-mail', placeholder: 'contact@…' },
  { name: 'facebook', label: 'Page Facebook' },
  { name: 'address', label: 'Adresse / localisation' },
  { name: 'hours', label: 'Horaires', placeholder: 'Lundi – Samedi : 08h00 – 18h00' },
  { name: 'map_url', label: 'URL d’intégration Google Maps', type: 'textarea' },
  { name: 'tagline', label: 'Signature du site' }
]

const statusLabels = {
  nouveau: 'Nouveau',
  en_cours: 'En cours',
  traite: 'Traité',
  lu: 'Lu'
}

function slugify(value) {
  return String(value || '')
    .replace(/[œŒ]/g, (character) => character === 'Œ' ? 'OE' : 'oe')
    .replace(/[æÆ]/g, (character) => character === 'Æ' ? 'AE' : 'ae')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function AdminNotice({ notice, onClose }) {
  if (!notice) return null
  return <div className={`admin-notice ${notice.type}`} role={notice.type === 'error' ? 'alert' : 'status'}>
    <span>{notice.message}</span>
    <button type="button" onClick={onClose} aria-label="Fermer la notification"><X size={17} /></button>
  </div>
}

function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      await onLogin(email, password)
    } catch (loginError) {
      setError(loginError.message)
    } finally {
      setBusy(false)
    }
  }

  return <main className="admin-login">
    <form onSubmit={submit}>
      <div className="admin-login-brand"><span className="brand-mark"><span>G</span><i /></span><span className="brand-text"><b>GÉANT NUMÉRIQUE</b><small>ESPACE ADMINISTRATEUR</small></span></div>
      <span className="eyebrow">ESPACE SÉCURISÉ</span>
      <h1>Bon retour.</h1>
      <p>Connectez-vous pour gérer le contenu et les demandes du site.</p>
      {error && <div className="admin-inline-error" role="alert">{error}</div>}
      <label>Adresse e-mail<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="username" required /></label>
      <label>Mot de passe<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required /></label>
      <button className="button" type="submit" disabled={busy}>{busy ? 'Connexion…' : 'Se connecter'} <ArrowUpRight size={17} /></button>
      <small className="admin-login-safe"><ShieldCheck size={15} /> Connexion protégée</small>
    </form>
  </main>
}

function Dashboard({ overview, onNavigate, onRefresh, loading }) {
  const cards = [
    { label: 'Demandes de devis', value: overview?.quotes?.total, pending: overview?.quotes?.pending, icon: MessageSquare, target: 'quotes' },
    { label: 'Messages reçus', value: overview?.messages?.total, pending: overview?.messages?.pending, icon: Mail, target: 'messages' },
    { label: 'Visites aujourd’hui', value: overview?.viewsToday, icon: ArrowUpRight },
    { label: 'Réalisations', value: overview?.content?.projects, icon: BriefcaseBusiness, target: 'projects' }
  ]
  return <div className="admin-dashboard">
    <div className="admin-page-heading">
      <div><span className="eyebrow">VOTRE ACTIVITÉ</span><h1>Vue d’ensemble</h1><p>Un aperçu rapide du site et des demandes entrantes.</p></div>
      <button className="admin-icon-button" type="button" onClick={onRefresh} disabled={loading} aria-label="Actualiser les statistiques"><RefreshCw size={17} className={loading ? 'spinning' : ''} /> Actualiser</button>
    </div>
    <div className="admin-metric-grid">
      {cards.map(({ label, value, pending, icon: Icon, target }) =>
        <button className="admin-metric" type="button" key={label} onClick={() => target && onNavigate(target)} disabled={!target}>
          <span className="admin-metric-icon"><Icon size={19} /></span>
          <span className="admin-metric-value">{value ?? '—'}</span>
          <span className="admin-metric-label">{label}</span>
          {pending > 0 && <span className="admin-metric-pending">{pending} à traiter</span>}
          {target && <ChevronRight className="admin-metric-arrow" size={18} />}
        </button>
      )}
    </div>
    <div className="admin-dashboard-bottom">
      <section className="admin-panel">
        <div className="admin-panel-heading"><div><span className="eyebrow">RACCOURCIS</span><h2>Gestion rapide</h2></div></div>
        <div className="admin-shortcuts">
          {[
            ['services', 'Gérer les services', BadgeCheck],
            ['projects', 'Ajouter une réalisation', BriefcaseBusiness],
            ['quotes', 'Consulter les demandes', MessageSquare],
            ['settings', 'Modifier les coordonnées', Settings]
          ].map(([target, label, Icon]) => <button key={target} type="button" onClick={() => onNavigate(target)}><Icon size={18} /><span>{label}</span><ArrowUpRight size={15} /></button>)}
        </div>
      </section>
      <section className="admin-panel admin-welcome">
        <div className="admin-welcome-icon"><ShieldCheck size={22} /></div>
        <span className="eyebrow">GÉANT NUMÉRIQUE 2.0</span>
        <h2>Votre espace de pilotage.</h2>
        <p>Gérez le contenu du site et suivez les demandes de vos clients depuis un seul endroit.</p>
      </section>
    </div>
  </div>
}

function CollectionManager({ resource, onNotice }) {
  const config = collections[resource]
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [reload, setReload] = useState(0)

  useEffect(() => {
    let active = true
    setLoading(true)
    request(`/admin/collections/${resource}`)
      .then((rows) => { if (active) { setItems(rows); setError('') } })
      .catch((loadError) => { if (active) setError(loadError.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [resource, reload])

  const filteredItems = useMemo(() => items.filter((item) => JSON.stringify(item).toLowerCase().includes(query.toLowerCase())), [items, query])
  const titleField = config.fields.find((field) => ['title', 'client_name'].includes(field.name))?.name

  function startCreate() {
    setEditing(null)
    setImageFile(null)
    setFormOpen(true)
  }

  function startEdit(item) {
    setEditing(item)
    setImageFile(null)
    setFormOpen(true)
  }

  async function save(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    const formData = new FormData(event.currentTarget)
    const payload = Object.fromEntries(config.fields.map((field) => {
      if (field.type === 'checkbox') return [field.name, formData.get(field.name) === 'on']
      if (field.type === 'number') return [field.name, Number(formData.get(field.name) || 0)]
      const value = String(formData.get(field.name) ?? '').trim()
      return [field.name, field.nullable && value === '' ? null : value]
    }))

    const displayTitle = payload.title || payload.client_name || 'Élément'
    payload.title = displayTitle
    if ('slug' in payload) payload.slug = slugify(payload.slug || displayTitle) || slugify(displayTitle)

    try {
      if (imageFile) {
        const upload = new FormData()
        upload.append('image', imageFile)
        const result = await request('/admin/upload', { method: 'POST', body: upload })
        payload.image_url = result.url
      }
      const path = editing ? `/admin/collections/${resource}/${editing.id}` : `/admin/collections/${resource}`
      await request(path, { method: editing ? 'PUT' : 'POST', body: JSON.stringify(payload) })
      setFormOpen(false)
      setEditing(null)
      setImageFile(null)
      setReload((value) => value + 1)
      onNotice({ type: 'success', message: `${config.singular} ${editing ? 'mis à jour' : 'ajouté'} avec succès.` })
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setSaving(false)
    }
  }

  async function remove(item) {
    const label = item.title || item.client_name || config.singular
    if (!window.confirm(`Supprimer « ${label} » ? Cette action est définitive.`)) return
    try {
      await request(`/admin/collections/${resource}/${item.id}`, { method: 'DELETE' })
      setReload((value) => value + 1)
      onNotice({ type: 'success', message: `${config.singular} supprimé.` })
    } catch (deleteError) {
      setError(deleteError.message)
    }
  }

  return <div className="admin-manager">
    <div className="admin-page-heading">
      <div><span className="eyebrow">CONTENU DU SITE</span><h1>{config.title}</h1><p>{config.description}</p></div>
      <button className="button" type="button" onClick={startCreate}><Plus size={17} /> Ajouter {config.singular}</button>
    </div>
    {error && <div className="admin-inline-error" role="alert">{error}</div>}
    {formOpen && <div className="admin-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setFormOpen(false) }}>
      <section className="admin-editor" role="dialog" aria-modal="true" aria-labelledby="admin-editor-title">
        <div className="admin-editor-heading"><div><span className="eyebrow">{editing ? 'MODIFICATION' : 'NOUVEAU CONTENU'}</span><h2 id="admin-editor-title">{editing ? 'Modifier' : 'Ajouter'} {config.singular}</h2></div><button className="admin-icon-button" type="button" aria-label="Fermer" onClick={() => setFormOpen(false)}><X size={18} /></button></div>
        <form className="admin-editor-form" acceptCharset="UTF-8" onSubmit={save}>
          <div className="admin-field-grid">
            {config.fields.map((field) => <label className={`admin-field ${field.type === 'textarea' ? 'wide' : ''} ${field.type === 'checkbox' ? 'check-field' : ''}`} key={field.name}>
              {field.type === 'checkbox'
                ? <><input type="checkbox" name={field.name} defaultChecked={editing ? Boolean(editing[field.name]) : Boolean(field.initial)} /><span>{field.label}</span></>
                : <>{field.label}{field.type === 'textarea'
                  ? <textarea name={field.name} required={field.required} defaultValue={editing?.[field.name] ?? field.initial ?? ''} placeholder={field.placeholder} rows={field.name === 'content' || field.name === 'description' ? 5 : 3} />
                  : <input name={field.name} type={field.type || 'text'} required={field.required} min={field.type === 'number' ? 0 : undefined} max={field.name === 'rating' ? 5 : undefined} defaultValue={editing?.[field.name] ?? field.initial ?? ''} placeholder={field.name === 'slug' ? 'Généré automatiquement depuis le titre' : field.placeholder} /> }
                  {field.hint && <small>{field.hint}</small>}</>}
            </label>)}
          </div>
          {config.image && <label className="admin-field admin-image-upload">Image de couverture
            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => setImageFile(event.target.files?.[0] || null)} />
            <small>JPEG, PNG, WebP ou GIF · 5 Mo maximum. L’image actuelle est conservée si aucun nouveau fichier n’est choisi.</small>
          </label>}
          {error && <div className="admin-inline-error" role="alert">{error}</div>}
          <div className="admin-editor-actions"><button className="admin-icon-button" type="button" onClick={() => setFormOpen(false)}>Annuler</button><button className="button" type="submit" disabled={saving}><Save size={16} /> {saving ? 'Enregistrement…' : 'Enregistrer'}</button></div>
        </form>
      </section>
    </div>}
    <div className="admin-list-toolbar">
      <div><b>{items.length}</b> {items.length === 1 ? config.singular : `${config.title.toLowerCase()}`}<span> · visibles dans l’administration</span></div>
      <label className="admin-search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Rechercher ${config.title.toLowerCase()}…`} aria-label={`Rechercher dans ${config.title}`} /></label>
    </div>
    {loading ? <div className="admin-empty">Chargement…</div> : filteredItems.length === 0 ? <div className="admin-empty"><Search size={24} /><b>{query ? 'Aucun résultat.' : `Aucun contenu ${config.title.toLowerCase()} pour le moment.`}</b><span>{query ? 'Essayez un autre terme.' : `Ajoutez votre premier ${config.singular} pour le publier sur le site.`}</span></div> :
      <div className="admin-table-wrap"><table className="admin-table">
        <thead><tr><th>Contenu</th><th>État</th><th>Dernière mise à jour</th><th><span className="sr-only">Actions</span></th></tr></thead>
        <tbody>{filteredItems.map((item) => {
          const label = item[titleField] || item.title || item.client_name || 'Sans titre'
          const published = item.active ?? item.published
          return <tr key={item.id}>
            <td><div className="admin-table-title">{item.image_url && <img src={assetUrl(item.image_url)} alt="" /> }<span><b>{label}</b><small>{item.description || item.quote || item.excerpt || item.slug || item.category || ''}</small></span></div></td>
            <td><span className={`admin-state ${published ? 'visible' : 'hidden'}`}><i />{published ? 'Publié' : 'Masqué'}</span></td>
            <td>{item.updated_at ? new Date(item.updated_at).toLocaleDateString('fr-FR') : item.created_at ? new Date(item.created_at).toLocaleDateString('fr-FR') : '—'}</td>
            <td><div className="admin-row-actions"><button type="button" onClick={() => startEdit(item)} aria-label={`Modifier ${label}`}><Pencil size={16} /></button><button type="button" className="delete" onClick={() => remove(item)} aria-label={`Supprimer ${label}`}><Trash2 size={16} /></button></div></td>
          </tr>
        })}</tbody>
      </table></div>}
  </div>
}

function InboxManager({ resource, onNotice }) {
  const quotes = resource === 'quotes'
  const title = quotes ? 'Demandes de devis' : 'Messages reçus'
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reload, setReload] = useState(0)

  useEffect(() => {
    let active = true
    setLoading(true)
    request(`/admin/collections/${resource}`)
      .then((rows) => { if (active) { setItems(rows); setError('') } })
      .catch((loadError) => { if (active) setError(loadError.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [resource, reload])

  async function changeStatus(item, status) {
    try {
      await request(`/admin/collections/${resource}/${item.id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) })
      setReload((value) => value + 1)
      onNotice({ type: 'success', message: 'Statut mis à jour.' })
    } catch (statusError) {
      setError(statusError.message)
    }
  }

  return <div className="admin-manager">
    <div className="admin-page-heading"><div><span className="eyebrow">RELATION CLIENT</span><h1>{title}</h1><p>Consultez les demandes et mettez à jour leur état de traitement.</p></div><span className="admin-count-pill">{items.length} au total</span></div>
    {error && <div className="admin-inline-error" role="alert">{error}</div>}
    {loading ? <div className="admin-empty">Chargement…</div> : items.length === 0 ? <div className="admin-empty"><MessageSquare size={25} /><b>Aucune {quotes ? 'demande de devis' : 'message'} pour le moment.</b><span>Les nouvelles demandes apparaîtront ici.</span></div> :
      <div className="admin-inbox-list">{items.map((item) => <article className="admin-inbox-item" key={item.id}>
        <div className="admin-inbox-top"><div><span className="eyebrow">{quotes ? item.service : item.subject}</span><h2>{item.name}</h2></div><time>{new Date(item.created_at).toLocaleString('fr-FR')}</time></div>
        <div className="admin-inbox-contact"><a href={`mailto:${item.email}`}>{item.email}</a>{item.phone && <a href={`tel:${item.phone}`}>{item.phone}</a>}{quotes && item.budget && <span>Budget : {item.budget}</span>}</div>
        <p className="admin-inbox-body">{quotes ? item.details : item.message}</p>
        <div className="admin-inbox-bottom"><a className="admin-reply-link" href={`mailto:${item.email}?subject=${encodeURIComponent(quotes ? 'Votre demande de devis' : `Re: ${item.subject}`)}`}>Répondre par e-mail <ArrowUpRight size={15} /></a>
          <label className="admin-status-select">Statut<select value={item.status} onChange={(event) => changeStatus(item, event.target.value)} aria-label={`Statut de la demande de ${item.name}`}>
            {(quotes ? ['nouveau', 'en_cours', 'traite'] : ['nouveau', 'lu', 'traite']).map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}
          </select></label>
        </div>
      </article>)}</div>}
  </div>
}

function SettingsManager({ onNotice }) {
  const [settings, setSettings] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    request('/admin/collections/settings')
      .then((values) => { if (active) { setSettings(values); setError('') } })
      .catch((loadError) => { if (active) setError(loadError.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  async function save(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      await request('/admin/settings', { method: 'PUT', body: JSON.stringify(settings) })
      onNotice({ type: 'success', message: 'Paramètres enregistrés.' })
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setSaving(false)
    }
  }

  return <div className="admin-manager">
    <div className="admin-page-heading"><div><span className="eyebrow">INFORMATIONS DU SITE</span><h1>Paramètres</h1><p>Coordonnées, horaires et informations affichés sur le site.</p></div></div>
    {error && <div className="admin-inline-error" role="alert">{error}</div>}
    <form className="admin-settings-form" onSubmit={save}>
      <div className="admin-panel-heading"><div><span className="eyebrow">COORDONNÉES PUBLIQUES</span><h2>Informations générales</h2></div></div>
      <div className="admin-field-grid">
        {settingsFields.map((field) => <label className={`admin-field ${field.type === 'textarea' ? 'wide' : ''}`} key={field.name}>{field.label}
          {field.type === 'textarea'
            ? <textarea name={field.name} value={settings[field.name] || ''} onChange={(event) => setSettings((current) => ({ ...current, [field.name]: event.target.value }))} placeholder={field.placeholder} rows={3} disabled={loading} />
            : <input name={field.name} value={settings[field.name] || ''} onChange={(event) => setSettings((current) => ({ ...current, [field.name]: event.target.value }))} placeholder={field.placeholder} disabled={loading} />}
        </label>)}
      </div>
      <div className="admin-editor-actions"><span>Ces informations sont visibles par les visiteurs.</span><button className="button" type="submit" disabled={loading || saving}><Save size={16} /> {saving ? 'Enregistrement…' : 'Enregistrer les paramètres'}</button></div>
    </form>
  </div>
}

export default function Admin() {
  const [token, setToken] = useState(() => localStorage.getItem('gn-token'))
  const [active, setActive] = useState('overview')
  const [overview, setOverview] = useState(null)
  const [loadingOverview, setLoadingOverview] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState(null)
  const [refresh, setRefresh] = useState(0)

  useEffect(() => {
    if (!token) return
    let activeRequest = true
    setLoadingOverview(true)
    request('/admin/overview')
      .then((data) => { if (activeRequest) { setOverview(data); setError('') } })
      .catch((loadError) => { if (activeRequest) setError(loadError.message) })
      .finally(() => { if (activeRequest) setLoadingOverview(false) })
    return () => { activeRequest = false }
  }, [token, refresh])

  async function login(email, password) {
    const result = await request('/admin/login', { method: 'POST', body: JSON.stringify({ email, password }) })
    localStorage.setItem('gn-token', result.token)
    setToken(result.token)
  }

  function logout() {
    localStorage.removeItem('gn-token')
    setToken(null)
    setOverview(null)
    setError('')
    setActive('overview')
  }

  if (!token) return <Login onLogin={login} />

  const current = navigation.find((item) => item.id === active) || navigation[0]
  const CurrentIcon = current.icon

  return <main className="admin-shell admin-layout">
    <aside className="admin-sidebar">
      <a className="admin-brand" href="/" aria-label="Retour au site">
        <span className="brand-mark"><span>G</span><i /></span>
        <span><b>GÉANT NUMÉRIQUE</b><small>ADMINISTRATION</small></span>
      </a>
      <div className="admin-nav-label">ESPACE DE GESTION</div>
      <nav className="admin-nav" aria-label="Navigation administrateur">
        {navigation.map(({ id, label, icon: Icon }) => <button key={id} type="button" className={active === id ? 'active' : ''} onClick={() => { setActive(id); setError('') }}>
          <Icon size={17} /><span>{label}</span>{id === 'quotes' && overview?.quotes?.pending > 0 && <i>{overview.quotes.pending}</i>}
        </button>)}
      </nav>
      <div className="admin-sidebar-bottom"><a href="/" target="_blank" rel="noreferrer"><ArrowUpRight size={16} /> Voir le site</a><button type="button" onClick={logout}><LogOut size={16} /> Se déconnecter</button></div>
    </aside>
    <section className="admin-workspace">
      <header className="admin-topbar"><div><span className="admin-topbar-icon"><CurrentIcon size={17} /></span><b>{current.label}</b></div><span className="admin-secure-pill"><ShieldCheck size={15} /> Session sécurisée</span></header>
      <div className="admin-main">
        <AdminNotice notice={notice} onClose={() => setNotice(null)} />
        {error && <div className="admin-inline-error admin-global-error" role="alert">{error}<button type="button" onClick={() => setRefresh((value) => value + 1)}>Réessayer</button></div>}
        {active === 'overview' && <Dashboard overview={overview} onNavigate={setActive} loading={loadingOverview} onRefresh={() => setRefresh((value) => value + 1)} />}
        {collections[active] && <CollectionManager key={active} resource={active} onNotice={setNotice} />}
        {(active === 'quotes' || active === 'messages') && <InboxManager key={active} resource={active} onNotice={setNotice} />}
        {active === 'settings' && <SettingsManager onNotice={setNotice} />}
      </div>
      <footer className="admin-workspace-footer"><span>GÉANT NUMÉRIQUE 2.0 · Espace administrateur</span><span><ShieldCheck size={14} /> Connexion protégée</span></footer>
    </section>
  </main>
}
