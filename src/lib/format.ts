export function capitalizar(texto: string) {
  const minusculo = texto.toLocaleLowerCase("pt-BR");
  return minusculo.charAt(0).toLocaleUpperCase("pt-BR") + minusculo.slice(1);
}

const MINUSCULAS = /^(DE|DO|DA|E|COM|POR|A|AO|EM|NA|NO)$/;
const SIGLAS = /^(HYROX|WOD|MLSS|VO2|EMOM|ARR|N1|N2|N3|RPE)$/;

/** Os títulos vêm em caixa alta do livro; no app ficam melhores em caixa normal. */
export function capitalizarTitulo(titulo: string) {
  if (titulo !== titulo.toLocaleUpperCase("pt-BR")) return titulo;

  return titulo
    .split(" ")
    .map((palavra, i) => {
      if (SIGLAS.test(palavra)) return palavra;
      if (i > 0 && MINUSCULAS.test(palavra)) return palavra.toLocaleLowerCase("pt-BR");
      return capitalizar(palavra);
    })
    .join(" ");
}
