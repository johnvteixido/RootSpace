import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

describe('RootSpace Project Structure', () => {
  it('should have a src directory', () => {
    const srcPath = path.resolve(process.cwd(), 'src')
    expect(fs.existsSync(srcPath)).toBe(true)
  })

  it('should have an index.js entry point', () => {
    const indexPath = path.resolve(process.cwd(), 'src', 'index.js')
    expect(fs.existsSync(indexPath)).toBe(true)
  })

  it('should have a dashboard directory', () => {
    const dashboardPath = path.resolve(process.cwd(), 'dashboard')
    expect(fs.existsSync(dashboardPath)).toBe(true)
  })
})
