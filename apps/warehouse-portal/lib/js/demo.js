/* Warehouse Management Portal, demo behaviour.
   Shared by every page: banner, mobile menu, dropdowns, table filters,
   select-all, CSV export, "Lines" pop-up and read-only notices. */
(function () {
  'use strict';

  function txt(el) { return el ? (el.textContent || '').replace(/\s+/g, ' ').trim() : ''; }
  function $all(sel, root) { return [].slice.call((root || document).querySelectorAll(sel)); }

  /* ---------- banner and toast ---------- */
  var bar = document.createElement('div');
  bar.className = 'demo-bar';
  bar.innerHTML = '<b>Interactive demo</b> with sample data. Built by Talel Ksiksi, <a href="https://cictnardc.net">CICTNA RDC</a>.';
  document.body.appendChild(bar);

  var toastEl = document.getElementById('demoToast'), toastTimer;
  function toast(m) {
    if (!toastEl) return;
    toastEl.textContent = m;
    toastEl.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('on'); }, 2600);
  }
  var READ_ONLY = 'Read-only demo: saving and editing are turned off.';

  /* ---------- mobile menu (navbar toggler) ---------- */
  $all('.navbar-toggler').forEach(function (btn) {
    var nav = btn.closest('nav');
    var panel = nav && nav.querySelector('.navbar-collapse');
    if (!panel) return;
    btn.dataset.handled = '1';
    btn.setAttribute('aria-label', 'Menu');
    btn.setAttribute('aria-expanded', 'false');
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var open = panel.classList.toggle('show');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });

  /* ---------- dropdowns ---------- */
  function closeDropdowns(except) {
    $all('.dropdown-menu.show').forEach(function (m) { if (m !== except) m.classList.remove('show'); });
  }
  $all('.dropdown-toggle').forEach(function (a) {
    a.dataset.handled = '1';
    a.addEventListener('click', function (e) {
      e.preventDefault();
      var m = a.parentElement.querySelector('.dropdown-menu');
      if (!m) return;
      var open = m.classList.contains('show');
      closeDropdowns(m);
      m.classList.toggle('show', !open);
    });
  });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.dropdown')) closeDropdowns();
  });

  /* ---------- sales order "Edit" goes to the order form ---------- */
  if (location.pathname.indexOf('sales-orders') > -1) {
    $all('tr a.btn').forEach(function (a) { if (txt(a) === 'Edit') a.href = 'sales-order.html'; });
  }

  /* ---------- table filters ---------- */
  var search = document.getElementById('searchInput');
  var filterBar = search ? (search.closest('.row') || search.closest('.d-flex') || search.parentElement) : null;
  var table = filterBar ? nextTable(filterBar) : null;

  function nextTable(start) {
    var el = start;
    while (el) {
      if (el.matches && el.matches('table')) return el;
      var t = el.querySelector && el.querySelector('table');
      if (t) return t;
      el = el.nextElementSibling;
    }
    return document.querySelector('table.table');
  }

  if (table && table.tHead && table.tBodies[0]) {
    var heads = [].map.call(table.tHead.rows[0].cells, txt);
    var body = table.tBodies[0];
    var rows = [].slice.call(body.rows);
    var filters = [];

    var colOf = function (names) {
      for (var i = 0; i < names.length; i++) {
        var k = heads.indexOf(names[i]);
        if (k > -1) return k;
      }
      return -1;
    };
    var cellText = function (r, i) { return txt(r.cells[i]); };
    var cellChecked = function (r, i) {
      var cb = r.cells[i] && r.cells[i].querySelector('input[type=checkbox]');
      return !!(cb && cb.checked);
    };
    var isoDate = function (s) {
      var m = /(\d{2})-(\d{2})-(\d{4})/.exec(s || '');
      return m ? m[3] + '-' + m[2] + '-' + m[1] : '';
    };
    var fill = function (sel, values) {
      values.forEach(function (v) {
        var o = document.createElement('option');
        o.value = v; o.textContent = v;
        sel.appendChild(o);
      });
    };
    var distinct = function (i) {
      var seen = {};
      rows.forEach(function (r) { var v = cellText(r, i); if (v && v !== '-') seen[v] = 1; });
      return Object.keys(seen).sort(function (a, b) { return a.localeCompare(b); });
    };

    // Dropdowns that the original app filled at runtime: fill them from the table.
    var byColumn = {
      locationFilter: ['Location', 'Pick location'],
      companyFilter: ['Company'],
      countryFilter: ['Country'],
      actionFilter: ['Action']
    };
    Object.keys(byColumn).forEach(function (id) {
      var sel = document.getElementById(id);
      var i = colOf(byColumn[id]);
      if (!sel || i < 0) return;
      if (sel.options.length <= 1) fill(sel, distinct(i));
      filters.push(function (r) { return !sel.value || cellText(r, i) === sel.value; });
      sel.dataset.filter = '1';
    });

    // Blocked yes/no (current stock).
    var blockedSel = document.getElementById('blockedFilter');
    var blockedCol = colOf(['Blocked']);
    if (blockedSel && blockedCol > -1) {
      if (blockedSel.options.length <= 1) {
        blockedSel.add(new Option('Blocked', 'yes'));
        blockedSel.add(new Option('Not blocked', 'no'));
      }
      filters.push(function (r) {
        if (!blockedSel.value) return true;
        return cellChecked(r, blockedCol) === (blockedSel.value === 'yes');
      });
      blockedSel.dataset.filter = '1';
    }

    // Order status: pending or completed.
    var statusSel = document.getElementById('statusFilter');
    var doneCol = colOf(['Completed']);
    if (statusSel && doneCol > -1) {
      if (!statusSel.querySelector('option[value="true"]')) statusSel.add(new Option('Completed', 'true'));
      filters.push(function (r) {
        if (!statusSel.value) return true;
        return cellChecked(r, doneCol) === (statusSel.value === 'true');
      });
      statusSel.dataset.filter = '1';
    }

    // Date range on the main date column.
    var dFrom = document.getElementById('dateFromFilter');
    var dTo = document.getElementById('dateToFilter');
    var dateCol = colOf(['Storage date', 'Date created', 'Timestamp']);
    if ((dFrom || dTo) && dateCol > -1) {
      filters.push(function (r) {
        var d = isoDate(cellText(r, dateCol));
        if (!d) return true;
        if (dFrom && dFrom.value && d < dFrom.value) return false;
        if (dTo && dTo.value && d > dTo.value) return false;
        return true;
      });
    }

    // Pre-filled filters on the master data pages: match the column named by the label.
    $all('select.demo-filter', filterBar).forEach(function (sel) {
      var wrap = sel.parentElement;
      var label = txt(wrap && wrap.querySelector('label'));
      var i = colOf([label, label === 'Packaging' ? 'Packaging type' : label]);
      filters.push(function (r) {
        if (!sel.value) return true;
        if (i > -1) return cellText(r, i) === sel.value;
        return txt(r).toLowerCase().indexOf(sel.value.toLowerCase()) > -1;
      });
      sel.dataset.filter = '1';
    });

    // "Nothing matches" row.
    var emptyRow = document.createElement('tr');
    emptyRow.className = 'demo-empty demo-hidden';
    emptyRow.innerHTML = '<td colspan="' + heads.length + '" class="text-center text-muted py-4">No rows match these filters.</td>';
    body.appendChild(emptyRow);

    var visibleRows = function () {
      return rows.filter(function (r) { return !r.classList.contains('demo-hidden'); });
    };

    var apply = function () {
      var q = search ? search.value.trim().toLowerCase() : '';
      var shown = 0;
      rows.forEach(function (r) {
        var ok = (!q || txt(r).toLowerCase().indexOf(q) > -1) &&
          filters.every(function (f) { return f(r); });
        r.classList.toggle('demo-hidden', !ok);
        if (ok) shown++;
        else { var cb = r.querySelector('.row-select'); if (cb) cb.checked = false; }
      });
      emptyRow.classList.toggle('demo-hidden', shown > 0);
      updateBulk();
    };

    if (search) search.addEventListener('input', apply);
    $all('select, input[type=date]', filterBar).forEach(function (el) {
      el.addEventListener('change', apply);
      el.addEventListener('input', apply);
    });

    // Reset / clear button (the one with the "times" icon).
    $all('button', filterBar).forEach(function (b) {
      if (!b.querySelector('.fa-times')) return;
      b.dataset.handled = '1';
      b.addEventListener('click', function (e) {
        e.preventDefault();
        if (search) search.value = '';
        $all('select', filterBar).forEach(function (s) { s.value = ''; });
        $all('input[type=date]', filterBar).forEach(function (d) { d.value = ''; });
        apply();
      });
    });

    /* ---------- select all + bulk actions ---------- */
    var selectAll = document.getElementById('selectAll');
    var bulk = document.getElementById('bulkActions');
    var bulkCount = document.getElementById('bulkCount');
    function updateBulk() {
      var n = $all('.row-select', body).filter(function (c) { return c.checked; }).length;
      if (bulkCount) bulkCount.textContent = n;
      if (bulk) { bulk.classList.toggle('d-none', n === 0); bulk.classList.toggle('d-flex', n > 0); }
      if (selectAll) {
        var vis = visibleRows().length;
        selectAll.checked = n > 0 && n === vis;
        selectAll.indeterminate = n > 0 && n < vis;
      }
    }
    if (selectAll) {
      selectAll.addEventListener('change', function () {
        visibleRows().forEach(function (r) {
          var cb = r.querySelector('.row-select');
          if (cb) cb.checked = selectAll.checked;
        });
        updateBulk();
      });
    }
    body.addEventListener('change', function (e) {
      if (e.target.classList.contains('row-select')) updateBulk();
    });

    /* ---------- CSV export of the visible rows ---------- */
    var exportCols = heads.map(function (h, i) { return i; }).filter(function (i) {
      var h = heads[i];
      return h && h !== 'Actions' && h !== 'Snapshot' && !(table.tHead.rows[0].cells[i].querySelector('input'));
    });
    var csvCell = function (r, i) {
      var c = r.cells[i];
      if (!c) return '';
      var cb = c.querySelector('input[type=checkbox]');
      var dt = c.querySelector('input[type=date]');
      var v = cb ? (cb.checked ? 'Yes' : 'No') : dt ? dt.value : txt(c);
      return /[",;\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
    };
    var downloadCsv = function () {
      var lines = [exportCols.map(function (i) { return heads[i]; }).join(',')];
      visibleRows().forEach(function (r) { lines.push(exportCols.map(function (i) { return csvCell(r, i); }).join(',')); });
      var name = (document.title.split('|')[0].trim() || 'export').toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.csv';
      var blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = name;
      document.body.appendChild(a);
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
      toast('Exported ' + (lines.length - 1) + ' rows to ' + name + '.');
    };
    $all('button', filterBar).forEach(function (b) {
      if (b.querySelector('.fa-file-csv')) {
        b.dataset.handled = '1';
        b.addEventListener('click', function (e) { e.preventDefault(); downloadCsv(); });
      }
    });

    apply();
  }

  /* ---------- analytics page: fixed snapshot ---------- */
  if (location.pathname.indexOf('analytics') > -1) {
    $all('#dateFrom, #dateTo, #companyId, #locationId').forEach(function (el) {
      el.addEventListener('change', function () {
        toast('The analytics page shows one fixed sample snapshot, so its filters are not active in the demo.');
      });
    });
  }

  /* ---------- email buttons ---------- */
  $all('button').forEach(function (b) {
    if (b.querySelector('.fa-envelope')) {
      b.dataset.handled = '1';
      b.addEventListener('click', function (e) {
        e.preventDefault();
        toast('Email is turned off in the demo. The real app sends the filtered list as a CSV attachment.');
      });
    }
  });

  /* ---------- blocked checkboxes inside rows are read-only ---------- */
  $all('table .blocked-checkbox').forEach(function (cb) {
    cb.addEventListener('click', function (e) { e.preventDefault(); toast(READ_ONLY); });
  });

  /* ---------- order lines pop-up ---------- */
  var PRODS = ['PX-110', 'PX-117', 'PX-124', 'PX-131', 'PX-145', 'PX-152', 'PX-166', 'PX-173', 'PX-180', 'PX-187', 'PX-194', 'AX-120'];
  function showLines(row) {
    var c = [].map.call(row.cells, txt);
    var head = [].map.call(row.closest('table').tHead.rows[0].cells, txt);
    var g = function (n) { var i = head.indexOf(n); return i >= 0 ? c[i] : ''; };
    var code = g('Unique Order Code'), qty = parseInt((g('Qty expected') || '0').replace(/,/g, ''), 10) || 12, comp = g('Company');
    var seed = parseInt(g('Id'), 10) || 7, n = 1 + seed % 3, lines = [], left = qty;
    for (var k = 0; k < n; k++) {
      var q = k === n - 1 ? left : Math.max(1, Math.round(qty / n));
      left -= q;
      lines.push([k + 1, PRODS[(seed * 3 + k * 5) % PRODS.length], 'L26-' + (4100 + ((seed * 13 + k * 7) % 300)), q]);
    }
    var m = document.getElementById('demoModal');
    if (!m) {
      m = document.createElement('div');
      m.id = 'demoModal';
      m.className = 'demo-modal';
      document.body.appendChild(m);
      m.addEventListener('click', function (ev) {
        if (ev.target === m || ev.target.closest('[data-close]')) m.classList.remove('on');
      });
    }
    m.innerHTML = '<div class="demo-modal-box" role="dialog" aria-modal="true"><div class="d-flex justify-content-between align-items-center mb-3"><h5 class="mb-0">Lines, ' + code +
      '</h5><button class="btn btn-sm btn-outline-secondary" data-close data-handled="1">Close</button></div><p class="text-muted small mb-2">' + comp +
      '</p><table class="table table-sm"><thead class="table-light"><tr><th>#</th><th>Product</th><th>Batch</th><th class="text-end">Qty</th></tr></thead><tbody>' +
      lines.map(function (l) { return '<tr><td>' + l[0] + '</td><td class="fw-semibold">' + l[1] + '</td><td>' + l[2] + '</td><td class="text-end">' + l[3].toLocaleString('en') + '</td></tr>'; }).join('') +
      '</tbody></table></div>';
    m.classList.add('on');
  }

  /* ---------- everything else: navigation or a read-only notice ---------- */
  document.addEventListener('click', function (e) {
    var el = e.target.closest('button, a');
    if (!el || el.dataset.handled) return;
    var label = txt(el);
    if (label === 'History') {
      var row = el.closest('tr');
      if (row) { e.preventDefault(); location.href = 'stock-history.html?id=' + txt(row.cells[1]); return; }
    }
    if (label === 'Lines') {
      var r2 = el.closest('tr');
      if (r2) { e.preventDefault(); showLines(r2); return; }
    }
    if (el.matches('[data-demo]')) { e.preventDefault(); toast('This screen is not included in the demo.'); return; }
    if (el.closest('.demo-bar')) return;
    var href = el.getAttribute('href');
    if (el.tagName === 'A' && href && href !== '#') return;
    e.preventDefault();
    toast(READ_ONLY);
  });

  document.querySelectorAll('form').forEach(function (f) {
    f.addEventListener('submit', function (e) { e.preventDefault(); toast(READ_ONLY); });
  });
})();
