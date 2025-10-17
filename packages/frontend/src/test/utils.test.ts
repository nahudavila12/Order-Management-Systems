import { cn, formatCurrency, truncateText } from '@/lib/utils'

describe('utils', () => {
  it('cn merges classes', () => {
    expect(cn('a', false && 'b', 'c')).toBe('a c')
  })

  it('formatCurrency formats USD', () => {
    expect(formatCurrency(1234)).toMatch(/\$1,234/)
  })

  it('truncateText truncates long text', () => {
    expect(truncateText('abcdef', 4)).toBe('abcd...')
  })
})
