import { mkdir, mkdirSync } from 'fs';
import { writeFile } from 'fs/promises';

export async function CreateFile(filePath: string, content: string): Promise<void> {
    try {
        await writeFile(filePath, content, 'utf8');
        console.log(`File created at ${filePath}`);
    } catch (err) {
        console.error('Error writing file:', err);
    }
}
export  function CreateFolder(uniqueFolder: string) {
     mkdirSync(uniqueFolder);
  }
export const codeConst = `def export_triangle_glb(obj, filepath="/triangle.glb"):
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj

    bpy.ops.export_scene.gltf(
        filepath=filepath,
        export_format='GLB',
        use_selection=True
    )

    return filepath

def upload_file(filepath, url="https://api.aikka.io/survey/file/upload"):
    files = [
        ('file', ('triangle.glb', open(filepath, 'rb'), 'application/octet-stream'))
    ]
    payload = {'entity': 'build'}
    headers = {}
    response = requests.request("POST", url, headers=headers, data=payload, files=files)

    print(response.text)

    return response.status_code == 200

export_path = os.path.abspath(os.path.join(os.getcwd(), "triangle.glb"))
createdObject = create_scene()
exported_path = export_triangle_glb(createdObject, export_path)

if exported_path and os.path.exists(exported_path):
    success = upload_file(exported_path)
    if success:
        os.remove(exported_path)
`;
