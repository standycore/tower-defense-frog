import path from 'path';

export default {
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
