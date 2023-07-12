import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import svgrPlugin from 'vite-plugin-svgr';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), svgrPlugin()],
    base: '',
    build: {
        outDir: 'build',
    },
    server: {
        port: 3000
    },
    preview: {
        port: 3000
    }
});
