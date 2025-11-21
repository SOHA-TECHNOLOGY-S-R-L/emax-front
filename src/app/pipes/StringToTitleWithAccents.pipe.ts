import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: 'stringToTitleWithAccents'
})

export class StringToTitleWithAccents implements PipeTransform {

  // Diccionario de palabras con tildes
  private accentDictionary: Record<string, string> = {
    "imagen": "imágen",
    "ceramica": "cerámica",
    "magica": "mágica",
    "termico": "térmico",
    "sublimacion": "sublimación",
    "termica": "térmica",
    "ecologica": "ecológica",
    "ecologico": "ecológico",
    "metalico": "metálico",
    "maquina": "máquina",
    "maquinas": "máquinas",
    "tamano": "tamaño",
    "lapices": "lápices",
    "publico": "público",
    "muneco": "muñeco",
    "medico": "médico",
    "antiestres": "antiestrés",
    "diseno": "diseño",
    "grafico": "gráfico",
    "estacion": "estación",
    "corazon": "corazón",


    // Agrega aquí todas las palabras que necesiten tilde
  };

  transform(value: string): string {
    if (!value) {
      return '';
    }

    // 1. Reemplazar guiones por espacios
    let text = value.replace(/-/g, ' ');

    // 2. Separar palabras
    const words = text.split(' ');

    // 3. Aplicar diccionario de tildes
    const processedWords = words.map(word => {
      const lower = word.toLowerCase();
      return this.accentDictionary[lower] ?? lower;
    });

    // 4. Convertir todo a mayúsculas
    return processedWords.join(' ').toUpperCase();
  }
}
