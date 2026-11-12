/*
 * Site content. Everything a visitor reads lives here, so updating the
 * portfolio never means touching the window manager. Text that changes with
 * the language is written as { en: "...", fr: "..." }.
 */
window.SITE = {
  owner: "Talel Ksiksi",
  studio: "CICTNA RDC",
  tagline: { en: "Industrial software, integrations and web apps that ship.", fr: "Logiciel industriel, intégrations et applications web qui aboutissent." },
  email: "contact@cictnardc.net",
  // Contact form delivery via Web3Forms (https://web3forms.com). The access
  // key only lets visitors send mail TO our inbox, so it is safe to publish.
  // Leave it "" and the form opens the visitor's own mail app instead.
  web3formsKey: "6ec4d65c-5286-4a3a-9db2-1b870d8a7333",
  github: "https://github.com/talelksiksi",
  website: "https://cictnardc.net/",
  // CV files, relative to the site root. Leave a value "" to hide that language.
  cv: {
    en: "assets/cv/Talel-Ksiksi-CV-EN.pdf",
    fr: "assets/cv/Talel-Ksiksi-CV-FR.pdf",
  },
};

window.PROJECTS = [
  {
    id: "integration-toolkit",
    name: "Integration Toolkit",
    file: "IntegrationToolkit.exe",
    icon: "flow",
    category: { en: "Web app · Integration", fr: "Application web · Intégration" },
    year: "2026",
    summary: {
      en: "A visual API integration builder for designing data flows between warehouse systems: drag systems onto a canvas, wire them together, and export the workflow as code.",
      fr: "Un constructeur visuel d'intégrations API pour concevoir les flux de données entre systèmes d'entrepôt : déposez les systèmes sur un canevas, reliez-les, puis exportez le flux sous forme de code.",
    },
    problem: {
      en: "Integration projects stall in meetings because nobody can see how data moves between the WMS, the PLCs and the ERP. Whiteboard sketches never match what gets built.",
      fr: "Les projets d'intégration s'enlisent en réunion parce que personne ne voit comment circulent les données entre le WMS, les automates et l'ERP. Les croquis au tableau ne correspondent jamais à ce qui est livré.",
    },
    solution: {
      en: "A canvas where stakeholders lay out the systems themselves, configure each connection's data type, direction and update rate, watch animated packets flow, then hand developers generated JavaScript, cURL or Python.",
      fr: "Un canevas où les parties prenantes disposent elles-mêmes les systèmes, configurent le type de données, le sens et la fréquence de chaque liaison, regardent les paquets circuler, puis remettent aux développeurs du JavaScript, du cURL ou du Python généré.",
    },
    highlights: {
      en: [
        "6 system node types: WMS, PLC, API, Database, Kafka, REST",
        "Per-connection data type, direction and update frequency",
        "Animated data packets simulate live flow along each link",
        "One-click export to JavaScript, cURL or Python",
        "Keyboard shortcuts and a mobile-responsive canvas",
      ],
      fr: [
        "6 types de nœuds : WMS, automate, API, base de données, Kafka, REST",
        "Type de données, sens et fréquence réglables par liaison",
        "Paquets animés simulant le flux en direct sur chaque liaison",
        "Export en un clic vers JavaScript, cURL ou Python",
        "Raccourcis clavier et canevas adapté au mobile",
      ],
    },
    stack: ["React 18", "SVG", "CSS3", "Vercel"],
    live: "https://integration-toolkit-dner.vercel.app",
    shot: "assets/shots/integration-toolkit.jpg",
  },
  {
    id: "tray-store-controller",
    name: "Tray Store Controller",
    file: "TrayStore.sim",
    icon: "tray",
    category: { en: "Industrial automation · Simulation", fr: "Automatisme industriel · Simulation" },
    year: "2026",
    summary: {
      en: "A browser simulation of the controller software that runs an automated tray store: retrieval planning, PLC telegrams with checksums, and fault-safe recovery.",
      fr: "Une simulation dans le navigateur du logiciel de conduite d'un magasin automatisé à plateaux : planification des sorties, télégrammes automate avec somme de contrôle et reprise sûre après défaut.",
    },
    problem: {
      en: "Automated storage controllers are hard to demo and harder to test: every move is physical, and a dropped PLC link mid-sequence can make a naive controller execute the same move twice.",
      fr: "Les contrôleurs de stockage automatisé sont difficiles à montrer et encore plus à tester : chaque mouvement est physique, et une coupure de liaison automate en pleine séquence peut faire exécuter deux fois le même mouvement à un contrôleur naïf.",
    },
    solution: {
      en: "A faithful model of the machine (channels of 12 trays on plain rollers, two powered transfer devices) plus a controller that plans the moves, sends one telegram at a time and waits for each ACK. After a link fault it asks the PLC for the status of the last move instead of resending it.",
      fr: "Un modèle fidèle de la machine (canaux de 12 plateaux sur rouleaux libres, deux transferts motorisés) et un contrôleur qui planifie les mouvements, envoie un télégramme à la fois et attend chaque ACK. Après une coupure, il demande à l'automate l'état du dernier mouvement au lieu de le renvoyer.",
    },
    highlights: {
      en: [
        "Finds the tray, picks the nearer channel end, cycles blocking trays through the nearest channel",
        "Telegram protocol with XOR checksums, one move in flight at a time",
        "Fault button drops the PLC link mid-sequence to prove recovery",
        "No move is ever executed twice",
        "Zero-dependency HTML, CSS and JavaScript",
      ],
      fr: [
        "Trouve le plateau, choisit l'extrémité de canal la plus proche, fait tourner les plateaux gênants par le canal voisin",
        "Protocole de télégrammes avec somme de contrôle XOR, un mouvement à la fois",
        "Un bouton de défaut coupe la liaison automate en pleine séquence pour prouver la reprise",
        "Aucun mouvement n'est jamais exécuté deux fois",
        "HTML, CSS et JavaScript sans aucune dépendance",
      ],
    },
    stack: ["JavaScript", "HTML5", "CSS", { en: "PLC protocol design", fr: "Conception de protocole automate" }],
    demo: "telegram",
    live: "https://tray-store-controller.vercel.app",
    shot: "assets/shots/tray-store-controller.jpg",
  },
  {
    id: "plant-data-logger",
    name: "Plant Data Logger",
    file: "PlantLogger.exe",
    icon: "gauge",
    category: { en: "Industrial data · Water treatment", fr: "Données industrielles · Traitement de l'eau" },
    year: "2026",
    summary: {
      en: "A plant data logger for water treatment: process values read from the PLCs every two seconds, stored in PostgreSQL and turned into live trends, alarms and daily reports. The demo runs two sample units, an MSF desalination unit and an acid dosing skid, in English and Arabic.",
      fr: "Un enregistreur de données pour le traitement de l'eau : les valeurs process sont lues dans les automates toutes les deux secondes, stockées dans PostgreSQL et transformées en tendances en direct, alarmes et rapports quotidiens. La démo fait tourner deux unités, une unité de dessalement MSF et un skid de dosage d'acide, en anglais et en arabe.",
    },
    problem: {
      en: "Plants run on values nobody keeps: operators copy readings by hand, a network drop silently loses data, and management gets yesterday's figures late, in the wrong format.",
      fr: "Les sites tournent avec des valeurs que personne ne conserve : les opérateurs recopient les relevés à la main, une coupure réseau fait perdre des données sans prévenir, et la direction reçoit les chiffres de la veille en retard, dans le mauvais format.",
    },
    solution: {
      en: "A collector that reads the controllers, buffers locally when the network drops and catches up without losing a value, then serves trends, an alarm list and a report generated every night at 00:05. It runs on its own or next to an existing SCADA.",
      fr: "Un collecteur qui lit les automates, met en mémoire tampon localement quand le réseau tombe et rattrape sans perdre une valeur, puis fournit tendances, liste d'alarmes et un rapport généré chaque nuit à 00:05. Il fonctionne seul ou à côté d'un SCADA existant.",
    },
    highlights: {
      en: [
        "Process values every two seconds into PostgreSQL",
        "Live 30-minute trends, alarm and event list, collector log",
        "Network-drop buffering: simulate a drop and watch it catch up",
        "Daily report generated at 00:05, printable, in English or Arabic",
        "Real projects connect over Modbus TCP, OPC UA or Siemens S7",
      ],
      fr: [
        "Valeurs process toutes les deux secondes dans PostgreSQL",
        "Tendances sur 30 minutes, liste d'alarmes et d'événements, journal du collecteur",
        "Mémoire tampon en cas de coupure : simulez une coupure et regardez le rattrapage",
        "Rapport quotidien généré à 00:05, imprimable, en anglais ou en arabe",
        "Les vrais projets se connectent en Modbus TCP, OPC UA ou Siemens S7",
      ],
    },
    stack: ["JavaScript", "Chart.js", "PostgreSQL", "Modbus TCP · OPC UA · S7"],
    live: "https://plant-data-logger.vercel.app",
    shot: "assets/shots/plant-data-logger.jpg",
  },
  {
    id: "opcua-connector",
    name: "OPC UA Connector",
    file: "OpcUaConnector.dll",
    icon: "plug",
    category: { en: "Industrial library · C#", fr: "Bibliothèque industrielle · C#" },
    year: "2026",
    summary: {
      en: "A C# library built around one interface with two implementations: a realistic in-process simulator for prototyping, and a real opc.tcp:// client verified against a live OPC UA server.",
      fr: "Une bibliothèque C# construite autour d'une seule interface et de deux implémentations : un simulateur réaliste pour le prototypage, et un vrai client opc.tcp:// vérifié face à un serveur OPC UA réel.",
    },
    problem: {
      en: "Teams building dashboards and alarm logic for factory equipment wait weeks for access to a real PLC, then discover their trigger logic behaves differently on live data.",
      fr: "Les équipes qui développent tableaux de bord et alarmes pour des équipements industriels attendent des semaines l'accès à un vrai automate, puis découvrent que leurs déclencheurs se comportent autrement sur des données réelles.",
    },
    solution: {
      en: "Code against IOpcUaClient. Prototype with the mock, which drifts realistic values every second, then swap in the real adapter with zero changes: the same 9 trigger types evaluate through the same TriggerManager on both.",
      fr: "On code contre IOpcUaClient. On prototype avec le simulateur, qui fait varier des valeurs réalistes chaque seconde, puis on branche l'adaptateur réel sans rien changer : les mêmes 9 types de déclencheurs passent par le même TriggerManager.",
    },
    highlights: {
      en: [
        "9 trigger types: AnyChange, Threshold (hysteresis), Deadband, RateOfChange, Direction, ValueChange, Bit, TimeBased, Connection",
        "Configurable security: None / Sign / SignAndEncrypt, policies, credentials",
        "Recursive, cycle-safe address-space browsing and endpoint discovery",
        "69 tests: 64 unit + real-server integration tests",
        "Live Blazor Server dashboard with streaming trigger log",
      ],
      fr: [
        "9 types de déclencheurs : AnyChange, Threshold (hystérésis), Deadband, RateOfChange, Direction, ValueChange, Bit, TimeBased, Connection",
        "Sécurité configurable : None / Sign / SignAndEncrypt, politiques, identifiants",
        "Parcours récursif de l'espace d'adressage, sans boucle, et découverte des points d'accès",
        "69 tests : 64 unitaires + tests d'intégration sur serveur réel",
        "Tableau de bord Blazor Server en direct avec journal des déclenchements",
      ],
    },
    stack: ["C#", ".NET", "OPC UA", "xUnit", "Blazor Server"],
  },
  {
    id: "warehouse-dashboard",
    name: "Warehouse Dashboard",
    file: "WarehouseDash.app",
    icon: "chart",
    category: { en: "Web app · Real-time monitoring", fr: "Application web · Supervision temps réel" },
    year: "2026",
    summary: {
      en: "A real-time floor display modelling fifty machines by state, alongside inventory and an order queue, pushed live over WebSockets from an Express and PostgreSQL backend.",
      fr: "Un affichage temps réel modélisant cinquante machines par état, avec le stock et une file de commandes, poussé en direct par WebSocket depuis un backend Express et PostgreSQL.",
    },
    problem: {
      en: "Shift leads juggle separate screens for machine status, stock levels and order backlog, and only learn about a stopped machine when the orders pile up.",
      fr: "Les chefs d'équipe jonglent entre plusieurs écrans pour l'état des machines, le stock et les commandes en attente, et n'apprennent qu'une machine est arrêtée que lorsque les commandes s'accumulent.",
    },
    solution: {
      en: "One live view. An Express.js backend exposes machines, inventory and orders over a REST API and streams changes over WebSockets so the dashboard updates the moment the floor does.",
      fr: "Une seule vue en direct. Un backend Express.js expose machines, stock et commandes via une API REST et diffuse les changements par WebSocket : le tableau de bord bouge dès que le terrain bouge.",
    },
    highlights: {
      en: [
        "Fifty machines modelled by state, plus inventory and an order queue",
        "WebSocket push for live updates, no polling",
        "REST API: health, machines, inventory, orders",
        "Companion to the Integration Toolkit",
      ],
      fr: [
        "Cinquante machines modélisées par état, plus le stock et une file de commandes",
        "Mises à jour poussées par WebSocket, sans interrogation périodique",
        "API REST : santé, machines, stock, commandes",
        "Complément de l'Integration Toolkit",
      ],
    },
    stack: ["React", "Express.js", "PostgreSQL", "WebSockets"],
    live: "https://warehouse-dashboard-umber.vercel.app",
    shot: "assets/shots/warehouse-dashboard.jpg",
  },
  {
    id: "warehouse-portal",
    name: "Warehouse Management Portal",
    file: "WarehousePortal.app",
    icon: "portal",
    category: { en: "Web app · Inventory & orders", fr: "Application web · Stock et commandes" },
    year: "2026",
    summary: {
      en: "A full warehouse management web application: master data, purchase and sales orders, stock per product, batch and location, storage costs and a complete movement history. The demo runs on sample data; the real one is in production use.",
      fr: "Une application web complète de gestion d'entrepôt : données de référence, commandes d'achat et de vente, stock par produit, lot et emplacement, coûts de stockage et historique complet des mouvements. La démo tourne sur des données d'exemple ; la vraie est en production.",
    },
    problem: {
      en: "A warehouse running on an ageing legacy system: stock levels drifting from reality, orders getting stuck, and nobody able to say what a pallet has cost in storage.",
      fr: "Un entrepôt sur un système historique vieillissant : des stocks qui s'éloignent de la réalité, des commandes bloquées, et personne pour dire combien une palette a coûté en stockage.",
    },
    solution: {
      en: "A replacement built around stock movements: every inbound and outbound movement is recorded per product, batch and location, so stock levels and storage costs stay correct and every number can be traced back.",
      fr: "Un remplaçant construit autour des mouvements de stock : chaque entrée et sortie est enregistrée par produit, lot et emplacement, pour que stocks et coûts de stockage restent justes et que chaque chiffre soit traçable.",
    },
    highlights: {
      en: [
        "Master data: companies, products, packaging types, locations",
        "Purchase and sales orders with stock reservations",
        "Current stock per product, batch and location, with blocking and partial blocking",
        "Storage cost tracking, stock movement history and an audit log",
        "Analytics dashboard, CSV export by download or email",
      ],
      fr: [
        "Données de référence : sociétés, produits, types d'emballage, emplacements",
        "Commandes d'achat et de vente avec réservation de stock",
        "Stock par produit, lot et emplacement, avec blocage total ou partiel",
        "Suivi des coûts de stockage, historique des mouvements et journal d'audit",
        "Tableau de bord analytique, export CSV en téléchargement ou par e-mail",
      ],
    },
    stack: ["ASP.NET Core", "Entity Framework Core", "PostgreSQL", "Bootstrap"],
    live: "https://warehouse-portal-demo.vercel.app",
    shot: "assets/shots/warehouse-portal.jpg",
  },
  {
    id: "dental-clinic",
    name: "Dental Clinic Manager",
    file: "DentalClinic.app",
    icon: "tooth",
    category: { en: "Web app · Clinic management", fr: "Application web · Gestion de cabinet" },
    year: "2026",
    summary: {
      en: "A management application for a dental practice: patients with their medical history, appointments, treatments on a dental chart, payments and printable invoices, reports and staff. The demo is in French with sample patients.",
      fr: "Une application de gestion pour cabinet dentaire : patients et antécédents médicaux, rendez-vous, soins sur schéma dentaire, paiements et factures imprimables, rapports et personnel. La démo est en français avec des patients d'exemple.",
    },
    problem: {
      en: "Small practices run on a paper diary, a spreadsheet for payments and patient files in a cupboard, so nobody sees the day, the revenue or what a patient still owes at a glance.",
      fr: "Les petits cabinets fonctionnent avec un agenda papier, un tableur pour les paiements et des dossiers patients dans une armoire : personne ne voit d'un coup d'œil la journée, le chiffre d'affaires ou ce qu'un patient doit encore.",
    },
    solution: {
      en: "One screen for the front desk and the dentist: today's planning and revenue on the dashboard, a full file per patient (appointments, treatments, payments, X-rays), and invoices ready to print.",
      fr: "Un seul écran pour l'accueil et le praticien : planning et chiffre du jour sur le tableau de bord, un dossier complet par patient (rendez-vous, soins, paiements, radios) et des factures prêtes à imprimer.",
    },
    highlights: {
      en: [
        "Dashboard: today's appointments, monthly revenue, pending payments, charts",
        "Patient files with medical history, emergency contact, files and X-rays",
        "Appointments, treatments and an interactive dental chart",
        "Payments with printable invoices, reports and analytics",
        "Staff management and clinic settings",
      ],
      fr: [
        "Tableau de bord : rendez-vous du jour, revenu mensuel, paiements en attente, graphiques",
        "Dossiers patients avec antécédents médicaux, contact d'urgence, fichiers et radios",
        "Rendez-vous, soins et schéma dentaire interactif",
        "Paiements avec factures imprimables, rapports et analyses",
        "Gestion du personnel et paramètres du cabinet",
      ],
    },
    stack: ["JavaScript", "Chart.js", "HTML", "CSS"],
    live: "https://dental-clinic-demo-six-rouge.vercel.app",
    shot: "assets/shots/dental-clinic.jpg",
  },
];

// Only projects with a public live demo are shown. Work in progress stays in
// the list above without a "live" link and appears once it is deployed.
window.PROJECTS = window.PROJECTS.filter((p) => p.live);

// The Recycle Bin: approaches we threw away, and what replaced them.
window.TRASH = [
  {
    file: "resend_on_timeout.js",
    what: {
      en: "The naive tray-store controller: when the PLC doesn't answer, resend the move.",
      fr: "Le contrôleur naïf de magasin à plateaux : quand l'automate ne répond pas, renvoyer le mouvement.",
    },
    lesson: {
      en: "If the link drops after the PLC executed the move, a resend moves the tray twice. Our controller asks the PLC for the status of the last move instead.",
      fr: "Si la liaison tombe après l'exécution du mouvement, un renvoi déplace le plateau deux fois. Notre contrôleur demande plutôt à l'automate l'état du dernier mouvement.",
    },
  },
  {
    file: "functions_without_search_path.sql",
    what: {
      en: "An inherited warehouse database where 125 of 128 stored functions never declared their search path, alongside out-of-sync sequences and stuck orders.",
      fr: "Une base d'entrepôt héritée où 125 des 128 fonctions stockées ne déclaraient pas leur search path, avec des séquences désynchronisées et des commandes bloquées.",
    },
    lesson: {
      en: "Pin the search path in every function. And a live system can be repaired without stopping it: we fixed all of it with zero downtime.",
      fr: "Fixer le search path dans chaque fonction. Et un système en production peut se réparer sans l'arrêter : nous avons tout corrigé sans interruption de service.",
    },
  },
  {
    file: "pallets_stacked_by_eye.txt",
    what: {
      en: "Mixed pallets built by eye at a packing station, carton by carton.",
      fr: "Des palettes mixtes montées à l'œil au poste d'emballage, carton par carton.",
    },
    lesson: {
      en: "Compute the load plan from order data and carton dimensions, then project a laser onto the exact spot for each carton. Stable pallets that survive transit.",
      fr: "Calculer le plan de chargement à partir des commandes et des dimensions, puis projeter au laser l'emplacement exact de chaque carton. Des palettes stables qui tiennent au transport.",
    },
  },
  {
    file: "auto_trust_all_certs.cs",
    what: {
      en: "The tempting shortcut: auto-accept every OPC UA server certificate so demos connect faster.",
      fr: "Le raccourci tentant : accepter automatiquement tous les certificats de serveur OPC UA pour que les démos se connectent plus vite.",
    },
    lesson: {
      en: "That defeats the whole point of OPC UA security, so AutoAcceptUntrustedCertificates defaults to false in our connector.",
      fr: "Cela annule tout l'intérêt de la sécurité OPC UA : AutoAcceptUntrustedCertificates vaut donc false par défaut dans notre connecteur.",
    },
  },
];

// Track record from the founder's CV. Client names are deliberately left out.
window.TRACK = {
  stats: [
    { n: "10", en: "years building industrial control software", fr: "ans de logiciel de conduite industrielle" },
    { n: "7", en: "live sites supported today", fr: "sites en exploitation supportés aujourd'hui" },
    { n: "3", en: "continents with running installations", fr: "continents avec des installations en service" },
    { n: "8", en: "industries, from pharma to airports", fr: "secteurs, de la pharmacie aux aéroports" },
  ],
  work: [
    {
      sector: { en: "Automated storage", fr: "Stockage automatisé" },
      title: { en: "Control software for an elevator-type storage and retrieval system", fr: "Logiciel de conduite d'un système de stockage automatisé de type ascenseur" },
      text: {
        en: "Architected and built from a whiteboard idea to live installations in Europe, the US and Asia: machine model, PLC layers from socket telegrams to OPC UA, product-flow and fault-recovery strategies, live monitoring, operator HMI and the WMS interface.",
        fr: "Conçu et développé d'une idée au tableau jusqu'à des installations en Europe, aux États-Unis et en Asie : modèle machine, couches automate du télégramme sur socket à OPC UA, stratégies de flux et de reprise sur défaut, supervision, IHM opérateur et interface WMS.",
      },
    },
    {
      sector: { en: "Food & beverage · USA", fr: "Agroalimentaire · États-Unis" },
      title: { en: "Two projects for a major US craft brewer", fr: "Deux projets pour un grand brasseur américain" },
      text: {
        en: "Integrated our storage control software with the WMS supplied by a tier-one US systems integrator.",
        fr: "Intégration de notre logiciel de stockage avec le WMS fourni par un intégrateur américain de premier plan.",
      },
    },
    {
      sector: { en: "Pharma · Laundry · Fashion", fr: "Pharmacie · Blanchisserie · Mode" },
      title: { en: "Seven live sites, from one machine to two installations of six", fr: "Sept sites en exploitation, d'une machine à deux installations de six" },
      text: {
        en: "Lead support across sites in pharmaceutical distribution, industrial laundry and fashion retail. On the two six-machine sites we delivered the whole chain: WMS logic, conveyor control over OPC and the tray buffers.",
        fr: "Responsable du support sur des sites en distribution pharmaceutique, blanchisserie industrielle et distribution de mode. Sur les deux sites à six machines, nous avons livré toute la chaîne : logique WMS, convoyage via OPC et tampons de plateaux.",
      },
    },
    {
      sector: { en: "Aviation", fr: "Aérien" },
      title: { en: "Robotic baggage loading at a major European airport", fr: "Chargement robotisé de bagages dans un grand aéroport européen" },
      text: {
        en: "A push-arm robot that stacks baggage into ULD containers autonomously, now running in the baggage halls. Development and project management.",
        fr: "Un robot à bras pousseur qui empile les bagages dans les conteneurs ULD de façon autonome, en service dans les halls bagages. Développement et gestion de projet.",
      },
    },
    {
      sector: { en: "Beverage production", fr: "Production de boissons" },
      title: { en: "Plant-wide WMS with SAP integration", fr: "WMS de site avec intégration SAP" },
      text: {
        en: "Pallets from the end of the production line through storage to shipping, synchronised with SAP over IDoc: inbound orders, movement confirmations and stock.",
        fr: "Les palettes de la sortie de ligne au stockage puis à l'expédition, synchronisées avec SAP par IDoc : ordres entrants, confirmations de mouvement et stock.",
      },
    },
    {
      sector: { en: "Retail logistics", fr: "Logistique retail" },
      title: { en: "Mixed palletising with laser guidance", fr: "Palettisation mixte guidée par laser" },
      text: {
        en: "Load-carrier optimisation from order data and business rules, with a station that projects each carton's exact position. Installed for a national retailer; proposal delivered to a global logistics group.",
        fr: "Optimisation du support de charge à partir des commandes et de règles métier, avec un poste qui projette la position exacte de chaque carton. Installé chez une enseigne nationale ; proposition remise à un groupe logistique mondial.",
      },
    },
    {
      sector: { en: "Robotics", fr: "Robotique" },
      title: { en: "Robotic storage with AMRs and pick stations", fr: "Stockage robotisé avec AMR et postes de prélèvement" },
      text: {
        en: "Application framework and AMR communication layer, plus touchscreen pick stations guided by LED strips for trays with up to eight compartments.",
        fr: "Framework applicatif et couche de communication AMR, plus des postes de prélèvement tactiles guidés par LED pour des plateaux jusqu'à huit compartiments.",
      },
    },
    {
      sector: { en: "Distribution", fr: "Distribution" },
      title: { en: "Warehouse management web app replacing a legacy system", fr: "Application web de gestion d'entrepôt remplaçant un système historique" },
      text: {
        en: "ASP.NET Core, PostgreSQL and EF Core: orders, stock per batch and location with cost tracking, KPI dashboard. Started with a zero-downtime rescue of the legacy database.",
        fr: "ASP.NET Core, PostgreSQL et EF Core : commandes, stock par lot et emplacement avec suivi des coûts, tableau de bord. A commencé par le sauvetage sans interruption de la base historique.",
      },
    },
  ],
};

window.SERVICES = [
  {
    title: { en: "Industrial integration", fr: "Intégration industrielle" },
    text: {
      en: "PLC, OPC UA and WMS integration; controllers, telegram protocols and fault-safe sequencing for automated storage.",
      fr: "Intégration automates, OPC UA et WMS ; contrôleurs, protocoles à télégrammes et séquencement sûr pour le stockage automatisé.",
    },
  },
  {
    title: { en: "Operations dashboards", fr: "Tableaux de bord d'exploitation" },
    text: {
      en: "Real-time monitoring for machines, inventory and orders, with live push updates instead of polling.",
      fr: "Supervision temps réel des machines, du stock et des commandes, avec des mises à jour poussées en direct.",
    },
  },
  {
    title: { en: "Web & client portals", fr: "Sites et portails clients" },
    text: {
      en: "Customer-facing sites and self-service portals that take load off your operations team.",
      fr: "Sites et portails en libre-service qui soulagent votre équipe d'exploitation.",
    },
  },
  {
    title: { en: "Simulators & digital twins", fr: "Simulateurs et jumeaux numériques" },
    text: {
      en: "Test and demo control logic before the hardware exists, against realistic drifting data.",
      fr: "Testez et montrez la logique de conduite avant que le matériel n'existe, sur des données réalistes.",
    },
  },
];
