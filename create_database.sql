-- Table utilisateur
CREATE TABLE utilisateur (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL
);

-- Table type_serveur
CREATE TABLE type_serveur (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL
);

-- Table role
CREATE TABLE role (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(50) NOT NULL,
    description TEXT
);

-- Table serveur
CREATE TABLE serveur (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    type_id INT NOT NULL REFERENCES type_serveur(id),
    createur_id INT NOT NULL REFERENCES utilisateur(id)
);

-- Table serveur_membre
CREATE TABLE serveur_membre (
    id SERIAL PRIMARY KEY,
    utilisateur_id INT NOT NULL REFERENCES utilisateur(id),
    serveur_id INT NOT NULL REFERENCES serveur(id),
    role_id INT NOT NULL REFERENCES role(id),
    UNIQUE(utilisateur_id, serveur_id)
);

-- Table activité
CREATE TABLE activité (
    id SERIAL PRIMARY KEY,
    serveur_id INT NOT NULL REFERENCES serveur(id),
    nom VARCHAR(255) NOT NULL
);

-- Table session
CREATE TABLE session (
    id SERIAL PRIMARY KEY,
    activite_id INT NOT NULL REFERENCES activité(id),
    serveur_id INT NOT NULL REFERENCES serveur(id),
    createur_membre_id INT NOT NULL REFERENCES serveur_membre(id),
    date TIMESTAMP NOT NULL DEFAULT NOW(),
    duree INTERVAL
);

-- Table session_membre (participants à une session)
CREATE TABLE session_membre (
    session_id INT NOT NULL REFERENCES session(id) ON DELETE CASCADE,
    serveur_membre_id INT NOT NULL REFERENCES serveur_membre(id),
    PRIMARY KEY (session_id, serveur_membre_id)
);

-- Table stats_serveur
CREATE TABLE stats_serveur (
    serveur_id INT PRIMARY KEY REFERENCES serveur(id),
    total_sessions INT DEFAULT 0,
    total_membres_actifs INT DEFAULT 0
    -- Ajouter d'autres colonnes d'agrégation si nécessaire
);

-- Table stats_membre
CREATE TABLE stats_membre (
    serveur_id INT NOT NULL REFERENCES serveur(id),
    serveur_membre_id INT NOT NULL REFERENCES serveur_membre(id),
    total_sessions INT DEFAULT 0,
    total_duree INTERVAL DEFAULT '0',
    PRIMARY KEY (serveur_id, serveur_membre_id)
    -- Ajouter d'autres colonnes d'agrégation si nécessaire
);

-- Table enum_definition (catégories d'énumérations par serveur)
CREATE TABLE enum_definition (
    id SERIAL PRIMARY KEY,
    serveur_id INT NOT NULL REFERENCES serveur(id),
    nom VARCHAR(255) NOT NULL,
    description TEXT
);

-- Table enum_valeur (valeurs possibles pour chaque enum_definition)
CREATE TABLE enum_valeur (
    id SERIAL PRIMARY KEY,
    enum_id INT NOT NULL REFERENCES enum_definition(id),
    valeur VARCHAR(255) NOT NULL,
    ordre INT DEFAULT 0
);

-- Table session_enum (valeur choisie par session)
CREATE TABLE session_enum (
    session_id INT NOT NULL REFERENCES session(id) ON DELETE CASCADE,
    enum_valeur_id INT NOT NULL REFERENCES enum_valeur(id),
    PRIMARY KEY (session_id, enum_valeur_id)
);

-- Table session_like (likes d'une session par membre)
CREATE TABLE session_like (
    session_id INT NOT NULL REFERENCES session(id) ON DELETE CASCADE,
    serveur_membre_id INT NOT NULL REFERENCES serveur_membre(id),
    date_like TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (session_id, serveur_membre_id)
);
