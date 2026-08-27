from io import BytesIO

import qrcode


def generate_qr_png_bytes(data: str, box_size: int = 8, border: int = 2) -> bytes:
    img = qrcode.make(data, box_size=box_size, border=border)
    buf = BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()
