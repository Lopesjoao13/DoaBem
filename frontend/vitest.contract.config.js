import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'

// Testes de contrato: rodam contra um backend real (padrão http://localhost:8080).
// Use CONTRACT_API_URL para apontar para outro endereço.
const apiUrl = process.env.CONTRACT_API_URL ?? 'http://localhost:8080'

export default defineConfig({
    resolve: {
        alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    test: {
        environment: 'node',
        env: { VITE_USE_MOCK: 'false', VITE_API_URL: `${apiUrl}/api`, CONTRACT_API_URL: apiUrl },
        setupFiles: ['./tests/contract/setup.js'],
        include: ['tests/contract/**/*.test.js'],
        fileParallelism: false,
        testTimeout: 20000,
    },
})
