/**
 * Divide o texto em tokens por espaços, preservando a pontuação junto à palavra.
 * Retorna os tokens e os offsets de cada um no texto original.
 */
export function tokenize(text = '') {
  const tokens = []
  const offsets = []
  const regex = /\S+/g
  let match = regex.exec(text)

  while (match) {
    tokens.push(match[0])
    offsets.push({ start: match.index, end: match.index + match[0].length })
    match = regex.exec(text)
  }

  return { tokens, offsets }
}

export function segmentTextFromTokens(tokens, startToken, endToken) {
  if (!Array.isArray(tokens)) return ''
  if (
    !Number.isInteger(startToken) ||
    !Number.isInteger(endToken) ||
    startToken < 0 ||
    endToken < startToken ||
    endToken >= tokens.length
  ) {
    return ''
  }
  return tokens.slice(startToken, endToken + 1).join(' ')
}
