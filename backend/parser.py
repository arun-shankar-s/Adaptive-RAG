from pypdf import PdfReader
from docx import Document

def parse_pdf(file):
    reader = PdfReader(file)
    pages = []
    
    for i, page in enumerate(reader.pages):
        text = page.extract_text() or ""
        pages.append({
            "page_number": i + 1,
            "text": text
        })
    
    return pages


def parse_docx(file):
    doc = Document(file)
    full_text = "\n".join([para.text for para in doc.paragraphs])
    
    return [{
        "page_number": None,
        "text": full_text
    }]