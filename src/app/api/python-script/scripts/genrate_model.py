import bpy
import requests
import os

def create_scene():
    if bpy.context.object and bpy.context.object.mode == 'EDIT':
        bpy.ops.object.mode_set(mode='OBJECT')

    obj_name = "MainObject"
    mesh_name = "MainMesh"
    mat_name = "MainMaterial"

    if obj_name in bpy.data.objects:
        bpy.ops.object.select_all(action='DESELECT')
        bpy.data.objects[obj_name].select_set(True)
        bpy.ops.object.delete()

    if mesh_name in bpy.data.meshes:
        mesh_to_remove = bpy.data.meshes[mesh_name]
        bpy.data.meshes.remove(mesh_to_remove)

    if mat_name in bpy.data.materials:
        material_to_remove = bpy.data.materials[mat_name]
        bpy.data.materials.remove(material_to_remove)

    main_material = bpy.data.materials.new(name=mat_name)
    main_material.diffuse_color = (0.4, 0.2, 0.1, 1.0)

    bpy.ops.object.select_all(action='DESELECT')
    
    parts = []

    to_rad_factor = 3.141592653589793 / 180.0
    cos_30_deg = 0.8660254037844386 
    sin_30_deg = 0.5                

    bpy.ops.mesh.primitive_cube_add(size=1, enter_editmode=False, align='WORLD', location=(0, 0, 0.7))
    body = bpy.context.active_object
    body.scale = (2.0, 0.8, 0.6)
    parts.append(body)

    bpy.ops.mesh.primitive_cube_add(size=0.5, enter_editmode=False, align='WORLD', location=(1.25, 0, 0.85))
    head = bpy.context.active_object
    parts.append(head)

    leg_radius = 0.1
    leg_depth = 0.8
    leg_base_z = 0.4 
    leg_center_z = leg_base_z - leg_depth / 2

    leg_params = [
        {"loc": (0.7, 0.3, leg_center_z), "rot_y": 15.0},
        {"loc": (0.7, -0.3, leg_center_z), "rot_y": -15.0},
        {"loc": (-0.7, 0.3, leg_center_z), "rot_y": -15.0},
        {"loc": (-0.7, -0.3, leg_center_z), "rot_y": 15.0}
    ]

    for params in leg_params:
        bpy.ops.mesh.primitive_cylinder_add(
            radius=leg_radius, 
            depth=leg_depth, 
            enter_editmode=False, 
            align='WORLD', 
            location=params["loc"],
            vertices=16
        )
        leg = bpy.context.active_object
        leg.rotation_euler[1] = params["rot_y"] * to_rad_factor
        parts.append(leg)

    tail_length = 0.7
    tail_radius = 0.08
    attach_point_z = 0.6 
    
    final_rot_y_tail_rad = (-90.0 + 30.0) * to_rad_factor

    tail_center_x = -1.0 - (tail_length / 2) * cos_30_deg
    tail_center_z = attach_point_z + (tail_length / 2) * sin_30_deg
    
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=8,
        radius=tail_radius,
        depth=tail_length,
        enter_editmode=False,
        align='WORLD',
        location=(tail_center_x, 0, tail_center_z)
    )
    tail = bpy.context.active_object
    tail.rotation_euler = (0, final_rot_y_tail_rad, 0)
    parts.append(tail)

    bpy.ops.object.select_all(action='DESELECT')
    for part in parts:
        part.select_set(True)
    
    if parts: 
        bpy.context.view_layer.objects.active = parts[0]

    bpy.ops.object.join()
    
    main_obj = bpy.context.active_object
    main_obj.name = obj_name
    
    if main_obj.data:
        main_obj.data.name = mesh_name

    if main_obj.data.materials:
        main_obj.data.materials[0] = main_material
    else:
        main_obj.data.materials.append(main_material)

    return main_obj

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
