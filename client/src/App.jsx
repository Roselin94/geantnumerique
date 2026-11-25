import { useEffect, useState } from 'react'
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import {
  ArrowDown, ArrowRight, ArrowUpRight, BadgeCheck, Check, ChevronDown, Code2, FileText, GraduationCap,
  Laptop, Menu, MessageCircle, MonitorCog, PanelsTopLeft, ShieldCheck, Sparkles, Wrench, X
} from 'lucide-react'
import { assetUrl, getPublic, request } from './api.js'
import Admin from './Admin.jsx'

const initialServices = [
  { title: 'Création de sites web', slug: 'creation-sites-web', icon: 'PanelsTopLeft', description: 'Des sites vitrines aux applications web sur mesure, donnons vie à vos projets numériques.', featured: true },
  { title: 'Maintenance informatique', slug: 'maintenance-informatique', icon: 'Wrench', description: 'Diagnostic, dépannage et assistance pour un matériel fiable au quotidien.', featured: true },
  { title: 'Installation de logiciels', slug: 'installation-logiciels', icon: 'MonitorCog', description: 'Windows, macOS et Microsoft Office configurés selon les licences applicables.', featured: true },
  { title: 'Formations à domicile', slug: 'formations-informatique', icon: 'GraduationCap', description: 'Apprenez à votre rythme, chez vous, avec un accompagnement personnalisé.', featured: true },
  { title: 'Vidéosurveillance', slug: 'videosurveillance', icon: 'ShieldCheck', description: 'Installation et maintenance de systèmes de caméras adaptés à vos espaces.' },
  { title: 'Conseil informatique', slug: 'conseil-informatique', icon: 'Sparkles', description: 'Des conseils concrets pour faire les bons choix et avancer sereinement.' }
]

const iconMap = { PanelsTopLeft, Wrench, MonitorCog, GraduationCap, ShieldCheck, Sparkles, Laptop, Code2 }

const serviceDetails = {
  'creation-sites-web': {
    intro: 'Une présence en ligne claire et professionnelle, conçue pour présenter votre activité et transformer les visites en prises de contact.',
    includes: ['Site vitrine, site dynamique ou application web sur mesure', 'Conception adaptée aux mobiles, tablettes et ordinateurs', 'Pages et contenus organisés autour de vos objectifs', 'Formulaire de contact ou de demande de devis', 'Mise en ligne et accompagnement à la prise en main'],
    outcome: 'Un outil numérique à votre image, facile à consulter et prêt à évoluer avec votre activité.'
  },
  'maintenance-informatique': {
    intro: 'Nous vous aidons à retrouver un équipement fiable et à limiter les interruptions, avec un diagnostic expliqué avant toute intervention.',
    includes: ['Diagnostic des problèmes matériels ou logiciels', 'Dépannage et remise en état du système', 'Installation des mises à jour et vérifications essentielles', 'Conseils pour protéger et entretenir vos équipements', 'Assistance adaptée au problème rencontré'],
    outcome: 'Un accompagnement clair pour remettre votre matériel en service et mieux prévenir les pannes.'
  },
  'installation-logiciels': {
    intro: 'Installation et configuration de systèmes et d’outils bureautiques pour commencer à travailler dans un environnement adapté à vos usages.',
    includes: ['Installation et configuration de Windows ou macOS', 'Configuration de Word, Excel et PowerPoint', 'Mise à jour des logiciels et vérification du fonctionnement', 'Paramétrage des éléments nécessaires à votre utilisation', 'Conseils de prise en main selon votre niveau'],
    outcome: 'Une configuration prête à l’emploi, réalisée dans le respect des licences applicables.'
  },
  'formations-informatique': {
    intro: 'Des séances pratiques et progressives, adaptées à votre niveau, à vos objectifs et à votre rythme d’apprentissage.',
    includes: ['Initiation à l’informatique et prise en main de l’ordinateur', 'Word, Excel et PowerPoint pour les besoins du quotidien', 'Excel avancé : formules, tableaux et analyse de données', 'Exercices concrets liés à vos usages', 'Formation à domicile selon les modalités convenues'],
    outcome: 'Vous apprenez en pratiquant et repartez avec des méthodes directement utiles.'
  },
  videosurveillance: {
    intro: 'Des solutions de vidéosurveillance étudiées selon vos espaces et vos besoins, avec une installation et une configuration expliquées.',
    includes: ['Échange sur les zones et besoins à couvrir', 'Conseil sur le choix et l’emplacement des équipements', 'Installation et configuration du système', 'Vérification du fonctionnement et explication de l’utilisation', 'Maintenance et assistance selon le besoin'],
    outcome: 'Un système configuré pour vos espaces, avec les points essentiels de son utilisation expliqués.'
  },
  'conseil-informatique': {
    intro: 'Un regard professionnel pour clarifier vos besoins et vous aider à choisir les solutions numériques adaptées à votre situation.',
    includes: ['Analyse de votre besoin et de votre contexte', 'Conseils sur les équipements et logiciels', 'Orientation pour un projet web ou informatique', 'Comparaison des options selon vos priorités', 'Recommandations claires sur les prochaines étapes'],
    outcome: 'Vous avancez avec une vision plus claire des solutions possibles et de leur mise en œuvre.'
  }
}

function useContent(resource, fallback = []) {
  const [data, setData] = useState(fallback)
  useEffect(() => {
    let active = true
    getPublic(resource).then((value) => { if (active) setData(value?.length ? value : fallback) }).catch((error) => console.error(`Chargement ${resource} :`, error))
    return () => { active = false }
  }, [resource])
  return data
}

function Header() {
  const [open, setOpen] = useState(false)
  const links = [['Accueil', '/'], ['Services', '/services'], ['Réalisations', '/realisations'], ['Formations', '/formations'], ['Actualités', '/actualites'], ['À propos', '/a-propos'], ['Contact', '/contact']]
  return <header className="site-header">
    <div className="container nav-wrap">
      <Link to="/" className="brand" aria-label="GÉANT NUMÉRIQUE 2.0, accueil">
        <span className="brand-mark"><span>G</span><i /></span>
        <span className="brand-text"><b>GÉANT NUMÉRIQUE</b><small>2.0 · Votre partenaire digital</small></span>
      </Link>
      <button className="menu-toggle" onClick={() => setOpen(!open)} aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}>{open ? <X /> : <Menu />}</button>
      <nav className={open ? 'main-nav is-open' : 'main-nav'}>
        {links.map(([label, to]) => <NavLink key={to} to={to} end={to === '/'} onClick={() => setOpen(false)}>{label}</NavLink>)}
        <Link className="button button-small" to="/devis" onClick={() => setOpen(false)}>Demander un devis <ArrowUpRight size={16} /></Link>
      </nav>
    </div>
  </header>
}

function Footer({ settings }) {
  return <footer className="footer">
    <div className="container footer-grid">
      <div><Link to="/" className="brand brand-light"><span className="brand-mark"><span>G</span><i /></span><span className="brand-text"><b>GÉANT NUMÉRIQUE</b><small>2.0 · Votre partenaire digital</small></span></Link><p>Le numérique au service de vos projets !</p></div>
      <div><h4>Explorer</h4><Link to="/services">Nos services</Link><Link to="/realisations">Nos réalisations</Link><Link to="/formations">Nos formations</Link><Link to="/actualites">Actualités</Link><Link to="/a-propos">À propos</Link></div>
      <div><h4>Parlons de votre projet</h4><a href="tel:+242061820117">{settings.phone || '+242 06 18 20 117'}</a><a href="https://wa.me/24269118545" target="_blank" rel="noreferrer">WhatsApp · +242 06 91 18 545</a><Link to="/contact">Nous écrire</Link><Link to="/admin" className="admin-link">Espace administrateur</Link></div>
    </div>
    <div className="container footer-bottom"><span>© {new Date().getFullYear()} GÉANT NUMÉRIQUE 2.0. Tous droits réservés.</span><span>Conçu avec soin à Brazzaville.</span></div>
  </footer>
}

function WhatsApp() {
  return <a className="whatsapp-float" href="https://wa.me/24269118545" target="_blank" rel="noreferrer" aria-label="Contacter GÉANT NUMÉRIQUE sur WhatsApp"><MessageCircle size={23} /></a>
}

function SectionTitle({ eyebrow, title, text, centered = false }) {
  return <div className={`section-title ${centered ? 'text-center' : ''}`}><span className="eyebrow">{eyebrow}</span><h2>{title}</h2>{text && <p>{text}</p>}</div>
}

function ServiceCard({ item, index }) {
  const Icon = iconMap[item.icon] || Laptop
  return <article className="service-card">
    <div className="service-icon"><Icon size={22} strokeWidth={1.8} /></div>
    <span className="card-number">0{index + 1}</span>
    <h3>{item.title}</h3><p>{item.description}</p>
    {item.price && <small className="price-label">{item.price}</small>}
    <Link to={`/services#${item.slug}`} className="text-link">Découvrir la prestation <ArrowRight size={16} /></Link>
  </article>
}

function ServiceDetail({ item, index }) {
  const Icon = iconMap[item.icon] || Laptop
  const detail = serviceDetails[item.slug] || {
    intro: item.description,
    includes: ['Échange pour préciser votre besoin', 'Proposition adaptée au périmètre du projet', 'Accompagnement selon la prestation retenue'],
    outcome: 'Une réponse adaptée à votre besoin, définie avec vous avant le démarrage.'
  }
  return <article className="service-detail" id={item.slug}>
    <div className="service-detail-heading">
      <span className="service-detail-number">0{index + 1}</span>
      <div className="service-icon"><Icon size={23} strokeWidth={1.8} /></div>
      <div><span className="eyebrow">PRESTATION 0{index + 1}</span><h2>{item.title}</h2></div>
    </div>
    <p className="service-detail-intro">{detail.intro}</p>
    <div className="service-detail-content">
      <div className="service-includes">
        <h3>Ce que nous pouvons prendre en charge</h3>
        <ul>{detail.includes.map((line) => <li key={line}><Check size={17} />{line}</li>)}</ul>
      </div>
      <aside className="service-outcome">
        <span className="eyebrow">NOTRE APPROCHE</span>
        <p>{detail.outcome}</p>
        <div className="service-price">{item.price || 'Tarif établi selon votre besoin'}</div>
        <Link to={`/devis?service=${encodeURIComponent(item.title)}`} className="button">Demander un devis <ArrowRight size={16} /></Link>
      </aside>
    </div>
  </article>
}

function Home() {
  const services = useContent('services', initialServices)
  const projects = useContent('projects')
  const testimonials = useContent('testimonials')
  return <>
    <section className="hero">
      <div className="hero-glow" />
      <div className="container hero-grid">
        <div className="hero-copy">
          <div className="hero-kicker"><span /> VOTRE PARTENAIRE DIGITAL À BRAZZAVILLE</div>
          <h1>Le numérique<br />qui fait grandir<br /><span>vos projets.</span></h1>
          <p>Sites web, assistance informatique et formations : des solutions pensées autour de vos besoins, avec un accompagnement de proximité.</p>
          <div className="hero-actions"><Link to="/services" className="button">Découvrir nos expertises <ArrowRight size={17} /></Link><Link to="/devis" className="button button-outline">Parler de mon projet</Link></div>
          <div className="hero-proof"><span className="proof-mark"><BadgeCheck size={19} /></span><div><b>Conseil, réalisation, accompagnement</b><small>Un interlocuteur local à Brazzaville</small></div></div>
        </div>
        <div className="hero-visual" aria-label="Aperçu graphique d’un projet digital">
          <div className="visual-orbit orbit-one" /><div className="visual-orbit orbit-two" />
          <div className="visual-dashboard">
            <div className="dashboard-bar"><span className="dashboard-dots"><i /><i /><i /></span><span>APERÇU DE PROJET</span><span className="dashboard-live">● CONCEPT</span></div>
            <div className="dashboard-content">
              <span className="dashboard-eyebrow">GÉANT NUMÉRIQUE 2.0</span>
              <b>Le digital<br />prend forme.</b>
              <span className="dashboard-rule" />
              <div className="dashboard-bottom"><span>WEB · INFORMATIQUE · FORMATION</span><span>GN<span className="dashboard-cyan">.</span></span></div>
            </div>
            <span className="dashboard-orb" />
          </div>
          <div className="float-card float-code"><Code2 size={18} /><span><b>Web & digital</b><small>Des solutions sur mesure</small></span><i>↗</i></div>
          <div className="float-card float-secure"><ShieldCheck size={19} /><span><b>Fiable & sécurisé</b><small>Vos projets en confiance</small></span></div>
          <div className="float-card float-spark"><Sparkles size={18} /></div>
        </div>
        <a href="#intro" className="scroll-cue"><ArrowDown size={16} /> DÉFILER</a>
      </div>
      <div className="hero-bottom-line" />
    </section>

    <section className="intro-section section" id="intro"><div className="container intro-grid">
      <div className="intro-art"><div className="intro-art-grid" /><div className="intro-art-label">LE DIGITAL<br /><b>EN MOUVEMENT</b></div><div className="intro-art-chip"><span>GN</span><i>2.0</i></div><div className="intro-art-circle" /></div>
      <div><span className="eyebrow">QUI SOMMES-NOUS ?</span><h2>La technologie,<br /><span>à votre portée.</span></h2><p className="lead">GÉANT NUMÉRIQUE 2.0 accompagne les particuliers, entrepreneurs et organisations dans leurs projets informatiques.</p><p>De la première idée à la solution concrète, nous privilégions l'écoute, la qualité et un accompagnement humain. Votre réussite numérique est notre priorité.</p><Link to="/a-propos" className="text-link">Découvrir notre approche <ArrowRight size={17} /></Link></div>
    </div></section>

    <section className="section services-section"><div className="container"><div className="section-head"><SectionTitle eyebrow="CE QUE NOUS FAISONS" title={<>Des solutions utiles.<br /><span>Un impact concret.</span></>} text="Un seul partenaire pour vos besoins numériques essentiels." /><Link to="/services" className="text-link desktop-link">Tous nos services <ArrowRight size={17} /></Link></div>
      <div className="service-grid">{services.slice(0, 6).map((service, i) => <ServiceCard item={service} index={i} key={service.id || service.slug} />)}</div><Link to="/services" className="text-link mobile-link">Tous nos services <ArrowRight size={17} /></Link>
    </div></section>

    <section className="why-section section"><div className="container why-grid"><div><span className="eyebrow eyebrow-light">POURQUOI NOUS CHOISIR</span><h2>Un partenaire engagé.<br /><span>Des résultats qui comptent.</span></h2><p>Nous mettons la technologie au service de vos objectifs, avec des solutions adaptées à votre réalité.</p><Link to="/contact" className="button button-white">Parlons de votre projet <ArrowRight size={17} /></Link></div>
      <div className="why-list"><div><span>01</span><div><h3>Proximité & écoute</h3><p>Un interlocuteur disponible qui comprend votre besoin.</p></div><BadgeCheck /></div><div><span>02</span><div><h3>Solutions sur mesure</h3><p>Le bon outil, pensé pour votre activité et vos moyens.</p></div><BadgeCheck /></div><div><span>03</span><div><h3>Accompagnement durable</h3><p>Un suivi humain, avant, pendant et après votre projet.</p></div><BadgeCheck /></div></div>
    </div></section>

    <section className="section portfolio-section"><div className="container"><div className="section-head"><SectionTitle eyebrow="DU CONCRET, PAS DES PROMESSES" title={<>Des projets qui prennent<br /><span>vie en ligne.</span></>} text="Quelques exemples de ce que nous pouvons construire ensemble." /><Link to="/realisations" className="text-link desktop-link">Voir le portfolio <ArrowRight size={17} /></Link></div>
      {projects.length ? <div className="project-grid">{projects.slice(0, 3).map((project) => <ProjectCard key={project.id} project={project} />)}</div> : <div className="portfolio-placeholder"><div className="placeholder-icon"><PanelsTopLeft /></div><div><b>Votre prochain projet pourrait être ici.</b><p>Parlons de votre idée et construisons ensemble une réalisation qui vous ressemble.</p></div><Link to="/devis" className="text-link">Démarrer un projet <ArrowRight size={16} /></Link></div>}
    </div></section>

    {testimonials.length > 0 && <section className="section testimonial-section"><div className="container"><SectionTitle eyebrow="ILS NOUS FONT CONFIANCE" title="Leurs mots, notre meilleure référence." centered /><div className="testimonial-grid">{testimonials.slice(0, 3).map((t) => <blockquote key={t.id}><div className="stars">{'★'.repeat(t.rating || 5)}</div><p>« {t.quote} »</p><footer><b>{t.client_name}</b><span>{t.role}</span></footer></blockquote>)}</div></div></section>}

    <CallToAction />
  </>
}

function ProjectCard({ project }) {
  return <article className="project-card"><div className="project-image">{project.image_url ? <img src={assetUrl(project.image_url)} alt={project.title} loading="lazy" /> : <div className="project-image-empty"><PanelsTopLeft size={35} /></div>}<span>{project.category || 'Projet digital'}</span></div><div className="project-info"><h3>{project.title}</h3><p>{project.description}</p>{project.technologies && <small>{project.technologies}</small>}</div></article>
}

function CallToAction() {
  return <section className="cta-section"><div className="container cta-inner"><div><span className="eyebrow eyebrow-light">PRÊT À PASSER À L’ACTION ?</span><h2>Votre prochain projet<br />commence par une conversation.</h2><p>Partagez-nous votre idée. Nous vous aiderons à lui donner forme.</p></div><Link to="/devis" className="button button-white">Parlons de votre projet <ArrowRight size={17} /></Link></div></section>
}

function PageIntro({ eyebrow, title, text }) {
  return <section className="page-intro"><div className="container"><span className="eyebrow eyebrow-light">{eyebrow}</span><h1>{title}</h1><p>{text}</p><div className="breadcrumb"><Link to="/">Accueil</Link><span>/</span>{eyebrow}</div></div></section>
}

function Services() {
  const services = useContent('services', initialServices)
  return <>
    <PageIntro eyebrow="NOS SERVICES" title={<>Votre partenaire<br /><span>pour chaque étape.</span></>} text="Des solutions informatiques concrètes, du conseil à la réalisation, conçues pour répondre à vos besoins." />
    <section className="section service-index-section">
      <div className="container">
        <SectionTitle eyebrow="NOS EXPERTISES" title="Le numérique, simplement." text="Choisissez votre besoin pour découvrir le contenu de chaque prestation." />
        <nav className="service-index" aria-label="Accès rapide aux prestations">
          {services.map((service, index) => {
            const Icon = iconMap[service.icon] || Laptop
            return <a href={`#${service.slug}`} key={service.id || service.slug}><span>0{index + 1}</span><Icon size={20} /><b>{service.title}</b><ArrowDown size={16} /></a>
          })}
        </nav>
      </div>
    </section>
    <section className="section service-detail-section">
      <div className="container">
        <SectionTitle eyebrow="EN DÉTAIL" title="Des prestations pensées pour vous." text="Nous faisons le point sur votre situation avant de proposer une solution adaptée." />
        <div className="service-detail-list">{services.map((service, index) => <ServiceDetail key={service.id || service.slug} item={service} index={index} />)}</div>
        <div className="license-note"><BadgeCheck /><p><b>Des installations en toute conformité.</b> Les systèmes d’exploitation et logiciels sont installés et activés conformément aux licences applicables.</p></div>
      </div>
    </section>
    <CallToAction />
  </>
}

function Portfolio() {
  const projects = useContent('projects')
  return <><PageIntro eyebrow="NOS RÉALISATIONS" title={<>Des idées devenues<br /><span>des expériences digitales.</span></>} text="Découvrez nos projets et imaginons ensemble la prochaine réussite." /><section className="section"><div className="container">{projects.length ? <div className="project-grid project-grid-page">{projects.map((project) => <ProjectCard key={project.id} project={project} />)}</div> : <div className="empty-state"><PanelsTopLeft size={38} /><h2>Nos réalisations arrivent bientôt.</h2><p>Votre projet pourrait être le prochain à rejoindre notre portfolio.</p><Link to="/devis" className="button">Discuter de mon projet <ArrowRight size={16} /></Link></div>}</div></section><CallToAction /></>
}

function Trainings() {
  const items = useContent('trainings')
  return <><PageIntro eyebrow="NOS FORMATIONS" title={<>Apprenez à votre rythme,<br /><span>à votre domicile.</span></>} text="Des formations pratiques et personnalisées pour gagner en autonomie et en confiance avec le numérique." /><section className="section"><div className="container training-layout"><div><SectionTitle eyebrow="PROGRAMMES" title="Des compétences qui ouvrent des portes." text="Chaque parcours s’adapte à votre niveau, à vos objectifs et à votre disponibilité." /><div className="training-list">{items.map((item) => <article className="training-card" key={item.id}><div className="service-icon"><GraduationCap /></div><div><h3>{item.title}</h3><p>{item.description}</p><div className="training-meta"><span>◷ {item.duration}</span>{item.audience && <span>◎ {item.audience}</span>}{item.price && <b>{item.price}</b>}</div></div><Link to="/devis" aria-label={`S’inscrire à ${item.title}`}><ArrowUpRight /></Link></article>)}</div></div><aside className="training-aside"><span className="eyebrow eyebrow-light">APPRENDRE EN PRATIQUE</span><h3>Une formation qui vous ressemble.</h3><p>Vous choisissez le lieu, le rythme et les sujets prioritaires. Nous nous occupons du reste.</p><ul><li><Check /> Accompagnement individuel</li><li><Check /> Exercices concrets et progressifs</li><li><Check /> Contenu adapté à vos objectifs</li><li><Check /> Formation à domicile</li></ul><Link to="/devis" className="button button-white">Demander les tarifs <ArrowRight size={16} /></Link></aside></div></section><CallToAction /></>
}

function NewsCard({ item }) {
  const publishedDate = item.published_at ? new Date(item.published_at) : null
  const hasValidDate = publishedDate && !Number.isNaN(publishedDate.getTime())

  return <article className="news-card">
    {item.image_url && <img className="news-card-image" src={assetUrl(item.image_url)} alt={item.title} loading="lazy" />}
    <div className="news-card-content">
      {hasValidDate && <time dateTime={publishedDate.toISOString()}>{publishedDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</time>}
      <h2>{item.title}</h2>
      <p className="news-card-excerpt">{item.excerpt}</p>
      {item.content && <details><summary>Lire l’article</summary><p>{item.content}</p></details>}
    </div>
  </article>
}

function News() {
  const items = useContent('news')
  return <>
    <PageIntro eyebrow="ACTUALITÉS" title={<>Les nouvelles<br /><span>de GÉANT NUMÉRIQUE.</span></>} text="Retrouvez les informations et nouveautés de GÉANT NUMÉRIQUE 2.0." />
    <section className="section">
      <div className="container">
        {items.length
          ? <div className="news-grid">{items.map((item) => <NewsCard key={item.id} item={item} />)}</div>
          : <div className="empty-state"><FileText size={38} /><h2>Aucune actualité publiée pour le moment.</h2><p>Revenez bientôt pour découvrir nos nouveautés.</p></div>}
      </div>
    </section>
    <CallToAction />
  </>
}

function About() {
  return <><PageIntro eyebrow="À PROPOS" title={<>Le numérique au service<br /><span>de vos ambitions.</span></>} text="Un partenaire de confiance pour accompagner la réussite de vos projets numériques à Brazzaville." /><section className="section"><div className="container about-grid"><div><span className="eyebrow">GÉANT NUMÉRIQUE 2.0</span><h2>Des idées claires.<br />Des solutions concrètes.</h2><p className="lead">Notre mission : rendre l’informatique accessible et utile pour tous.</p><p>Nous accompagnons particuliers, entrepreneurs et organisations avec une approche pragmatique : comprendre vos besoins, recommander les bonnes solutions et rester à vos côtés pour qu’elles vous servent vraiment.</p><p>Site web, dépannage, formation ou conseil : chaque projet mérite la même attention et le même engagement.</p><Link to="/contact" className="text-link">Échangeons sur vos besoins <ArrowRight size={16} /></Link></div><div className="values-card"><h3>Nos engagements</h3>{[['01','Écoute','Comprendre avant de proposer.'],['02','Fiabilité','Livrer un travail soigné et durable.'],['03','Proximité','Rester disponible et accessible.'],['04','Transparence','Conseiller avec honnêteté et clarté.']].map(([n,title,desc])=><div key={n}><span>{n}</span><p><b>{title}</b><small>{desc}</small></p><Check size={17} /></div>)}</div></div></section><CallToAction /></>
}

function ContactForm({ kind = 'contact' }) {
  const isQuote = kind === 'quote'
  const location = useLocation()
  const requestedService = new URLSearchParams(location.search).get('service')
  const defaultService = initialServices.some((service) => service.title === requestedService) ? requestedService : ''
  const [state, setState] = useState({ busy: false, error: '', success: '' })
  async function submit(event) {
    event.preventDefault()
    setState({ busy: true, error: '', success: '' })
    const form = Object.fromEntries(new FormData(event.currentTarget).entries())
    try {
      const result = await request(`/public/${isQuote ? 'quote' : 'contact'}`, { method: 'POST', body: JSON.stringify(form) })
      setState({ busy: false, error: '', success: result.message })
      event.currentTarget.reset()
    } catch (error) {
      setState({ busy: false, error: error.message, success: '' })
    }
  }
  return <form className="contact-form" onSubmit={submit}>
    {state.error && <div className="form-alert error" role="alert">{state.error}</div>}{state.success && <div className="form-alert success" role="status">{state.success}</div>}
    <div className="form-row"><label>Votre nom<input name="name" required minLength="2" maxLength="120" autoComplete="name" placeholder="Nom et prénom" /></label><label>Adresse e-mail<input name="email" type="email" required maxLength="190" autoComplete="email" placeholder="vous@exemple.com" /></label></div>
    <div className="form-row"><label>Téléphone<input name="phone" type="tel" required={isQuote} maxLength="50" autoComplete="tel" placeholder="+242 ..." /></label>{isQuote ? <label>Prestation souhaitée<select name="service" required defaultValue={defaultService}><option value="" disabled>Choisir une prestation</option>{initialServices.map((s)=><option key={s.slug} value={s.title}>{s.title}</option>)}<option>Autre besoin</option></select></label> : <label>Sujet<input name="subject" required minLength="2" maxLength="180" placeholder="Comment pouvons-nous vous aider ?" /></label>}</div>
    {isQuote && <label>Votre budget estimatif<input name="budget" maxLength="120" placeholder="Ex. : à définir, 100 000 FCFA..." /></label>}
    <label>{isQuote ? 'Décrivez votre besoin' : 'Votre message'}<textarea name={isQuote ? 'details' : 'message'} required minLength="10" maxLength="5000" rows="5" placeholder="Quelques mots sur votre projet..." /></label>
    <button className="button" disabled={state.busy}>{state.busy ? 'Envoi en cours…' : isQuote ? 'Envoyer ma demande' : 'Envoyer le message'} <ArrowRight size={17} /></button>
    <small>Vos informations restent confidentielles et servent uniquement à répondre à votre demande.</small>
  </form>
}

function Contact({ settings }) {
  return <><PageIntro eyebrow="CONTACT" title={<>Parlons de votre<br /><span>prochain projet.</span></>} text="Une question, une idée ou besoin d’un accompagnement ? Nous sommes à votre écoute." /><section className="section"><div className="container contact-layout"><div className="contact-details"><span className="eyebrow">RESTONS EN CONTACT</span><h2>Un échange suffit<br />pour commencer.</h2><p>Contactez-nous par téléphone, WhatsApp ou laissez-nous un message. Nous vous répondrons dès que possible.</p><a className="contact-item" href="tel:+242061820117"><span>01</span><div><small>TÉLÉPHONE</small><b>{settings.phone || '+242 06 18 20 117 / 06 59 08 694'}</b></div><ArrowUpRight /></a><a className="contact-item" href="https://wa.me/24269118545" target="_blank" rel="noreferrer"><span>02</span><div><small>WHATSAPP</small><b>{settings.whatsapp || '+242 06 91 18 545'}</b></div><ArrowUpRight /></a><a className="contact-item" href={`https://www.facebook.com/${encodeURIComponent(settings.facebook || 'GéantNumérique2.0')}`} target="_blank" rel="noreferrer"><span>03</span><div><small>FACEBOOK</small><b>{settings.facebook || 'GéantNumérique2.0'}</b></div><ArrowUpRight /></a><div className="hours-card"><span>HORAIRES</span><p>{settings.hours || 'Lundi – Samedi : 08h00 – 18h00'}</p><small>{settings.address || 'Brazzaville, République du Congo'}</small></div></div><div className="form-panel"><span className="eyebrow">ÉCRIVEZ-NOUS</span><h3>Votre message</h3><ContactForm /></div></div>{settings.map_url && <div className="container map-wrap"><iframe title="Localisation GÉANT NUMÉRIQUE 2.0" src={settings.map_url} loading="lazy" referrerPolicy="no-referrer-when-downgrade" /></div>}</section></>
}

function Quote() {
  return <><PageIntro eyebrow="DEVIS" title={<>Votre idée mérite<br /><span>un devis sur mesure.</span></>} text="Décrivez-nous votre besoin. Nous reviendrons vers vous pour échanger sur les prochaines étapes." /><section className="section"><div className="container quote-layout"><div><span className="eyebrow">VOTRE PROJET, À VOTRE RYTHME</span><h2>Quelques détails pour<br />mieux vous accompagner.</h2><p className="lead">Chaque demande est unique. Vos réponses nous aident à comprendre votre contexte et à vous proposer la solution la plus adaptée.</p><div className="quote-points"><span><Check /> Réponse personnalisée</span><span><Check /> Sans engagement</span><span><Check /> Données confidentielles</span></div><div className="quote-contact"><MessageCircle /><div><b>Un échange direct ?</b><a href="https://wa.me/24269118545" target="_blank" rel="noreferrer">Écrivez-nous sur WhatsApp <ArrowUpRight size={15} /></a></div></div></div><div className="form-panel"><span className="eyebrow">DEMANDE DE DEVIS</span><h3>Parlez-nous de votre projet</h3><ContactForm kind="quote" /></div></div></section></>
}

export default function App() {
  const [settings, setSettings] = useState({})
  const location = useLocation()
  useEffect(() => { getPublic('settings').then(setSettings).catch((error) => console.error('Chargement paramètres :', error)) }, [])
  useEffect(() => {
    if (location.pathname.startsWith('/admin')) return
    request('/public/visit', { method: 'POST', body: JSON.stringify({ path: location.pathname }) }).catch(() => {})
  }, [location.pathname])
  return location.pathname.startsWith('/admin') ? <Admin /> : <><Header /><main><Routes><Route path="/" element={<Home />} /><Route path="/services" element={<Services />} /><Route path="/realisations" element={<Portfolio />} /><Route path="/formations" element={<Trainings />} /><Route path="/actualites" element={<News />} /><Route path="/a-propos" element={<About />} /><Route path="/contact" element={<Contact settings={settings} />} /><Route path="/devis" element={<Quote />} /><Route path="*" element={<Home />} /></Routes></main><Footer settings={settings} /><WhatsApp /></>
}
