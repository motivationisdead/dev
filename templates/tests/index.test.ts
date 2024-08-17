import { describe, expect, it, spyOn } from 'bun:test'
import { greet } from '../src/index'

describe('#greet', () => {
  it('prints a greeting to the console', () => {
    const spy = spyOn(console, 'log')

    greet('World')

    expect(spy).toHaveBeenCalledWith('Hello, World!')
  })
})
