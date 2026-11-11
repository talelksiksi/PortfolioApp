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
    live: "https://integration-toolkit-eight.vercel.app",
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
  },
  {
    id: "warehouse-portal",
    name: "Warehouse Portal",
    file: "WarehousePortal.app",
    icon: "portal",
    category: { en: "Web app · Client portal", fr: "Application web · Portail client" },
    year: "2026",
    summary: {
      en: "A client-facing portal demo for warehouse operations, giving customers a self-service window into their stock and orders.",
      fr: "Une démo de portail client pour les opérations d'entrepôt, qui donne aux clients un accès en libre-service à leur stock et à leurs commandes.",
    },
    problem: {
      en: "Customers of a warehouse call or email to ask where their stock is, tying up the operations team with status questions.",
      fr: "Les clients d'un entrepôt appellent ou écrivent pour savoir où en est leur stock, ce qui mobilise l'équipe d'exploitation sur des questions de suivi.",
    },
    solution: {
      en: "A portal that puts the answers in front of the customer, built on the same data model as the internal dashboard.",
      fr: "Un portail qui met les réponses directement sous les yeux du client, construit sur le même modèle de données que le tableau de bord interne.",
    },
    highlights: {
      en: ["Self-service view of stock and orders", "Shares its data model with the internal dashboard"],
      fr: ["Vue en libre-service du stock et des commandes", "Partage son modèle de données avec le tableau de bord interne"],
    },
    stack: ["JavaScript", "Web"],
    live: "https://warehouse-portal-demo.vercel.app",
  },
  {
    id: "dental-clinic",
    name: "Dental Clinic Platform",
    file: "DentalClinic.web",
    icon: "tooth",
    category: { en: "Web app · Healthcare", fr: "Application web · Santé" },
    year: "2026",
    summary: {
      en: "A comprehensive website and management front end for a dental clinic: services, booking, and the day-to-day running of the practice.",
      fr: "Un site complet et une interface de gestion pour un cabinet dentaire : services, prise de rendez-vous et fonctionnement quotidien du cabinet.",
    },
    problem: {
      en: "Small clinics run on phone calls, paper diaries and a brochure website that can't take a booking.",
      fr: "Les petits cabinets fonctionnent au téléphone, à l'agenda papier et avec un site vitrine incapable de prendre un rendez-vous.",
    },
    solution: {
      en: "One site that sells the clinic to new patients and gives the front desk the tools to manage appointments.",
      fr: "Un seul site qui présente le cabinet aux nouveaux patients et donne à l'accueil les outils pour gérer les rendez-vous.",
    },
    highlights: {
      en: ["Patient-facing site with services and booking", "Clinic management screens for the front desk"],
      fr: ["Site patient avec services et prise de rendez-vous", "Écrans de gestion du cabinet pour l'accueil"],
    },
    stack: ["JavaScript", "HTML", "CSS"],
  },
];

// The Recycle Bin. Real lessons, mostly learned the hard way.
window.TRASH = [
  {
    file: "resend_on_timeout.js",
    what: {
      en: "First tray-store controller: when the PLC didn't answer, resend the move.",
      fr: "Premier contrôleur de magasin à plateaux : quand l'automate ne répondait pas, renvoyer le mouvement.",
    },
    lesson: {
      en: "If the link drops after the PLC executed the move, a resend moves the tray twice. Now the controller asks the PLC for the status of the last move instead.",
      fr: "Si la liaison tombe après l'exécution du mouvement, un renvoi déplace le plateau deux fois. Désormais, le contrôleur demande à l'automate l'état du dernier mouvement.",
    },
  },
  {
    file: "auto_trust_all_certs.cs",
    what: {
      en: "Early OPC UA adapter that auto-accepted every server certificate to make demos connect faster.",
      fr: "Premier adaptateur OPC UA qui acceptait automatiquement tous les certificats serveur pour connecter les démos plus vite.",
    },
    lesson: {
      en: "That defeats the whole point of OPC UA security. AutoAcceptUntrustedCertificates now defaults to false.",
      fr: "Cela annule tout l'intérêt de la sécurité OPC UA. AutoAcceptUntrustedCertificates vaut désormais false par défaut.",
    },
  },
  {
    file: "dashboard_polls_every_500ms.js",
    what: {
      en: "Warehouse dashboard v0 that polled the REST API twice a second.",
      fr: "Version 0 du tableau de bord, qui interrogeait l'API REST deux fois par seconde.",
    },
    lesson: {
      en: "Hammered the server and still felt laggy. WebSockets push changes only when the floor changes.",
      fr: "Le serveur saturait et l'affichage restait lent. Les WebSockets ne poussent un changement que lorsque le terrain change.",
    },
  },
  {
    file: "portfolio_v1_scroll_forever.html",
    what: {
      en: "A portfolio that was one very long scrolling page.",
      fr: "Un portfolio fait d'une seule page interminable.",
    },
    lesson: {
      en: "Nobody scrolled past the hero. You're looking at the replacement.",
      fr: "Personne ne dépassait le premier écran. Vous êtes en train de regarder son remplaçant.",
    },
  },
];

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
