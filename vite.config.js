import path from 'path';
import react from '@vitejs/plugin-react';

export default {
    plugins: [react({

    })],
    base: '/tower-defense-frog/',
    build: {
        outDir: './dist'
    },
    resolve: {
        alias: {
            $: path.resolve(__dirname, 'lib'),
            src: path.resolve(__dirname, './src')
        }
    }
};
