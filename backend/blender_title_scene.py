"""Render a short procedural 3D title animation with Blender."""
import math
import sys
from pathlib import Path

import bpy
from mathutils import Vector


def arg_values():
    values = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    if len(values) != 4:
        raise SystemExit("Expected: title, style, duration_seconds, output_path")
    return values[0], values[1], int(values[2]), Path(values[3])


def material(name, color, metallic=0.0, roughness=0.35, emission=0.0):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*color, 1.0)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (*color, 1.0)
    bsdf.inputs["Metallic"].default_value = metallic
    bsdf.inputs["Roughness"].default_value = roughness
    if emission:
        bsdf.inputs["Emission Color"].default_value = (*color, 1.0)
        bsdf.inputs["Emission Strength"].default_value = emission
    return mat


def point_camera(camera, target):
    camera.rotation_euler = (Vector(target) - camera.location).to_track_quat("-Z", "Y").to_euler()


def main():
    title, style, duration, output_path = arg_values()
    fps = 24
    frames = duration * fps
    # Start from a clean scene.
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)

    palette = {
        "cosmic": ((0.02, 0.10, 0.28), (0.08, 0.72, 1.0), (1.0, 0.48, 0.12)),
        "gold": ((0.22, 0.08, 0.015), (1.0, 0.57, 0.08), (1.0, 0.90, 0.42)),
        "emerald": ((0.015, 0.16, 0.10), (0.08, 0.95, 0.48), (0.68, 1.0, 0.34)),
    }
    bg_color, accent, secondary = palette.get(style, palette["cosmic"])
    title_mat = material("AR Gold Metal", secondary, metallic=0.72, roughness=0.22)
    accent_mat = material("Luminous Accent", accent, metallic=0.25, roughness=0.25, emission=1.3)
    floor_mat = material("Midnight Floor", bg_color, metallic=0.35, roughness=0.32)

    # A thick extruded title is a real editable 3D text object.
    text_curve = bpy.data.curves.new("3D Title", "FONT")
    text_curve.body = title[:64]
    text_curve.align_x = "CENTER"
    text_curve.align_y = "CENTER"
    text_curve.extrude = 0.10
    text_curve.bevel_depth = 0.018
    text_curve.bevel_resolution = 2
    text_obj = bpy.data.objects.new("Animated 3D Title", text_curve)
    bpy.context.collection.objects.link(text_obj)
    text_obj.location = (0, 0, 1.0)
    text_obj.data.materials.append(title_mat)
    text_obj.scale = (1.0, 1.0, 1.0)
    text_obj.keyframe_insert(data_path="rotation_euler", frame=1)
    text_obj.rotation_euler.z = math.radians(8)
    text_obj.keyframe_insert(data_path="rotation_euler", frame=frames)
    text_obj.location.z = 1.35
    text_obj.keyframe_insert(data_path="location", frame=frames // 2)
    text_obj.location.z = 1.0
    text_obj.keyframe_insert(data_path="location", frame=frames)

    # Stage and circular plinth.
    bpy.ops.mesh.primitive_cylinder_add(vertices=96, radius=4.2, depth=0.18, location=(0, 0, 0.15))
    plinth = bpy.context.object
    plinth.name = "3D Display Plinth"
    plinth.data.materials.append(floor_mat)
    bevel = plinth.modifiers.new("Soft machined edge", "BEVEL")
    bevel.width = 0.12
    bevel.segments = 3
    plinth.modifiers.new("Weighted normals", "WEIGHTED_NORMAL")

    bpy.ops.mesh.primitive_plane_add(size=200, location=(0, 0, 0.04))
    bpy.context.object.name = "Infinite dark stage"
    bpy.context.object.data.materials.append(floor_mat)

    # Three orbiting accent spheres animate around the title.
    orbiters = []
    for index, (radius, size) in enumerate(((3.2, 0.20), (2.65, 0.12), (3.65, 0.10))):
        angle = index * (2 * math.pi / 3)
        bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=12, radius=size,
                                             location=(radius * math.cos(angle), radius * math.sin(angle), 1.0 + index * 0.45))
        orb = bpy.context.object
        orb.name = f"Animated accent {index + 1}"
        orb.data.materials.append(accent_mat if index % 2 == 0 else title_mat)
        for frame, turn in ((1, 0), (frames, 2 * math.pi)):
            a = angle + turn
            orb.location = (radius * math.cos(a), radius * math.sin(a), 0.8 + index * 0.55 + 0.18 * math.sin(a * 2))
            orb.keyframe_insert(data_path="location", frame=frame)
        orb.rotation_euler = (0, 0, 0)
        orb.keyframe_insert(data_path="rotation_euler", frame=1)
        orb.rotation_euler.z = math.tau
        orb.keyframe_insert(data_path="rotation_euler", frame=frames)
        orbiters.append(orb)

    # Camera and studio lighting.
    bpy.ops.object.camera_add(location=(0, -12.8, 5.2))
    camera = bpy.context.object
    camera.name = "Cinematic Camera"
    point_camera(camera, (0, 0, 1.1))
    bpy.context.scene.camera = camera
    camera.data.lens = 48

    def area_light(name, location, energy, color, size):
        bpy.ops.object.light_add(type="AREA", location=location)
        lamp = bpy.context.object
        lamp.name = name
        lamp.data.energy = energy
        lamp.data.color = color
        lamp.data.shape = "DISK"
        lamp.data.size = size
        point_camera(lamp, (0, 0, 1))

    area_light("Warm key light", (1, -5, 7), 1300, (1.0, 0.72, 0.42), 5)
    area_light("Cool rim light", (-5, 1, 4), 1800, accent, 4)
    area_light("Top softbox", (3, 4, 7), 1500, (0.35, 0.62, 1.0), 5)

    scene = bpy.context.scene
    scene.render.engine = "BLENDER_EEVEE_NEXT"
    scene.eevee.taa_render_samples = 16
    scene.frame_start = 1
    scene.frame_end = frames
    scene.render.fps = fps
    scene.render.resolution_x = 1280
    scene.render.resolution_y = 720
    scene.render.resolution_percentage = 50  # modest CPU-friendly preview size
    scene.render.image_settings.file_format = "FFMPEG"
    scene.render.ffmpeg.format = "MPEG4"
    scene.render.ffmpeg.codec = "H264"
    scene.render.ffmpeg.constant_rate_factor = "MEDIUM"
    scene.render.filepath = str(output_path)
    scene.world.color = (0.006, 0.009, 0.025)
    scene.view_settings.view_transform = "AgX"
    scene.render.film_transparent = False

    # Smooth motion between keys.
    for obj in (text_obj, *orbiters):
        if obj.animation_data and obj.animation_data.action:
            for curve in obj.animation_data.action.fcurves:
                for key in curve.keyframe_points:
                    key.interpolation = "BEZIER"

    scene.frame_set(1)
    bpy.ops.render.render(animation=True)
    if not output_path.exists() or output_path.stat().st_size < 1024:
        raise RuntimeError("Blender did not create a valid MP4 file.")


if __name__ == "__main__":
    main()
