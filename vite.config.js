import path from 'path';

export default {
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
