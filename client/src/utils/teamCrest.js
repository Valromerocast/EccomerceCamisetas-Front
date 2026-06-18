const TEAM_COLORS = {
  argentina: ['#75AADB', '#FFFFFF', '#F6B40E'],
  brasil: ['#FFDF00', '#009739', '#002776'],
  canada: ['#D71920', '#FFFFFF', '#111111'],
  mexico: ['#006341', '#FFFFFF', '#CE1126'],
  'estados unidos': ['#1F4E8C', '#FFFFFF', '#B22234'],
  australia: ['#FFCD00', '#0057B8', '#00843D'],
  iran: ['#239F40', '#FFFFFF', '#DA0000'],
  japon: ['#003DA5', '#FFFFFF', '#BC002D'],
  jordania: ['#CE1126', '#FFFFFF', '#007A3D'],
  'corea del sur': ['#E6002D', '#FFFFFF', '#0047A0'],
  qatar: ['#8A1538', '#FFFFFF', '#A5ACAF'],
  'arabia saudita': ['#00843D', '#FFFFFF', '#D6C27A'],
  uzbekistan: ['#0099B5', '#FFFFFF', '#1EB53A'],
  iraq: ['#CE1126', '#FFFFFF', '#000000'],
  argelia: ['#006233', '#FFFFFF', '#D21034'],
  'cabo verde': ['#003893', '#FFFFFF', '#CF2027'],
  'rd congo': ['#007FFF', '#F7D618', '#CE1021'],
  'costa de marfil': ['#F77F00', '#FFFFFF', '#009E60'],
  egipto: ['#CE1126', '#FFFFFF', '#000000'],
  ghana: ['#000000', '#FCD116', '#CE1126'],
  marruecos: ['#C1272D', '#006233', '#F7D618'],
  senegal: ['#00853F', '#FDEF42', '#E31B23'],
  sudafrica: ['#007A4D', '#FFB612', '#002395'],
  tunez: ['#E70013', '#FFFFFF', '#111111'],
  curazao: ['#002B7F', '#F9E814', '#FFFFFF'],
  haiti: ['#00209F', '#D21034', '#FFFFFF'],
  panama: ['#D21034', '#FFFFFF', '#005293'],
  colombia: ['#FCD116', '#003893', '#CE1126'],
  ecuador: ['#FFD100', '#003893', '#CE1126'],
  paraguay: ['#D52B1E', '#FFFFFF', '#0038A8'],
  uruguay: ['#6DCFF6', '#FFFFFF', '#111111'],
  'nueva zelanda': ['#111111', '#FFFFFF', '#A2AAAD'],
  austria: ['#ED2939', '#FFFFFF', '#111111'],
  belgica: ['#000000', '#FAE042', '#ED2939'],
  'bosnia y herzegovina': ['#002F6C', '#FECB00', '#FFFFFF'],
  croacia: ['#E31B23', '#FFFFFF', '#171796'],
  chequia: ['#D7141A', '#FFFFFF', '#11457E'],
  inglaterra: ['#FFFFFF', '#1C2C5B', '#C8102E'],
  francia: ['#002395', '#FFFFFF', '#ED2939'],
  alemania: ['#000000', '#DD0000', '#FFCE00'],
  'paises bajos': ['#FF4F00', '#FFFFFF', '#21468B'],
  noruega: ['#BA0C2F', '#FFFFFF', '#00205B'],
  portugal: ['#006600', '#FF0000', '#FFCC00'],
  escocia: ['#003876', '#FFFFFF', '#6A9FD8'],
  espana: ['#AA151B', '#F1BF00', '#0039F0'],
  suecia: ['#FECC00', '#006AA7', '#FFFFFF'],
  suiza: ['#D52B1E', '#FFFFFF', '#111111'],
  turquia: ['#E30A17', '#FFFFFF', '#111111']
};

function normalize(value = '') {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

function escapeXml(value = '') {
  return value.replace(/[<>&'"]/g, (character) => ({
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    "'": '&apos;',
    '"': '&quot;'
  })[character]);
}

function initials(country) {
  const words = country.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 'FC';
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
  return words.map((word) => word[0]).join('').slice(0, 3).toUpperCase();
}

export function getTeamCrest(country = 'Seleccion') {
  const safeCountry = country.trim() || 'Seleccion';
  const [primary, secondary, accent] = TEAM_COLORS[normalize(safeCountry)]
    || ['#325B42', '#F7F3EB', '#D6B25E'];
  const abbreviation = initials(safeCountry);
  const label = safeCountry.length > 18 ? `${safeCountry.slice(0, 17)}…` : safeCountry;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="520" height="620" viewBox="0 0 520 620">
      <rect width="520" height="620" fill="#f7f3eb"/>
      <path d="M260 42 438 105v190c0 127-73 222-178 283C155 517 82 422 82 295V105z"
        fill="${primary}" stroke="${accent}" stroke-width="18"/>
      <path d="M260 80 402 130v160c0 101-55 181-142 237C173 471 118 391 118 290V130z"
        fill="${secondary}" opacity=".96"/>
      <path d="M118 229h284v78H118z" fill="${primary}"/>
      <circle cx="260" cy="176" r="54" fill="${accent}" stroke="${primary}" stroke-width="10"/>
      <path d="m260 132 12 27 29 3-22 19 7 29-26-15-26 15 7-29-22-19 29-3z"
        fill="${secondary}"/>
      <text x="260" y="285" text-anchor="middle" dominant-baseline="middle"
        fill="${secondary}" font-family="Arial, sans-serif" font-size="58" font-weight="800">${escapeXml(abbreviation)}</text>
      <text x="260" y="370" text-anchor="middle"
        fill="${primary}" font-family="Arial, sans-serif" font-size="28" font-weight="700">${escapeXml(label)}</text>
      <text x="260" y="410" text-anchor="middle"
        fill="${primary}" font-family="Arial, sans-serif" font-size="18" letter-spacing="5">SELECCION</text>
    </svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export function applyTeamCrestFallback(event, product = {}) {
  event.currentTarget.onerror = null;
  event.currentTarget.src = product.fallbackImage || getTeamCrest(product.country);
  event.currentTarget.classList.add('object-contain');
}
