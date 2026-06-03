import subprocess
import shutil


def pdf_to_docx(input_path: str, output_path: str):
    """
    Try LibreOffice headless conversion first. If not available, fall back to pdf2docx via Python.
    """
    # Try LibreOffice
    libreoffice = shutil.which('libreoffice') or shutil.which('soffice')
    if libreoffice:
        # LibreOffice will write output to current directory; run in output dir
        out_dir = '/tmp' if not output_path.startswith('/') else '/'
        cmd = [libreoffice, '--headless', '--convert-to', 'docx', '--outdir', str(shutil.os.path.dirname(output_path)), str(input_path)]
        subprocess.run(cmd, check=True)
        # LibreOffice names output file with same base name
        return

    # Fallback to pdf2docx
    try:
        from pdf2docx import Converter
        cv = Converter(input_path)
        cv.convert(output_path)
        cv.close()
    except Exception as e:
        raise RuntimeError('No conversion backend available: install libreoffice or pdf2docx') from e
