export interface Congresista {
  nombre: string;
  esLider: boolean;
  nota?: string;
}

export interface Faccion {
  nombre: string;
  nota?: string;
  miembros: Congresista[];
}

export interface AsambleaConstituyente {
  constitucionAnio: number;
  nombreAsamblea: string;
  facciones: Faccion[];
}

export const ASAMBLEAS: AsambleaConstituyente[] = [
  {
    constitucionAnio: 1920,
    nombreAsamblea: 'Asamblea Nacional de 1919',
    facciones: [
      {
        nombre: 'Partido Leguísta / Amigos del Régimen',
        miembros: [
          { nombre: 'Mariano H. Cornejo', esLider: true, nota: 'Presidente de la Asamblea Nacional e ideólogo principal' },
          { nombre: 'César Canevaro', esLider: true, nota: 'General de División, líder militar del leguísmo en el legislativo' },
          { nombre: 'Pedro José Rada y Gamio', esLider: true, nota: 'Líder del ala civil oficialista, posterior ministro' },
          { nombre: 'Fermín Málaga Santolalla', esLider: true, nota: 'Especialista corporativo, director de la célula de fomento' },
          { nombre: 'Augusto Bedoya Suárez', esLider: false },
          { nombre: 'Lauro A. Curletti', esLider: false },
          { nombre: 'Aníbal Maúrtua', esLider: false },
          { nombre: 'Melitón F. Carvajal', esLider: false },
          { nombre: 'Alejandro Deustua', esLider: false },
          { nombre: 'Enrique de la Riva Agüero', esLider: false },
          { nombre: 'Carlos Sayán Álvarez (padre)', esLider: false },
          { nombre: 'José Salvador Cavero', esLider: false },
          { nombre: 'Claudio Williman', esLider: false },
          { nombre: 'Manuel C. Rodríguez', esLider: false },
          { nombre: 'Esteban Piqueras', esLider: false },
          { nombre: 'Jesús M. Salazar', esLider: false },
          { nombre: 'Ubaldo Giraldo', esLider: false },
          { nombre: 'Eduardo C. Basadre', esLider: false },
          { nombre: 'Benjamín Huamán de los Heros', esLider: false },
        ],
      },
      {
        nombre: 'Independiente / Liberal Moderada',
        nota: 'Disidencia colaboracionista',
        miembros: [
          { nombre: 'Germán Arenas y Loayza', esLider: true, nota: 'Líder del grupo independiente moderado' },
          { nombre: 'Arturo Núñez', esLider: false },
          { nombre: 'Juan de Dios Salazar y Oyarzábal', esLider: false },
          { nombre: 'Federico Luna y Peralta', esLider: false },
          { nombre: 'Julio E. Ego-Aguirre', esLider: false },
          { nombre: 'Oscar C. Barrós', esLider: false },
        ],
      },
    ],
  },
  {
    constitucionAnio: 1933,
    nombreAsamblea: 'Congreso Constituyente de 1931',
    facciones: [
      {
        nombre: 'Unión Revolucionaria — Mayoría Sanchista',
        miembros: [
          { nombre: 'Luis A. Flores', esLider: true, nota: 'Jefe de la bancada de la UR y posterior líder del fascismo peruano' },
          { nombre: 'Carlos Sayán Álvarez', esLider: true, nota: 'Secretario del Congreso y redactor constitucional' },
          { nombre: 'José Matías Manzanilla', esLider: true, nota: 'Artífice de la legislación laboral y constitucional de la UR' },
          { nombre: 'Alfredo Herrera', esLider: false },
          { nombre: 'Emilio Guimoye', esLider: false },
          { nombre: 'Gualberto Guevara', esLider: false },
          { nombre: 'Eduardo Lawrie', esLider: false },
          { nombre: 'Gerardo Balbuena', esLider: false },
          { nombre: 'Saturnino Vara Cadillo', esLider: false },
          { nombre: 'Ignacio Brandariz', esLider: false },
          { nombre: 'Jorge de la Chira', esLider: false },
          { nombre: 'Manuel B. Llosa', esLider: false },
          { nombre: 'Manuel Diez Canseco', esLider: false },
          { nombre: 'Aurelio Miró Quesada Sosa', esLider: false },
          { nombre: 'Julio de la Piedra', esLider: false },
          { nombre: 'Arturo Osores (hijo)', esLider: false },
        ],
      },
      {
        nombre: 'Célula Parlamentaria Aprista (PAP)',
        nota: 'Desaforados en masa a inicios de 1932 mediante la Ley de Emergencia',
        miembros: [
          { nombre: 'Víctor Raúl Haya de la Torre', esLider: true, nota: 'Líder máximo del partido, coordinaba desde fuera de la asamblea' },
          { nombre: 'Manuel Seoane Corrales', esLider: true, nota: 'Jefe de la Célula Parlamentaria Aprista en el hemiciclo' },
          { nombre: 'Luis Alberto Sánchez', esLider: true, nota: 'Principal orador doctrinal e intelectual del bloque' },
          { nombre: 'Carlos Manuel Cox', esLider: true, nota: 'Especialista económico y financiero de la bancada' },
          { nombre: 'Alcides Spelucín', esLider: false },
          { nombre: 'Juan Seoane', esLider: false },
          { nombre: 'Arturo Sabroso Montoya', esLider: false, nota: 'Líder sindical obrero' },
          { nombre: 'Pedro E. Muñiz', esLider: false },
          { nombre: 'Luis E. Heysen', esLider: false },
          { nombre: 'Manuel Arévalo Carreño', esLider: false },
          { nombre: 'Miguel Checa Eguiguren', esLider: false },
          { nombre: 'Eduardo Ganoza Choza', esLider: false },
          { nombre: 'Luis Felipe Sánchez', esLider: false },
          { nombre: 'Manuel Vicente Villarán (hijo)', esLider: false },
        ],
      },
      {
        nombre: 'Partido Descentralista y Centristas Independientes',
        miembros: [
          { nombre: 'Luis Antonio Eguiguren', esLider: true, nota: 'Presidente del Congreso Constituyente' },
          { nombre: 'Víctor Andrés Belaunde', esLider: true, nota: 'Líder ideológico del pensamiento socialcristiano e independiente' },
          { nombre: 'Manuel J. Bustamante de la Fuente', esLider: true, nota: 'Principal exponente del descentralismo arequipeño' },
          { nombre: 'Jorge Basadre Grohmann', esLider: false, nota: 'Asesor técnico e intelectual adscrito' },
          { nombre: 'Emilio Romero Padilla', esLider: false },
          { nombre: 'José Antonio Encinas', esLider: false, nota: 'Educador, independiente de tendencia progresista' },
          { nombre: 'Francisco Tamayo', esLider: false },
          { nombre: 'José Luis Bustamante y Rivero', esLider: false, nota: 'Colaborador técnico y representante regional' },
        ],
      },
      {
        nombre: 'Partido Socialista del Perú y Bloque Marxista',
        miembros: [
          { nombre: 'Hildebrando Castro Pozo', esLider: true, nota: 'Líder indiscutible del pensamiento socialista agrario' },
          { nombre: 'Alberto Arca Parró', esLider: true, nota: 'Especialista en demografía, líder del ala técnica de izquierda' },
          { nombre: 'Luciano Castillo Colonna', esLider: true, nota: 'Fundador del Partido Socialista del Perú' },
          { nombre: 'Pio Maximiliano Medina', esLider: false },
        ],
      },
    ],
  },
  {
    constitucionAnio: 1979,
    nombreAsamblea: 'Asamblea Constituyente de 1978',
    facciones: [
      {
        nombre: 'Partido Aprista Peruano (PAP)',
        miembros: [
          { nombre: 'Víctor Raúl Haya de la Torre', esLider: true, nota: 'Presidente de la Asamblea Constituyente y líder histórico' },
          { nombre: 'Luis Alberto Sánchez', esLider: true, nota: 'Presidente de la Comisión Principal de Constitución' },
          { nombre: 'Ramiro Prialé', esLider: true, nota: 'Estratega de consensos y coaliciones parlamentarias' },
          { nombre: 'Andrés Townsend Ezcurra', esLider: true, nota: 'Vocero doctrinario internacional' },
          { nombre: 'Alan García Pérez', esLider: true, nota: 'Líder de las juventudes y miembro de la comisión redactora' },
          { nombre: 'Jorge Lozada Stanbury', esLider: false },
          { nombre: 'Carlos Manuel Cox', esLider: false },
          { nombre: 'Armando Villanueva del Campo', esLider: false },
          { nombre: 'Juana Castro', esLider: false },
          { nombre: 'Alfonso Ramos Alva', esLider: false },
          { nombre: 'Luis Rodríguez Vildosola', esLider: false },
          { nombre: 'Fernando León de Vivero', esLider: false },
          { nombre: 'Urbino Julca Serra', esLider: false },
          { nombre: 'Héctor Vargas Haya', esLider: false },
          { nombre: 'Guillermo Baca Aguinaga', esLider: false },
          { nombre: 'Gustavo García Mundaca', esLider: false },
          { nombre: 'Josmel Muñoz Cordero', esLider: false },
          { nombre: 'Enrique Chirinos Soto', esLider: false, nota: 'Aliado doctrinario e independiente pro-aprista' },
        ],
      },
      {
        nombre: 'Partido Popular Cristiano (PPC)',
        miembros: [
          { nombre: 'Luis Bedoya Reyes', esLider: true, nota: 'Líder y fundador del PPC, jefe del bloque' },
          { nombre: 'Roberto Ramírez del Villar', esLider: true, nota: 'Líder parlamentario y estratega constitucional del PPC' },
          { nombre: 'Mario Polar Ugarteche', esLider: true, nota: 'Ideólogo del socialcristianismo' },
          { nombre: 'Ernesto Alayza Grundy', esLider: true, nota: 'Jurisconsulto principal del partido' },
          { nombre: 'Celso Sotomarino Chávez', esLider: false },
          { nombre: 'Oscar Olivares Montano', esLider: false },
          { nombre: 'Rafael Vega García', esLider: false },
          { nombre: 'Moises Woll Dávila', esLider: false },
          { nombre: 'Lauro Muñoz Garay', esLider: false },
          { nombre: 'Miguel Ángel Mufarech Nemy', esLider: false },
          { nombre: 'Armando Buendía Gutiérrez', esLider: false },
          { nombre: 'Xavier Barrón Cebreros', esLider: false },
          { nombre: 'Gabriela Porto de Power', esLider: false },
          { nombre: 'Federico Tovar Velarde', esLider: false },
        ],
      },
      {
        nombre: 'FOCEP — Izquierda Radical',
        nota: 'Frente Obrero Campesino, Estudiantil y Popular',
        miembros: [
          { nombre: 'Hugo Blanco Galdós', esLider: true, nota: 'Líder histórico del movimiento campesino, el más votado de la izquierda' },
          { nombre: 'Genaro Ledesma Izquieta', esLider: true, nota: 'Presidente político del FOCEP' },
          { nombre: 'Enrique Fernández Chacón', esLider: true, nota: 'Líder del trotskismo obrero' },
          { nombre: 'Ricardo Napurí Schapiro', esLider: true, nota: 'Ideólogo marxista revolucionario' },
          { nombre: 'Saturnino Paredes Macedo', esLider: false, nota: 'Líder de la facción maoísta' },
          { nombre: 'Justiniano Apaza Ordóñez', esLider: false },
          { nombre: 'César Augusto Mateu Flores', esLider: false },
          { nombre: 'Juan Cornejo Gómez', esLider: false },
          { nombre: 'Magda Benavides', esLider: false },
        ],
      },
      {
        nombre: 'Partido Socialista Revolucionario (PSR)',
        nota: 'Izquierda Velasquista',
        miembros: [
          { nombre: 'Leonidas Rodríguez Figueroa', esLider: true, nota: 'General en retiro, líder y fundador del PSR' },
          { nombre: 'Alberto Ruiz Eldredge', esLider: true, nota: 'Jurista principal de la izquierda, redactor del capítulo de propiedad social' },
          { nombre: 'Antonio Meza Cuadra', esLider: true, nota: 'Secretario general del partido' },
          { nombre: 'Avelino Mar Arias', esLider: false },
          { nombre: 'Enrique Álvarez Blas', esLider: false },
        ],
      },
      {
        nombre: 'Partido Comunista Peruano (PCP)',
        nota: 'Izquierda Marxista-Leninista',
        miembros: [
          { nombre: 'Jorge del Prado Chávez', esLider: true, nota: 'Secretario General e histórico líder comunista' },
          { nombre: 'Isidoro Gamarra Ramírez', esLider: true, nota: 'Líder de la Confederación General de Trabajadores del Perú (CGTP)' },
          { nombre: 'Valentín Pacho', esLider: true, nota: 'Cuadro dirigencial minero y obrero' },
          { nombre: 'Alejandro Olivera', esLider: false },
          { nombre: 'Luis Alberto Delgado', esLider: false },
        ],
      },
      {
        nombre: 'Unidad Democrático Popular (UDP)',
        nota: 'Nueva Izquierda',
        miembros: [
          { nombre: 'Alfonso Barrantes Lingán', esLider: true, nota: 'Líder político del frente y articulador socialista' },
          { nombre: 'Carlos Malpica Silva Santisteban', esLider: true, nota: 'Especialista en petróleo y deuda externa' },
          { nombre: 'Javier Díez-Canseco Cisneros', esLider: true, nota: 'Líder de la facción vanguardista y defensor de DD.HH.' },
          { nombre: 'Victoriano Lázaro', esLider: false },
        ],
      },
      {
        nombre: 'FRENATRACA',
        nota: 'Frente Nacional de Trabajadores y Campesinos',
        miembros: [
          { nombre: 'Roger Cáceres Velásquez', esLider: true, nota: 'Líder del clan político Cáceres y del indigenismo sureño' },
          { nombre: 'Pedro Cáceres Velásquez', esLider: true, nota: 'Estratega parlamentario regional' },
          { nombre: 'J. Chambi', esLider: false },
          { nombre: 'E. Arbulo', esLider: false },
        ],
      },
      {
        nombre: 'Democracia Cristiana, UNO y MDP',
        miembros: [
          { nombre: 'Héctor Cornejo Chávez', esLider: true, nota: 'Líder de la Democracia Cristiana, aliado del ala militar velasquista' },
          { nombre: 'Víctor Freundt Rosell', esLider: true, nota: 'Líder de la Unión Nacional Odriísta' },
          { nombre: 'Javier Ortiz de Zevallos', esLider: true, nota: 'Líder del Movimiento Democrático Peruano' },
        ],
      },
    ],
  },
  {
    constitucionAnio: 1993,
    nombreAsamblea: 'Congreso Constituyente Democrático 1992–1993',
    facciones: [
      {
        nombre: 'Alianza Cambio 90 – Nueva Mayoría (C90-NM)',
        nota: 'Oficialismo Fujimorista',
        miembros: [
          { nombre: 'Jaime Yoshiyama Tanaka', esLider: true, nota: 'Presidente del Congreso Constituyente Democrático' },
          { nombre: 'Carlos Torres y Torres Lara', esLider: true, nota: 'Presidente de la Comisión de Constitución y de Redacción' },
          { nombre: 'Martha Chávez Cossío', esLider: true, nota: 'Líder defensora del régimen, posterior presidenta del Congreso' },
          { nombre: 'Luz Salgado Rubianes', esLider: true, nota: 'Líder de la organización de base de Cambio 90' },
          { nombre: 'Víctor Joy Way', esLider: true, nota: 'Operador político económico del oficialismo' },
          { nombre: 'Andrés Reggiardo Sayán', esLider: false },
          { nombre: 'José Barba Caballero', esLider: false, nota: 'Disidente aprista aliado al oficialismo' },
          { nombre: 'Juan Hermógenes Chávez Romero', esLider: false },
          { nombre: 'Willy Serrato Puse', esLider: false },
          { nombre: 'Carlos Reátegui Trigoso', esLider: false },
          { nombre: 'Carlos Blanco Oropeza', esLider: false },
          { nombre: 'Lourdes Villarán de la Puente', esLider: false },
          { nombre: 'José Ysisola Farfán', esLider: false },
          { nombre: 'Vicente Silva Checa', esLider: false },
          { nombre: 'Gilberto Gamonal Cruz', esLider: false },
          { nombre: 'Daniel Hokama Tokashiki', esLider: false },
          { nombre: 'César Campos', esLider: false },
          { nombre: 'Samuel Matsuda Nishimura', esLider: false },
          { nombre: 'Sandro Fuentes Acurio', esLider: false },
          { nombre: 'Tito Chávez', esLider: false },
          { nombre: 'Jorge Velásquez Ureta', esLider: false },
        ],
      },
      {
        nombre: 'Partido Popular Cristiano (PPC)',
        nota: 'Oposición de Derecha Institucional',
        miembros: [
          { nombre: 'Lourdes Flores Nano', esLider: true, nota: 'Líder de la minoría del PPC y principal voz de la oposición liberal' },
          { nombre: 'Xavier Barrón Cebreros', esLider: true, nota: 'Estratega parlamentario y constitucional' },
          { nombre: 'Antero Flores-Aráoz', esLider: true, nota: 'Constitucionalista de la minoría' },
          { nombre: 'Alexander Kouri Bumachar', esLider: false },
          { nombre: 'Celso Sotomarino Chávez', esLider: false },
          { nombre: 'Rafael Rey Rey', esLider: false, nota: 'Posteriormente fundador de Renovación Nacional' },
          { nombre: 'Juan Carlos Eguren', esLider: false },
        ],
      },
      {
        nombre: 'Frente Independiente Moralizador (FIM)',
        nota: 'Oposición Reformista',
        miembros: [
          { nombre: 'Fernando Olivera Vega', esLider: true, nota: 'Líder fundador del FIM y principal fiscalizador opositor' },
          { nombre: 'Carlos Cuaresma Sánchez', esLider: true, nota: 'Líder regional del Cusco' },
          { nombre: 'Ernesto Gamarra Olivares', esLider: false },
          { nombre: 'Jorge Salazar', esLider: false },
        ],
      },
      {
        nombre: 'Coordinadora Democrática (CODE)',
        nota: 'Izquierda Moderada',
        miembros: [
          { nombre: 'Henry Pease García', esLider: true, nota: 'Líder intelectual y principal articulador de oposición' },
          { nombre: 'Gloria Helfer Palacios', esLider: true, nota: 'Exministra de Educación, líder de la izquierda progresista' },
          { nombre: 'Julio Castro Gómez', esLider: false },
          { nombre: 'Alfonso Grados Bertorini', esLider: false, nota: 'Independiente, exministro de Trabajo' },
        ],
      },
      {
        nombre: 'FREPAP',
        nota: 'Frente Popular Agrícola del Perú',
        miembros: [
          { nombre: 'Ezequiel Ataucusi Gamonal', esLider: true, nota: 'Líder místico y fundador ideológico' },
          { nombre: 'Javier Noriega', esLider: true, nota: 'Vocero político de la bancada' },
        ],
      },
    ],
  },
];
