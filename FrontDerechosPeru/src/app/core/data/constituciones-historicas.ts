export interface ConstitucionHistorica {
  anio: number;
  promulgadoPor: string;
  cargo: string;
  contexto: string;
  vigenciaDesde: number;
  vigenciaHasta: number | null; // null = vigente
  tieneCongresistas: boolean;
  videoId?: string; // YouTube video ID
}

export const CONSTITUCIONES: ConstitucionHistorica[] = [
  {
    anio: 1823,
    promulgadoPor: 'José Bernardo de Tagle',
    cargo: 'Presidente de la República',
    contexto: 'Primera constitución del Perú republicano, redactada en plena guerra de independencia. Estableció la república representativa y la separación de poderes, aunque nunca llegó a aplicarse plenamente.',
    vigenciaDesde: 1823,
    vigenciaHasta: 1826,
    tieneCongresistas: false,
    videoId: 'QJIIXo-STWE'
  },
  {
    anio: 1826,
    promulgadoPor: 'Simón Bolívar',
    cargo: 'Libertador-Presidente',
    contexto: 'Conocida como la Constitución Vitalicia, fue diseñada por el propio Bolívar para concentrar el poder en un presidente de por vida. Tuvo vigencia efímera de menos de un anio antes de ser derogada.',
    vigenciaDesde: 1826,
    vigenciaHasta: 1827,
    tieneCongresistas: false,
    videoId: 'H-Pxqj8-2h8'
  },
  {
    anio: 1828,
    promulgadoPor: 'José de La Mar',
    cargo: 'Presidente de la República',
    contexto: 'Buscó equilibrar el poder entre el ejecutivo y el legislativo, estableciendo el bicameralismo y reforzando las garantías individuales. Fue considerada la primera constitución verdaderamente republicana del Perú.',
    vigenciaDesde: 1828,
    vigenciaHasta: 1834,
    tieneCongresistas: false,
    videoId: 's01W_wROEyg'
  },
  {
    anio: 1834,
    promulgadoPor: 'Luis José de Orbegoso',
    cargo: 'Presidente de la República',
    contexto: 'Reafirmó el constitucionalismo liberal y fue promulgada durante el convulso periodo previo a la Confederación Perú-Boliviana. Amplió ligeramente el sufragio y reguló las garantías constitucionales.',
    vigenciaDesde: 1834,
    vigenciaHasta: 1839,
    tieneCongresistas: false,
    videoId: 'uqEfxNZllVQ'
  },
  {
    anio: 1839,
    promulgadoPor: 'Agustín Gamarra',
    cargo: 'Presidente de la República',
    contexto: 'Promulgada tras la victoria en la Batalla de Yungay y la disolución de la Confederación con Bolivia. Fortaleció el poder ejecutivo y mantuvo restricciones al sufragio, rigiendo por 17 anios.',
    vigenciaDesde: 1839,
    vigenciaHasta: 1856,
    tieneCongresistas: false,
    videoId: 'ZfSvWLfojUk'
  },
  {
    anio: 1856,
    promulgadoPor: 'Ramón Castilla',
    cargo: 'Presidente de la República',
    contexto: 'De carácter marcadamente liberal, eliminó el fuero eclesiástico y militar, abolió la esclavitud y los tributos indígenas, y amplió las libertades individuales. Generó fuerte oposición conservadora.',
    vigenciaDesde: 1856,
    vigenciaHasta: 1860,
    tieneCongresistas: false,
    videoId: '3BwegsrS1yY'
  },
  {
    anio: 1860,
    promulgadoPor: 'Ramón Castilla',
    cargo: 'Presidente de la República',
    contexto: 'La constitución más longeva de la historia peruana. Moderó el liberalismo de 1856 buscando consenso entre conservadores y liberales. Rigió, con breves interrupciones, durante 60 anios.',
    vigenciaDesde: 1860,
    vigenciaHasta: 1920,
    tieneCongresistas: false,
    videoId: 'KFByQ4htmIA'
  },
  {
    anio: 1867,
    promulgadoPor: 'Mariano Ignacio Prado',
    cargo: 'Presidente de la República',
    contexto: 'Constitución liberal promulgada durante la Guerra con España. Tuvo la vigencia más corta de la historia peruana: menos de un anio, antes de ser derogada y restaurarse la Constitución de 1860.',
    vigenciaDesde: 1867,
    vigenciaHasta: 1868,
    tieneCongresistas: false,
    videoId: '0-_XIO1sF-A',
  },
  {
    anio: 1920,
    promulgadoPor: 'Augusto B. Leguía',
    cargo: 'Presidente de la República',
    contexto: 'Inauguró el constitucionalismo social en el Perú, incorporando derechos laborales y reconocimiento explícito de las comunidades indígenas. Fue promulgada durante el inicio del Oncenio de Leguía.',
    vigenciaDesde: 1920,
    vigenciaHasta: 1933,
    tieneCongresistas: true,
    videoId: 'R91v-3TqHkU',
  },
  {
    anio: 1933,
    promulgadoPor: 'Óscar R. Benavides',
    cargo: 'Presidente de la República',
    contexto: 'Promulgada tras el asesinato de Sánchez Cerro. Amplió el sufragio, reforzó el parlamento y reconoció derechos sociales. Con 46 anios de vigencia formal, fue la segunda constitución más longeva del Perú.',
    vigenciaDesde: 1933,
    vigenciaHasta: 1979,
    tieneCongresistas: true,
    videoId: 'ing4kkxF_Ik',
  },
  {
    anio: 1979,
    promulgadoPor: 'Francisco Morales Bermúdez',
    cargo: 'Presidente del Gobierno Revolucionario',
    contexto: 'Producto del retorno a la democracia tras el gobierno militar. Reconoció amplios derechos sociales y económicos, y fue la primera en otorgar el voto a los analfabetos. Entró en vigor con el gobierno de Belaunde.',
    vigenciaDesde: 1979,
    vigenciaHasta: 1993,
    tieneCongresistas: true,
    videoId: 'uIV-dQIENwY',
  },
  {
    anio: 1993,
    promulgadoPor: 'Alberto Fujimori',
    cargo: 'Presidente de la República',
    contexto: 'Redactada tras el autogolpe de 1992 por el Congreso Constituyente Democrático (CCD). Introduce la reelección inmediata, refuerza el modelo económico de libre mercado y concentra poder en el ejecutivo. Vigente hasta hoy.',
    vigenciaDesde: 1993,
    vigenciaHasta: null,
    tieneCongresistas: true,
    videoId: 'm-4UzHge7V8',
  },
];
