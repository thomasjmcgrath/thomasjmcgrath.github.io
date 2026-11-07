import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {fileURLToPath,URL} from 'node:url';

export default defineConfig({
 root:fileURLToPath(new URL('./web',import.meta.url)),
 publicDir:fileURLToPath(new URL('./public',import.meta.url)),
 base:'/',
 plugins:[react()],
 resolve:{alias:{'@':fileURLToPath(new URL('.',import.meta.url))}},
 server:{host:'0.0.0.0',allowedHosts:['terminal.local']},
 preview:{host:'0.0.0.0',allowedHosts:['terminal.local']},
 build:{outDir:fileURLToPath(new URL('./dist',import.meta.url)),emptyOutDir:true,sourcemap:false},
});
