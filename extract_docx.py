import zipfile
import xml.etree.ElementTree as ET

def extract_text_from_docx(docx_path):
    try:
        with zipfile.ZipFile(docx_path) as docx:
            xml_content = docx.read('word/document.xml')
            tree = ET.XML(xml_content)
            namespace = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
            paragraphs = tree.findall('.//w:p', namespace)
            text = []
            for p in paragraphs:
                texts = [node.text for node in p.findall('.//w:t', namespace) if node.text]
                if texts:
                    text.append(''.join(texts))
            return '\n'.join(text)
    except Exception as e:
        return str(e)

with open("prd_output.txt", "w", encoding="utf-8") as f:
    f.write("=== PRD v2 ===\n")
    f.write(extract_text_from_docx(r"c:\Users\ASUS\OneDrive\Pictures\ドキュメント\Desktop\shailraj\src\assets\Shailraj_Travels_SEO_PRD_v2.docx"))
    f.write("\n\n=== PRD v3 ===\n")
    f.write(extract_text_from_docx(r"c:\Users\ASUS\OneDrive\Pictures\ドキュメント\Desktop\shailraj\src\assets\Shailraj_Travels_SEO_PRD_v3.docx"))
