// Languages of the page: English, French and Arabic. English is the key; a missing translation
// falls back to it. Names, NodeIds, values and OPC UA status names come from the server and are
// never translated.

export const LANGS = ["en", "fr", "ar"];

const read = () => { try { return localStorage.getItem("lang"); } catch { return null; } };
const write = (value) => { try { localStorage.setItem("lang", value); } catch { /* storage unavailable */ } };

let fromQuery = null;
try { fromQuery = new URLSearchParams(location.search).get("lang"); } catch { /* no location */ }

let lang = LANGS.includes(fromQuery) ? fromQuery : read();
if (!LANGS.includes(lang)) lang = (navigator.language || "en").slice(0, 2).toLowerCase();
if (!LANGS.includes(lang)) lang = "en";
if (LANGS.includes(fromQuery)) write(fromQuery);

const listeners = [];

export const currentLang = () => lang;
export const onLangChange = (fn) => listeners.push(fn);
export const locale = () => (lang === "ar" ? "ar-u-nu-latn" : lang === "fr" ? "fr-FR" : "en-US");

export function setLang(next) {
  if (!LANGS.includes(next) || next === lang) return;
  lang = next;
  write(next);
  listeners.forEach((fn) => fn(lang));
}

/** Translates a sentence; {0}, {1} are replaced by the extra arguments. */
export function t(key, ...args) {
  const entry = STR[key];
  let text = lang === "en" || !entry ? key : entry[lang === "fr" ? 0 : 1] ?? key;
  if (args.length) text = text.replace(/\{(\d)\}/g, (_, i) => (args[i] ?? ""));
  return text;
}

// [French, Arabic]
const STR = {
  // top bar
  "Not connected": ["Non connecté", "غير متصل"],
  "Connected": ["Connecté", "متصل"],
  "Connecting": ["Connexion", "جارٍ الاتصال"],
  "Disconnecting": ["Déconnexion", "جارٍ قطع الاتصال"],
  "Reconnecting": ["Reconnexion", "جارٍ إعادة الاتصال"],
  "Tool not answering": ["L'outil ne répond pas", "الأداة لا تستجيب"],
  "No security": ["Sans sécurité", "بدون تأمين"],
  "anonymous": ["anonyme", "مجهول"],
  "user {0}": ["utilisateur {0}", "المستخدم {0}"],
  "Writing locked": ["Écriture verrouillée", "الكتابة مقفلة"],
  "Writing unlocked": ["Écriture déverrouillée", "الكتابة مفتوحة"],
  "Writing is locked. Click to unlock.": ["L'écriture est verrouillée. Cliquez pour déverrouiller.", "الكتابة مقفلة. انقر لفتحها."],
  "Values you write go to the controller. Click to lock again.": ["Les valeurs écrites partent vers l'automate. Cliquez pour reverrouiller.", "القيم التي تكتبها تذهب إلى المتحكم. انقر للقفل من جديد."],
  "Disconnect": ["Déconnecter", "قطع الاتصال"],
  "Language": ["Langue", "اللغة"],

  // connect screen
  "Connect to a server": ["Se connecter à un serveur", "الاتصال بخادم"],
  "Enter the address of the controller or OPC UA server. The tool asks it what it offers, then you choose how to connect.":
    ["Saisissez l'adresse de l'automate ou du serveur OPC UA. L'outil lui demande ce qu'il propose, puis vous choisissez comment vous connecter.",
     "أدخل عنوان المتحكم أو خادم OPC UA. تسأله الأداة عمّا يتيحه، ثم تختار طريقة الاتصال."],
  "Server address": ["Adresse du serveur", "عنوان الخادم"],
  "Look up": ["Interroger", "استعلام"],
  "User name": ["Nom d'utilisateur", "اسم المستخدم"],
  "(leave empty for anonymous)": ["(vide pour une connexion anonyme)", "(اتركه فارغاً للدخول دون اسم)"],
  "Password": ["Mot de passe", "كلمة المرور"],
  "Accept the server's certificate without checking it. Compare the thumbprint above with the one on the server first.":
    ["Accepter le certificat du serveur sans le vérifier. Comparez d'abord l'empreinte ci-dessus avec celle du serveur.",
     "قبول شهادة الخادم دون التحقق منها. قارن أولاً البصمة أعلاه مع بصمة الخادم."],
  "Connect": ["Se connecter", "اتصال"],
  "No controller at hand?": ["Pas d'automate sous la main ?", "لا يوجد متحكم أمامك؟"],
  "The tool comes with a small invented plant: two tanks, a packaging line, utilities and a thousand sensors. Values move and set points can be written.":
    ["L'outil embarque une petite usine fictive : deux cuves, une ligne de conditionnement, des utilités et mille capteurs. Les valeurs bougent et les consignes peuvent être écrites.",
     "تأتي الأداة بمصنع صغير افتراضي: خزانان وخط تعبئة ومرافق وألف حسّاس. القيم تتغير ويمكن كتابة القيم المطلوبة."],
  "Start the demo plant": ["Démarrer l'usine de démonstration", "تشغيل المصنع التجريبي"],
  "Stop the demo plant": ["Arrêter l'usine de démonstration", "إيقاف المصنع التجريبي"],
  "Running at {0}": ["En marche sur {0}", "يعمل على {0}"],
  "Encrypted connections": ["Connexions chiffrées", "الاتصالات المشفّرة"],
  "For Sign or Sign and Encrypt the server has to trust this tool's certificate. Download it and add it to the server's trusted clients.":
    ["Pour Sign ou Sign and Encrypt, le serveur doit faire confiance au certificat de cet outil. Téléchargez-le et ajoutez-le aux clients de confiance du serveur.",
     "في وضعي Sign و Sign and Encrypt يجب أن يثق الخادم بشهادة هذه الأداة. نزّلها وأضفها إلى قائمة العملاء الموثوقين في الخادم."],
  "Download the certificate": ["Télécharger le certificat", "تنزيل الشهادة"],
  "Version {0} · open62541 {1}": ["Version {0} · open62541 {1}", "الإصدار {0} · open62541 {1}"],
  "Sign and encrypt, {0}": ["Signature et chiffrement, {0}", "توقيع وتشفير، {0}"],
  "Sign, {0}": ["Signature, {0}", "توقيع، {0}"],
  "Sign-in: {0}": ["Identification : {0}", "الدخول: {0}"],
  "user name": ["nom d'utilisateur", "اسم مستخدم"],
  "none": ["aucune", "لا شيء"],
  "Server certificate {0}": ["Certificat du serveur {0}", "شهادة الخادم {0}"],
  "Not supported by this tool yet": ["Pas encore pris en charge par l'outil", "غير مدعوم في الأداة حالياً"],
  "The server answered but offers no endpoints.": ["Le serveur a répondu mais ne propose aucun point d'accès.", "أجاب الخادم لكنه لا يتيح أي نقطة اتصال."],
  "Connected to {0}": ["Connecté à {0}", "تم الاتصال بـ {0}"],
  "Disconnected": ["Déconnecté", "تم قطع الاتصال"],
  "The tool's service is not answering. Is it still running?": ["Le service de l'outil ne répond pas. Tourne-t-il encore ?", "خدمة الأداة لا تستجيب. هل ما زالت تعمل؟"],
  "Request failed ({0}).": ["La requête a échoué ({0}).", "فشل الطلب ({0})."],

  // tree
  "Address space": ["Espace d'adressage", "فضاء العناوين"],
  "Reload": ["Recharger", "إعادة التحميل"],
  "Switch between the Objects folder and the full root": ["Basculer entre le dossier Objects et la racine complète", "التبديل بين مجلد Objects والجذر الكامل"],
  "Read the tree again": ["Relire l'arborescence", "قراءة الشجرة من جديد"],
  "Select a node to see it.": ["Sélectionnez un nœud pour le voir.", "اختر عقدة لعرضها."],
  "List tags": ["Lister les variables", "سرد المتغيرات"],
  "scans everything under it.": ["parcourt tout ce qu'il contient.", "يمسح كل ما تحتها."],
  "Watch": ["Suivre", "مراقبة"],
  "Reading": ["Lecture", "جارٍ القراءة"],
  "Reading the address space": ["Lecture de l'espace d'adressage", "جارٍ قراءة فضاء العناوين"],
  "This server shows nothing here.": ["Ce serveur ne montre rien ici.", "لا يعرض الخادم شيئاً هنا."],

  // tags
  "Tags": ["Variables", "المتغيرات"],
  "{0} of {1}": ["{0} sur {1}", "{0} من {1}"],
  "Filter by name, path, NodeId, type or value": ["Filtrer par nom, chemin, NodeId, type ou valeur", "تصفية بالاسم أو المسار أو NodeId أو النوع أو القيمة"],
  "Hide properties": ["Masquer les propriétés", "إخفاء الخصائص"],
  "Refresh values": ["Relire les valeurs", "تحديث القيم"],
  "Watch selected": ["Suivre la sélection", "مراقبة المحدَّد"],
  "Watch {0} selected": ["Suivre les {0} sélectionnées", "مراقبة {0} محدَّدة"],
  "Export CSV": ["Exporter en CSV", "تصدير CSV"],
  "Stop": ["Arrêter", "إيقاف"],
  "Scan options": ["Options du parcours", "خيارات المسح"],
  "Depth": ["Profondeur", "العمق"],
  "Node limit": ["Limite de nœuds", "حد العقد"],
  "Read values": ["Lire les valeurs", "قراءة القيم"],
  "Include the Server object": ["Inclure l'objet Server", "تضمين كائن Server"],
  "Select all shown": ["Tout sélectionner", "تحديد كل المعروض"],
  "Name": ["Nom", "الاسم"],
  "Path": ["Chemin", "المسار"],
  "Type": ["Type", "النوع"],
  "Access": ["Accès", "الوصول"],
  "Value": ["Valeur", "القيمة"],
  "Quality": ["Qualité", "الجودة"],
  "Pick a folder in the address space and choose List tags.": ["Choisissez un dossier dans l'espace d'adressage puis Lister les variables.", "اختر مجلداً من فضاء العناوين ثم «سرد المتغيرات»."],
  "Scanning {0}: {1} nodes, {2} variables so far": ["Parcours de {0} : {1} nœuds, {2} variables pour l'instant", "جارٍ مسح {0}: {1} عقدة و{2} متغيراً حتى الآن"],
  "Reading types and values of {0} variables under {1}": ["Lecture des types et valeurs de {0} variables sous {1}", "جارٍ قراءة أنواع وقيم {0} متغيراً تحت {1}"],
  "{0} variables under {1}, {2} nodes visited in {3} s.": ["{0} variables sous {1}, {2} nœuds visités en {3} s.", "{0} متغيراً تحت {1}، زيارة {2} عقدة في {3} ث."],
  "No tag matches the filter.": ["Aucune variable ne correspond au filtre.", "لا يوجد متغير يطابق التصفية."],
  "Scanning": ["Parcours en cours", "جارٍ المسح"],
  "No tags listed yet.": ["Aucune variable listée pour l'instant.", "لم تُسرد أي متغيرات بعد."],
  "Values read again": ["Valeurs relues", "تمت قراءة القيم من جديد"],

  // watch
  "Values arrive as the server reports changes. Nothing is polled.": ["Les valeurs arrivent quand le serveur signale un changement. Rien n'est interrogé en boucle.", "تصل القيم عندما يبلّغ الخادم عن تغيّر. لا يوجد استعلام دوري."],
  "Remove all": ["Tout retirer", "إزالة الكل"],
  "Source time": ["Heure source", "وقت المصدر"],
  "Updates": ["Mises à jour", "التحديثات"],
  "Remove from the watch list": ["Retirer de la liste de suivi", "إزالة من قائمة المراقبة"],
  "The watch list is empty. Add tags from the tree, the tag list or the selected node.": ["La liste de suivi est vide. Ajoutez des variables depuis l'arborescence, la liste ou le nœud sélectionné.", "قائمة المراقبة فارغة. أضف متغيرات من الشجرة أو من القائمة أو من العقدة المحدَّدة."],
  "Already on the watch list": ["Déjà dans la liste de suivi", "موجود في قائمة المراقبة"],
  "Added to the watch list": ["Ajouté à la liste de suivi", "أُضيف إلى قائمة المراقبة"],
  "{0} tags added to the watch list": ["{0} variables ajoutées à la liste de suivi", "أُضيف {0} متغيراً إلى قائمة المراقبة"],

  // selected node
  "Selected node": ["Nœud sélectionné", "العقدة المحدَّدة"],
  "Nothing selected.": ["Rien de sélectionné.", "لا شيء محدَّد."],
  "Copy": ["Copier", "نسخ"],
  "Copied": ["Copié", "تم النسخ"],
  "Copying is not available here. Select the text instead.": ["La copie n'est pas disponible ici. Sélectionnez le texte.", "النسخ غير متاح هنا. حدّد النص يدوياً."],
  "(no value)": ["(aucune valeur)", "(لا قيمة)"],
  "source {0}": ["source {0}", "المصدر {0}"],
  "Read again": ["Relire", "قراءة من جديد"],
  "On the watch list": ["Dans la liste de suivi", "في قائمة المراقبة"],
  "Add to watch": ["Ajouter au suivi", "إضافة إلى المراقبة"],
  "Write a value ({0})": ["Écrire une valeur ({0})", "كتابة قيمة ({0})"],
  "{0} array": ["tableau de {0}", "مصفوفة {0}"],
  "unknown type": ["type inconnu", "نوع غير معروف"],
  "New value": ["Nouvelle valeur", "قيمة جديدة"],
  "Write": ["Écrire", "كتابة"],
  "Writing is locked. Unlock it in the top bar first.": ["L'écriture est verrouillée. Déverrouillez-la d'abord dans la barre du haut.", "الكتابة مقفلة. افتحها أولاً من الشريط العلوي."],
  "Description": ["Description", "الوصف"],
  "Write this value?": ["Écrire cette valeur ?", "كتابة هذه القيمة؟"],
  "New value: {0}": ["Nouvelle valeur : {0}", "القيمة الجديدة: {0}"],
  "It goes straight to the controller.": ["Elle part directement vers l'automate.", "تذهب مباشرة إلى المتحكم."],
  "Written: {0}": ["Écrit : {0}", "كُتبت: {0}"],
  "Refused": ["Refusé", "مرفوض"],
  "Write {0}: {1}": ["Écriture {0} : {1}", "كتابة {0}: {1}"],
  "Unlock writing?": ["Déverrouiller l'écriture ?", "فتح الكتابة؟"],
  "Values you write go straight to the controller and can move a machine. Unlock only when you know the installation is safe to write to.":
    ["Les valeurs écrites partent directement vers l'automate et peuvent faire bouger une machine. Ne déverrouillez que si vous savez que l'installation peut être écrite sans risque.",
     "القيم التي تكتبها تذهب مباشرة إلى المتحكم وقد تحرّك آلة. لا تفتح الكتابة إلا إذا كنت متأكداً أن الكتابة آمنة على المنشأة."],
  "Unlock": ["Déverrouiller", "فتح"],
  "Cancel": ["Annuler", "إلغاء"],
  "Activity": ["Activité", "النشاط"],
  "Clear": ["Effacer", "مسح"],

  // hosted demo
  "Online demo on a simulated plant. The real tool runs on your PC and connects to your own controllers.":
    ["Démo en ligne sur une usine simulée. Le vrai outil tourne sur votre PC et se connecte à vos propres automates.",
     "عرض تجريبي على مصنع محاكى. الأداة الحقيقية تعمل على حاسوبك وتتصل بمتحكماتك."],
  "Built by": ["Réalisé par", "من إنجاز"],
  "More apps": ["Autres applications", "تطبيقات أخرى"],
  "The simulated plant is ready. Its address is filled in: choose Connect.": ["L'usine simulée est prête. Son adresse est déjà saisie : choisissez Se connecter.", "المصنع المحاكى جاهز وعنوانه مُدخل: اختر «اتصال»."],
  "Things to try": ["À essayer", "جرّب"],
  "A simulated plant": ["Une usine simulée", "مصنع محاكى"],
  "List the tags of the whole plant, filter them, watch a tank level, then unlock writing and change its set point.":
    ["Listez les variables de toute l'usine, filtrez-les, suivez le niveau d'une cuve, puis déverrouillez l'écriture et changez sa consigne.",
     "اسرد متغيرات المصنع كله وصفِّها، وراقب مستوى أحد الخزانات، ثم افتح الكتابة وغيّر القيمة المطلوبة له."],
  "This online demo only reaches its simulated plant at {0}. The real tool connects to your own servers.":
    ["Cette démo en ligne n'atteint que son usine simulée, à l'adresse {0}. Le vrai outil se connecte à vos propres serveurs.",
     "هذا العرض لا يصل إلا إلى مصنعه المحاكى على العنوان {0}. الأداة الحقيقية تتصل بخوادمك."],
  "The address must start with opc.tcp://": ["L'adresse doit commencer par opc.tcp://", "يجب أن يبدأ العنوان بـ opc.tcp://"],
  "Enter the server address, for example opc.tcp://192.168.0.10:4840.": ["Saisissez l'adresse du serveur, par exemple opc.tcp://192.168.0.10:4840.", "أدخل عنوان الخادم، مثلاً opc.tcp://192.168.0.10:4840."],
  "The certificates were not accepted. Tick the box to accept the server's certificate.": ["Les certificats n'ont pas été acceptés. Cochez la case pour accepter le certificat du serveur.", "لم تُقبل الشهادات. ضع علامة لقبول شهادة الخادم."],
  "The server refused the sign-in. This endpoint needs a user name (any name works in the demo).": ["Le serveur a refusé l'identification. Ce point d'accès demande un nom d'utilisateur (n'importe lequel dans la démo).", "رفض الخادم الدخول. نقطة الاتصال هذه تتطلب اسم مستخدم (أي اسم يصلح في العرض)."],
  "Not connected to a server.": ["Pas de connexion à un serveur.", "لا يوجد اتصال بخادم."],
  "Writing is locked. Unlock it first.": ["L'écriture est verrouillée. Déverrouillez-la d'abord.", "الكتابة مقفلة. افتحها أولاً."],
  "The access level does not allow writing to the Node.": ["Le niveau d'accès n'autorise pas l'écriture sur ce nœud.", "مستوى الوصول لا يسمح بالكتابة على هذه العقدة."],
  "A scan is already running. Stop it first.": ["Un parcours est déjà en cours. Arrêtez-le d'abord.", "هناك مسح جارٍ. أوقفه أولاً."],
  "Stopped. The list shows what was found until then.": ["Arrêté. La liste montre ce qui avait été trouvé.", "تم الإيقاف. القائمة تعرض ما وُجد حتى تلك اللحظة."],
  "Stopped at the limit of {0} nodes. Scan a smaller branch or raise the limit.": ["Arrêt à la limite de {0} nœuds. Parcourez une branche plus petite ou relevez la limite.", "توقف المسح عند حد {0} عقدة. امسح فرعاً أصغر أو ارفع الحد."],
  "There are nodes deeper than {0} levels that were not visited.": ["Des nœuds situés au-delà de {0} niveaux n'ont pas été visités.", "توجد عقد أعمق من {0} مستويات لم تُزر."],
  "The server does not know {0}.": ["Le serveur ne connaît pas {0}.", "الخادم لا يعرف {0}."],
  "A Boolean is true or false (1 and 0 also work).": ["Un Boolean vaut true ou false (1 et 0 fonctionnent aussi).", "قيمة Boolean هي true أو false (ويصلح 1 و0)."],
  "'{0}' is not a whole number ({1}).": ["« {0} » n'est pas un nombre entier ({1}).", "«{0}» ليس عدداً صحيحاً ({1})."],
  "{0} does not fit in {1} ({2} to {3}).": ["{0} ne tient pas dans un {1} ({2} à {3}).", "{0} خارج مجال {1} (من {2} إلى {3})."],
  "'{0}' is not a {1} number.": ["« {0} » n'est pas un nombre {1}.", "«{0}» ليس عدداً من نوع {1}."],
  "A DateTime is written like 2026-01-31T14:30:00Z.": ["Un DateTime s'écrit comme 2026-01-31T14:30:00Z.", "يُكتب DateTime بهذا الشكل: 2026-01-31T14:30:00Z."],
  "'{0}' is not a Guid.": ["« {0} » n'est pas un Guid.", "«{0}» ليس Guid صالحاً."],
  "A ByteString is written in hexadecimal, for example 0A FF 10.": ["Un ByteString s'écrit en hexadécimal, par exemple 0A FF 10.", "يُكتب ByteString بالنظام الست عشري، مثلاً 0A FF 10."],
  "An array is written as a list in square brackets, for example [1, 2, 3].": ["Un tableau s'écrit comme une liste entre crochets, par exemple [1, 2, 3].", "تُكتب المصفوفة كقائمة بين قوسين مربعين، مثلاً [1, 2, 3]."],
  "Element {0}: {1}": ["Élément {0} : {1}", "العنصر {0}: {1}"],
  "The watch list holds at most {0} tags.": ["La liste de suivi contient au plus {0} variables.", "قائمة المراقبة تتسع لـ {0} متغيراً على الأكثر."],
  "'{0}' is not a NodeId. Examples: ns=2;s=Pump01.Speed or ns=3;i=1001.": ["« {0} » n'est pas un NodeId. Exemples : ns=2;s=Pump01.Speed ou ns=3;i=1001.", "«{0}» ليس NodeId صالحاً. أمثلة: ns=2;s=Pump01.Speed أو ns=3;i=1001."],
};
