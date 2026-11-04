import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages 주소가 /defence2/ 아래라서 빌드할 때만 경로를 붙인다.
  base: process.env.NODE_ENV === 'production' ? '/defence2/' : '/',
  plugins: [react()],
})
