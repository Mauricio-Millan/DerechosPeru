import json
import os
import sys

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    json_path = os.path.join(script_dir, "constitucion.json")

    print(f"Loading {json_path}...")
    if not os.path.exists(json_path):
        print("Error: constitucion.json not found! Run 'python etlconstitucion.py' first.")
        sys.exit(1)

    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    errors = 0

    # Counts checking
    print("\n--- Structural Element Counts ---")
    print(f"Titles (titulos): {len(data['titulos'])}")
    print(f"Chapters (capitulos): {len(data['capitulos'])}")
    print(f"Articles (articulos): {len(data['articulos'])}")
    print(f"Final Dispositions (disposiciones_finales): {len(data['disposiciones_finales'])}")
    print(f"Special Dispositions (disposiciones_especiales): {len(data['disposiciones_especiales'])}")
    print(f"Preamble (preambulo) characters: {len(data['preambulo'])}")
    print(f"Declaration (declaracion) characters: {len(data['declaracion'])}")

    # 1. Verify Titles
    print("\nChecking Titles (titulos)...")
    expected_titles = {"I", "II", "III", "IV", "V", "VI"}
    titles_found = set()
    for t in data["titulos"]:
        romano = t.get("numero_romano")
        denominacion = t.get("denominacion")
        if not romano or not denominacion:
            print(f"  [Error] Invalid title structure: {t}")
            errors += 1
        else:
            titles_found.add(romano)
    if titles_found != expected_titles:
        print(f"  [Error] Titles set does not match. Expected {expected_titles}, got {titles_found}")
        errors += 1
    else:
        print("  [OK] All 6 Titles mapped correctly.")

    # 2. Verify Chapters
    print("\nChecking Chapters (capitulos)...")
    if len(data["capitulos"]) == 0:
        print("  [Error] No chapters found!")
        errors += 1
    else:
        for c in data["capitulos"]:
            tr = c.get("titulo_romano")
            cr = c.get("numero_romano")
            denominacion = c.get("denominacion")
            if not tr or not cr or not denominacion:
                print(f"  [Error] Invalid chapter structure: {c}")
                errors += 1
            elif tr not in expected_titles:
                print(f"  [Error] Chapter {cr} references invalid title: {tr}")
                errors += 1
        print(f"  [OK] All {len(data['capitulos'])} chapters mapped correctly.")

    # 3. Verify Articles
    print("\nChecking Articles (articulos)...")
    if len(data["articulos"]) != 206:
        print(f"  [Error] Article count mismatch! Expected 206, got {len(data['articulos'])}")
        errors += 1
    
    art_nums = []
    for a in data["articulos"]:
        num = a.get("numero")
        tr = a.get("titulo_romano")
        cr = a.get("capitulo_romano")
        content = a.get("contenido")
        
        if num is None or not tr or not content:
            print(f"  [Error] Invalid article structure for article {num}: {a}")
            errors += 1
            continue
            
        art_nums.append(num)

        # Cross-reference check
        if tr not in expected_titles:
            print(f"  [Error] Article {num} references invalid title: {tr}")
            errors += 1
            
        if cr is not None:
            # Check that chapter actually exists under this title
            chap_exists = False
            for c in data["capitulos"]:
                if c["titulo_romano"] == tr and c["numero_romano"] == cr:
                    chap_exists = True
                    break
            if not chap_exists:
                print(f"  [Error] Article {num} references non-existent chapter {cr} under Title {tr}")
                errors += 1

    # Check completeness of article numbers
    sorted_nums = sorted(art_nums)
    expected_nums = list(range(1, 207))
    if sorted_nums != expected_nums:
        print("  [Error] Articles sequence is incomplete or contains duplicates!")
        duplicates = [x for x in set(art_nums) if art_nums.count(x) > 1]
        if duplicates:
            print(f"    Duplicates found: {duplicates}")
        missing = set(expected_nums) - set(art_nums)
        if missing:
            print(f"    Missing numbers: {missing}")
        errors += 1
    else:
        print("  [OK] Articles sequence is complete from 1 to 206 (no duplicates or gaps).")

    # 4. Verify Dispositions
    print("\nChecking Dispositions...")
    if len(data["disposiciones_finales"]) != 16:
        print(f"  [Error] Expected 16 final dispositions, got {len(data['disposiciones_finales'])}")
        errors += 1
    else:
        print("  [OK] 16 Final Dispositions found.")

    if len(data["disposiciones_especiales"]) != 3:
        print(f"  [Error] Expected 3 special dispositions, got {len(data['disposiciones_especiales'])}")
        errors += 1
    else:
        print("  [OK] 3 Special Dispositions found.")

    # Summary
    print("\n--- Validation Summary ---")
    if errors == 0:
        print("SUCCESS: JSON file passed all structural and hierarchy checks successfully!")
    else:
        print(f"FAILURE: Found {errors} validation errors.")
        sys.exit(1)

if __name__ == "__main__":
    main()
