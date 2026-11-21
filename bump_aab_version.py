#!/usr/bin/env python3
"""
Utility script to unpack an Android App Bundle (.aab), bump its versionCode and versionName
in both base/manifest/AndroidManifest.xml (AAPT2 protobuf format) and base/assets/app.config (JSON),
strip outdated signature files (META-INF/), and package a clean new .aab.

Usage:
    python3 bump_aab_version.py <input.aab> <output.aab> <new_version_code> <new_version_name>

Example:
    python3 bump_aab_version.py 9.aab 10.aab 10 1.0.10
"""

import sys
import zipfile
import json

def read_varint(data, pos):
    res = 0
    shift = 0
    while True:
        b = data[pos]
        pos += 1
        res |= (b & 0x7f) << shift
        if not (b & 0x80):
            break
        shift += 7
    return res, pos

def write_varint(val):
    out = bytearray()
    while True:
        towrite = val & 0x7f
        val >>= 7
        if val:
            out.append(towrite | 0x80)
        else:
            out.append(towrite)
            break
    return bytes(out)

def parse_proto(data):
    fields = []
    pos = 0
    length = len(data)
    while pos < length:
        tag, pos = read_varint(data, pos)
        wire_type = tag & 0x7
        field_num = tag >> 3
        if wire_type == 0:
            val, pos = read_varint(data, pos)
        elif wire_type == 1:
            val = data[pos:pos+8]
            pos += 8
        elif wire_type == 2:
            l, pos = read_varint(data, pos)
            val = data[pos:pos+l]
            pos += l
        elif wire_type == 5:
            val = data[pos:pos+4]
            pos += 4
        fields.append((field_num, wire_type, val))
    return fields

def serialize_proto(fields):
    out = bytearray()
    for field_num, wire_type, val in fields:
        tag = (field_num << 3) | wire_type
        out.extend(write_varint(tag))
        if wire_type == 0:
            out.extend(write_varint(val))
        elif wire_type in (1, 5):
            out.extend(val)
        elif wire_type == 2:
            out.extend(write_varint(len(val)))
            out.extend(val)
    return bytes(out)

def update_manifest(raw, new_version_code, new_version_name):
    top = parse_proto(raw)
    new_top = []
    for f_num, w_type, val in top:
        if f_num == 1 and w_type == 2:
            elem_fields = parse_proto(val)
            new_elem = []
            for ef_num, ew_type, evalue in elem_fields:
                if ef_num == 4 and ew_type == 2:
                    attr_fields = parse_proto(evalue)
                    attr_dict = {fn: v for fn, wt, v in attr_fields}
                    name = attr_dict.get(2, b'').decode('utf-8', errors='ignore')
                    if name == 'versionCode':
                        new_attr = []
                        for af_num, aw_type, avalue in attr_fields:
                            if af_num == 3:
                                new_attr.append((3, 2, str(new_version_code).encode('utf-8')))
                            elif af_num == 6:
                                prim = parse_proto(avalue)
                                new_prim = []
                                for pf_num, pw_type, pval in prim:
                                    if pf_num == 7:
                                        prim_fields = parse_proto(pval)
                                        new_prim_fields = [
                                            (pfn, pwt, new_version_code if pfn == 6 else pv)
                                            for pfn, pwt, pv in prim_fields
                                        ]
                                        new_prim.append((7, 2, serialize_proto(new_prim_fields)))
                                    else:
                                        new_prim.append((pf_num, pw_type, pval))
                                new_attr.append((6, 2, serialize_proto(new_prim)))
                            else:
                                new_attr.append((af_num, aw_type, avalue))
                        new_elem.append((4, 2, serialize_proto(new_attr)))
                    elif name == 'versionName':
                        new_attr = []
                        for af_num, aw_type, avalue in attr_fields:
                            if af_num == 3:
                                new_attr.append((3, 2, new_version_name.encode('utf-8')))
                            else:
                                new_attr.append((af_num, aw_type, avalue))
                        new_elem.append((4, 2, serialize_proto(new_attr)))
                    else:
                        new_elem.append((ef_num, ew_type, evalue))
                else:
                    new_elem.append((ef_num, ew_type, evalue))
            new_top.append((1, 2, serialize_proto(new_elem)))
        else:
            new_top.append((f_num, w_type, val))
    return serialize_proto(new_top)

def update_app_config(raw_bytes, new_version_code, new_version_name):
    data = json.loads(raw_bytes.decode('utf-8'))
    data['version'] = new_version_name
    if 'android' in data:
        data['android']['versionCode'] = new_version_code
    return json.dumps(data, separators=(',', ':')).encode('utf-8')

def main():
    if len(sys.argv) < 5:
        print("Usage: python3 bump_aab_version.py <input.aab> <output.aab> <new_version_code> <new_version_name>")
        sys.exit(1)

    input_aab = sys.argv[1]
    output_aab = sys.argv[2]
    new_code = int(sys.argv[3])
    new_name = sys.argv[4]

    print(f"Bumping {input_aab} -> {output_aab}")
    print(f"Target: versionCode = {new_code}, versionName = {new_name}")

    with zipfile.ZipFile(input_aab, 'r') as src, zipfile.ZipFile(output_aab, 'w') as dst:
        for item in src.infolist():
            if item.filename.startswith('META-INF/'):
                continue
            data = src.read(item.filename)
            if item.filename == 'base/manifest/AndroidManifest.xml':
                data = update_manifest(data, new_code, new_name)
            elif item.filename == 'base/assets/app.config':
                data = update_app_config(data, new_code, new_name)
            dst.writestr(item, data)

    print(f"Done! Created {output_aab}")

if __name__ == '__main__':
    main()
