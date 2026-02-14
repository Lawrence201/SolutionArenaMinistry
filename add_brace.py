with open(r'C:\xampp\htdocs\Church_Management_System\Church_Management_System\components\Admin\admin.css', 'r', encoding='utf-8') as f:
    content = f.read()

# Add the missing closing brace before the new styles
lines = content.split('\n')

# Find line 22467 (index 22466)
if len(lines) > 22467:
    # Insert closing brace after line 22467
    lines.insert(22468, '}')
    
    # Write back
    with open(r'C:\xampp\htdocs\Church_Management_System\Church_Management_System\components\Admin\admin.css', 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))
    
    print("Added missing closing brace")
else:
    print(f"File only has {len(lines)} lines")
