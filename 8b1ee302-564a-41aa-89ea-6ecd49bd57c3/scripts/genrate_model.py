import bpy
import requests
import os

def create_scene():
    if bpy.context.mode == 'EDIT_MESH':
        bpy.ops.object.mode_set(mode='OBJECT')

    object_name = "MainObject"
    mesh_name = "MainMesh"
    material_name = "MainMaterial"

    if object_name in bpy.data.objects:
        bpy.data.objects[object_name].select_set(True)
        bpy.ops.object.delete(use_global=False)
    if mesh_name in bpy.data.meshes:
        bpy.data.meshes.remove(bpy.data.meshes[mesh_name])
    if material_name in bpy.data.materials:
        bpy.data.materials.remove(bpy.data.materials[material_name])

    mesh = bpy.data.meshes.new(mesh_name)
    obj = bpy.data.objects.new(object_name, mesh)
    bpy.context.collection.objects.link(obj)

    verts = [(1, 0, 0), (-1, 0, 0), (0, 1, 0), (0, 0, 1)]
    edges = [(0, 1), (0, 2), (0, 3), (1, 2), (1, 3), (2, 3)]
    faces = [(0, 2, 3), (0, 3, 1), (0, 1, 2), (1, 3, 2)]

    mesh.from_pydata(verts, edges, faces)
    mesh.update()

    mat = bpy.data.materials.new(name=material_name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]

    # Color Scheme: Red, Green, Blue, Yellow

    mat.node_tree.links.clear()
    output = mat.node_tree.nodes["Material Output"]

    color1 = mat.node_tree.nodes.new("ShaderNodeRGB")
    color1.outputs["Color"].default_value = (1.0, 0.0, 0.0, 1.0) # Red
    color2 = mat.node_tree.nodes.new("ShaderNodeRGB")
    color2.outputs["Color"].default_value = (0.0, 1.0, 0.0, 1.0) # Green
    color3 = mat.node_tree.nodes.new("ShaderNodeRGB")
    color3.outputs["Color"].default_value = (0.0, 0.0, 1.0, 1.0) # Blue
    color4 = mat.node_tree.nodes.new("ShaderNodeRGB")
    color4.outputs["Color"].default_value = (1.0, 1.0, 0.0, 1.0) # Yellow

    separate_xyz = mat.node_tree.nodes.new("ShaderNodeSeparateXYZ")
    geometry = mat.node_tree.nodes.new("ShaderNodeGeometry")

    math_node1 = mat.node_tree.nodes.new("ShaderNodeMath")
    math_node1.operation = 'GREATER_THAN'
    math_node1.inputs[1].default_value = 0.0

    math_node2 = mat.node_tree.nodes.new("ShaderNodeMath")
    math_node2.operation = 'GREATER_THAN'
    math_node2.inputs[1].default_value = 0.0

    mix_node1 = mat.node_tree.nodes.new("ShaderNodeMixRGB")
    mix_node1.blend_type = 'MIX'
    mix_node1.inputs[0].default_value = 0.5
    mix_node1.inputs[1].default_value = (0.0, 1.0, 0.0, 1.0)
    mix_node1.inputs[2].default_value = (0.0, 0.0, 1.0, 1.0)

    mix_node2 = mat.node_tree.nodes.new("ShaderNodeMixRGB")
    mix_node2.blend_type = 'MIX'
    mix_node2.inputs[0].default_value = 0.5
    mix_node2.inputs[1].default_value = (1.0, 0.0, 0.0, 1.0)
    mix_node2.inputs[2].default_value = (0.0, 1.0, 0.0, 1.0)

    mat.node_tree.links.new(geometry.outputs["Position"], separate_xyz.inputs["Vector"])
    mat.node_tree.links.new(separate_xyz.outputs["X"], math_node1.inputs[0])
    mat.node_tree.links.new(separate_xyz.outputs["Z"], math_node2.inputs[0])
    mat.node_tree.links.new(math_node1.outputs["Value"], mix_node1.inputs[0])
    mat.node_tree.links.new(math_node2.outputs["Value"], mix_node2.inputs[0])

    mat.node_tree.links.new(mix_node1.outputs["Color"], mix_node2.inputs[1])
    mat.node_tree.links.new(mix_node2.outputs["Color"], bsdf.inputs["Base Color"])

    obj.data.materials.append(mat)

    return obj
obj = create_scene()
def export_triangle_glb(obj, filepath="/triangle.glb"):
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
