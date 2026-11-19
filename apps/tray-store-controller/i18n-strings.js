/* Interface text in French and Arabic. The app is written in English.
   Read by /portfolio/assets/i18n/cictna-i18n.js (see that file for the format). */
window.CI18N_CONFIG = {
  source: 'en',
  mount: '.top-inner .status',
  dict: {
    'Tray Store Controller | Simulation': { fr: 'Tray Store Controller | Simulation', ar: 'Tray Store Controller | محاكاة' },
    'Simulation': { fr: 'Simulation', ar: 'محاكاة' },
    'Ask for a product. The controller finds its tray, plans the moves to get it out, then sends them to the PLC one at a time and waits for each confirmation before sending the next.': {
      fr: "Demandez un produit. Le contrôleur trouve son plateau, planifie les mouvements pour le sortir, puis les envoie à l'automate un par un et attend chaque confirmation avant d'envoyer le suivant.",
      ar: 'اطلب منتجاً، فيجد البرنامج الصينية التي تحمله، ويخطط الحركات اللازمة لإخراجها، ثم يرسلها إلى جهاز PLC واحدة تلو الأخرى، ولا يرسل الحركة التالية قبل أن يصله تأكيد السابقة.' },
    'PLC link': { fr: 'Liaison automate', ar: 'اتصال PLC' },
    'OK': { fr: 'OK', ar: 'سليم' },
    'Down': { fr: 'Coupée', ar: 'مقطوع' },
    'Transfer devices at': { fr: 'Dispositifs de transfert en', ar: 'موقع أجهزة النقل' },
    'Store, front view': { fr: 'Magasin, vue de face', ar: 'المخزن من الأمام' },
    'Each cell is a channel of 12 trays, front end on the left': { fr: "Chaque case est un canal de 12 plateaux, l'avant à gauche", ar: 'كل خانة قناة تتسع لـ 12 صينية، وطرفها الأمامي على اليسار' },
    'Channel x0 y1, infeed': { fr: 'Canal x0 y1, entrée', ar: 'القناة x0 y1، الإدخال' },
    'Front transfer device, 12 tray positions, back transfer device': { fr: 'Dispositif de transfert avant, 12 positions, dispositif de transfert arrière', ar: 'جهاز النقل الأمامي، 12 موضعاً للصواني، جهاز النقل الخلفي' },
    'Front TD': { fr: 'Transfert avant', ar: 'النقل الأمامي' },
    'Back TD': { fr: 'Transfert arrière', ar: 'النقل الخلفي' },
    'Pick station': { fr: 'Poste de prélèvement', ar: 'محطة الأخذ' },
    'Idle': { fr: 'Au repos', ar: 'في الانتظار' },
    'Stock': { fr: 'Stock', ar: 'المخزون' },
    'Shared with the parent system': { fr: 'Partagé avec le système amont', ar: 'مشترك مع النظام الرئيسي' },
    'Speed': { fr: 'Vitesse', ar: 'السرعة' },
    'The next confirmation from the PLC will be lost': { fr: "La prochaine confirmation de l'automate sera perdue", ar: 'سيضيع التأكيد التالي القادم من جهاز PLC' },
    'Drop PLC link': { fr: 'Couper la liaison automate', ar: 'اقطع اتصال PLC' },
    'Next ACK will be lost': { fr: 'Le prochain ACK sera perdu', ar: 'سيضيع التأكيد التالي' },
    'Move plan': { fr: 'Plan des mouvements', ar: 'خطة الحركات' },
    'Request a product to see the plan': { fr: 'Demandez un produit pour voir le plan', ar: 'اطلب منتجاً لترى الخطة' },
    'PLC messages': { fr: 'Messages automate', ar: 'رسائل PLC' },
    'start,': { fr: 'début,', ar: 'البداية،' },
    'field separator,': { fr: 'séparateur de champs,', ar: 'فاصل الحقول،' },
    'XOR checksum,': { fr: 'somme de contrôle XOR,', ar: 'مجموع تحقق XOR،' },
    'end': { fr: 'fin', ar: 'النهاية' },
    'How the store works': { fr: 'Comment fonctionne le magasin', ar: 'كيف يعمل المخزن' },
    'The store is a grid of channels, addressed by column x and level y. Every channel holds 12 trays on plain rollers. Some trays carry product, others are empty.': {
      fr: "Le magasin est une grille de canaux, repérés par la colonne x et le niveau y. Chaque canal contient 12 plateaux sur des rouleaux libres. Certains plateaux portent du produit, d'autres sont vides.",
      ar: 'المخزن شبكة من القنوات، نحدد كل قناة برقم العمود x ورقم المستوى y. في كل قناة 12 صينية على بكرات حرة، بعضها يحمل منتجات وبعضها فارغ.' },
    'Two transfer devices, one at the front face and one at the back, always travel together to the same channel. Only they have powered rollers.': {
      fr: "Deux dispositifs de transfert, l'un à l'avant et l'autre à l'arrière, se déplacent toujours ensemble vers le même canal. Eux seuls ont des rouleaux motorisés.",
      ar: 'جهازا نقل، أحدهما في الواجهة الأمامية والآخر في الخلف، يتحركان دائماً معاً إلى القناة نفسها، وهما وحدهما مزوّدان ببكرات تعمل بمحرك.' },
    'When one transfer device pushes trays into a channel, the same number of trays comes out at the other end onto the other transfer device. Between them they always hold 2 trays.': {
      fr: "Quand un dispositif de transfert pousse des plateaux dans un canal, le même nombre de plateaux sort à l'autre bout sur l'autre dispositif. À eux deux, ils portent toujours 2 plateaux.",
      ar: 'عندما يدفع أحد جهازي النقل صوانيَ داخل قناة، يخرج العدد نفسه من الطرف الآخر إلى الجهاز الثاني. ويحمل الجهازان معاً صينيتين دائماً.' },
    'To reach a tray, the controller works from the nearer end. Blocking trays are cycled through the nearest channel until the target comes out, then it goes to the outfeed belt at x0 y2. After picking it comes back through the infeed at x0 y1.': {
      fr: "Pour atteindre un plateau, le contrôleur part de l'extrémité la plus proche. Les plateaux gênants passent par le canal voisin jusqu'à ce que la cible sorte, puis elle va sur le convoyeur de sortie en x0 y2. Après le prélèvement, elle revient par l'entrée en x0 y1.",
      ar: 'للوصول إلى صينية، يبدأ البرنامج من الطرف الأقرب إليها، وينقل الصواني المعترضة عبر أقرب قناة حتى تخرج الصينية المطلوبة، فتذهب إلى حزام الإخراج في x0 y2. وبعد أخذ المنتج تعود من حزام الإدخال في x0 y1.' },
    'Built by Talel Ksiksi,': { fr: 'Réalisé par Talel Ksiksi,', ar: 'من تطوير طلال كسيكسي،' },
    '. All data is simulated.': { fr: '. Toutes les données sont simulées.', ar: '. كل البيانات افتراضية.' },
    'Outfeed': { fr: 'Sortie', ar: 'إخراج' },
    'Infeed': { fr: 'Entrée', ar: 'إدخال' },
    'Request': { fr: 'Demander', ar: 'اطلب' },
    'x0 y1, infeed belt': { fr: "x0 y1, convoyeur d'entrée", ar: 'x0 y1، حزام الإدخال' },
    'x0 y2, outfeed belt': { fr: 'x0 y2, convoyeur de sortie', ar: 'x0 y2، حزام الإخراج' },
    'Front TD, belt, back TD': { fr: 'Transfert avant, convoyeur, transfert arrière', ar: 'النقل الأمامي، الحزام، النقل الخلفي' },
    'Front TD, tray positions 1 to 12, back TD': { fr: 'Transfert avant, positions 1 à 12, transfert arrière', ar: 'النقل الأمامي، المواضع من 1 إلى 12، النقل الخلفي' },
    'Controller online. PLC link established. Waiting for requests.': { fr: 'Contrôleur en ligne. Liaison automate établie. En attente de demandes.', ar: 'البرنامج يعمل والاتصال بجهاز PLC قائم. في انتظار الطلبات.' },
    'Reconnecting...': { fr: 'Reconnexion...', ar: 'جارٍ إعادة الاتصال...' },
    'Fault armed: the next confirmation from the PLC will be lost.': { fr: "Défaut armé : la prochaine confirmation de l'automate sera perdue.", ar: 'العطل جاهز: سيضيع التأكيد التالي القادم من جهاز PLC.' },
    // words used inside sentences
    'front': { fr: 'avant', ar: 'الأمامي' },
    'back': { fr: 'arrière', ar: 'الخلفي' },
    // sample products
    'Bearing 6204': { fr: 'Roulement 6204', ar: 'محمل 6204' },
    'Valve body V20': { fr: 'Corps de vanne V20', ar: 'جسم صمام V20' },
    'Seal kit S12': { fr: 'Kit de joints S12', ar: 'طقم جوانات S12' },
    'Proximity sensor PX3': { fr: 'Capteur de proximité PX3', ar: 'حساس اقتراب PX3' },
    'Gear wheel G40': { fr: 'Roue dentée G40', ar: 'ترس G40' },
    'Filter cartridge F8': { fr: 'Cartouche filtrante F8', ar: 'خرطوشة فلتر F8' }
  },
  patterns: [
    ['^(\\d+) units$', { fr: '$1 unités', ar: '$1 وحدة' }],
    ['^1 tray$', { fr: '1 plateau', ar: 'صينية واحدة' }],
    ['^(\\d+) trays$', { fr: '$1 plateaux', ar: '$1 صواني' }],
    ['^(T-\\d+), empty$', { fr: '$1, vide', ar: '$1، فارغة' }],
    ['^(T-\\d+), (.+), (\\d+) units$', { fr: '$1, $2, $3 unités', ar: '$1، $2، $3 وحدة' }],
    ['^Channel (x\\d+ y\\d+)$', { fr: 'Canal $1', ar: 'القناة $1' }],
    ['^(.+): (\\d+) PLC moves$', { fr: '$1 : $2 mouvements automate', ar: '$1: $2 حركة على PLC' }],
    ['^Target tray (T-\\d+) \\((.+)\\) is at position (\\d+) of 12 in (x\\d+ y\\d+)\\. Nearest end: (front|back), (\\d+) trays? in the way\\.$',
      { fr: 'Plateau cible $1 ($2) en position $3 sur 12 dans $4. Extrémité la plus proche : $5, $6 plateau(x) à déplacer.',
        ar: 'الصينية المطلوبة $1 ($2) في الموضع $3 من 12 داخل $4. أقرب طرف هو $5، وأمامها $6 صينية.' }],
    ['^Target tray (T-\\d+) \\((.+)\\) is already on the (front|back) transfer device\\.$',
      { fr: 'Le plateau cible $1 ($2) est déjà sur le dispositif de transfert $3.', ar: 'الصينية المطلوبة $1 ($2) موجودة أصلاً على جهاز النقل $3.' }],
    ['^Push (\\d+) from the (front|back) into (x\\d+ y\\d+), the nearest channel\\. \\d+ (?:trays come|tray comes) out at the (front|back), ready to push again\\.$',
      { fr: 'Pousser $1 depuis le côté $2 dans $3, le canal le plus proche. Autant de plateaux sortent côté $4, prêts à être repoussés.',
        ar: 'دفع $1 من الطرف $2 إلى $3، أقرب قناة. يخرج العدد نفسه من الطرف $4، جاهزاً للدفع من جديد.' }],
    ['^Push (\\d+) from the (front|back) into (x\\d+ y\\d+)\\. \\d+ blocking (?:trays come|tray comes) out at the (front|back)\\.$',
      { fr: 'Pousser $1 depuis le côté $2 dans $3. Les plateaux gênants sortent côté $4.', ar: 'دفع $1 من الطرف $2 إلى $3. تخرج الصواني المعترضة من الطرف $4.' }],
    ['^Push (\\d+) from the (front|back) into (x\\d+ y\\d+)\\. Target tray (T-\\d+) comes out at the (front|back)\\.$',
      { fr: 'Pousser $1 depuis le côté $2 dans $3. Le plateau cible $4 sort côté $5.', ar: 'دفع $1 من الطرف $2 إلى $3. تخرج الصينية المطلوبة $4 من الطرف $5.' }],
    ['^Push (\\d+) from the (front|back) into (x\\d+ y\\d+) so (T-\\d+) sits at the edge of the (front|back) transfer device\\.$',
      { fr: 'Pousser $1 depuis le côté $2 dans $3 pour amener $4 au bord du dispositif de transfert $5.', ar: 'دفع $1 من الطرف $2 إلى $3 حتى تصل $4 إلى حافة جهاز النقل $5.' }],
    ['^Push (T-\\d+) from the (front|back) onto the outfeed belt at x0 y2\\.$',
      { fr: 'Pousser $1 depuis le côté $2 sur le convoyeur de sortie en x0 y2.', ar: 'دفع $1 من الطرف $2 إلى حزام الإخراج في x0 y2.' }],
    ['^Operator picks 1 × (.+) from (T-\\d+)\\.$', { fr: "L'opérateur prélève 1 × $1 dans $2.", ar: 'يأخذ العامل 1 × $1 من $2.' }],
    ['^Take (T-\\d+) back from the infeed belt at x0 y1 onto the (front|back) transfer device\\.$',
      { fr: "Reprendre $1 depuis le convoyeur d'entrée en x0 y1 sur le dispositif de transfert $2.", ar: 'إرجاع $1 من حزام الإدخال في x0 y1 إلى جهاز النقل $2.' }],
    ['^Request from parent system: ([A-Z0-9-]+)\\. Planned (\\d+) moves for (T-\\d+)\\.$',
      { fr: 'Demande du système amont : $1. $2 mouvements planifiés pour $3.', ar: 'طلب من النظام الرئيسي: $1. خطة من $2 حركة للصينية $3.' }],
    ['^Queued: (.+)$', { fr: 'En attente : $1', ar: 'في الانتظار: $1' }],
    ['^(T-\\d+) arriving on the outfeed belt$', { fr: '$1 arrive sur le convoyeur de sortie', ar: '$1 في طريقها إلى حزام الإخراج' }],
    ['^Picking 1 × (.+) from (T-\\d+)$', { fr: 'Prélèvement de 1 × $1 dans $2', ar: 'جارٍ أخذ 1 × $1 من $2' }],
    ['^Picked 1 × (.+)\\. (T-\\d+): (\\d+) → (\\d+) units, sending tray back\\.$',
      { fr: '1 × $1 prélevé. $2 : $3 → $4 unités, retour du plateau.', ar: 'تم أخذ 1 × $1. في $2 الآن $4 وحدة بعد $3، والصينية في طريق العودة.' }],
    ['^Pick confirmed: 1 × ([A-Z0-9-]+) from (T-\\d+)$', { fr: 'Prélèvement confirmé : 1 × $1 dans $2', ar: 'تأكيد الأخذ: 1 × $1 من $2' }],
    ['^Request ([A-Z0-9-]+) complete\\.$', { fr: 'Demande $1 terminée.', ar: 'اكتمل الطلب $1.' }],
    ['^No ACK for (#\\d+) within 1\\.5 s\\. Holding the sequence, link down\\.$',
      { fr: "Pas d'ACK pour $1 en 1,5 s. Séquence suspendue, liaison coupée.", ar: 'لم يصل تأكيد الرسالة $1 خلال 1.5 ثانية. توقفت السلسلة والاتصال مقطوع.' }],
    ['^Link restored\\. Asking the PLC what happened to (#\\d+) before sending anything new\\.$',
      { fr: "Liaison rétablie. On demande à l'automate ce qu'est devenu $1 avant d'envoyer quoi que ce soit.", ar: 'عاد الاتصال. نسأل جهاز PLC عمّا حدث للرسالة $1 قبل إرسال أي شيء جديد.' }],
    ['^(#\\d+) was already executed\\. Not resending it, continuing with the next move\\.$',
      { fr: '$1 était déjà exécuté. Pas de renvoi, on passe au mouvement suivant.', ar: 'الرسالة $1 نُفِّذت من قبل، فلن نعيد إرسالها وننتقل إلى الحركة التالية.' }],
    ['^No stock for (.+)$', { fr: 'Pas de stock pour $1', ar: 'لا يوجد مخزون لـ $1' }]
  ],
  // The machine view, the tray strip and the telegram log keep their physical left-to-right layout.
  css: 'html[dir=rtl] .grid-wrap,html[dir=rtl] .xlabels,html[dir=rtl] .lane,html[dir=rtl] .pos-scale,html[dir=rtl] .log{direction:ltr;text-align:left}html[dir=rtl] .log .note,html[dir=rtl] .log .bad{unicode-bidi:isolate;direction:rtl;display:inline-block}' +
       'html[dir=rtl] .xlabels,html[dir=rtl] .pos-scale{text-align:left}' +
       'html[dir=rtl] .badge{margin-left:0;margin-right:.35rem}' +
       'html[dir=rtl] .pick b{margin-right:0;margin-left:.4rem}' +
       'html[dir=rtl] .pmeta{text-align:left}' +
       'html[dir=rtl] .speed span{margin-right:0;margin-left:4px}' +
       'html[dir=rtl] .plan{padding-left:0;padding-right:1.4rem}' +
       'html[dir=rtl] .plan > p.hint{margin:0 -1.4rem 6px 0!important}' +
       'html[dir=rtl] .how ul{padding-left:0;padding-right:1.2rem}' +
       '.top-inner .status .ci18n-switch{margin-inline-start:4px}'
};
