/** Erro de uma chamada à API. status 0 = sem resposta do servidor. */
export class ErroApi extends Error {
  constructor(status, dados) {
    super(`HTTP ${status}`)
    this.status = status
    this.dados = dados
  }
}

/** Extrai uma mensagem amigavel de um erro de requisição. */
export function mensagemDeErro(err, padrao = 'Algo deu errado. Tente novamente.') {
  if (!(err instanceof ErroApi) || !err.status) {
    return 'Não foi possível conectar ao servidor. Verifique se o backend está rodando.'
  }
  const dados = err.dados
  if (typeof dados === 'string' && dados) return dados
  return dados?.message || padrao
}
