import os

def count_lines(directory, extensions):
    total_lines = 0
    file_count = 0
    for root, dirs, files in os.walk(directory):
        # Skip node_modules and venv
        if 'node_modules' in root or 'venv' in root or '.git' in root or '__pycache__' in root:
            continue
        for file in files:
            if any(file.endswith(ext) for ext in extensions):
                path = os.path.join(root, file)
                try:
                    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                        lines = f.readlines()
                        total_lines += len(lines)
                        file_count += 1
                except Exception as e:
                    print(f"Could not read {path}: {e}")
    return total_lines, file_count

backend_path = r'e:\Abdul\Logistics_Project_Transfer\backend'
frontend_path = r'e:\Abdul\Logistics_Project_Transfer\frontend'

backend_lines, backend_files = count_lines(backend_path, ['.py', '.env'])
frontend_lines, frontend_files = count_lines(frontend_path, ['.js', '.jsx', '.css', '.html'])

print(f"Backend: {backend_lines} lines across {backend_files} files")
print(f"Frontend: {frontend_lines} lines across {frontend_files} files")
print(f"Total: {backend_lines + frontend_lines} lines across {backend_files + frontend_files} files")
