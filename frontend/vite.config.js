import { resolve } from 'path'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import eslint from 'vite-plugin-eslint'
import monaco from "vite-plugin-monaco-editor"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), eslint(), monaco()],
  build: {
    rollupOptions: {
      input: {
        tryout: resolve(__dirname, 'tryout.html'),
        index: resolve(__dirname, 'index.html'),
        views: resolve(__dirname, 'views.html'),
        screen: resolve(__dirname, 'screen.html'),
        editor: resolve(__dirname, 'editor.html'),
        datafetch: resolve(__dirname, 'datafetch.html'),
        dataplot: resolve(__dirname, 'dataplot.html'),
        modbus: resolve(__dirname, 'modbus.html'),
        opto22: resolve(__dirname, 'opto22.html'),
        laurel: resolve(__dirname, 'laurel.html'),
        preset: resolve(__dirname, 'preset.html'),
      }
    }
  },
  server: {
    proxy: {
      '/items/websocket': {
        target: 'http://127.0.0.1:4000',
        changeOrigin: true,
        secure: false,
        ws: true
      },
      '/views/websocket': {
        target: 'http://127.0.0.1:4000',
        changeOrigin: true,
        secure: false,
        ws: true
      },
      '/editor/websocket': {
        target: 'http://127.0.0.1:4000',
        changeOrigin: true,
        secure: false,
        ws: true
      },
      '/points/websocket': {
        target: 'http://127.0.0.1:4000',
        changeOrigin: true,
        secure: false,
        ws: true
      },
      '/screen/websocket': {
        target: 'http://127.0.0.1:4000',
        changeOrigin: true,
        secure: false,
        ws: true
      },
      '/dataplot/websocket': {
        target: 'http://127.0.0.1:4000',
        changeOrigin: true,
        secure: false,
        ws: true
      },
      '/api': {
        target: 'http://127.0.0.1:4000',
        changeOrigin: true,
        secure: false,
        ws: false
      }
    }
  }
})
