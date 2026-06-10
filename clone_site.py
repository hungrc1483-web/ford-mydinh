import os
import re
import sys
import urllib.request
import urllib.parse
import urllib.error
import time

# Reconfigure stdout for UTF-8 to prevent encoding errors on Windows console
sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = "https://fordbacninh.webxe.vn"
WORKSPACE = "d:\\web new"

# Sets to keep track
visited_pages = set()
pages_to_visit = {"/"}
downloaded_assets = set()

# Headers for request
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

def clean_url_path(url_path):
    # Remove query params for local saving
    parsed = urllib.parse.urlparse(url_path)
    path = parsed.path
    if path.endswith('/'):
        path = path + "index.html"
    return path

def download_file(url, local_path):
    """Downloads a file from url to local_path. Returns True if successful, False otherwise."""
    local_abs_path = os.path.join(WORKSPACE, local_path.replace('/', os.sep).lstrip(os.sep))
    
    if os.path.exists(local_abs_path):
        # Already downloaded
        return True
        
    # Create directories if they don't exist
    os.makedirs(os.path.dirname(local_abs_path), exist_ok=True)
    
    print(f"Downloading asset: {url} -> {local_path}")
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=15) as response:
            content = response.read()
        with open(local_abs_path, 'wb') as f:
            f.write(content)
        return True
    except Exception as e:
        print(f"Error downloading {url}: {e}")
        return False

def parse_css_for_assets(css_content, css_url):
    """Extracts background images and other assets from CSS and downloads them."""
    urls = re.findall(r'url\s*\(\s*["\']?([^"\'\)]+)["\']?\s*\)', css_content)
    for u in urls:
        if u.startswith('data:'):
            continue
        # Make absolute
        abs_url = urllib.parse.urljoin(css_url, u)
        parsed_abs = urllib.parse.urlparse(abs_url)
        if parsed_abs.netloc == "fordbacninh.webxe.vn" or not parsed_abs.netloc:
            local_path = clean_url_path(parsed_abs.path)
            if local_path not in downloaded_assets:
                if download_file(abs_url, local_path):
                    downloaded_assets.add(local_path)

def process_page(page_path):
    """Fetches a page, saves it, extracts links and assets."""
    # Build absolute URL
    url = BASE_URL + page_path
    print(f"\nProcessing page: {url}")
    
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=15) as response:
            html = response.read().decode('utf-8', errors='ignore')
    except Exception as e:
        print(f"Error fetching page {url}: {e}")
        return

    # Determine local filename
    if page_path == "/":
        local_filename = "index.html"
    else:
        # Strip slashes
        clean_name = page_path.strip("/")
        if not clean_name.endswith(".html"):
            local_filename = clean_name + ".html"
        else:
            local_filename = clean_name
            
    # Save the HTML page
    html_abs_path = os.path.join(WORKSPACE, local_filename.replace('/', os.sep))
    os.makedirs(os.path.dirname(html_abs_path), exist_ok=True)
    with open(html_abs_path, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"Saved page to {local_filename}")

    # 1. Find stylesheets
    css_files = re.findall(r'<link[^>]*rel=["\']stylesheet["\'][^>]*href=["\']([^"\']+)["\']', html, re.IGNORECASE)
    css_files += re.findall(r'<link[^>]*href=["\']([^"\']+)["\'][^>]*rel=["\']stylesheet["\']', html, re.IGNORECASE)
    
    # 2. Find scripts
    js_files = re.findall(r'<script[^>]*src=["\']([^"\']+)["\']', html, re.IGNORECASE)
    
    # 3. Find images
    img_files = re.findall(r'<img[^>]*src=["\']([^"\']+)["\']', html, re.IGNORECASE)
    # Find background images in inline styles
    bg_images = re.findall(r'url\s*\(\s*["\']?([^"\'\)]+)["\']?\s*\)', html)
    # Find icons
    icon_files = re.findall(r'<link[^>]*rel=["\'](?:shortcut icon|icon)["\'][^>]*href=["\']([^"\']+)["\']', html, re.IGNORECASE)
    
    all_imgs = list(set(img_files + bg_images + icon_files))

    # Download CSS files
    for css in css_files:
        parsed_css = urllib.parse.urlparse(css)
        if not parsed_css.netloc or parsed_css.netloc == "fordbacninh.webxe.vn":
            local_path = clean_url_path(parsed_css.path)
            abs_url = urllib.parse.urljoin(url, css)
            if local_path not in downloaded_assets:
                if download_file(abs_url, local_path):
                    downloaded_assets.add(local_path)
                    # Read CSS and parse for background images
                    try:
                        css_abs_path = os.path.join(WORKSPACE, local_path.replace('/', os.sep).lstrip(os.sep))
                        with open(css_abs_path, 'r', encoding='utf-8', errors='ignore') as f:
                            css_content = f.read()
                        parse_css_for_assets(css_content, abs_url)
                    except Exception as css_err:
                        print(f"Error reading local CSS {local_path}: {css_err}")

    # Download JS files
    for js in js_files:
        parsed_js = urllib.parse.urlparse(js)
        # We only download local scripts, skip Google Tag Manager, Histats, etc.
        if not parsed_js.netloc or parsed_js.netloc == "fordbacninh.webxe.vn":
            local_path = clean_url_path(parsed_js.path)
            abs_url = urllib.parse.urljoin(url, js)
            if local_path not in downloaded_assets:
                if download_file(abs_url, local_path):
                    downloaded_assets.add(local_path)

    # Download images
    for img in all_imgs:
        if img.startswith('data:'):
            continue
        parsed_img = urllib.parse.urlparse(img)
        # Download images from the domain or toyotacantho (as seen in resources) or webxe
        if not parsed_img.netloc or parsed_img.netloc in ["fordbacninh.webxe.vn", "toyotacantho.net.vn", "webxe.vn"]:
            # If it is a remote absolute URL (e.g. toyotacantho.net.vn), we save it to its host directory to prevent collisions
            if parsed_img.netloc and parsed_img.netloc != "fordbacninh.webxe.vn":
                local_path = os.path.join("external_assets", parsed_img.netloc, clean_url_path(parsed_img.path).lstrip('/'))
                local_path = local_path.replace(os.sep, '/')
            else:
                local_path = clean_url_path(parsed_img.path)
                
            abs_url = urllib.parse.urljoin(url, img)
            if local_path not in downloaded_assets:
                if download_file(abs_url, local_path):
                    downloaded_assets.add(local_path)

    # Find internal links to other pages
    links = re.findall(r'<a\s+[^>]*href=["\']([^"\']+)["\'][^>]*>', html, re.IGNORECASE)
    for href in links:
        parsed_href = urllib.parse.urlparse(href)
        # Check if internal link
        if (not parsed_href.netloc or parsed_href.netloc == "fordbacninh.webxe.vn"):
            path = parsed_href.path
            # Ignore files/assets, search, privaties, or hashes
            if path and not any(path.endswith(ext) for ext in ['.png', '.jpg', '.jpeg', '.gif', '.pdf', '.css', '.js']):
                if path.startswith('/') and path != '/tim-kiem' and not path.startswith('/khuyenmai'):
                    # Standardize page path
                    if path not in visited_pages and path not in pages_to_visit:
                        pages_to_visit.add(path)

def main():
    print("Starting site cloning...")
    start_time = time.time()
    
    while pages_to_visit:
        current_page = pages_to_visit.pop()
        visited_pages.add(current_page)
        process_page(current_page)
        # Delay slightly to avoid hitting the server too hard
        time.sleep(0.5)
        
    print("\n--- CLONING SUMMARY ---")
    print(f"Total pages crawled: {len(visited_pages)}")
    print(f"Crawled pages: {visited_pages}")
    print(f"Total assets downloaded: {len(downloaded_assets)}")
    print(f"Time taken: {time.time() - start_time:.2f} seconds")

if __name__ == "__main__":
    main()
