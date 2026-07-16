// بيتشغّل قبل كل بناء (npm run build)، وبيكتب رقم نسخة جديد في public/version.json
// المتصفح بيتحقق من الملف ده كل شوية، ولو لقى رقم مختلف عن اللي حمّله، يظهر تنبيه "فيه تحديث جديد"
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const version = String(Date.now());

writeFileSync(
  join(__dirname, '../public/version.json'),
  JSON.stringify({ version })
);

console.log('Generated build version:', version);
