import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd())

    return {
        plugins: [react()],
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url)),
            },
        },
        test: {
            environment: 'jsdom',
            environmentOptions: { jsdom: { url: 'http://localhost/' } },
            env: { VITE_USE_MOCK: 'false', VITE_API_URL: '/api' },
            setupFiles: ['./src/test/setup.js'],
            include: ['src/**/*.test.{js,jsx}'],
            restoreMocks: true,
        },
        server: {
            proxy: {
                '/api': env.VITE_API_PROXY_TARGET ?? 'http://localhost:8080',
            },
        },
    }
})
