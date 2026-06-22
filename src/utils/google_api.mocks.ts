export const compararDescripcionesMocks = [
  {
    score: 1,
    matches: [],
    differences: [
      'Género (Mujer vs. Hombre)',
      'Edad (Joven vs. Adulto mayor de 70 años)',
      'Vestimenta (Campera de jena, remera blanca y pantalón negro vs. Pijama a rayas celeste y blanco, descalzo)',
      'Características distintivas (Tatuaje en forma de mariposa en el pie vs. Manchas de vitíligo en manos y cuello, calvo con franja de cabello blanco en los costados)',
    ],
    reasoning:
      'Las descripciones corresponden a individuos de géneros y rangos de edad completamente opuestos. La vestimenta descrita en ambos casos es totalmente diferente. Las características físicas distintivas (tatuaje en uno, vitíligo y calvicie en el otro) no presentan ninguna similitud ni compatibilidad. No se encontró ninguna característica compartida ni compatible entre ambas descripciones, resultando en contradicciones fundamentales en casi todos los puntos de comparación.',
  },
  {
    score: 65,
    matches: [
      "Ambas descripciones mencionan 'Mujer joven'.",
      "Ambas describen una 'campera de jena/jean' (considerando 'jena' y 'jean' como variantes o sinónimos).",
      "Ambas mencionan 'remera blanca'.",
      "Ambas mencionan 'pantalón negro'.",
      'Ambas ubican un tatuaje en la zona del pie/tobillo (considerado compatible según las instrucciones).',
    ],
    differences: [
      "El diseño del tatuaje es completamente diferente: 'indio tomando merca' en la Descripción 1 y 'mariposa' en la Descripción 2.",
    ],
    reasoning:
      "Existe una alta coincidencia en la vestimenta (tipo de campera, remera blanca, pantalón negro) y en la descripción general de la persona ('Mujer joven'). La ubicación del tatuaje es compatible (pie vs. tobillo), lo cual no se considera una diferencia. Sin embargo, la contradicción en el diseño del tatuaje ('indio tomando merca' vs. 'mariposa') es un elemento de identificación clave y por lo tanto, una diferencia significativa. Los detalles adicionales de la Descripción 2 (edad, complexión, cabello, aros) no se consideran diferencias al no haber sido mencionados en la Descripción 1, solo aportan más detalle.",
  },
];
