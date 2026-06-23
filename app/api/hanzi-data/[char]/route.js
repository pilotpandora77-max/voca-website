import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET(request, { params }) {
  const char = decodeURIComponent(params.char);
  try {
    const filePath = join(process.cwd(), 'node_modules/hanzi-writer-data', `${char}.json`);
    const data = JSON.parse(readFileSync(filePath, 'utf8'));
    return Response.json(data);
  } catch {
    return Response.json({ error: 'Character not found' }, { status: 404 });
  }
}
