import { expect } from 'vitest'
import { expectShape } from '@/test/shapes.js'
import * as auth from '@/services/authService.js'
import { clearSession, saveSession } from '@/services/sessionStorageService.js'

export const API_URL = process.env.CONTRACT_API_URL ?? 'http://localhost:8080'

export const COORDINATOR = { email: 'coordenador@doabem.local', password: 'Doabem@123' }
export const OPERATOR = { email: 'operador@doabem.local', password: 'Doabem@123' }

// Sufixo único por execução: o banco H2 do backend persiste entre execuções enquanto ele estiver no ar.
export const RUN = Date.now().toString(36)
export const unique = (label) => `${label} ${RUN}${Math.random().toString(36).slice(2, 6)}`

export const isBackendUp = async () => {
    try {
        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: '{}',
        })
        return response.status > 0
    } catch {
        return false
    }
}

export const signInAs = async (account) => {
    const session = await auth.login(account.email, account.password)
    saveSession(session)
    return session
}

export const signOut = () => clearSession()

// Executa a chamada e devolve o ApiError lançado (falha o teste se não houver erro).
export const failure = async (promise) => {
    try {
        await promise
    } catch (error) {
        return error
    }
    throw new Error('A chamada deveria ter falhado, mas teve sucesso.')
}

export const expectStatus = async (promise, status) => {
    const error = await failure(promise)
    expect(error.status, `mensagem: ${error.message}`).toBe(status)
    return error
}

export const expectOneOfStatus = async (promise, statuses) => {
    const error = await failure(promise)
    expect(statuses, `status ${error.status}: ${error.message}`).toContain(error.status)
    return error
}

export const expectFieldError = async (promise, field) => {
    const error = await expectStatus(promise, 400)
    expect(error.fieldErrors, `sem fieldErrors em: ${error.message}`).toBeTruthy()
    expect(Object.keys(error.fieldErrors)).toContain(field)
    return error
}

export const check = (value, schema, label) => expectShape(value, schema, label)
