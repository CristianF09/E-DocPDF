import fitz  # PyMuPDF
from PIL import Image


def stamp_signature(input_pdf: str, signature_image: str, output_pdf: str, page: int = 1, x: float = 50.0, y: float = 50.0):
    """Places signature image on the specified page at coordinates (x,y) in PDF points.
    Coordinates are from top-left. """
    doc = fitz.open(input_pdf)
    page_index = max(0, page - 1)
    if page_index >= len(doc):
        raise ValueError('Page number out of range')

    img = Image.open(signature_image)
    # Convert to RGBA if necessary
    if img.mode != 'RGBA':
        img = img.convert('RGBA')

    rect = fitz.Rect(x, y, x + img.width, y + img.height)
    page_obj = doc[page_index]
    img_bytes = img.tobytes("png") if hasattr(img, 'tobytes') else None
    # Easiest: insert image from file
    page_obj.insert_image(rect, filename=signature_image)
    doc.save(output_pdf)
    doc.close()
