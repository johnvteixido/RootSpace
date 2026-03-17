import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

describe('Dashboard Project Structure', () => {
  it('should have a src directory', () => {
    const srcPath = path.resolve(process.cwd(), 'src')
    expect(fs.existsSync(srcPath)).toBe(true)
  })

  it('should have an index.html entry point', () => {
    const indexPath = path.resolve(process.cwd(), 'index.html')
    expect(fs.existsSync(indexPath)).toBe(true)
  })

  it('should have a vite.config.js', () => {
    const configPath = path.resolve(process.cwd(), 'vite.config.js')
    expect(fs.existsSync(configPath)).toBe(true)
  })
})
