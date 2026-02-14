import sys

def find_imbalance_all(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    stack = []
    pairs = {'{': '}', '(': ')', '[': ']'}
    
    for i, char in enumerate(content):
        if char in '{([':
            stack.append((char, i))
        elif char in '})]':
            if not stack:
                line_nm = content[:i].count('\n') + 1
                col_nm = i - content.rfind('\n', 0, i)
                print(f"ERROR: Extra '{char}' at line {line_nm}, col {col_nm}")
            else:
                last_char, last_index = stack.pop()
                if pairs[last_char] != char:
                    line_nm = content[:i].count('\n') + 1
                    col_nm = i - content.rfind('\n', 0, i)
                    prev_line = content[:last_index].count('\n') + 1
                    print(f"ERROR: Mismatched '{char}' at line {line_nm}, expected closing for '{last_char}' from line {prev_line}")
                    
    if stack:
        for char, index in stack:
            line_num = content[:index].count('\n') + 1
            print(f"ERROR: Unclosed '{char}' from line {line_num}")

if __name__ == "__main__":
    filepath = r'c:\xampp\htdocs\Church_Management_System\Church_Management_System\components\Admin\attendance\AttendanceClient.tsx'
    find_imbalance_all(filepath)
