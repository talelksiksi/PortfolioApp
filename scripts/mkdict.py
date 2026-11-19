# python3 mkdict.py dict.py out.js  -> writes window.CI18N_CONFIG from D (dict of source -> (lang1, lang2)) and P (patterns)
import json, sys, importlib.util
spec = importlib.util.spec_from_file_location('d', sys.argv[1]); m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
SRC = getattr(m, 'SOURCE', 'fr'); TARGETS = getattr(m, 'TARGETS', ('en', 'ar'))
cfg = {'source': SRC}
for k in ('MOUNT', 'SKIP', 'CSS'):
    if hasattr(m, k): cfg[k.lower()] = getattr(m, k)
lines = []
lines.append('/* Interface text in ' + ' and '.join({'en':'English','fr':'French','ar':'Arabic'}[t] for t in TARGETS) + '. Generated from i18n/strings.py; edit that file. */')
lines.append('window.CI18N_CONFIG = {')
for k, v in cfg.items(): lines.append(f'  {k}: {json.dumps(v, ensure_ascii=False)},')
lines.append('  dict: {')
items = list(m.D.items())
for i, (k, v) in enumerate(items):
    e = {t: v[j] for j, t in enumerate(TARGETS)}
    lines.append(f'    {json.dumps(k, ensure_ascii=False)}: {json.dumps(e, ensure_ascii=False)}' + (',' if i < len(items) - 1 else ''))
lines.append('  },')
lines.append('  patterns: [')
for i, (rx, v) in enumerate(m.P):
    e = {t: v[j] for j, t in enumerate(TARGETS)}
    lines.append(f'    [{json.dumps(rx, ensure_ascii=False)}, {json.dumps(e, ensure_ascii=False)}]' + (',' if i < len(m.P) - 1 else ''))
lines.append('  ]')
lines.append('};')
if hasattr(m, 'EXTRA'): lines.append(m.EXTRA)
open(sys.argv[2], 'w', encoding='utf-8').write('\n'.join(lines) + '\n')
print(len(m.D), 'entries,', len(m.P), 'patterns ->', sys.argv[2])
