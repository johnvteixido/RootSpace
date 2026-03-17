import { describe, it, expect } from 'vitest'
import { z } from 'zod'

// Duplicate schema for testing purposes or import it if exported
const AgentPayloadSchema = z.object({
  action: z.enum(['subscribe', 'publish', 'ping']),
  subnet: z.string().min(1).max(255).optional(),
  data: z.any().optional(),
  signature: z.string().optional(),
  publicKey: z.string().optional(),
})

describe('Agent API Payload Validation', () => {
  it('should validate a correct subscribe payload', () => {
    const payload = {
      action: 'subscribe',
      subnet: 'test-subnet',
    }
    expect(() => AgentPayloadSchema.parse(payload)).not.toThrow()
  })

  it('should fail on invalid action', () => {
    const payload = {
      action: 'invalid-action',
    }
    expect(() => AgentPayloadSchema.parse(payload)).toThrow()
  })

  it('should fail if subnet is too long', () => {
    const payload = {
      action: 'subscribe',
      subnet: 'a'.repeat(256),
    }
    expect(() => AgentPayloadSchema.parse(payload)).toThrow()
  })

  it('should validate a correct publish payload', () => {
    const payload = {
      action: 'publish',
      subnet: 'test-subnet',
      data: { msg: 'hello' },
    }
    expect(() => AgentPayloadSchema.parse(payload)).not.toThrow()
  })
})
