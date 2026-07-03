import re
import json
import os

def clean_text_lines(lines_list):
    """
    Cleans raw lines from a section: removes form-feeds, skips page numbers,
    normalizes double spaces, and reconstructs paragraph boundaries.
    """
    cleaned_lines = []
    for line in lines_list:
        # Remove form feed character
        line = line.replace('\x0c', '')
        # Skip page number lines
        if re.match(r'^\s*\d+\s*$', line):
            continue
        cleaned_lines.append(line)

    paragraphs = []
    current_para = []

    for line in cleaned_lines:
        stripped = line.strip()
        if not stripped:
            # Empty line indicates potential paragraph break
            if not current_para:
                continue
            
            # Check if the paragraph should actually end.
            # It ends if it has a sentence terminator at the end of the last word.
            last_word = current_para[-1].strip()
            if last_word and last_word[-1] in ('.', ':', ';', '?', '!', '"', ')'):
                para_text = " ".join(current_para)
                para_text = re.sub(r'\s+', ' ', para_text).strip()
                if para_text:
                    paragraphs.append(para_text)
                current_para = []
            else:
                # Spurious empty line (e.g. from page margins/headers/spacings)
                continue
        else:
            # Check if this line starts a new list item (e.g. '1. ', 'a. ', '24) ')
            # If so, finalize the previous paragraph even without explicit blank line spacing.
            is_new_item = re.match(r'^(?:\d{1,3}|[a-zA-Z])[\.\)]\s', stripped)
            if is_new_item and current_para:
                para_text = " ".join(current_para)
                para_text = re.sub(r'\s+', ' ', para_text).strip()
                if para_text:
                    paragraphs.append(para_text)
                current_para = []
            
            current_para.append(stripped)

    # Add the last paragraph if any
    if current_para:
        para_text = " ".join(current_para)
        para_text = re.sub(r'\s+', ' ', para_text).strip()
        if para_text:
            paragraphs.append(para_text)

    return "\n\n".join(paragraphs)


def parse_constitution(file_path, encoding="utf-16"):
    """
    Parses a Constitution Markdown file using a state machine.
    Thin wrapper: lee el archivo y delega en parse_constitution_text (función pura).
    """
    with open(file_path, "r", encoding=encoding) as f:
        text = f.read()
    return parse_constitution_text(text)


def parse_constitution_text(text: str) -> dict:
    """
    Parsea el texto de una Constitución con una máquina de estados.

    Función PURA (sin I/O): recibe el texto crudo (p. ej. extraído de un PDF o
    leído de un .md) y devuelve la estructura jerárquica. La extracción de
    formatos distintos al de 1993 será imperfecta; por eso existe la revisión
    humana contra el PDF antes de publicar (M8).
    """
    lines = text.splitlines(keepends=True)

    # Output structure matching Supabase tables + extra sections
    titulos = []
    capitulos = []
    articulos = []
    
    preambulo_lines = []
    disposiciones_finales = []
    disposiciones_especiales = []
    declaracion_lines = []

    # State machine variables
    # States: PREAMBULO, BODY, DISPOSICIONES_FINALES, DISPOSICIONES_ESPECIALES, DECLARACION
    state = "PREAMBULO"
    
    current_title_romano = None
    current_chapter_romano = None
    
    waiting_for_title_name = False
    waiting_for_chapter_name = False

    # Buffers
    active_article = None      # {'numero': int, 'lines': []}
    active_disposition = None  # {'numero': str, 'lines': []}

    # Regex patterns
    title_pattern = re.compile(r"^T[ií]t(?:ulo)?\.?\s+([IVXLCDM]+)[\s\.\-]*$", re.IGNORECASE)
    capitulo_pattern = re.compile(r"^Cap(?:[ií]tulo)?\.?\s+([IVXLCDM]+)[\s\.\-]*$", re.IGNORECASE)
    articulo_pattern = re.compile(r"^Art(?:[ií]culo)?\.?\s*(\d+)[°\s\.\-]+(.*)$")
    
    disp_finales_pattern = re.compile(r"^DISPOSICIONES\s+FINALES\s+Y\s+TRANSITORIAS$", re.IGNORECASE)
    disp_especiales_pattern = re.compile(r"^DISPOSICIONES\s+TRANSITORIAS\s+ESPECIALES$", re.IGNORECASE)
    declaracion_pattern = re.compile(r"^DECLARACION$", re.IGNORECASE)
    
    # Matches 'Primera.-', 'Segunda.-', 'TERCERA.-', etc.
    disp_item_pattern = re.compile(r"^([a-zA-ZáéíóúÁÉÍÓÚñÑ]+)\.-\s*(.*)$")

    def save_active_article():
        nonlocal active_article
        if active_article:
            text = clean_text_lines(active_article["lines"])
            articulos.append({
                "titulo_romano": current_title_romano,
                "capitulo_romano": current_chapter_romano,
                "numero": int(active_article["numero"]),
                "sumilla": None,
                "contenido": text
            })
            active_article = None

    def save_active_disposition():
        nonlocal active_disposition
        if active_disposition:
            text = clean_text_lines(active_disposition["lines"])
            item = {
                "numero": active_disposition["numero"].capitalize(),
                "contenido": text
            }
            if state == "DISPOSICIONES_FINALES":
                disposiciones_finales.append(item)
            elif state == "DISPOSICIONES_ESPECIALES":
                disposiciones_especiales.append(item)
            active_disposition = None

    for line_num, line in enumerate(lines, 1):
        clean = line.replace("\x0c", "").strip()

        # Ignore page number lines
        if re.match(r"^\d+$", clean):
            continue

        # --- TRANSITION CHECKS ---
        
        # 1. Title Transition
        title_match = title_pattern.match(clean)
        if title_match:
            save_active_article()
            save_active_disposition()
            current_title_romano = title_match.group(1).upper()
            current_chapter_romano = None
            waiting_for_title_name = True
            waiting_for_chapter_name = False
            state = "BODY"
            continue

        # 2. Chapter Transition
        cap_match = capitulo_pattern.match(clean)
        if cap_match:
            save_active_article()
            save_active_disposition()
            current_chapter_romano = cap_match.group(1).upper()
            waiting_for_chapter_name = True
            state = "BODY"
            continue

        # 3. Article Transition
        art_match = articulo_pattern.match(clean)
        if art_match:
            save_active_article()
            save_active_disposition()
            state = "BODY"
            active_article = {
                "numero": art_match.group(1),
                "lines": [art_match.group(2)]
            }
            continue

        # 4. Disposiciones Finales Transition
        if disp_finales_pattern.match(clean):
            save_active_article()
            save_active_disposition()
            state = "DISPOSICIONES_FINALES"
            continue

        # 5. Disposiciones Especiales Transition
        if disp_especiales_pattern.match(clean):
            save_active_article()
            save_active_disposition()
            state = "DISPOSICIONES_ESPECIALES"
            continue

        # 6. Declaracion Transition
        if declaracion_pattern.match(clean):
            save_active_article()
            save_active_disposition()
            state = "DECLARACION"
            continue

        # --- STATE LOGIC ---
        if state == "PREAMBULO":
            preambulo_lines.append(line)

        elif state == "BODY":
            if waiting_for_title_name:
                if clean:
                    titulos.append({
                        "numero_romano": current_title_romano,
                        "denominacion": clean
                    })
                    waiting_for_title_name = False
                continue
            elif waiting_for_chapter_name:
                if clean:
                    capitulos.append({
                        "titulo_romano": current_title_romano,
                        "numero_romano": current_chapter_romano,
                        "denominacion": clean
                    })
                    waiting_for_chapter_name = False
                continue
            elif active_article:
                active_article["lines"].append(line)

        elif state in ("DISPOSICIONES_FINALES", "DISPOSICIONES_ESPECIALES"):
            disp_match = disp_item_pattern.match(clean)
            if disp_match:
                save_active_disposition()
                active_disposition = {
                    "numero": disp_match.group(1),
                    "lines": [disp_match.group(2)]
                }
            elif active_disposition:
                active_disposition["lines"].append(line)

        elif state == "DECLARACION":
            declaracion_lines.append(line)

    # Save remaining active items
    save_active_article()
    save_active_disposition()

    # Clean up static blocks
    preambulo_text = clean_text_lines(preambulo_lines)
    declaracion_text = clean_text_lines(declaracion_lines)

    return {
        "titulos": titulos,
        "capitulos": capitulos,
        "articulos": articulos,
        "preambulo": preambulo_text,
        "disposiciones_finales": disposiciones_finales,
        "disposiciones_especiales": disposiciones_especiales,
        "declaracion": declaracion_text
    }

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    input_path = os.path.join(script_dir, "constitucion.md")
    output_path = os.path.join(script_dir, "constitucion.json")

    print(f"Reading from {input_path}...")
    if not os.path.exists(input_path):
        print(f"Error: {input_path} not found!")
        return

    data = parse_constitution(input_path)

    print("\n--- Parsing Statistics ---")
    print(f"Titles found: {len(data['titulos'])}")
    print(f"Chapters found: {len(data['capitulos'])}")
    print(f"Articles found: {len(data['articulos'])}")
    print(f"Final Dispositions found: {len(data['disposiciones_finales'])}")
    print(f"Special Dispositions found: {len(data['disposiciones_especiales'])}")
    print(f"Preamble text length: {len(data['preambulo'])} characters")
    print(f"Declaration text length: {len(data['declaracion'])} characters")

    # Save to JSON
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"\nSuccessfully saved JSON to {output_path}")

if __name__ == "__main__":
    main()
