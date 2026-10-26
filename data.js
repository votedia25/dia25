/* Dados do Sufrágio app. Toda afirmação factual leva fonte (ids em fontes). */
window.SUF = {
  nacional: { l: 64256232, f: 59826041, pl: 51.79, pf: 48.21, comparecimento: "128,2 milhões", abstencao: "19,2%", eleito: "Luiz Inácio Lula da Silva (PT)" },
  /* votos por estado: tabela do 2º turno (Bloomberg Línea, com base no TSE). Percentuais são calculados no app sobre votos válidos. */
  estados: [
 {
  "uf": "AC",
  "nome": "Acre",
  "l": 144513,
  "f": 287715
 },
 {
  "uf": "AL",
  "nome": "Alagoas",
  "l": 1152621,
  "f": 744140
 },
 {
  "uf": "AP",
  "nome": "Amapá",
  "l": 222968,
  "f": 198674
 },
 {
  "uf": "AM",
  "nome": "Amazonas",
  "l": 1145783,
  "f": 975245
 },
 {
  "uf": "BA",
  "nome": "Bahia",
  "l": 6485258,
  "f": 2608761
 },
 {
  "uf": "CE",
  "nome": "Ceará",
  "l": 4036124,
  "f": 1819478
 },
 {
  "uf": "DF",
  "nome": "Distrito Federal",
  "l": 825224,
  "f": 979542
 },
 {
  "uf": "ES",
  "nome": "Espírito Santo",
  "l": 1001965,
  "f": 1294504
 },
 {
  "uf": "GO",
  "nome": "Goiás",
  "l": 1585555,
  "f": 2345334
 },
 {
  "uf": "MA",
  "nome": "Maranhão",
  "l": 2808231,
  "f": 1229971
 },
 {
  "uf": "MT",
  "nome": "Mato Grosso",
  "l": 694167,
  "f": 1351099
 },
 {
  "uf": "MS",
  "nome": "Mato Grosso do Sul",
  "l": 628973,
  "f": 927892
 },
 {
  "uf": "MG",
  "nome": "Minas Gerais",
  "l": 6351099,
  "f": 6241786
 },
 {
  "uf": "PR",
  "nome": "Paraná",
  "l": 2566504,
  "f": 4291444
 },
 {
  "uf": "PB",
  "nome": "Paraíba",
  "l": 1794059,
  "f": 865210
 },
 {
  "uf": "PA",
  "nome": "Pará",
  "l": 2690449,
  "f": 2199940
 },
 {
  "uf": "PE",
  "nome": "Pernambuco",
  "l": 4117513,
  "f": 1832554
 },
 {
  "uf": "PI",
  "nome": "Piauí",
  "l": 1653989,
  "f": 525859
 },
 {
  "uf": "RN",
  "nome": "Rio Grande do Norte",
  "l": 1413596,
  "f": 737409
 },
 {
  "uf": "RS",
  "nome": "Rio Grande do Sul",
  "l": 2824552,
  "f": 3874378
 },
 {
  "uf": "RJ",
  "nome": "Rio de Janeiro",
  "l": 4565393,
  "f": 5169033
 },
 {
  "uf": "RO",
  "nome": "Rondônia",
  "l": 294446,
  "f": 674382
 },
 {
  "uf": "RR",
  "nome": "Roraima",
  "l": 83505,
  "f": 219675
 },
 {
  "uf": "SC",
  "nome": "Santa Catarina",
  "l": 1418314,
  "f": 3220071
 },
 {
  "uf": "SE",
  "nome": "Sergipe",
  "l": 989041,
  "f": 433354
 },
 {
  "uf": "SP",
  "nome": "São Paulo",
  "l": 12119274,
  "f": 14139178
 },
 {
  "uf": "TO",
  "nome": "Tocantins",
  "l": 442962,
  "f": 467916
 }
],
  fontes: {
    tse: { nome: "TSE: presidente do TSE anuncia reeleição de Lula e faz balanço do 2º turno", url: "https://www.tse.jus.br/comunicacao/noticias/2026/Outubro/presidente-do-tse-anuncia-reeleicao-de-lula-e-faz-balanco-do-2o-turno-das-eleicoes-2026" },
    uf: { nome: "Bloomberg Línea: resultado do 2º turno por estado", url: "https://www.bloomberglinea.com.br/brasil/resultado-do-2-turno-por-estado-veja-onde-lula-e-flavio-bolsonaro-venceram/" },
    sp: { nome: "TRE-SP: resultado do 2º turno em SP", url: "https://www.tre-sp.jus.br/comunicacao/noticias/2026/Outubro/eleicoes-2026-lula-e-reeleito-presidente-da-republica-confira-resultado-do-2o-turno-em-sp" },
    obrig: { nome: "TSE: para quem o voto é obrigatório ou facultativo", url: "https://www.tse.jus.br/comunicacao/noticias/2026/Setembro/faltam-19-dias-saiba-para-quem-o-voto-e-obrigatorio-ou-facultativo" },
    cod32: { nome: "TSE, glossário: Código Eleitoral", url: "https://www.tse.jus.br/servicos-eleitorais/glossario/termos/codigo-eleitoral" },
    cf88: { nome: "TSE: Constituição Federal completa 35 anos", url: "https://www.tse.jus.br/comunicacao/noticias/2023/Outubro/pilar-da-democracia-constituicao-federal-completa-35-anos" }
  }
};
