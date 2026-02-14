# Read the clean styles
with open(r'C:\xampp\htdocs\Church_Management_System\Church_Management_System\components\Admin\church_group_styles.css', 'r', encoding='utf-8') as f:
    new_styles = f.read()

# Append to admin.css
with open(r'C:\xampp\htdocs\Church_Management_System\Church_Management_System\components\Admin\admin.css', 'a', encoding='utf-8') as f:
    f.write('\n\n')
    f.write(new_styles)

print("Styles appended successfully")
