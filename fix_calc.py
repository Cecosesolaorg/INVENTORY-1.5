import os

base_path = r'c:\Users\javic\OneDrive\Desktop\PROGRAMMING PROJECTS\inventarioJ\contenedor'
targets = [f'pasillo{i}' for i in range(1, 18)]

for target in targets:
    target_dir = os.path.join(base_path, target)
    if not os.path.exists(target_dir): continue
    for f in os.listdir(target_dir):
        if f.endswith('.html'):
            path = os.path.join(target_dir, f)
            with open(path, 'r', encoding='utf-8') as file:
                content = file.read()
            content = content.replace('>ANS</button>', '>ANT</button>')
            with open(path, 'w', encoding='utf-8') as file:
                file.write(content)
            print(f"Updated {path}")

print("Done.")
