CREATE DATABASE IF NOT EXISTS geant_numerique CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE geant_numerique;
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS admins (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS services (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(180) NOT NULL,
  slug VARCHAR(190) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon VARCHAR(60) NOT NULL DEFAULT 'Monitor',
  price VARCHAR(120) NULL,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS trainings (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(180) NOT NULL,
  description TEXT NOT NULL,
  duration VARCHAR(100) NOT NULL,
  price VARCHAR(120) NULL,
  audience VARCHAR(180) NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS projects (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(180) NOT NULL,
  slug VARCHAR(190) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  image_url VARCHAR(500) NULL,
  technologies VARCHAR(500) NULL,
  category VARCHAR(100) NOT NULL DEFAULT 'Site web',
  project_url VARCHAR(500) NULL,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS news (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(180) NOT NULL,
  slug VARCHAR(190) NOT NULL UNIQUE,
  excerpt TEXT NOT NULL,
  content MEDIUMTEXT NOT NULL,
  image_url VARCHAR(500) NULL,
  published BOOLEAN NOT NULL DEFAULT FALSE,
  published_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS testimonials (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  client_name VARCHAR(120) NOT NULL,
  role VARCHAR(160) NULL,
  quote TEXT NOT NULL,
  rating TINYINT UNSIGNED NOT NULL DEFAULT 5,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS site_settings (
  setting_key VARCHAR(100) PRIMARY KEY,
  setting_value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS quote_requests (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  service VARCHAR(180) NOT NULL,
  budget VARCHAR(120) NULL,
  details TEXT NOT NULL,
  status ENUM('nouveau','en_cours','traite') NOT NULL DEFAULT 'nouveau',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_quote_status_created (status, created_at)
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL,
  phone VARCHAR(50) NULL,
  subject VARCHAR(180) NOT NULL,
  message TEXT NOT NULL,
  status ENUM('nouveau','lu','traite') NOT NULL DEFAULT 'nouveau',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_message_status_created (status, created_at)
);

CREATE TABLE IF NOT EXISTS page_views (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  path VARCHAR(500) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_page_views_date (created_at)
);

INSERT IGNORE INTO services (title, slug, description, icon, featured, sort_order) VALUES
('Création de sites web', 'creation-sites-web', 'Sites vitrines, plateformes dynamiques et applications web sur mesure, conçus pour votre activité.', 'PanelsTopLeft', TRUE, 1),
('Maintenance informatique', 'maintenance-informatique', 'Diagnostic, dépannage, maintenance préventive et assistance pour votre matériel informatique.', 'Wrench', TRUE, 2),
('Installation de logiciels', 'installation-logiciels', 'Installation et configuration de Windows, macOS et Microsoft Office selon les licences applicables.', 'MonitorCog', TRUE, 3),
('Formations à domicile', 'formations-informatique', 'Formations pratiques en informatique et bureautique adaptées à votre niveau et à votre rythme.', 'GraduationCap', TRUE, 4),
('Vidéosurveillance', 'videosurveillance', 'Installation et maintenance de systèmes de caméras pour sécuriser vos espaces.', 'ShieldCheck', FALSE, 5),
('Conseil informatique', 'conseil-informatique', 'Conseils personnalisés et accompagnement dans vos choix et projets numériques.', 'Lightbulb', FALSE, 6);

INSERT IGNORE INTO trainings (title, description, duration, price, audience, sort_order) VALUES
('Initiation à l’informatique', 'Prise en main de l’ordinateur, gestion des fichiers, navigation internet et bonnes pratiques.', 'Sur mesure', NULL, 'Débutants', 1),
('Bureautique : Word, Excel et PowerPoint', 'Créez des documents, tableaux et présentations avec méthode et efficacité.', 'Sur mesure', NULL, 'Débutants et intermédiaires', 2),
('Excel avancé', 'Formules, tableaux croisés dynamiques, analyse et automatisation de vos tâches.', 'Sur mesure', NULL, 'Utilisateurs intermédiaires', 3);

INSERT IGNORE INTO site_settings (setting_key, setting_value) VALUES
('phone', '+242 06 18 20 117 / 06 59 08 694'),
('whatsapp', '+242 06 91 18 545'),
('facebook', 'GéantNumérique2.0'),
('email', ''),
('address', 'Brazzaville, République du Congo'),
('hours', 'Lundi – Samedi : 08h00 – 18h00'),
('map_url', ''),
('tagline', 'Votre partenaire digital.');
