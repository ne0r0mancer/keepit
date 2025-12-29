#!/usr/bin/env python3
"""Generate simple PNG icons for the extension."""
import struct
import zlib

def create_png(size, color=(74, 158, 255)):
    """Create a simple solid color PNG icon."""
    width = height = size
    
    def make_chunk(chunk_type, data):
        chunk = chunk_type + data
        crc = zlib.crc32(chunk) & 0xffffffff
        return struct.pack('>I', len(data)) + chunk + struct.pack('>I', crc)
    
    # PNG signature
    png = b'\x89PNG\r\n\x1a\n'
    
    # IHDR chunk
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0)
    png += make_chunk(b'IHDR', ihdr_data)
    
    # IDAT chunk (image data)
    raw_data = b''
    for _ in range(height):
        raw_data += b'\x00'  # filter byte
        for _ in range(width):
            raw_data += bytes(color)
    
    compressed = zlib.compress(raw_data)
    png += make_chunk(b'IDAT', compressed)
    
    # IEND chunk
    png += make_chunk(b'IEND', b'')
    
    return png

if __name__ == '__main__':
    for size in [16, 48, 128]:
        with open(f'../icon{size}.png', 'wb') as f:
            f.write(create_png(size))
        print(f'Created icon{size}.png')

