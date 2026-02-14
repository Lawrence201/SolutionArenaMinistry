with open(r'C:\xampp\htdocs\Church_Management_System\Church_Management_System\components\Admin\admin.css', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Keep only the first 22468 lines (removing corrupted content)
with open(r'C:\xampp\htdocs\Church_Management_System\Church_Management_System\components\Admin\admin.css', 'w', encoding='utf-8') as f:
    f.writelines(lines[:22468])

print("CSS file cleaned successfully")
