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
    id: "restaurant-suite",
    name: "Restaurant & Café Suite",
    file: "RestaurantSuite.app",
    icon: "cup",
    category: { en: "Web app · Restaurants & cafés", fr: "Application web · Restaurants et cafés", ar: "تطبيق ويب · المطاعم والمقاهي" },
    year: "2026",
    summary: {
      en: "An ordering suite for cafés, restaurants and bars: waiter tablets, a screen per station (kitchen, coffee bar, juice bar), QR ordering from the table and a cashier, all on one live order stream. In English, French and Arabic.",
      fr: "Une suite de commande pour cafés, restaurants et bars : tablettes serveurs, un écran par poste (cuisine, bar à café, bar à jus), commande par QR code depuis la table et caisse, sur un seul flux de commandes en direct. En anglais, en français et en arabe.",
      ar: "منظومة طلبات للمقاهي والمطاعم: أجهزة لوحية للنادل، وشاشة لكل قسم (المطبخ وركن القهوة وركن العصائر)، وطلب من الطاولة عبر رمز QR، وكاشير، كلها على مسار طلبات واحد مباشر. بالعربية والفرنسية والإنجليزية.",
    },
    problem: {
      en: "Orders are shouted across the room or written on paper, the barista and the kitchen learn about them late, guests wait to catch a waiter's eye, and in Saudi Arabia every bill now has to meet ZATCA e-invoicing rules.",
      fr: "Les commandes sont criées à travers la salle ou notées sur papier, le barista et la cuisine les découvrent tard, les clients attendent d'attirer un serveur, et en Arabie saoudite chaque addition doit désormais respecter la facturation électronique ZATCA.",
      ar: "تُنقل الطلبات بالصوت أو على الورق، فيعلم بها ركن القهوة والمطبخ متأخرين، وينتظر الزبون حتى يلفت انتباه النادل، وفي السعودية صار على كل فاتورة أن تلتزم بقواعد الفوترة الإلكترونية لهيئة الزكاة والضريبة والجمارك.",
    },
    solution: {
      en: "Every device works on the same live orders: the waiter sends, each station sees only its items and bumps them ready, the waiter is told when to serve, and guests can order and ask for the bill from their phone. The cashier closes bills beside the venue's existing register, through a compliance provider, or with ZATCA e-invoicing built in, on one data model so a venue can switch later.",
      fr: "Tous les appareils travaillent sur les mêmes commandes en direct : le serveur envoie, chaque poste ne voit que ses articles et les passe à prêt, le serveur est prévenu quand servir, et les clients commandent et demandent l'addition depuis leur téléphone. La caisse clôture à côté de la caisse existante, via un prestataire de conformité ou avec la facturation ZATCA intégrée, sur un seul modèle de données pour pouvoir changer plus tard.",
      ar: "كل الأجهزة تعمل على الطلبات نفسها مباشرة: يرسل النادل الطلب، ويرى كل قسم أصنافه فقط ويعلن جاهزيتها، ويُنبَّه النادل حين يحين التقديم، ويستطيع الزبون الطلب وطلب الحساب من هاتفه. ويغلق الكاشير الفاتورة بجانب نقطة البيع الحالية، أو عبر مزوّد امتثال، أو بالفوترة الإلكترونية المدمجة، على نموذج بيانات واحد يتيح التبديل لاحقاً.",
    },
    highlights: {
      en: ["Waiter tablet with floor plan, modifiers, notes and ready alerts", "Kitchen, coffee and juice bar screens with timers that turn amber, then red", "QR menu: guests order, call a waiter or ask for the bill", "Split bills by item or equally, card or cash, day report", "ZATCA simplified invoices: counter, hash chain, signature, QR code and UBL 2.1 XML"],
      fr: ["Tablette serveur avec plan de salle, options, notes et alertes « prêt »", "Écrans cuisine, bar à café et bar à jus avec minuteurs qui passent à l'orange puis au rouge", "Menu QR : les clients commandent, appellent un serveur ou demandent l'addition", "Addition partagée par article ou à parts égales, carte ou espèces, rapport du jour", "Factures simplifiées ZATCA : compteur, chaîne d'empreintes, signature, QR code et XML UBL 2.1"],
      ar: ["جهاز النادل مع مخطط الصالة والإضافات والملاحظات وتنبيهات الجاهزية", "شاشات للمطبخ وركن القهوة وركن العصائر بمؤقتات تتحول إلى البرتقالي ثم الأحمر", "منيو QR: يطلب الزبون أو ينادي النادل أو يطلب الحساب", "تقسيم الفاتورة حسب الأصناف أو بالتساوي، بطاقة أو نقداً، وتقرير اليوم", "فواتير ضريبية مبسطة: عدّاد وسلسلة بصمات وتوقيع ورمز QR وملف XML بصيغة UBL 2.1"],
    },
    stack: ["JavaScript", "ASP.NET Core + SignalR", "PostgreSQL", "ZATCA Fatoora"],
    live: "https://cictnardc.net/portfolio/restaurant-suite/",
    shot: "assets/shots/restaurant-suite.jpg",
  },
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
    id: "batch-dosing-gateway",
    name: "Batch Dosing Gateway",
    file: "BatchDosing.sim",
    icon: "silo",
    category: { en: "Industrial automation · Simulation", fr: "Automatisme industriel · Simulation", ar: "أتمتة صناعية · محاكاة" },
    year: "2026",
    summary: {
      en: "The software between a plant's ERP and its dosing PLC, simulated live in the browser: production orders become recipe setpoints over Modbus TCP or OPC UA, every batch is followed through the PLC handshake, checked against tolerance and confirmed back to the ERP.",
      fr: "Le logiciel entre l'ERP d'une usine et son automate de dosage, simulé en direct dans le navigateur : les ordres de fabrication deviennent des consignes de recette en Modbus TCP ou OPC UA, chaque lot est suivi pendant l'échange avec l'automate, contrôlé par rapport à sa tolérance et confirmé à l'ERP.",
      ar: "البرنامج الذي يربط نظام ERP في المصنع بجهاز PLC الخاص بالتجريع، في محاكاة مباشرة داخل المتصفح: تتحول أوامر الإنتاج إلى قيم وصفات عبر Modbus TCP أو OPC UA، وتُتابع كل دفعة خلال التبادل مع PLC، ثم تُفحص مقابل السماحية وتُؤكد إلى ERP.",
    },
    problem: {
      en: "Orders are typed into the batching panel by hand, quantities get mistyped, and the ERP only learns what was produced at the end of the shift. When the network drops mid-batch nobody is sure whether it was dosed, so it is either lost or booked twice.",
      fr: "Les ordres sont ressaisis à la main au pupitre de dosage, les quantités sont mal tapées, et l'ERP n'apprend ce qui a été produit qu'en fin de poste. Quand le réseau tombe en plein lot, personne ne sait s'il a été dosé : il est perdu ou compté deux fois.",
      ar: "تُكتب الأوامر يدوياً في لوحة التجريع، وتُدخل الكميات خطأً، ولا يعرف ERP ما أُنتج إلا في نهاية الوردية. وعندما تنقطع الشبكة في منتصف الدفعة لا أحد يعرف هل جُرّعت أم لا، فتضيع أو تُحسب مرتين.",
    },
    solution: {
      en: "A gateway checks each order, splits it into batches and writes the setpoints with a batch id. It follows the PLC's status word through load, start, dosing, mixing and done, reads the weighed quantities, books each batch exactly once and confirms the order to the ERP, with retries and an outbox when either side is down.",
      fr: "Une passerelle vérifie chaque ordre, le découpe en lots et écrit les consignes avec un numéro de lot. Elle suit le mot d'état de l'automate du chargement à la fin du lot, lit les quantités pesées, enregistre chaque lot une seule fois et confirme l'ordre à l'ERP, avec nouvelles tentatives et file d'attente quand l'un des deux est indisponible.",
      ar: "تتحقق البوابة من كل أمر وتقسّمه إلى دفعات وتكتب القيم المطلوبة مع رقم الدفعة. ثم تتابع كلمة الحالة في PLC من التحميل حتى نهاية الدفعة، وتقرأ الكميات الموزونة، وتسجّل كل دفعة مرة واحدة فقط، وتؤكد الأمر إلى ERP، مع إعادة المحاولة وطابور انتظار عندما يتوقف أحد الطرفين.",
    },
    highlights: {
      en: ["Same signals over Modbus TCP or OPC UA, switchable live", "Real Modbus frames in the log, byte by byte", "Pull the PLC cable mid-batch: nothing is dosed or booked twice", "Batch records with setpoint, dosed quantity and tolerance per silo", "Faults to try: lost link, empty silo, scale drift, ERP offline"],
      fr: ["Mêmes signaux en Modbus TCP ou OPC UA, au choix en direct", "Vraies trames Modbus dans le journal, octet par octet", "Débranchez l'automate en plein lot : rien n'est dosé ni compté deux fois", "Fiches de lot avec consigne, quantité dosée et tolérance par silo", "Pannes à essayer : liaison perdue, silo vide, balance déréglée, ERP coupé"],
      ar: ["الإشارات نفسها عبر Modbus TCP أو OPC UA مع التبديل مباشرة", "إطارات Modbus حقيقية في السجل، بايتاً بايتاً", "افصل كابل PLC في منتصف الدفعة: لا شيء يُجرّع أو يُسجّل مرتين", "سجلات دفعات بالقيمة المطلوبة والكمية المجرّعة والسماحية لكل صومعة", "أعطال للتجربة: انقطاع الاتصال، صومعة فارغة، انحراف الميزان، توقف ERP"],
    },
    stack: ["JavaScript", "C# / .NET", "Modbus TCP", "OPC UA", "REST / JSON"],
    live: "https://cictnardc.net/portfolio/batch-dosing-gateway/",
    shot: "assets/shots/batch-dosing-gateway.jpg",
  },
  {
    id: "opcua-explorer",
    name: "OPC UA Explorer",
    file: "OpcUaExplorer.exe",
    icon: "plug",
    category: { en: "Industrial automation · Engineering tool", fr: "Automatisme industriel · Outil d'ingénierie", ar: "أتمتة صناعية · أداة هندسية" },
    year: "2026",
    summary: {
      en: "A tool for finding out what an OPC UA server really offers: browse its address space, list every tag under a branch in one go, read and write values with the right data type, and watch them change live. The online demo runs on a simulated plant.",
      fr: "Un outil pour savoir ce qu'un serveur OPC UA propose vraiment : parcourir son espace d'adressage, lister d'un coup toutes les variables d'une branche, lire et écrire des valeurs au bon type, et les suivre en direct. La démo en ligne tourne sur une usine simulée.",
      ar: "أداة لمعرفة ما يتيحه خادم OPC UA فعلاً: تصفّح فضاء العناوين، واسرد كل متغيرات فرع كامل دفعة واحدة، واقرأ القيم واكتبها بالنوع الصحيح، وراقب تغيّرها مباشرة. العرض على الإنترنت يعمل على مصنع محاكى.",
    },
    problem: {
      en: "The variable list that comes with a machine is often out of date: names changed, tags missing, types wrong. Integration work then starts on guesses, and the errors show up on site, at the worst moment.",
      fr: "La liste de variables livrée avec une machine est souvent périmée : noms changés, variables manquantes, types faux. Le travail d'intégration démarre alors sur des suppositions, et les erreurs apparaissent sur site, au pire moment.",
      ar: "قائمة المتغيرات التي تُسلَّم مع الآلة كثيراً ما تكون قديمة: أسماء تغيّرت ومتغيرات ناقصة وأنواع خاطئة. فيبدأ عمل الربط على التخمين، وتظهر الأخطاء في الموقع وفي أسوأ وقت.",
    },
    solution: {
      en: "Ask the controller itself. The tool connects to the server, walks a whole branch in a few requests and lists every variable with its path, NodeId, data type, access rights, value and quality. Tags can be filtered, exported to CSV, written for a test behind a write lock, and watched on a subscription that survives a lost connection.",
      fr: "Demander à l'automate lui-même. L'outil se connecte au serveur, parcourt une branche entière en quelques requêtes et liste chaque variable avec son chemin, son NodeId, son type, ses droits d'accès, sa valeur et sa qualité. Les variables se filtrent, s'exportent en CSV, s'écrivent pour un essai derrière un verrou, et se suivent par un abonnement qui survit à une coupure.",
      ar: "اسأل المتحكم نفسه. تتصل الأداة بالخادم وتمسح فرعاً كاملاً ببضعة طلبات وتسرد كل متغير بمساره و NodeId ونوعه وصلاحيات الوصول وقيمته وجودته. يمكن تصفية المتغيرات وتصديرها إلى CSV، والكتابة عليها للتجربة خلف قفل، ومراقبتها باشتراك يصمد عند انقطاع الاتصال.",
    },
    highlights: {
      en: ["Bulk scan: a thousand tags with type, access and value in seconds", "Filter, sort and export the list to CSV", "Typed writes for scalars and arrays, locked until you unlock them", "Live watch list on an OPC UA subscription, with automatic reconnect", "English, French and Arabic"],
      fr: ["Parcours en masse : mille variables avec type, accès et valeur en quelques secondes", "Filtre, tri et export CSV de la liste", "Écritures typées, scalaires et tableaux, verrouillées jusqu'à déverrouillage", "Suivi en direct par abonnement OPC UA, avec reconnexion automatique", "Anglais, français et arabe"],
      ar: ["مسح شامل: ألف متغير بالنوع والوصول والقيمة في ثوانٍ", "تصفية القائمة وترتيبها وتصديرها إلى CSV", "كتابة بالنوع الصحيح للقيم المفردة والمصفوفات، مقفلة حتى تفتحها", "مراقبة مباشرة باشتراك OPC UA مع إعادة اتصال تلقائية", "بالعربية والإنجليزية والفرنسية"],
    },
    stack: ["C# / .NET", "ASP.NET Core", "OPC UA", "JavaScript"],
    live: "https://cictnardc.net/portfolio/opcua-explorer/",
    shot: "assets/shots/opcua-explorer.jpg",
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
    id: "fabrication-suite",
    name: "Fabrication Shop Suite",
    file: "FabricationShop.app",
    icon: "steel",
    category: { en: "Web app · Fabrication workshops", fr: "Application web · Ateliers de fabrication", ar: "تطبيق ويب · ورش التصنيع" },
    year: "2026",
    summary: {
      en: "An order, drawing and production system for stainless steel workshops that build commercial kitchens, food production units, mall kiosks and event stands, with a tracking page for each client and the workshop's public website. In English, French and Arabic.",
      fr: "Un système de commandes, de plans et de production pour les ateliers inox qui réalisent cuisines professionnelles, unités de production alimentaire, kiosques et stands, avec une page de suivi par client et le site public de l'atelier. En anglais, en français et en arabe.",
      ar: "نظام للطلبات والمخططات والإنتاج لورش الستانلس ستيل التي تنفّذ المطابخ التجارية ووحدات الإنتاج الغذائي والأكشاك وأجنحة المعارض، مع صفحة متابعة لكل عميل والموقع العام للورشة. بالعربية والفرنسية والإنجليزية.",
    },
    problem: {
      en: "Custom one-off pieces built from drawings that keep changing: the workshop builds from an old revision, nobody knows which pieces are still in welding, material runs out mid-job, and the client calls every day to ask where their order is.",
      fr: "Des pièces uniques fabriquées d'après des plans qui changent : l'atelier part d'une ancienne révision, personne ne sait quelles pièces sont encore à la soudure, la matière manque en plein chantier, et le client appelle chaque jour pour savoir où en est sa commande.",
      ar: "قطع فريدة تُصنع وفق مخططات تتغير باستمرار: تعمل الورشة على مراجعة قديمة، ولا أحد يعرف أي القطع ما زالت في اللحام، وتنفد الخامات في منتصف العمل، ويتصل العميل كل يوم ليسأل عن طلبه.",
    },
    solution: {
      en: "Every article carries its drawings and revisions, and only the client-approved revision reaches the workshop. Workers start and finish pieces on a tablet at each station, so progress per article and per order is always current. Material is reserved when a quote is accepted, and the client follows everything, approves drawings and sees the installation date from one private link.",
      fr: "Chaque article porte ses plans et révisions, et seule la révision validée par le client arrive à l'atelier. Les ouvriers commencent et terminent les pièces sur tablette à chaque poste, l'avancement par article et par commande est donc toujours à jour. La matière est réservée à l'acceptation du devis, et le client suit tout, valide les plans et voit la date de pose depuis un lien privé.",
      ar: "يحمل كل صنف مخططاته ومراجعاته، ولا يصل إلى الورشة إلا ما اعتمده العميل. ويبدأ العمال القطع وينهونها على جهاز لوحي في كل محطة، فيبقى تقدم كل صنف وكل طلب محدّثاً دائماً. وتُحجز الخامات عند قبول عرض السعر، ويتابع العميل كل شيء ويعتمد المخططات ويعرف موعد التركيب من رابط خاص واحد.",
    },
    highlights: {
      en: ["Drawings with revisions; a new revision waits for client approval before cutting", "Workshop tablet per station: cutting, bending, welding, polishing, assembly, QC, packing, installation", "Quality check can send a piece back for rework with a note", "Material reserved on order and consumed at cutting, low-stock warnings", "Client tracking link and a public website whose quote form lands in the office"],
      fr: ["Plans avec révisions ; une nouvelle révision attend la validation du client avant découpe", "Tablette atelier par poste : découpe, pliage, soudure, polissage, assemblage, contrôle, emballage, pose", "Le contrôle qualité peut renvoyer une pièce en reprise avec une note", "Matière réservée à la commande et consommée à la découpe, alertes de stock bas", "Lien de suivi client et site public dont le formulaire de devis arrive au bureau"],
      ar: ["مخططات بمراجعاتها، والمراجعة الجديدة تنتظر اعتماد العميل قبل القص", "جهاز لوحي لكل محطة: القص والثني واللحام والتلميع والتجميع والفحص والتغليف والتركيب", "يستطيع فحص الجودة إعادة القطعة للإصلاح مع ملاحظة", "حجز الخامات عند الطلب واستهلاكها عند القص، وتنبيهات نقص المخزون", "رابط متابعة للعميل وموقع عام يصل طلب عرض السعر فيه إلى المكتب مباشرة"],
    },
    stack: ["JavaScript", "ASP.NET Core + SignalR", "PostgreSQL", "AutoCAD DWG / PDF"],
    live: "https://cictnardc.net/portfolio/fabrication-suite/",
    shot: "assets/shots/fabrication-suite.jpg",
  },
  {
    id: "spare-parts-store",
    name: "Plant Spare Parts Store",
    file: "SpareParts.app",
    icon: "bins",
    category: { en: "Web app · Maintenance stores", fr: "Application web · Magasin de maintenance", ar: "تطبيق ويب · مخازن الصيانة" },
    year: "2026",
    summary: {
      en: "Maintenance stores software for a water and power plant: spare parts with criticality and reorder points, bins and lots, issue requests against work orders, purchase orders with goods receipt, stock value and a full audit trail. In English, French and Arabic.",
      fr: "Le logiciel du magasin de maintenance d'une usine d'eau et d'électricité : pièces avec criticité et point de commande, emplacements et lots, sorties sur ordres de travail, commandes d'achat et réceptions, valeur du stock et journal d'audit complet. En anglais, en français et en arabe.",
      ar: "برنامج مخازن الصيانة لمحطة مياه وكهرباء: قطع غيار بدرجة أهميتها وحد إعادة طلبها، ومواقع ودفعات، وطلبات صرف على أوامر العمل، وطلبات شراء واستلام، وقيمة المخزون وسجل تدقيق كامل. بالعربية والفرنسية والإنجليزية.",
    },
    problem: {
      en: "A pump trips at night and the seal it needs is listed in stock but nowhere to be found. Critical spares run out unnoticed, oils and chemicals expire on the shelf, and nobody can say what the stores are worth or which parts have not moved in a year.",
      fr: "Une pompe déclenche la nuit et la garniture dont elle a besoin figure en stock mais reste introuvable. Les pièces critiques s'épuisent sans que personne ne le voie, huiles et produits chimiques périment en rayon, et personne ne sait ce que vaut le magasin ni quelles pièces n'ont pas bougé depuis un an.",
      ar: "تتوقف مضخة ليلاً، ومانع التسرب الذي تحتاجه مسجّل في المخزون لكن لا أحد يجده. تنفد القطع الحرجة دون أن ينتبه أحد، وتنتهي صلاحية الزيوت والكيماويات على الرفوف، ولا أحد يعرف قيمة المخزن ولا القطع التي لم تتحرك منذ سنة.",
    },
    solution: {
      en: "Every part has a criticality, a reorder point and a home bin, and every stock line a lot and an expiry date where it matters. A work order's parts are reserved the moment the request comes in, the pick list says which bin and lot to take, and issuing books them out to the work order. Shortages turn into draft purchase orders in one click, and receiving books the parts straight into a bin.",
      fr: "Chaque pièce a une criticité, un point de commande et un emplacement, et chaque ligne de stock un lot et une date de péremption quand il le faut. Les pièces d'un ordre de travail sont réservées dès l'arrivée de la demande, la liste de prélèvement indique l'emplacement et le lot, et la sortie les impute à l'ordre de travail. Les manquants deviennent des commandes brouillon en un clic, et la réception range les pièces directement dans un emplacement.",
      ar: "لكل قطعة درجة أهمية وحد لإعادة الطلب وموقع ثابت، ولكل سطر مخزون دفعة وتاريخ صلاحية حين يلزم. تُحجز قطع أمر العمل فور وصول الطلب، وتحدد قائمة التجهيز الموقع والدفعة، والصرف يحمّلها على أمر العمل. وتتحول النواقص إلى طلبات شراء بنقرة واحدة، والاستلام يُدخل القطع مباشرة إلى موقعها.",
    },
    highlights: {
      en: ["Criticality A, B, C with a watchlist of critical spares at zero", "Reservations for work orders, pick lists first expiry first out", "Purchase orders from shortages, goods receipt into bins with lot numbers", "Quarantine, transfers, cycle counts and a year of movement history", "Stock value by store and category, slow movers, audit log"],
      fr: ["Criticité A, B, C et liste de surveillance des pièces critiques à zéro", "Réservations pour les ordres de travail, prélèvement premier périmé premier sorti", "Commandes d'achat depuis les manquants, réception en emplacement avec numéro de lot", "Quarantaine, transferts, inventaires tournants et un an d'historique", "Valeur du stock par magasin et catégorie, faible rotation, journal d'audit"],
      ar: ["درجات أهمية A وB وC وقائمة مراقبة للقطع الحرجة النافدة", "حجز لأوامر العمل وقوائم تجهيز حسب الأقرب انتهاءً", "طلبات شراء من النواقص واستلام إلى المواقع بأرقام الدفعات", "حجر ونقل وجرد دوري وسنة كاملة من سجل الحركات", "قيمة المخزون حسب المخزن والفئة، والمواد بطيئة الحركة، وسجل التدقيق"],
    },
    stack: ["JavaScript", "ASP.NET Core", "PostgreSQL", { en: "CMMS / ERP integration", fr: "Intégration GMAO / ERP", ar: "ربط مع أنظمة الصيانة وERP" }],
    live: "https://cictnardc.net/portfolio/spare-parts-store/",
    shot: "assets/shots/spare-parts-store.jpg",
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
      en: "The naive dosing gateway: when the PLC doesn't answer, resend the batch.",
      fr: "La passerelle de dosage naïve : quand l'automate ne répond pas, renvoyer le lot.",
      ar: "بوابة التجريع الساذجة: إذا لم يجب المتحكم المنطقي، أعد إرسال الدفعة.",
    },
    lesson: {
      en: "If the link drops after the PLC started the batch, a resend doses it twice. Our gateway gives every batch an id and asks the PLC for the status of that batch instead.",
      fr: "Si la liaison tombe après le démarrage du lot, un renvoi le dose deux fois. Notre passerelle donne un numéro à chaque lot et demande plutôt à l'automate l'état de ce lot.",
      ar: "إذا انقطع الاتصال بعد أن بدأ المتحكم المنطقي الدفعة، فإعادة الإرسال تجرّعها مرتين. بوابتنا تعطي كل دفعة رقماً وتسأل عن حالة تلك الدفعة بدلاً من ذلك.",
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
