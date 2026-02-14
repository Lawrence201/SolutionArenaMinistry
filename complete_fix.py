with open(r'C:\xampp\htdocs\Church_Management_System\Church_Management_System\components\Admin\admin.css', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Keep only the first 22467 lines (line 22468 has corruption)
with open(r'C:\xampp\htdocs\Church_Management_System\Church_Management_System\components\Admin\admin.css', 'w', encoding='utf-8') as f:
    f.writelines(lines[:22467])

# Now append the clean styles
with open(r'C:\xampp\htdocs\Church_Management_System\Church_Management_System\components\Admin\church_group_styles.css', 'r', encoding='utf-8') as f:
    new_styles = f.read()

with open(r'C:\xampp\htdocs\Church_Management_System\Church_Management_System\components\Admin\admin.css', 'a', encoding='utf-8') as f:
    f.write('\n\n')
    f.write(new_styles)

print("CSS file completely fixed")
