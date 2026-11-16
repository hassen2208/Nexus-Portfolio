"""Convert the user's static OBJ avatar into an optimized, web-deliverable GLB.
Requires Python packages numpy and trimesh; no remote services.
Voxel clustering keeps vertices near one another but may remove fine details; retain the original .obj separately.
Usage: python scripts/optimize_avatar.py /path/to/avatar.obj public/models/hassen-avatar.glb [voxel=0.009]
"""
import sys
import os
import numpy as np
import trimesh
from pathlib import Path

if len(sys.argv) < 3:
    raise SystemExit('Usage: python optimize_avatar.py input.obj output.glb [voxel=0.009]')
inp=Path(sys.argv[1]); out=Path(sys.argv[2]); voxel=float(sys.argv[3]) if len(sys.argv)>3 else 0.009
vertices=[]; faces=[]
with inp.open(encoding='utf-8',errors='ignore') as f:
    for line in f:
        if line.startswith('v '):
            vertices.append([float(s) for s in line.split()[1:4]])
        elif line.startswith('f '):
            parts=line.split()[1:]
            if len(parts)==3: faces.append([int(s.split('/')[0])-1 for s in parts])
verts=np.asarray(vertices,dtype=np.float32)
tris=np.asarray(faces,dtype=np.int32)
origin=verts.min(axis=0)
keys=np.floor((verts-origin)/voxel).astype(np.int32)
_, inv=np.unique(keys, axis=0,return_inverse=True)
counts=np.bincount(inv)
newverts=np.column_stack([np.bincount(inv,weights=verts[:,d])/counts for d in range(3)]).astype(np.float32)
newtris=inv[tris]
keep=(newtris[:,0]!=newtris[:,1])&(newtris[:,1]!=newtris[:,2])&(newtris[:,0]!=newtris[:,2])
newtris=newtris[keep].astype(np.int32)
# Remove duplicate faces from voxel collapse. Use sorted keys but preserve original winding.
_, unique_idx=np.unique(np.sort(newtris,axis=1),axis=0,return_index=True)
newtris=newtris[np.sort(unique_idx)]
mesh=trimesh.Trimesh(vertices=newverts,faces=newtris,process=False)
# Keep world orientation and unit scale from source: Y is up, the original avatar is ~1.9 units high.
mesh.visual=trimesh.visual.ColorVisuals(mesh,vertex_colors=np.tile([180,201,214,255],(len(mesh.vertices),1)))
mesh.fix_normals()
out.parent.mkdir(parents=True,exist_ok=True)
mesh.export(str(out),file_type='glb')
print('Original vertices',len(verts),'faces',len(tris),'bounds',verts.min(0),verts.max(0))
print('Optimized vertices',len(mesh.vertices),'faces',len(mesh.faces),'bounds',mesh.bounds)
print('GLB bytes',out.stat().st_size,'file',out)
