import os
import glob

WORKSPACE = "d:\\web new"

def main():
    html_files = glob.glob(os.path.join(WORKSPACE, "*.html"))
    print(f"Found {len(html_files)} HTML files to process.")
    
    replacements = {
        "https://toyotacantho.net.vn/": "/external_assets/toyotacantho.net.vn/",
        "http://toyotacantho.net.vn/": "/external_assets/toyotacantho.net.vn/",
        "//toyotacantho.net.vn/": "/external_assets/toyotacantho.net.vn/",
        "https://webxe.vn/": "/external_assets/webxe.vn/",
        "http://webxe.vn/": "/external_assets/webxe.vn/",
        "//webxe.vn/": "/external_assets/webxe.vn/"
    }
    
    total_replacements = 0
    
    for file_path in html_files:
        filename = os.path.basename(file_path)
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
            
        modified = False
        new_content = content
        for original, replacement in replacements.items():
            if original in new_content:
                count = new_content.count(original)
                new_content = new_content.replace(original, replacement)
                print(f" - Replacing '{original}' with '{replacement}' in {filename} ({count} times)")
                total_replacements += count
                modified = True
                
        if modified:
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(new_content)
                
    print(f"\nDone. Total replacements made: {total_replacements}")

if __name__ == "__main__":
    main()
