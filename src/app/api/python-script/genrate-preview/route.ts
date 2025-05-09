import { exec } from 'child_process';
import util from 'util';
import { NextResponse } from 'next/server';
import path from 'path';
import { z } from 'zod';
import { codeConst, CreateFile, CreateFolder } from '@/utils/functions/fileIO';
import { generateUUID } from 'three/src/math/MathUtils.js';


const execPromise = util.promisify(exec);
const bodySchema = z.object({
  code: z.string().min(5), // User input like: "a low-poly tree on a hill"
});


export async function POST(request: Request) {
  const body = await request.json();
  const { code } = bodySchema.parse(body);
  const uniqueKey = generateUUID()
  const uniqueFolder = path.join(process.cwd(), uniqueKey)
  CreateFolder(uniqueFolder);
  const scriptFolder = path.join(uniqueFolder, 'scripts')
  CreateFolder(scriptFolder);
  const scriptPath = path.join(scriptFolder, 'genrate_model.py');
  await CreateFile(scriptPath, code + "\n" + codeConst)
  try {
    const { stdout, stderr } = await execPromise(`python3 ${scriptPath}`);

    if (stderr) {
      console.error(`Stderr: ${stderr}`);
      return NextResponse.json({ error: stderr }, { status: 500 });
    }

    return NextResponse.json({ output: stdout.trim() }, { status: 200 });

  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


