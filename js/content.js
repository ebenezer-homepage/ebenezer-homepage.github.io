/* ================================================
   content.js — content.json을 읽어 홈페이지 렌더
   저장 위치: GitHub repo의 content.json (모든 기기 공유)
   ================================================ */

const DEFAULTS = {
  beethoven: { images: ['','','','',''], youtubeUrl: '' },
  portfolio: [],
  videos: [],
  info: { phone:'1544-0481', hours:'평일 09:00 - 18:00', address:'전국 어디서나 상담 가능', kakao:'#', copyright:'© 2026 에벤에셀 EBENEZER. All rights reserved.', footerHours:'평일 09:00 - 18:00' },
  customText: {}
};

/* content.json을 우선 로드, 없으면 localStorage, 없으면 기본값 */
let _content = null;

async function loadContent() {
  /* 1순위: content.json (GitHub에서 서빙 — 모든 기기 동일) */
  try {
    const jsonUrl = new URL('content.json', location.href).href;
    const resp = await fetch(jsonUrl, { cache: 'no-store' });
    if (resp.ok) {
      _content = await resp.json();
      return;
    }
  } catch(e) {}

  /* 2순위: localStorage (이전 저장 데이터) */
  _content = {};
  ['portfolio','videos','info','customText','images','beethoven'].forEach(k => {
    try {
      const v = localStorage.getItem('eb_' + k);
      if (v) _content[k] = JSON.parse(v);
    } catch(e) {}
  });
}

function get(key) {
  return (_content && _content[key] !== undefined) ? _content[key] : DEFAULTS[key];
}

/* ── 렌더 함수들 ── */
function renderPortfolio() {
  const grid = document.getElementById('portfolioGrid');
  if (!grid) return;
  const items = get('portfolio');
  if (!items.length) { grid.innerHTML = '<p style="text-align:center;color:#aaa;padding:40px;grid-column:1/-1">등록된 시공사례가 없습니다.</p>'; return; }
  grid.innerHTML = items.map(p => {
    const extras = [p.photo2, p.photo3, p.photo4].filter(Boolean);
    const gallery = extras.length
      ? `<div class="port-gallery">${extras.map(src => `<img src="${src}" alt="${p.title}" loading="lazy">`).join('')}</div>`
      : '';
    const ytBtn = p.youtubeUrl
      ? `<a href="${p.youtubeUrl}" target="_blank" rel="noopener" class="port-yt-badge">▶ 시공 영상 보기</a>`
      : '';
    return `
    <div class="port-item reveal">
      <div class="port-img-wrap">
        <img src="${p.img}" alt="${p.title}" loading="lazy">
        <div class="port-overlay">
          <div>
            <span class="port-tag">${p.type || ''}</span>
            <span class="port-title">${p.title}</span>
            <span class="port-info">${p.size} · ${p.style || ''}</span>
          </div>
        </div>
      </div>
      ${gallery}${ytBtn}
    </div>`;
  }).join('');
}

function renderVideos() {
  const grid = document.getElementById('videoGrid');
  if (!grid) return;
  const items = get('videos').filter(v => v.youtubeId && v.youtubeId.trim());
  if (!items.length) {
    grid.innerHTML = '<div class="video-empty">아직 등록된 영상이 없습니다.<br><small>관리자 패널에서 유튜브 영상을 추가하세요.</small></div>';
    return;
  }
  grid.innerHTML = items.map(v => {
    const thumb = `https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg`;
    return `
      <div class="video-card">
        <div class="video-thumb" onclick="openVideo('${v.youtubeId}')">
          <img src="${thumb}" alt="${v.title}" loading="lazy">
          <div class="video-play-btn">▶</div>
        </div>
        <div class="video-info"><h4>${v.title}</h4><span>유튜브 영상 보기</span></div>
      </div>`;
  }).join('');
}

function openVideo(id) { window.open(`https://www.youtube.com/watch?v=${id}`, '_blank'); }

function renderBeethovenGallery() {
  const bData = get('beethoven') || { images: [], youtubeUrl: '' };
  const photos = (bData.images || []).filter(Boolean);
  const ytUrl  = (bData.youtubeUrl || '').trim();

  const galleryEl = document.getElementById('beethovenGallery');
  if (galleryEl) {
    if (photos.length) {
      galleryEl.innerHTML = photos.map(src => `<img src="${src}" alt="베토벤프로젝트" loading="lazy">`).join('');
      galleryEl.style.display = 'grid';
    } else {
      galleryEl.style.display = 'none';
    }
  }

  const ytEl = document.getElementById('beethovenYT');
  if (ytEl) {
    if (ytUrl) { ytEl.href = ytUrl; ytEl.style.display = 'inline-flex'; }
    else ytEl.style.display = 'none';
  }
}

function applyImages() {
  const images = get('images') || {};
  if (images.aboutImg) {
    const el = document.getElementById('aboutImg');
    if (el) el.src = images.aboutImg;
  }
}

function applyInfo() {
  const info = get('info');
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  const setHref = (id, val) => { const el = document.getElementById(id); if (el) { el.textContent = val; el.href = 'tel:' + val.replace(/[^0-9]/g,''); } };
  setHref('headerPhone',  info.phone);
  setHref('heroPhone',    info.phone);
  setHref('contactPhone', info.phone);
  setHref('footerPhone',  info.phone);
  setHref('footerPhone2', info.phone);
  setHref('ctaPhone',     info.phone);
  set('contactHours',   info.hours);
  set('contactAddr',    info.address);
  set('footerHours',    info.footerHours || info.hours);
  set('footerCopyright',info.copyright);
  const kakao = document.getElementById('footerKakao');
  if (kakao && info.kakao) kakao.href = info.kakao;
}

function applyCustomText() {
  const ct = get('customText');
  const fields = [
    'heroTitle','heroSub','aboutTitle','aboutLead','aboutDesc',
    'ctaTitle','ctaDesc','footerTagline','stat1Label','stat2Label',
  ];
  fields.forEach(id => {
    if (ct[id]) { const el = document.getElementById(id); if (el) el.innerHTML = ct[id]; }
  });

  /* 네비게이션 메뉴명 */
  const navMap = {
    navAbout:     ['nav-about',    'mnav-about'],
    navBeethoven: ['nav-beethoven','mnav-beethoven'],
    navProcess:   ['nav-process',  'mnav-process'],
    navPortfolio: ['nav-portfolio','mnav-portfolio'],
    navCta:       ['nav-cta',      'mnav-cta'],
  };
  Object.entries(navMap).forEach(([key, ids]) => {
    if (ct[key]) ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = ct[key];
    });
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  /* 즉시 기본값으로 렌더 (빠른 첫 화면) */
  applyInfo(); applyCustomText(); applyImages(); renderPortfolio(); renderVideos(); renderBeethovenGallery();
  /* content.json 로드 후 재렌더 (모든 기기 최신 반영) */
  await loadContent();
  applyInfo(); applyCustomText(); applyImages(); renderPortfolio(); renderVideos(); renderBeethovenGallery();
});
