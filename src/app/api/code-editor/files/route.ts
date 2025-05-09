
import fs from 'fs';
import { NextResponse } from 'next/server';
import path from 'path';

const getFileTree = (dir: string) => {
  const fileTree: any = {};
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const itemPath = path.join(dir, item);
    const stats = fs.statSync(itemPath);

    if (stats.isDirectory()) {
      fileTree[item] = getFileTree(itemPath);
    } else {
      fileTree[item] = fs.readFileSync(itemPath, 'utf-8');
    }
  }

  return fileTree;
};

// Assuming your project root is the current working directory
const projectRoot = path.join(process.cwd(),"8b1ee302-564a-41aa-89ea-6ecd49bd57c3") ;



export async function GET() {
  try {
   console.log("Extracting Files")
   const filePath = getFileTree(projectRoot) 
   console.log(filePath)
   return NextResponse.json({ output: filePath}, { status: 200 });

  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
}