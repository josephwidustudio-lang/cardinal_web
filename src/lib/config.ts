export const SITE = {
  nombre:      'Cardinal',
  nombreCorto: 'CARDINAL',
  tagline:     'Arquitectura que trasciende',
  descripcion: 'Desarrollamos proyectos residenciales únicos con identidad propia, calidad constructiva y diseño que perdura.',

  wa:          process.env.NEXT_PUBLIC_WA_NUMBER ?? '',
  waMsg:       'Hola, quiero información sobre Cardinal',
  email:       'info@cardinal.com.ar',
  telefono:    '',
  direccion:   '',
  horario:     'Lunes a viernes 9 a 18 hs',

  instagram:   '',
  facebook:    '',
  youtube:     '',

  seoTitle:    'Cardinal — Arquitectura que trasciende',
  seoDesc:     'Proyectos residenciales premium con identidad propia y calidad constructiva de excelencia.',
  seoKeywords: 'desarrolladora inmobiliaria, proyectos premium, arquitectura',

  stats: [
    { num: '1',    label: 'Proyecto'   },
    { num: '100%', label: 'Dedicación' },
    { num: 'PHs',  label: 'y unidades' },
  ],

  heroTitulo:    'Arquitectura que',
  heroTituloEm:  'trasciende',
  heroSubtitulo: 'Un proyecto diseñado para quienes eligen vivir distinto. Calidad, identidad y detalle en cada espacio.',
  heroImagen:    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1800&q=80',

  nosotrosTitulo:   'Un proyecto,',
  nosotrosTituloEm: 'una visión',
  nosotrosTexto1:   'Cardinal nace de la convicción de que la arquitectura puede transformar la vida cotidiana. Cada decisión de diseño está pensada para quienes valoran el detalle, la calidad y la experiencia de habitar un espacio único.',
  nosotrosTexto2:   'Un solo proyecto. Toda la atención puesta en él.',
  nosotrosImagen:   'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80',
  nosotrosStats: [
    { num: '1',    label: 'Proyecto exclusivo'    },
    { num: '100%', label: 'Atención al detalle'   },
    { num: 'A+',   label: 'Calidad constructiva'  },
    { num: '∞',    label: 'Compromiso'            },
  ],
}

export const COLORS = {
  bg:          '#0D3542',
  bgAlt:       '#0A2D38',
  bgCard:      '#0F3D4C',
  bgCardHover: '#134455',

  primary:     '#CEA279',
  primaryLight:'#E2BC99',
  primaryDark: '#B8855A',

  textMain:    '#F5F0EA',
  textMid:     '#7A9BA8',
  textLight:   '#A8C4CE',

  disponible:  '#5BC47A',
  reservado:   '#CEA279',
  vendido:     '#E07070',

  border:      'rgba(206,162,121,0.15)',
  borderHover: 'rgba(206,162,121,0.4)',
}

export const FONTS = {
  display: "'Panton', 'Georgia', serif",
  body:    "'Panton', 'system-ui', sans-serif",
}