/* Gullu — BHAO's mascot: a clay gullak (Indian piggy-bank pot).
   Reference drawing for src/components/mascot/Gullu.tsx (spec §D.15).
   Moods: happy | cheer | think | worried | wow */
window.gullu = function (mood = 'happy', size = 96) {
  const eyes = {
    happy:   '<ellipse cx="40" cy="57" rx="4.2" ry="5" fill="#2B1408"/><ellipse cx="60" cy="57" rx="4.2" ry="5" fill="#2B1408"/><circle cx="41.4" cy="55.2" r="1.5" fill="#fff"/><circle cx="61.4" cy="55.2" r="1.5" fill="#fff"/>',
    cheer:   '<path d="M35.5 58 Q40 51.5 44.5 58" stroke="#2B1408" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M55.5 58 Q60 51.5 64.5 58" stroke="#2B1408" stroke-width="3" fill="none" stroke-linecap="round"/>',
    think:   '<ellipse cx="40" cy="57" rx="4" ry="4.6" fill="#2B1408"/><ellipse cx="60" cy="57" rx="4" ry="4.6" fill="#2B1408"/><circle cx="41.6" cy="55.4" r="1.4" fill="#fff"/><circle cx="61.6" cy="55.4" r="1.4" fill="#fff"/><path d="M55 48.5 L65 47" stroke="#2B1408" stroke-width="2.6" stroke-linecap="round"/>',
    worried: '<ellipse cx="40" cy="58" rx="4" ry="4.6" fill="#2B1408"/><ellipse cx="60" cy="58" rx="4" ry="4.6" fill="#2B1408"/><circle cx="41.4" cy="56.4" r="1.4" fill="#fff"/><circle cx="61.4" cy="56.4" r="1.4" fill="#fff"/><path d="M35 50 L44 52.5" stroke="#2B1408" stroke-width="2.6" stroke-linecap="round"/><path d="M65 50 L56 52.5" stroke="#2B1408" stroke-width="2.6" stroke-linecap="round"/>',
    wow:     '<circle cx="40" cy="56" r="5.4" fill="#2B1408"/><circle cx="60" cy="56" r="5.4" fill="#2B1408"/><circle cx="41.8" cy="54" r="1.9" fill="#fff"/><circle cx="61.8" cy="54" r="1.9" fill="#fff"/>',
  }[mood];
  const mouth = {
    happy:   '<path d="M43.5 66 Q50 72.5 56.5 66" stroke="#2B1408" stroke-width="3" fill="none" stroke-linecap="round"/>',
    cheer:   '<path d="M42 64.5 Q50 76 58 64.5 Z" fill="#6E1F0E"/><path d="M45.5 69.5 Q50 72.5 54.5 69.5 Q50 74.5 45.5 69.5Z" fill="#F07A64"/>',
    think:   '<path d="M46 68 Q50 66.5 54.5 68.5" stroke="#2B1408" stroke-width="2.8" fill="none" stroke-linecap="round"/>',
    worried: '<path d="M43.5 69 Q47 66 50 68.5 Q53 71 56.5 68" stroke="#2B1408" stroke-width="2.8" fill="none" stroke-linecap="round"/>',
    wow:     '<ellipse cx="50" cy="68.5" rx="4" ry="4.8" fill="#6E1F0E"/>',
  }[mood];
  const extra = mood === 'cheer'
    ? '<path d="M14 30 l2.5 5 5 2.5 -5 2.5 -2.5 5 -2.5 -5 -5 -2.5 5 -2.5z" fill="#FFC530"/><path d="M86 22 l2 4 4 2 -4 2 -2 4 -2 -4 -4 -2 4 -2z" fill="#FFC530"/>'
    : mood === 'think' ? '<circle cx="82" cy="30" r="3" fill="#FFF8EC" stroke="#C98A00" stroke-width="1.5"/><circle cx="89" cy="20" r="5" fill="#FFF8EC" stroke="#C98A00" stroke-width="1.5"/>' : '';
  return `<svg width="${size}" height="${size}" viewBox="0 0 100 100" role="img" aria-label="Gullu" class="gullu gullu--${mood}">
  <ellipse cx="50" cy="94" rx="26" ry="4" fill="rgba(30,20,5,.18)"/>
  <path d="M38 24 h24 l3 9 h-30z" fill="#A54A24"/>
  <ellipse cx="50" cy="24" rx="13" ry="4.5" fill="#C8643B"/>
  <ellipse cx="50" cy="23" rx="8" ry="2.4" fill="#7A3418"/>
  <path d="M50 30 C 16 30, 10 52, 14 68 C 18 86, 34 92, 50 92 C 66 92, 82 86, 86 68 C 90 52, 84 30, 50 30 Z" fill="#D2703F"/>
  <path d="M50 30 C 16 30, 10 52, 14 68 C 15 72, 16 75, 18 78 C 30 84, 70 84, 82 78 C 84 75, 85 72, 86 68 C 90 52, 84 30, 50 30 Z" fill="#DB7A48"/>
  <path d="M18 79 C 30 86, 70 86, 82 79" stroke="#FFF1D6" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".9"/>
  <g fill="#FFF1D6" opacity=".9"><circle cx="28" cy="85" r="1.6"/><circle cx="39" cy="88" r="1.6"/><circle cx="50" cy="89" r="1.6"/><circle cx="61" cy="88" r="1.6"/><circle cx="72" cy="85" r="1.6"/></g>
  <path d="M24 46 C 28 38, 36 34, 42 34" stroke="#F3A57B" stroke-width="4" fill="none" stroke-linecap="round" opacity=".8"/>
  <rect x="41" y="37" width="18" height="4.6" rx="2.3" fill="#4A2412"/>
  <circle cx="31" cy="66" r="5" fill="#F28A6B" opacity=".55"/><circle cx="69" cy="66" r="5" fill="#F28A6B" opacity=".55"/>
  ${eyes}${mouth}${extra}
</svg>`;
};
