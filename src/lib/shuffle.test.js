import { describe, expect, it } from 'vitest'
import { pickRandom, shuffle, shuffleNotSolved } from './shuffle'

describe('shuffle', () => {
  it('mantém os mesmos itens e não muta a entrada', () => {
    const input = [1, 2, 3, 4, 5]
    const result = shuffle(input)
    expect(result).toHaveLength(input.length)
    expect([...result].sort()).toEqual([...input].sort())
    expect(input).toEqual([1, 2, 3, 4, 5])
  })
})

describe('shuffleNotSolved', () => {
  it('devolve listas de 0 ou 1 item sem alterações', () => {
    expect(shuffleNotSolved([])).toEqual([])
    expect(shuffleNotSolved(['a'])).toEqual(['a'])
  })

  it('nunca devolve a ordem correta', () => {
    const ids = ['a', 'b', 'c', 'd', 'e']
    for (let attempt = 0; attempt < 30; attempt += 1) {
      const result = shuffleNotSolved(ids)
      expect(result).not.toEqual(ids)
      expect([...result].sort()).toEqual([...ids].sort())
    }
  })
})

describe('pickRandom', () => {
  it('sorteia a quantidade pedida sem repetir', () => {
    const result = pickRandom([1, 2, 3, 4], 2)
    expect(result).toHaveLength(2)
    expect(new Set(result).size).toBe(2)
  })

  it('não sorteia mais do que existe', () => {
    expect(pickRandom([1, 2], 5)).toHaveLength(2)
    expect(pickRandom([1, 2], 0)).toEqual([])
  })
})
