from PIL import Image
import pytesseract
import os


def perform_ocr(input_path: str, lang: str = 'eng') -> str:
    """Performs OCR on the given file. If PDF, it will convert to images using PIL (requires pdf2image).
    """
    ext = os.path.splitext(input_path)[1].lower()
    text_parts = []
    if ext in ['.png', '.jpg', '.jpeg', '.tiff', '.bmp']:
        image = Image.open(input_path)
        text_parts.append(pytesseract.image_to_string(image, lang=lang))
    elif ext == '.pdf':
        try:
            from pdf2image import convert_from_path
            images = convert_from_path(input_path)
            for img in images:
                text_parts.append(pytesseract.image_to_string(img, lang=lang))
        except Exception as e:
            raise RuntimeError('pdf2image is required for PDF OCR; install poppler and pdf2image') from e
    else:
        raise RuntimeError('Unsupported file type for OCR')

    return "\n\n".join(text_parts)
