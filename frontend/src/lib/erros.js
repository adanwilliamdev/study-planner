/** Extrai uma mensagem amigavel de um erro do axios. */
export function mensagemDeErro(err, padrao = 'Algo deu errado. Tente novamente.') {
  if (!err.response) return 'Não foi possível conectar ao servidor. Verifique se o backend está rodando.'
  const data = err.response.data
  if (typeof data === 'string' && data) return data
  return data?.message || padrao
}
