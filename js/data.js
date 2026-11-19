/*
 * Site content. Everything a visitor reads lives here, so updating the
 * portfolio never means touching the window manager. Text that changes with
 * the language is written as { en: "...", fr: "...", ar: "..." }.
 */
window.SITE = {
  owner: "Talel Ksiksi",
  studio: "CICTNA RDC",
  tagline: { en: "Industrial software, integrations and web apps that ship.", fr: "Logiciel industriel, intégrations et applications web qui aboutissent.", ar: "برمجيات صناعية وربط أنظمة وتطبيقات ويب تصل إلى خط النهاية." },
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
    category: { en: "Web app · Integration planning", fr: "Application web · Planification d'intégrations", ar: "تطبيق ويب · تخطيط ربط الأنظمة" },
    year: "2026",
    summary: {
      en: "An interactive integration planner: map how your ERP, WMS, PLCs and partners exchange data, break links on purpose to see what gets lost, get an instant review with one-click fixes, and leave with a written spec and starter code.",
      fr: "Un planificateur d'intégrations interactif : cartographiez les échanges entre votre ERP, votre WMS, vos automates et vos partenaires, cassez des liens pour voir ce qui se perd, obtenez une revue instantanée avec corrections en un clic, et repartez avec une spécification et du code de départ.",
      ar: "مخطِّط تفاعلي لربط الأنظمة: ارسم كيف تتبادل أنظمة ERP وWMS والمتحكمات المنطقية وشركاؤك البيانات، واقطع الروابط عمداً لترى ما يضيع، واحصل على مراجعة فورية مع إصلاحات بنقرة واحدة، ثم اخرج بمواصفات مكتوبة وكود جاهز للبدء.",
    },
    problem: {
      en: "Integration projects stall because nobody can see how orders, stock and machine data really move, or what happens when one link fails. Interfaces break quietly, and the first sign is a customer complaint.",
      fr: "Les projets d'intégration s'enlisent parce que personne ne voit comment circulent vraiment commandes, stocks et données machines, ni ce qui se passe quand un lien tombe. Les interfaces cassent en silence, et le premier signal est une réclamation client.",
      ar: "تتعثر مشاريع ربط الأنظمة لأن لا أحد يرى فعلاً كيف تنتقل الطلبات والمخزون وبيانات الآلات، ولا ماذا يحدث عندما يتعطل رابط واحد. تنكسر الواجهات بصمت، وأول من ينبّهك هو شكوى عميل.",
    },
    solution: {
      en: "Start from a real scenario or your own systems, run simulated traffic, cut a link or take a system offline, and watch messages get lost or wait safely, translated into business impact. An automatic review scores the plan and fixes weak spots in one click; then export the spec and code, or send the plan to us.",
      fr: "Partez d'un scénario réel ou de vos propres systèmes, lancez un trafic simulé, coupez un lien ou arrêtez un système, et voyez les messages se perdre ou attendre en sécurité, traduits en impact métier. Une revue automatique note le plan et corrige les points faibles en un clic ; exportez ensuite la spécification et le code, ou envoyez-nous le plan.",
      ar: "ابدأ من سيناريو حقيقي أو من أنظمتك أنت، وشغّل حركة بيانات محاكاة، ثم اقطع رابطاً أو أوقف نظاماً وشاهد الرسائل وهي تضيع أو تنتظر بأمان، مع ترجمة الأثر إلى لغة الأعمال. مراجعة آلية تقيّم الخطة وتعالج نقاط الضعف بنقرة واحدة، ثم صدّر المواصفات والكود أو أرسل الخطة إلينا.",
    },
    highlights: {
      en: [
        "Three real-world scenarios: warehouse order flow, plant data to the boardroom, automated storage",
        "15 system types and real protocols: SAP IDoc, OPC UA, Modbus, S7, TCP telegrams, MQTT, Kafka, REST",
        "Outage simulation with lost vs buffered messages and plain-language business impact",
        "Automatic review out of 100 with one-click fixes",
        "Export a written spec (PDF) and one Node.js starter service per link, or send the plan to CICTNA RDC",
      ],
      fr: [
        "Trois scénarios réels : flux de commandes, données d'usine vers la direction, stockage automatisé",
        "15 types de systèmes et de vrais protocoles : IDoc SAP, OPC UA, Modbus, S7, télégrammes TCP, MQTT, Kafka, REST",
        "Simulation de pannes : messages perdus ou en attente, avec l'impact métier en clair",
        "Revue automatique sur 100 avec corrections en un clic",
        "Export d'une spécification (PDF) et d'un service Node.js par lien, ou envoi du plan à CICTNA RDC",
      ],
      ar: ["ثلاثة سيناريوهات واقعية: تدفق طلبات المستودع، وبيانات المصنع حتى مجلس الإدارة، والتخزين الآلي", "15 نوعاً من الأنظمة وبروتوكولات حقيقية: SAP IDoc وOPC UA وModbus وS7 ورسائل TCP وMQTT وKafka وREST", "محاكاة الانقطاعات مع التمييز بين الرسائل الضائعة والمحفوظة، وشرح الأثر على العمل بلغة واضحة", "مراجعة آلية من 100 مع إصلاحات بنقرة واحدة", "تصدير مواصفات مكتوبة (PDF) وخدمة Node.js جاهزة لكل رابط، أو إرسال الخطة إلى CICTNA RDC"],
    },
    stack: ["React", "SVG", "Node.js codegen", "OPC UA · Modbus · IDoc · Kafka"],
    live: "https://cictnardc.net/portfolio/integration-toolkit/",
    shot: "assets/shots/integration-toolkit.jpg",
  },
  {
    id: "tray-store-controller",
    name: "Tray Store Controller",
    file: "TrayStore.sim",
    icon: "tray",
    category: { en: "Industrial automation · Simulation", fr: "Automatisme industriel · Simulation", ar: "أتمتة صناعية · محاكاة" },
    year: "2026",
    summary: {
      en: "A browser simulation of the controller software that runs an automated tray store: retrieval planning, PLC telegrams with checksums, and fault-safe recovery.",
      fr: "Une simulation dans le navigateur du logiciel de conduite d'un magasin automatisé à plateaux : planification des sorties, télégrammes automate avec somme de contrôle et reprise sûre après défaut.",
      ar: "محاكاة في المتصفح لبرنامج التحكم الذي يدير مخزناً آلياً للصواني: تخطيط عمليات السحب، ورسائل PLC مع مجموع اختباري، واستعادة آمنة بعد الأعطال.",
    },
    problem: {
      en: "Automated storage controllers are hard to demo and harder to test: every move is physical, and a dropped PLC link mid-sequence can make a naive controller execute the same move twice.",
      fr: "Les contrôleurs de stockage automatisé sont difficiles à montrer et encore plus à tester : chaque mouvement est physique, et une coupure de liaison automate en pleine séquence peut faire exécuter deux fois le même mouvement à un contrôleur naïf.",
      ar: "يصعب عرض متحكمات التخزين الآلي ويصعب اختبارها أكثر: كل حركة فيها فعل مادي، وانقطاع الاتصال بالمتحكم المنطقي في منتصف التسلسل قد يجعل متحكماً ساذجاً ينفّذ الحركة نفسها مرتين.",
    },
    solution: {
      en: "A faithful model of the machine (channels of 12 trays on plain rollers, two powered transfer devices) plus a controller that plans the moves, sends one telegram at a time and waits for each ACK. After a link fault it asks the PLC for the status of the last move instead of resending it.",
      fr: "Un modèle fidèle de la machine (canaux de 12 plateaux sur rouleaux libres, deux transferts motorisés) et un contrôleur qui planifie les mouvements, envoie un télégramme à la fois et attend chaque ACK. Après une coupure, il demande à l'automate l'état du dernier mouvement au lieu de le renvoyer.",
      ar: "نموذج دقيق للآلة (قنوات من 12 صينية على بكرات عادية، وجهازا نقل مزوّدان بمحركات) ومعه متحكم يخطط الحركات ويرسل رسالة واحدة في كل مرة وينتظر تأكيد كل منها. وبعد أي انقطاع يسأل المتحكم المنطقي عن حالة آخر حركة بدل أن يعيد إرسالها.",
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
      ar: ["يحدد مكان الصينية، ويختار أقرب طرف للقناة، ويمرّر الصواني المعيقة عبر أقرب قناة", "بروتوكول رسائل بمجموع اختباري XOR، وحركة واحدة قيد التنفيذ في كل مرة", "زر عطل يقطع الاتصال بالمتحكم المنطقي في منتصف التسلسل لإثبات التعافي", "لا تُنفَّذ أي حركة مرتين أبداً", "HTML وCSS وJavaScript دون أي مكتبات خارجية"],
    },
    stack: ["JavaScript", "HTML5", "CSS", { en: "PLC protocol design", fr: "Conception de protocole automate", ar: "تصميم بروتوكول PLC" }],
    demo: "telegram",
    live: "https://cictnardc.net/portfolio/tray-store-controller/",
    shot: "assets/shots/tray-store-controller.jpg",
  },
  {
    id: "plant-data-logger",
    name: "Plant Data Logger",
    file: "PlantLogger.exe",
    icon: "gauge",
    category: { en: "Industrial data · Water treatment", fr: "Données industrielles · Traitement de l'eau", ar: "بيانات صناعية · معالجة المياه" },
    year: "2026",
    summary: {
      en: "A plant data logger for water treatment: process values read from the PLCs every two seconds, stored in PostgreSQL and turned into live trends, alarms and daily reports. The demo runs two sample units, an MSF desalination unit and an acid dosing skid, in English, French and Arabic.",
      fr: "Un enregistreur de données pour le traitement de l'eau : les valeurs process sont lues dans les automates toutes les deux secondes, stockées dans PostgreSQL et transformées en tendances en direct, alarmes et rapports quotidiens. La démo fait tourner deux unités, une unité de dessalement MSF et un skid de dosage d'acide, en anglais, en français et en arabe.",
      ar: "مسجّل بيانات لمحطات معالجة المياه: تُقرأ قيم التشغيل من المتحكمات المنطقية كل ثانيتين، وتُخزَّن في PostgreSQL، وتتحول إلى منحنيات مباشرة وإنذارات وتقارير يومية. تعرض النسخة التجريبية وحدتين نموذجيتين، وحدة تحلية MSF ووحدة حقن حمض، بالإنجليزية والفرنسية والعربية.",
    },
    problem: {
      en: "Plants run on values nobody keeps: operators copy readings by hand, a network drop silently loses data, and management gets yesterday's figures late, in the wrong format.",
      fr: "Les sites tournent avec des valeurs que personne ne conserve : les opérateurs recopient les relevés à la main, une coupure réseau fait perdre des données sans prévenir, et la direction reçoit les chiffres de la veille en retard, dans le mauvais format.",
      ar: "تعمل المحطات على قيم لا يحتفظ بها أحد: المشغّلون ينقلون القراءات باليد، وانقطاع الشبكة يُضيع البيانات بصمت، والإدارة تتلقى أرقام الأمس متأخرة وبصيغة غير مناسبة.",
    },
    solution: {
      en: "A collector that reads the controllers, buffers locally when the network drops and catches up without losing a value, then serves trends, an alarm list and a report generated every night at 00:05. It runs on its own or next to an existing SCADA.",
      fr: "Un collecteur qui lit les automates, met en mémoire tampon localement quand le réseau tombe et rattrape sans perdre une valeur, puis fournit tendances, liste d'alarmes et un rapport généré chaque nuit à 00:05. Il fonctionne seul ou à côté d'un SCADA existant.",
      ar: "جامع بيانات يقرأ المتحكمات، ويخزّن محلياً عند انقطاع الشبكة ثم يستدرك دون أن يفقد أي قيمة، ويقدّم المنحنيات وقائمة الإنذارات وتقريراً يُنشأ كل ليلة عند 00:05. يعمل وحده أو بجانب نظام SCADA قائم.",
    },
    highlights: {
      en: [
        "Process values every two seconds into PostgreSQL",
        "Live 30-minute trends, alarm and event list, collector log",
        "Network-drop buffering: simulate a drop and watch it catch up",
        "Daily report generated at 00:05, printable, in English, French or Arabic",
        "Real projects connect over Modbus TCP, OPC UA or Siemens S7",
      ],
      fr: [
        "Valeurs process toutes les deux secondes dans PostgreSQL",
        "Tendances sur 30 minutes, liste d'alarmes et d'événements, journal du collecteur",
        "Mémoire tampon en cas de coupure : simulez une coupure et regardez le rattrapage",
        "Rapport quotidien généré à 00:05, imprimable, en anglais, en français ou en arabe",
        "Les vrais projets se connectent en Modbus TCP, OPC UA ou Siemens S7",
      ],
      ar: ["قيم التشغيل كل ثانيتين إلى PostgreSQL", "منحنيات مباشرة لآخر 30 دقيقة، وقائمة الإنذارات والأحداث، وسجل جامع البيانات", "تخزين مؤقت عند انقطاع الشبكة: حاكِ انقطاعاً وشاهده يستدرك", "تقرير يومي يُنشأ عند 00:05، قابل للطباعة، بالإنجليزية أو الفرنسية أو العربية", "المشاريع الفعلية تتصل عبر Modbus TCP أو OPC UA أو Siemens S7"],
    },
    stack: ["JavaScript", "Chart.js", "PostgreSQL", "Modbus TCP · OPC UA · S7"],
    live: "https://cictnardc.net/portfolio/plant-data-logger/",
    shot: "assets/shots/plant-data-logger.jpg",
  },
  {
    id: "warehouse-dashboard",
    name: "Warehouse Control Room",
    file: "WarehouseDash.app",
    icon: "chart",
    category: { en: "Web app · Real-time monitoring", fr: "Application web · Supervision temps réel", ar: "تطبيق ويب · مراقبة لحظية" },
    year: "2026",
    summary: {
      en: "A one-screen control room for a warehouse: 50 machines, live alarms with acknowledgement, stock and orders, all updating in real time.",
      fr: "Une salle de contrôle d'entrepôt sur un seul écran : 50 machines, alarmes en direct avec acquittement, stock et commandes, le tout mis à jour en temps réel.",
      ar: "غرفة تحكم في شاشة واحدة لمستودع كامل: 50 آلة، وإنذارات مباشرة مع الإقرار بها، والمخزون والطلبات، وكلها تتحدث لحظياً.",
    },
    problem: {
      en: "Shift leads juggle separate screens for machines, stock and orders, and only learn about a stopped machine when the orders pile up.",
      fr: "Les chefs d'équipe jonglent entre plusieurs écrans pour les machines, le stock et les commandes, et n'apprennent qu'une machine est arrêtée que lorsque les commandes s'accumulent.",
      ar: "رؤساء الورديات يتنقلون بين شاشات منفصلة للآلات والمخزون والطلبات، ولا يعلمون بتوقف آلة إلا عندما تتراكم الطلبات.",
    },
    solution: {
      en: "Headline figures at the top, every machine on one screen coloured by state, and an alarm panel with cause, severity, acknowledgement and history. Click a machine for its live output trend and events; press Simulate a fault to watch an alarm go from raised to cleared.",
      fr: "Les chiffres clés en haut, chaque machine sur un seul écran colorée selon son état, et un panneau d'alarmes avec cause, gravité, acquittement et historique. Cliquez sur une machine pour sa tendance de production et ses événements ; simulez une panne pour suivre une alarme de son déclenchement à sa résolution.",
      ar: "الأرقام الرئيسية في الأعلى، وكل الآلات في شاشة واحدة ملوّنة حسب حالتها، ولوحة إنذارات تبيّن السبب والخطورة والإقرار والسجل. انقر على أي آلة لترى منحنى إنتاجها المباشر وأحداثها، واضغط «محاكاة عطل» لتتابع الإنذار من ظهوره إلى زواله.",
    },
    highlights: {
      en: [
        "KPIs: running, idle and faulted machines, output, uptime, stock alerts, orders",
        "Alarm panel with acknowledge and history; faults and low stock raise alarms",
        "All 50 machines on one screen, filters by state and station",
        "Machine detail with a live output trend and recent events",
        "Orders with labelled steps, inventory sorted by urgency, WebSocket-ready",
      ],
      fr: [
        "Indicateurs : machines en marche, à l'arrêt et en défaut, production, disponibilité, alertes stock, commandes",
        "Panneau d'alarmes avec acquittement et historique ; défauts et stock bas déclenchent des alarmes",
        "Les 50 machines sur un écran, filtres par état et par poste",
        "Détail machine avec tendance de production en direct et événements récents",
        "Commandes aux étapes nommées, stock trié par urgence, prêt pour WebSocket",
      ],
      ar: ["مؤشرات الأداء: الآلات العاملة والمتوقفة والمعطلة، والإنتاج، ونسبة التشغيل، وتنبيهات المخزون، والطلبات", "لوحة إنذارات مع الإقرار والسجل؛ الأعطال ونقص المخزون تطلق إنذارات", "الآلات الخمسون كلها في شاشة واحدة، مع تصفية حسب الحالة والمحطة", "تفاصيل كل آلة مع منحنى إنتاج مباشر وآخر الأحداث", "طلبات بمراحل واضحة، ومخزون مرتب حسب الأولوية، وجاهز للعمل عبر WebSocket"],
    },
    stack: ["React", "WebSockets", "Express.js", "PostgreSQL"],
    live: "https://cictnardc.net/portfolio/warehouse-dashboard/",
    shot: "assets/shots/warehouse-dashboard.jpg",
  },
  {
    id: "warehouse-portal",
    name: "Warehouse Management Portal",
    file: "WarehousePortal.app",
    icon: "portal",
    category: { en: "Web app · Inventory & orders", fr: "Application web · Stock et commandes", ar: "تطبيق ويب · المخزون والطلبات" },
    year: "2026",
    summary: {
      en: "A full warehouse management web application: master data, purchase and sales orders, stock per product, batch and location, storage costs and a complete movement history. The demo runs on sample data; the real one is in production use.",
      fr: "Une application web complète de gestion d'entrepôt : données de référence, commandes d'achat et de vente, stock par produit, lot et emplacement, coûts de stockage et historique complet des mouvements. La démo tourne sur des données d'exemple ; la vraie est en production.",
      ar: "تطبيق ويب متكامل لإدارة المستودعات: البيانات الأساسية، وطلبات الشراء والبيع، والمخزون حسب المنتج والدفعة والموقع، وتكاليف التخزين، وسجل كامل للحركات. النسخة التجريبية تعمل ببيانات نموذجية، والنسخة الفعلية مستخدمة في الإنتاج.",
    },
    problem: {
      en: "A warehouse running on an ageing legacy system: stock levels drifting from reality, orders getting stuck, and nobody able to say what a pallet has cost in storage.",
      fr: "Un entrepôt sur un système historique vieillissant : des stocks qui s'éloignent de la réalité, des commandes bloquées, et personne pour dire combien une palette a coûté en stockage.",
      ar: "مستودع يعمل على نظام قديم متهالك: أرصدة المخزون تبتعد عن الواقع، والطلبات تتعطل، ولا أحد يستطيع أن يقول كم كلّف تخزين منصة واحدة.",
    },
    solution: {
      en: "A replacement built around stock movements: every inbound and outbound movement is recorded per product, batch and location, so stock levels and storage costs stay correct and every number can be traced back.",
      fr: "Un remplaçant construit autour des mouvements de stock : chaque entrée et sortie est enregistrée par produit, lot et emplacement, pour que stocks et coûts de stockage restent justes et que chaque chiffre soit traçable.",
      ar: "نظام بديل مبني حول حركات المخزون: كل حركة دخول وخروج تُسجَّل حسب المنتج والدفعة والموقع، فتبقى الأرصدة وتكاليف التخزين صحيحة، ويمكن تتبّع أي رقم إلى مصدره.",
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
      ar: ["البيانات الأساسية: الشركات والمنتجات وأنواع التغليف والمواقع", "طلبات الشراء والبيع مع حجز المخزون", "المخزون الحالي حسب المنتج والدفعة والموقع، مع التجميد الكلي والجزئي", "تتبّع تكاليف التخزين، وسجل حركات المخزون، وسجل التدقيق", "لوحة تحليلات، وتصدير CSV بالتنزيل أو بالبريد"],
    },
    stack: ["ASP.NET Core", "Entity Framework Core", "PostgreSQL", "Bootstrap"],
    live: "https://cictnardc.net/portfolio/warehouse-portal/",
    shot: "assets/shots/warehouse-portal.jpg",
  },
  {
    id: "gp-office",
    name: "Mon Cabinet",
    file: "MonCabinet.app",
    icon: "medical",
    category: { en: "Web app · GP practice", fr: "Application web · Cabinet médical", ar: "تطبيق ويب · عيادة طب عام" },
    year: "2026",
    summary: {
      en: "Practice software for a general practitioner, built to be easy to read and available in French, English and Arabic: patient files, consultations, prescriptions and certificates to print, and the day's agenda. Demo code: 1234.",
      fr: "Un logiciel de cabinet pour médecin généraliste, pensé pour une lecture confortable et disponible en français, en anglais et en arabe : dossiers patients, consultations, ordonnances et certificats à imprimer, et l'agenda du jour. Code de démonstration : 1234.",
      ar: "برنامج عيادة لطبيب عام، مصمم ليكون سهل القراءة ومتاحاً بالفرنسية والإنجليزية والعربية: ملفات المرضى، والاستشارات، والوصفات والشهادات للطباعة، وجدول مواعيد اليوم. رمز الدخول التجريبي: 1234.",
    },
    problem: {
      en: "A doctor working on ageing desktop software with small text and slow screens, and years of patient history locked inside its database.",
      fr: "Un médecin sur un logiciel vieillissant aux petits caractères et aux écrans lents, avec des années d'historique patient enfermées dans sa base.",
      ar: "طبيب يعمل على برنامج مكتبي قديم بخط صغير وشاشات بطيئة، وسنوات من تاريخ مرضاه محبوسة في قاعدة بياناته.",
    },
    solution: {
      en: "Large type and strong contrast with an adjustable text size, a 4-digit code on a big keypad, and everything one click from the patient file. It runs on the practice PC with daily backups and only listens locally; the old database is migrated in.",
      fr: "De gros caractères et un fort contraste avec une taille de texte réglable, un code à 4 chiffres sur un grand pavé, et tout à un clic du dossier patient. Il tourne sur le PC du cabinet avec sauvegarde quotidienne et n'écoute qu'en local ; l'ancienne base est reprise.",
      ar: "خط كبير وتباين قوي مع حجم نص قابل للتعديل، ورمز من 4 أرقام على لوحة مفاتيح كبيرة، وكل شيء على بُعد نقرة من ملف المريض. يعمل على حاسوب العيادة مع نسخ احتياطي يومي ولا يستقبل إلا الاتصالات المحلية، وتُنقل إليه قاعدة البيانات القديمة.",
    },
    highlights: {
      en: [
        "Patient file: history by type, allergy alert, latest measurements with trend, past consultations",
        "Consultation: reason, examination, blood pressure, pulse, weight, glucose, conclusion, private notes",
        "Prescriptions with a medicine catalogue, templates, quick dosages and renew-last-prescription",
        "A5 printing: prescriptions, rest and fitness certificates, referral letters",
        "Agenda with free slots and waiting room; adjustable text size",
      ],
      fr: [
        "Dossier patient : antécédents par type, alerte allergies, dernières mesures avec évolution, consultations passées",
        "Consultation : motif, examen, tension, pouls, poids, glycémie, conclusion, notes privées",
        "Ordonnances avec catalogue de médicaments, modèles, posologies rapides et reprise de la dernière",
        "Impression A5 : ordonnances, certificats de repos et d'aptitude, lettres à un confrère",
        "Agenda avec heures libres et salle d'attente ; taille du texte réglable",
      ],
      ar: ["ملف المريض: السوابق حسب النوع، وتنبيه الحساسية، وآخر القياسات مع اتجاهها، والاستشارات السابقة", "الاستشارة: السبب، والفحص، والضغط، والنبض، والوزن، والسكر، والخلاصة، وملاحظات خاصة", "وصفات مع دليل أدوية وقوالب وجرعات سريعة وتجديد آخر وصفة", "طباعة بحجم A5: الوصفات، وشهادات الراحة واللياقة، ورسائل الإحالة", "جدول مواعيد مع الأوقات الشاغرة وقاعة الانتظار؛ وحجم نص قابل للتعديل"],
    },
    stack: ["JavaScript", "Node.js", "HTML", "CSS"],
    live: "https://cictnardc.net/portfolio/gp-office/",
    shot: "assets/shots/gp-office.jpg",
  },
  {
    id: "dental-clinic",
    name: "Dental Clinic Manager",
    file: "DentalClinic.app",
    icon: "tooth",
    category: { en: "Web app · Clinic management", fr: "Application web · Gestion de cabinet", ar: "تطبيق ويب · إدارة العيادات" },
    year: "2026",
    summary: {
      en: "A management application for a dental practice: patients with their medical history, appointments, treatments on a dental chart, payments and printable invoices, reports and staff. The demo runs on sample patients, in French, English or Arabic.",
      fr: "Une application de gestion pour cabinet dentaire : patients et antécédents médicaux, rendez-vous, soins sur schéma dentaire, paiements et factures imprimables, rapports et personnel. La démo tourne avec des patients d'exemple, en français, en anglais ou en arabe.",
      ar: "تطبيق لإدارة عيادة أسنان: المرضى وتاريخهم الطبي، والمواعيد، والعلاجات على مخطط الأسنان، والمدفوعات والفواتير القابلة للطباعة، والتقارير والطاقم. النسخة التجريبية تعمل بمرضى نموذجيين، بالفرنسية أو الإنجليزية أو العربية.",
    },
    problem: {
      en: "Small practices run on a paper diary, a spreadsheet for payments and patient files in a cupboard, so nobody sees the day, the revenue or what a patient still owes at a glance.",
      fr: "Les petits cabinets fonctionnent avec un agenda papier, un tableur pour les paiements et des dossiers patients dans une armoire : personne ne voit d'un coup d'œil la journée, le chiffre d'affaires ou ce qu'un patient doit encore.",
      ar: "العيادات الصغيرة تعمل بمفكرة ورقية وجدول بيانات للمدفوعات وملفات مرضى في خزانة، فلا أحد يرى بنظرة واحدة برنامج اليوم ولا الإيرادات ولا ما بقي على كل مريض.",
    },
    solution: {
      en: "One screen for the front desk and the dentist: today's planning and revenue on the dashboard, a full file per patient (appointments, treatments, payments, X-rays), and invoices ready to print.",
      fr: "Un seul écran pour l'accueil et le praticien : planning et chiffre du jour sur le tableau de bord, un dossier complet par patient (rendez-vous, soins, paiements, radios) et des factures prêtes à imprimer.",
      ar: "شاشة واحدة للاستقبال وللطبيب: برنامج اليوم والإيرادات على لوحة القيادة، وملف كامل لكل مريض (مواعيد وعلاجات ومدفوعات وصور أشعة)، وفواتير جاهزة للطباعة.",
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
      ar: ["لوحة القيادة: مواعيد اليوم، والإيرادات الشهرية، والمدفوعات المعلقة، ورسوم بيانية", "ملفات المرضى مع التاريخ الطبي وجهة الاتصال في الطوارئ والملفات وصور الأشعة", "المواعيد والعلاجات ومخطط أسنان تفاعلي", "المدفوعات مع فواتير قابلة للطباعة، والتقارير والتحليلات", "إدارة الطاقم وإعدادات العيادة"],
    },
    stack: ["JavaScript", "Chart.js", "HTML", "CSS"],
    live: "https://cictnardc.net/portfolio/dental-clinic/",
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
      ar: "المتحكم الساذج لمخزن الصواني: إذا لم يجب المتحكم المنطقي، أعد إرسال الحركة.",
    },
    lesson: {
      en: "If the link drops after the PLC executed the move, a resend moves the tray twice. Our controller asks the PLC for the status of the last move instead.",
      fr: "Si la liaison tombe après l'exécution du mouvement, un renvoi déplace le plateau deux fois. Notre contrôleur demande plutôt à l'automate l'état du dernier mouvement.",
      ar: "إذا انقطع الاتصال بعد أن نفّذ المتحكم المنطقي الحركة، فإعادة الإرسال تحرك الصينية مرتين. متحكمنا يسأل عن حالة آخر حركة بدلاً من ذلك.",
    },
  },
  {
    file: "functions_without_search_path.sql",
    what: {
      en: "An inherited warehouse database where 125 of 128 stored functions never declared their search path, alongside out-of-sync sequences and stuck orders.",
      fr: "Une base d'entrepôt héritée où 125 des 128 fonctions stockées ne déclaraient pas leur search path, avec des séquences désynchronisées et des commandes bloquées.",
      ar: "قاعدة بيانات مستودع موروثة لم تحدد 125 من أصل 128 دالة مخزنة فيها مسار البحث، إلى جانب تسلسلات غير متزامنة وطلبات عالقة.",
    },
    lesson: {
      en: "Pin the search path in every function. And a live system can be repaired without stopping it: we fixed all of it with zero downtime.",
      fr: "Fixer le search path dans chaque fonction. Et un système en production peut se réparer sans l'arrêter : nous avons tout corrigé sans interruption de service.",
      ar: "ثبّت مسار البحث في كل دالة. ويمكن إصلاح نظام يعمل دون إيقافه: أصلحنا كل ذلك دون أي توقف.",
    },
  },
  {
    file: "pallets_stacked_by_eye.txt",
    what: {
      en: "Mixed pallets built by eye at a packing station, carton by carton.",
      fr: "Des palettes mixtes montées à l'œil au poste d'emballage, carton par carton.",
      ar: "منصات مختلطة تُرصّ بالعين في محطة تعبئة، كرتونة بعد كرتونة.",
    },
    lesson: {
      en: "Compute the load plan from order data and carton dimensions, then project a laser onto the exact spot for each carton. Stable pallets that survive transit.",
      fr: "Calculer le plan de chargement à partir des commandes et des dimensions, puis projeter au laser l'emplacement exact de chaque carton. Des palettes stables qui tiennent au transport.",
      ar: "احسب خطة التحميل من بيانات الطلب وأبعاد الكراتين، ثم اعرض بالليزر الموضع الدقيق لكل كرتونة. منصات ثابتة تصمد أثناء النقل.",
    },
  },
  {
    file: "auto_trust_all_certs.cs",
    what: {
      en: "The tempting shortcut: auto-accept every OPC UA server certificate so demos connect faster.",
      fr: "Le raccourci tentant : accepter automatiquement tous les certificats de serveur OPC UA pour que les démos se connectent plus vite.",
      ar: "الاختصار المغري: قبول كل شهادات خوادم OPC UA تلقائياً حتى تتصل العروض التجريبية أسرع.",
    },
    lesson: {
      en: "That defeats the whole point of OPC UA security, so AutoAcceptUntrustedCertificates defaults to false in our connector.",
      fr: "Cela annule tout l'intérêt de la sécurité OPC UA : AutoAcceptUntrustedCertificates vaut donc false par défaut dans notre connecteur.",
      ar: "هذا يُسقط الغاية من أمان OPC UA أصلاً، لذلك فإن AutoAcceptUntrustedCertificates معطّل افتراضياً في الموصل الذي نطوره.",
    },
  },
];

// Track record from the founder's CV. Client names are deliberately left out.
window.TRACK = {
  stats: [
    { n: "10", en: "years building industrial control software", fr: "ans de logiciel de conduite industrielle", ar: "سنوات في بناء برمجيات التحكم الصناعي" },
    { n: "7", en: "live sites supported today", fr: "sites en exploitation supportés aujourd'hui", ar: "مواقع تعمل اليوم ونتولى دعمها" },
    { n: "3", en: "continents with running installations", fr: "continents avec des installations en service", ar: "قارات فيها منشآت تعمل" },
    { n: "8", en: "industries, from pharma to airports", fr: "secteurs, de la pharmacie aux aéroports", ar: "قطاعات، من الأدوية إلى المطارات" },
  ],
  work: [
    {
      sector: { en: "Automated storage", fr: "Stockage automatisé", ar: "التخزين الآلي" },
      title: { en: "Control software for an elevator-type storage and retrieval system", fr: "Logiciel de conduite d'un système de stockage automatisé de type ascenseur", ar: "برنامج تحكم لنظام تخزين وسحب آلي من نوع المصعد" },
      text: {
        en: "Architected and built from a whiteboard idea to live installations in Europe, the US and Asia: machine model, PLC layers from socket telegrams to OPC UA, product-flow and fault-recovery strategies, live monitoring, operator HMI and the WMS interface.",
        fr: "Conçu et développé d'une idée au tableau jusqu'à des installations en Europe, aux États-Unis et en Asie : modèle machine, couches automate du télégramme sur socket à OPC UA, stratégies de flux et de reprise sur défaut, supervision, IHM opérateur et interface WMS.",
        ar: "صمّمه وبناه من فكرة على السبورة حتى منشآت تعمل في أوروبا والولايات المتحدة وآسيا: نموذج الآلة، وطبقات الاتصال مع المتحكمات من رسائل المقابس إلى OPC UA، واستراتيجيات تدفق المنتجات والتعافي من الأعطال، والمراقبة المباشرة، وواجهة المشغّل، والربط مع نظام WMS.",
      },
    },
    {
      sector: { en: "Food & beverage · USA", fr: "Agroalimentaire · États-Unis", ar: "الأغذية والمشروبات · الولايات المتحدة" },
      title: { en: "Two projects for a major US craft brewer", fr: "Deux projets pour un grand brasseur américain", ar: "مشروعان لمصنع جعة حرفية كبير في الولايات المتحدة" },
      text: {
        en: "Integrated our storage control software with the WMS supplied by a tier-one US systems integrator.",
        fr: "Intégration de notre logiciel de stockage avec le WMS fourni par un intégrateur américain de premier plan.",
        ar: "ربط برنامج التحكم في التخزين الذي نطوره بنظام WMS قدّمه مُكامِل أنظمة أمريكي من الصف الأول.",
      },
    },
    {
      sector: { en: "Pharma · Laundry · Fashion", fr: "Pharmacie · Blanchisserie · Mode", ar: "الأدوية · المغاسل الصناعية · الأزياء" },
      title: { en: "Seven live sites, from one machine to two installations of six", fr: "Sept sites en exploitation, d'une machine à deux installations de six", ar: "سبعة مواقع تعمل، من آلة واحدة إلى منشأتين من ست آلات" },
      text: {
        en: "Lead support across sites in pharmaceutical distribution, industrial laundry and fashion retail. On the two six-machine sites we delivered the whole chain: WMS logic, conveyor control over OPC and the tray buffers.",
        fr: "Responsable du support sur des sites en distribution pharmaceutique, blanchisserie industrielle et distribution de mode. Sur les deux sites à six machines, nous avons livré toute la chaîne : logique WMS, convoyage via OPC et tampons de plateaux.",
        ar: "قيادة الدعم في مواقع توزيع الأدوية والمغاسل الصناعية وتجارة الأزياء. وفي الموقعين ذوي الآلات الست سلّمنا السلسلة كاملة: منطق WMS، والتحكم في السيور عبر OPC، ومخازن الصواني المؤقتة.",
      },
    },
    {
      sector: { en: "Aviation", fr: "Aérien", ar: "الطيران" },
      title: { en: "Robotic baggage loading at a major European airport", fr: "Chargement robotisé de bagages dans un grand aéroport européen", ar: "تحميل آلي للأمتعة بالروبوت في مطار أوروبي كبير" },
      text: {
        en: "A push-arm robot that stacks baggage into ULD containers autonomously, now running in the baggage halls. Development and project management.",
        fr: "Un robot à bras pousseur qui empile les bagages dans les conteneurs ULD de façon autonome, en service dans les halls bagages. Développement et gestion de projet.",
        ar: "روبوت بذراع دفع يرصّ الأمتعة داخل حاويات ULD ذاتياً، ويعمل اليوم في صالات الأمتعة. التطوير وإدارة المشروع.",
      },
    },
    {
      sector: { en: "Beverage production", fr: "Production de boissons", ar: "إنتاج المشروبات" },
      title: { en: "Plant-wide WMS with SAP integration", fr: "WMS de site avec intégration SAP", ar: "نظام WMS للمصنع كله مع ربط SAP" },
      text: {
        en: "Pallets from the end of the production line through storage to shipping, synchronised with SAP over IDoc: inbound orders, movement confirmations and stock.",
        fr: "Les palettes de la sortie de ligne au stockage puis à l'expédition, synchronisées avec SAP par IDoc : ordres entrants, confirmations de mouvement et stock.",
        ar: "المنصات من نهاية خط الإنتاج إلى التخزين ثم الشحن، بتزامن مع SAP عبر IDoc: طلبات الاستلام، وتأكيدات الحركة، والمخزون.",
      },
    },
    {
      sector: { en: "Retail logistics", fr: "Logistique retail", ar: "لوجستيات التجزئة" },
      title: { en: "Mixed palletising with laser guidance", fr: "Palettisation mixte guidée par laser", ar: "رصّ مختلط للمنصات بتوجيه الليزر" },
      text: {
        en: "Load-carrier optimisation from order data and business rules, with a station that projects each carton's exact position. Installed for a national retailer; proposal delivered to a global logistics group.",
        fr: "Optimisation du support de charge à partir des commandes et de règles métier, avec un poste qui projette la position exacte de chaque carton. Installé chez une enseigne nationale ; proposition remise à un groupe logistique mondial.",
        ar: "تحسين حمولة المنصات انطلاقاً من بيانات الطلبات وقواعد العمل، مع محطة تعرض الموضع الدقيق لكل كرتونة. رُكّب لدى سلسلة تجزئة وطنية، وقُدّم عرض لمجموعة لوجستية عالمية.",
      },
    },
    {
      sector: { en: "Robotics", fr: "Robotique", ar: "الروبوتات" },
      title: { en: "Robotic storage with AMRs and pick stations", fr: "Stockage robotisé avec AMR et postes de prélèvement", ar: "تخزين روبوتي بروبوتات متنقلة ذاتية ومحطات تجهيز" },
      text: {
        en: "Application framework and AMR communication layer, plus touchscreen pick stations guided by LED strips for trays with up to eight compartments.",
        fr: "Framework applicatif et couche de communication AMR, plus des postes de prélèvement tactiles guidés par LED pour des plateaux jusqu'à huit compartiments.",
        ar: "إطار التطبيق وطبقة الاتصال مع الروبوتات المتنقلة، ومحطات تجهيز بشاشات لمس توجّهها أشرطة LED لصوانٍ تضم حتى ثماني خانات.",
      },
    },
    {
      sector: { en: "Distribution", fr: "Distribution", ar: "التوزيع" },
      title: { en: "Warehouse management web app replacing a legacy system", fr: "Application web de gestion d'entrepôt remplaçant un système historique", ar: "تطبيق ويب لإدارة المستودع بدلاً من نظام قديم" },
      text: {
        en: "ASP.NET Core, PostgreSQL and EF Core: orders, stock per batch and location with cost tracking, KPI dashboard. Started with a zero-downtime rescue of the legacy database.",
        fr: "ASP.NET Core, PostgreSQL et EF Core : commandes, stock par lot et emplacement avec suivi des coûts, tableau de bord. A commencé par le sauvetage sans interruption de la base historique.",
        ar: "ASP.NET Core وPostgreSQL وEF Core: الطلبات، والمخزون حسب الدفعة والموقع مع تتبّع التكاليف، ولوحة مؤشرات الأداء. بدأ بإنقاذ قاعدة البيانات القديمة دون أي توقف.",
      },
    },
  ],
};

window.SERVICES = [
  {
    title: { en: "Industrial integration", fr: "Intégration industrielle", ar: "الربط الصناعي" },
    text: {
      en: "PLC, OPC UA and WMS integration; controllers, telegram protocols and fault-safe sequencing for automated storage.",
      fr: "Intégration automates, OPC UA et WMS ; contrôleurs, protocoles à télégrammes et séquencement sûr pour le stockage automatisé.",
      ar: "ربط المتحكمات المنطقية وOPC UA وأنظمة WMS؛ متحكمات وبروتوكولات رسائل وتسلسل آمن من الأعطال للتخزين الآلي.",
    },
  },
  {
    title: { en: "Operations dashboards", fr: "Tableaux de bord d'exploitation", ar: "لوحات متابعة العمليات" },
    text: {
      en: "Real-time monitoring for machines, inventory and orders, with live push updates instead of polling.",
      fr: "Supervision temps réel des machines, du stock et des commandes, avec des mises à jour poussées en direct.",
      ar: "مراقبة لحظية للآلات والمخزون والطلبات، بتحديثات تصل مباشرة بدل الاستعلام المتكرر.",
    },
  },
  {
    title: { en: "Web & client portals", fr: "Sites et portails clients", ar: "مواقع وبوابات للعملاء" },
    text: {
      en: "Customer-facing sites and self-service portals that take load off your operations team.",
      fr: "Sites et portails en libre-service qui soulagent votre équipe d'exploitation.",
      ar: "مواقع موجهة للعملاء وبوابات خدمة ذاتية تخفف الضغط عن فريق عملياتك.",
    },
  },
  {
    title: { en: "Simulators & digital twins", fr: "Simulateurs et jumeaux numériques", ar: "محاكيات وتوائم رقمية" },
    text: {
      en: "Test and demo control logic before the hardware exists, against realistic drifting data.",
      fr: "Testez et montrez la logique de conduite avant que le matériel n'existe, sur des données réalistes.",
      ar: "اختبر منطق التحكم واعرضه قبل وجود العتاد، على بيانات واقعية متغيرة.",
    },
  },
];
