import sys

def count_braces(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    open_braces = content.count('{')
    close_braces = content.count('}')
    return open_braces, close_braces

if __name__ == "__main__":
    filepath = r'c:\xampp\htdocs\Church_Management_System\Church_Management_System\components\Admin\attendance\AttendanceClient.tsx'
    op, cl = count_braces(filepath)
    print(f"Open: {op}, Close: {cl}")
