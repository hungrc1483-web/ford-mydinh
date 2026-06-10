import os
import glob
import re

WORKSPACE = "d:\\web new"

# List of known page names that were crawled
PAGES = [
    'gioi-thieu', 'san-pham', 'tin-tuc', 'lien-he', 'territory-5-cho',
    'everest-7-cho', 'explorer-7-cho', 'ban-tai-ranger', 'ford-raptor',
    'transit-16-cho', 'dang-ky-lai-thu', 'ford-ranger-bac-ninh',
    'ford-everest-bac-ninh', 'ford-territory-bac-ninh', 'ford-transit-bac-ninh',
    'ranger-raptor-bac-ninh', 'baiviet2', 'baiviet3', 'baiviet4', 'baiviet5',
    'baiviet7', 'baiviet8', 'gia-xe', 'cap-nhat', 'chinh-sach-bao-mat',
    'dieu-khoan-dich-vu', 'update', 'sale'
]

ASSET_DIRS = ['frontend', 'assets', 'files', 'external_assets']

def make_file_offline(file_path):
    filename = os.path.basename(file_path)
    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()

    original_content = content
    
    # 1. Replace root link href="/" or href="" with index.html
    # We should search for href="/" or href=""
    content = re.sub(r'href=["\']/["\']', 'href="index.html"', content)
    
    # 2. Replace page links like href="/gioi-thieu" or href="/gioi-thieu/" with "gioi-thieu.html"
    for page in PAGES:
        # Match href="/page" or href="/page/" with or without query params
        content = re.sub(r'href=["\']/' + re.escape(page) + r'/?(?:\?[^"\']*)?["\']', f'href="{page}.html"', content)

    # 3. Replace asset paths: strip the leading slash
    # e.g., href="/frontend/css/..." -> href="frontend/css/..."
    for asset_dir in ASSET_DIRS:
        # Matches e.g. src="/frontend/" or href="/frontend/" or url('/frontend/')
        content = re.sub(r'(src|href|url)\s*=\s*(["\'])/' + re.escape(asset_dir) + r'/', r'\1=\2' + asset_dir + r'/', content)
        content = re.sub(r'url\(\s*(["\']?)/' + re.escape(asset_dir) + r'/', r'url(\1' + asset_dir + r'/', content)
    if content != original_content:
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Processed: {filename} (made relative/offline links)")
        return True
    else:
        print(f"No changes in: {filename}")
        return False

def main():
    html_files = glob.glob(os.path.join(WORKSPACE, "*.html"))
    print(f"Found {len(html_files)} HTML files to convert to offline mode.")
    
    changed_count = 0
    for file_path in html_files:
        if make_file_offline(file_path):
            changed_count += 1
            
    print(f"\nDone. Successfully converted {changed_count} files to offline mode.")

if __name__ == "__main__":
    main()
