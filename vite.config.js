import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'fs'

// بيقرأ رقم النسخة اللي gen-version.js كتبه، عشان يحطه جوه الكود نفسه للمقارنة
let buildVersion = String(Date.now())
try {
  const versionFile = JSON.parse(readFileSync('./public/version.json', 'utf-8'))
  buildVersion = versionFile.version
} catch {
  // لو الملف مش موجود لسه (أول مرة)، هيستخدم الوقت الحالي
}

export default defineConfig({
  plugins: [react()],
  base: '/itqan-platform3/',
  define: {
    __BUILD_VERSION__: JSON.stringify(buildVersion),
  },
})
