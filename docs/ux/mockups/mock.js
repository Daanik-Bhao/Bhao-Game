/* Mockup helpers: card renderers matching spec §D.14 */
window.TYPE_ICON = { opportunity: 'indian-rupee', attack: 'swords', defence: 'shield', event: 'calendar-days' };
window.CAT_ICON = { medical: 'heart-pulse', job: 'briefcase', market: 'trending-down', fraud: 'shield', tax: 'landmark', property: 'house', legal: 'scale', personal: 'user', travel: 'plane', debt: 'credit-card' };
window.TYPE_LABEL = { opportunity: 'Decision', attack: 'Attack', defence: 'Shield', event: 'Life event' };
const cls = { opportunity: '', attack: 'attack', defence: 'defence', event: 'event' };

function valueHtml(v, type) {
  if (v === 'choose') return '<span class="dots" aria-hidden="true"><i style="background:var(--spend)"></i><i style="background:var(--save)"></i><i style="background:var(--invest)"></i></span>';
  if (type === 'defence') return `<span style="color:var(--defence-strong)">${v}</span>`;
  const neg = /^[−-]/.test(v);
  return `<span style="color:${neg ? 'var(--attack-strong)' : 'var(--gain-fg)'}">${v}</span>`;
}
/* Hand card (compact) 68x100 */
window.hcard = (o) => {
  const t = o.type || 'opportunity';
  const ic = o.cat ? CAT_ICON[o.cat] : TYPE_ICON[t];
  return `<button class="gcard ${cls[t] ? 'gcard--' + cls[t] : ''} ${o.tier === 'legendary' ? 'is-legendary' : ''} ${o.locked ? 'is-locked' : ''} ${o.sel ? 'is-selected' : ''}" style="width:${o.w || 68}px;height:${o.h || 100}px" aria-label="${o.name}">
    <span class="gcard__band">${icon(ic, 16)}</span>
    <i class="gcard__gem gem-${o.tier || 'common'}"></i>
    ${o.locked ? `<span style="position:absolute;top:30px;right:5px;color:var(--ink-700)">${icon('lock', 12)}</span>` : ''}
    <span class="gcard__name ${Math.max(...o.name.split(/\s+/).map(w => w.length)) >= 9 ? 'is-long' : ''}">${o.name}</span>
    <span class="gcard__value">${valueHtml(o.value, t)}</span>
  </button>`;
};
/* Full card 128x184 (desktop hand, sheet header, library) */
window.fcard = (o) => {
  const t = o.type || 'opportunity';
  const ic = o.cat ? CAT_ICON[o.cat] : TYPE_ICON[t];
  const w = o.w || 128, h = o.h || 184;
  return `<div class="fcard ${cls[t] ? 'fcard--' + cls[t] : ''} ${o.tier === 'legendary' ? 'is-legendary' : ''} ${o.sel ? 'is-selected' : ''} ${w < 110 ? 'is-narrow' : ''}" style="width:${w}px;height:${h}px">
    <div class="fcard__band">${icon(ic, 18)}<span>${o.label || TYPE_LABEL[t]}</span></div>
    <i class="fcard__gem gem-${o.tier || 'common'}"></i>
    <div class="fcard__name">${o.name}</div>
    <div class="fcard__flavor">${o.flavor || ''}</div>
    <div class="fcard__value">${valueHtml(o.value, t)}</div>
  </div>`;
};
window.ring = (sec, total = 60, color = 'var(--haldi-400)') => {
  const c = 2 * Math.PI * 19, off = c * (1 - sec / total);
  return `<div class="ring" role="timer" aria-label="${sec} seconds left in your turn"><svg width="44" height="44"><circle cx="22" cy="22" r="19" stroke="rgba(255,255,255,.14)" stroke-width="4" fill="none"/><circle cx="22" cy="22" r="19" stroke="${color}" stroke-width="4" fill="none" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${off}"/></svg><b>${sec}</b></div>`;
};
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-icon]').forEach(el => { el.outerHTML = icon(el.dataset.icon, +el.dataset.size || 20, el.className || ''); });
  document.querySelectorAll('[data-gullu]').forEach(el => { el.innerHTML = gullu(el.dataset.gullu, +el.dataset.size || 96); });
});
