#!/usr/bin/env python3
"""Convert the submitted rigged hassen-avatar.glb into a compact glTF 2.0 GLB.

Keeps original vertex attributes, indices, mesh geometry, scene hierarchy, node names,
skins and animations as-is. Recompresses embedded opaque PNG textures into JPEG to
reduce load while retaining full 2048x2048 resolution. This utility does not add a rig.
Requires Pillow (`pip install Pillow`). Usage:
 python scripts/prepare_avatar.py /path/to/hassen-avatar.glb public/models/hassen-avatar.glb
"""
from __future__ import annotations
import argparse
import copy
from io import BytesIO
import json
import struct
from pathlib import Path
from PIL import Image

JSON_CHUNK = 0x4E4F534A
BIN_CHUNK = 0x004E4942

def align4(data: bytes, padding=b'\0') -> bytes:
    return data + (padding * ((-len(data)) % 4))

def unpack_glb(path: Path):
    raw = path.read_bytes()
    if len(raw)<20 or raw[:4]!=b'glTF':
        raise ValueError('Not a GLB')
    version, total = struct.unpack_from('<II',raw,4)
    if version!=2 or total!=len(raw):
        raise ValueError('Unsupported glTF version or corrupt length')
    cursor=12; contents={}
    while cursor<len(raw):
        length,typ=struct.unpack_from('<II',raw,cursor);cursor+=8
        contents[typ]=raw[cursor:cursor+length];cursor+=length
    return json.loads(contents[JSON_CHUNK].decode('utf-8')), contents[BIN_CHUNK]

def pack_glb(data: dict, binary: bytes) -> bytes:
    j=align4(json.dumps(data,separators=(',',':'),ensure_ascii=False).encode('utf-8'),b' ')
    b=align4(binary,b'\0')
    return b'glTF'+struct.pack('<II',2,12+8+len(j)+8+len(b))+struct.pack('<II',len(j),JSON_CHUNK)+j+struct.pack('<II',len(b),BIN_CHUNK)+b

def convert(source:Path,out:Path,quality:int=91):
    data,binary=unpack_glb(source)
    data=copy.deepcopy(data)
    views=data['bufferViews']
    replacements={}
    for image in data.get('images',[]):
        if image.get('mimeType')!='image/png' or 'bufferView' not in image:
            continue
        idx=image['bufferView'];view=views[idx];start=view.get('byteOffset',0)
        img=Image.open(BytesIO(binary[start:start+view['byteLength']]))
        if 'A' in img.getbands() and img.getchannel('A').getextrema()!=(255,255):
            continue
        dst=BytesIO()
        img.convert('RGB').save(dst,'JPEG',quality=quality,subsampling=0,optimize=True)
        replacements[idx]=dst.getvalue()
        image['mimeType']='image/jpeg'
    new_binary=bytearray()
    for i,view in enumerate(views):
        start=view.get('byteOffset',0)
        b=replacements.get(i,binary[start:start+view['byteLength']])
        new_binary.extend(b'\0'*((-len(new_binary))%4))
        view['byteOffset']=len(new_binary)
        view['byteLength']=len(b)
        new_binary.extend(b)
    data['buffers'][0]['byteLength']=len(new_binary)
    out.parent.mkdir(parents=True,exist_ok=True)
    out.write_bytes(pack_glb(data,bytes(new_binary)))
    print(f'{source.name}: {source.stat().st_size/1048576:.2f} MiB → {out.name}: {out.stat().st_size/1048576:.2f} MiB')
    print(f'preserved geometry: {len(data.get("meshes",[]))} mesh(es), skins: {len(data.get("skins",[]))}, animations: {len(data.get("animations",[]))}, recompressed images: {len(replacements)}')

if __name__=='__main__':
    p=argparse.ArgumentParser()
    p.add_argument('source',type=Path)
    p.add_argument('destination',type=Path)
    p.add_argument('--quality',type=int,default=91)
    a=p.parse_args()
    convert(a.source,a.destination,a.quality)
