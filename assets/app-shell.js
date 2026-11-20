'use strict';

/* =====================================================================
   App Shell กลางของระบบร้านยาจำลอง
   สร้าง sidebar + topbar ด้วย createElement/createElementNS (ไม่ใช้ innerHTML)
   เก็บค่าธีมใน localStorage key "drug-theme" และสถานะแถบเมนูใน "drug-sidebar"
   ===================================================================== */
(function initAppShell() {
  /* รายการเมนูหลักในแถบซ้าย — เพิ่มหรือแก้ได้บรรทัดเดียว */
  const NAV_ITEMS = [
    { href: 'index.html',     label: 'หน้าแรก',          icon: 'home' },
    { href: 'pos.html',       label: 'หน้าขายยา',        icon: 'pos' },
    { href: 'admin.html',     label: 'จัดการระบบ',       icon: 'admin' },
    { href: 'dashboard.html', label: 'Dashboard คลังยา', icon: 'dashboard' },
    { href: 'status.html',    label: 'ตรวจสถานะระบบ',    icon: 'status' },
  ];

  const SVG_NS = 'http://www.w3.org/2000/svg';
  const ICON_SHAPES = {
    brand: [
      ['path', { d: 'M10.5 20.5 3.5 13.5a4.95 4.95 0 0 1 7-7l7 7a4.95 4.95 0 0 1-7 7Z' }],
      ['path', { d: 'm8.5 8.5 7 7' }],
    ],
    home: [
      ['path', { d: 'M3 10.5 12 3l9 7.5' }],
      ['path', { d: 'M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5' }],
      ['path', { d: 'M9 21v-6h6v6' }],
    ],
    pos: [
      ['circle', { cx: '9', cy: '20', r: '1.4' }],
      ['circle', { cx: '18', cy: '20', r: '1.4' }],
      ['path', { d: 'M2 3h3l2.7 12.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6' }],
    ],
    admin: [
      ['path', { d: 'M12 3 4 7v5c0 5 3.5 8.5 8 9.5 4.5-1 8-4.5 8-9.5V7Z' }],
      ['path', { d: 'm9 12 2 2 4-4' }],
    ],
    dashboard: [
      ['rect', { x: '3', y: '3', width: '7', height: '9', rx: '1.5' }],
      ['rect', { x: '14', y: '3', width: '7', height: '5', rx: '1.5' }],
      ['rect', { x: '14', y: '12', width: '7', height: '9', rx: '1.5' }],
      ['rect', { x: '3', y: '16', width: '7', height: '5', rx: '1.5' }],
    ],
    status: [
      ['path', { d: 'M3 12h4l2.5-6 5 12 2.5-6H21' }],
    ],
    menu: [
      ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
      ['path', { d: 'M9 3v18' }],
      ['path', { d: 'm16 15-3-3 3-3' }],
    ],
    moon: [
      ['path', { d: 'M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z' }],
    ],
    sun: [
      ['circle', { cx: '12', cy: '12', r: '4' }],
      ['path', { d: 'M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4' }],
    ],
    info: [
      ['circle', { cx: '12', cy: '12', r: '9' }],
      ['path', { d: 'M12 11v5M12 8h.01' }],
    ],
  };

  function makeSvg(name, strokeWidth) {
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', String(strokeWidth || 2));
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    const shapes = ICON_SHAPES[name] || [];
    for (const [tag, attrs] of shapes) {
      const node = document.createElementNS(SVG_NS, tag);
      for (const [k, v] of Object.entries(attrs)) {
        node.setAttribute(k, v);
      }
      svg.appendChild(node);
    }
    return svg;
  }

  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } },
  };

  function currentPageFile() {
    const seg = (location.pathname || '').split('/').pop() || '';
    if (!seg || seg === '/') return 'index.html';
    const lower = seg.toLowerCase();
    return lower.includes('.') ? lower : lower + '.html';
  }

  /* ตั้งค่าธีมทันทีเพื่อลดการกะพริบ */
  const prefersDark = typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = store.get('drug-theme') || (prefersDark ? 'dark' : 'light');
  document.documentElement.dataset.theme = initialTheme;

  /* ประกอบโครง sidebar + topbar */
  const app = document.createElement('div');
  app.className = 'app';
  app.id = 'shell-app';
  if (store.get('drug-sidebar') === 'collapsed') {
    app.classList.add('collapsed');
  }

  /* --- Sidebar --- */
  const sidebar = document.createElement('aside');
  sidebar.className = 'sidebar';
  sidebar.id = 'shell-sidebar';
  sidebar.setAttribute('aria-label', 'เมนูหลักระบบร้านยา');

  const brand = document.createElement('a');
  brand.className = 'brand';
  brand.href = 'index.html';

  const brandIcon = document.createElement('div');
  brandIcon.className = 'brand-icon';
  brandIcon.appendChild(makeSvg('brand', 2.2));

  const brandText = document.createElement('div');
  const brandTitle = document.createElement('b');
  brandTitle.textContent = 'ร้านยาจำลอง';
  const brandSub = document.createElement('span');
  brandSub.textContent = 'Pharmacy Workshop';
  brandText.append(brandTitle, brandSub);
  brand.append(brandIcon, brandText);
  sidebar.appendChild(brand);

  const navLabel = document.createElement('div');
  navLabel.className = 'nav-label';
  navLabel.textContent = 'ระบบร้านยา';
  sidebar.appendChild(navLabel);

  const activeFile = currentPageFile();
  const navLinks = [];
  for (const item of NAV_ITEMS) {
    const a = document.createElement('a');
    a.className = 'nav-link';
    a.href = item.href;
    a.setAttribute('data-tip', item.label);
    if (item.href.toLowerCase() === activeFile) {
      a.classList.add('active');
      a.setAttribute('aria-current', 'page');
    }
    a.appendChild(makeSvg(item.icon));
    const lbl = document.createElement('span');
    lbl.className = 'lbl';
    lbl.textContent = item.label;
    a.appendChild(lbl);
    sidebar.appendChild(a);
    navLinks.push(a);
  }

  const foot = document.createElement('div');
  foot.className = 'sidebar-foot';
  foot.appendChild(makeSvg('info'));
  const footText = document.createElement('span');
  footText.textContent = 'ข้อมูลจำลอง ห้ามใส่ชื่อจริง';
  foot.appendChild(footText);
  sidebar.appendChild(foot);

  /* --- Main + Topbar --- */
  const mainWrap = document.createElement('div');
  mainWrap.className = 'main';
  mainWrap.id = 'shell-main';

  const topbar = document.createElement('header');
  topbar.className = 'topbar';
  topbar.id = 'shell-topbar';

  const menuBtn = document.createElement('button');
  menuBtn.type = 'button';
  menuBtn.className = 'icon-btn menu-btn';
  menuBtn.id = 'shell-menu-btn';
  menuBtn.setAttribute('aria-label', 'เก็บ/แสดงแถบเมนู');
  menuBtn.title = 'เก็บ/แสดงแถบเมนู (Ctrl+B)';
  menuBtn.appendChild(makeSvg('menu'));

  const titleBox = document.createElement('div');
  titleBox.className = 'topbar-title';

  const crumbText = document.body.dataset.shellCrumb || '';
  if (crumbText) {
    const crumb = document.createElement('div');
    crumb.className = 'crumb';
    crumb.textContent = crumbText;
    titleBox.appendChild(crumb);
  }
  const h1 = document.createElement('h1');
  h1.textContent = document.body.dataset.shellTitle || document.title;
  titleBox.appendChild(h1);

  const topbarEnd = document.createElement('div');
  topbarEnd.className = 'topbar-end';

  const topbarSlot = document.querySelector('[data-shell-topbar]');
  if (topbarSlot) {
    while (topbarSlot.firstChild) {
      topbarEnd.appendChild(topbarSlot.firstChild);
    }
    topbarSlot.remove();
  }

  const themeBtn = document.createElement('button');
  themeBtn.type = 'button';
  themeBtn.className = 'icon-btn theme';
  themeBtn.id = 'shell-theme-btn';
  themeBtn.setAttribute('aria-label', 'สลับโหมดมืด/สว่าง');
  topbarEnd.appendChild(themeBtn);

  topbar.append(menuBtn, titleBox, topbarEnd);
  mainWrap.appendChild(topbar);

  /* ย้ายเนื้อหาหลักของหน้าเข้าไปใน shell */
  const contentTarget = document.querySelector('[data-shell-content]');
  if (contentTarget) {
    mainWrap.appendChild(contentTarget);
  }

  app.append(sidebar, mainWrap);

  const scrim = document.createElement('div');
  scrim.className = 'scrim';
  scrim.id = 'shell-scrim';

  document.body.prepend(app, scrim);

  /* --- การสลับโหมดมืด/สว่าง --- */
  function applyTheme(t) {
    document.documentElement.dataset.theme = t;
    themeBtn.replaceChildren(makeSvg(t === 'dark' ? 'sun' : 'moon'));
    themeBtn.title = t === 'dark' ? 'เปลี่ยนเป็นโหมดสว่าง' : 'เปลี่ยนเป็นโหมดมืด';
  }
  applyTheme(initialTheme);

  themeBtn.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    store.set('drug-theme', next);
    applyTheme(next);
  });

  /* --- การพับเมนูบนจอใหญ่ และ drawer บนมือถือ --- */
  const isMobile = () => typeof matchMedia === 'function' && matchMedia('(max-width: 820px)').matches;

  function closeDrawer() {
    sidebar.classList.remove('show');
    scrim.classList.remove('show');
  }

  function toggleSidebar() {
    if (isMobile()) {
      const open = sidebar.classList.toggle('show');
      scrim.classList.toggle('show', open);
      return;
    }
    const collapsed = app.classList.toggle('collapsed');
    store.set('drug-sidebar', collapsed ? 'collapsed' : 'open');
  }

  menuBtn.addEventListener('click', toggleSidebar);
  scrim.addEventListener('click', closeDrawer);
  for (const link of navLinks) {
    link.addEventListener('click', closeDrawer);
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDrawer();
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
      e.preventDefault();
      toggleSidebar();
    }
  });
})();
