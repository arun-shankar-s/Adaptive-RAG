from langchain_text_splitters import RecursiveCharacterTextSplitter

def chunk_pages(pages, chunk_size=500, chunk_overlap=50):
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap
    )

    chunks = []
    chunk_index = 0

    for page in pages:
        splits = splitter.split_text(page["text"])

        for split in splits:
            chunks.append({
                "chunk_index": chunk_index,
                "text": split,
                "char_count": len(split),
                "page_number": page["page_number"]
            })
            chunk_index += 1

    return chunks