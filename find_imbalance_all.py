import sys

def find_imbalance_all(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    stack = []
    pairs = {'{': '}', '(': ')', '[': ']'}
    
    for i, char in enumerate(content):
        if char in '{ ([':
            stack.append((char, i))
        elif char in '} )]':
            if not stack:
                print(f"ERROR: Extra '{char}' at index {i}")
            else:
                last_char, last_index = stack.pop()
                if pairs[last_char] != char:
                    print(f"ERROR: Mismatched '{char}' at index {i}, expected closing for '{last_char}' from index {last_index}")
                    
    if stack:
        for char, index in stack:
            # Find line number for index
            line_num = content[:index].count('\n') + 1
            print(f"ERROR: Unclosed '{char}' from line {line_num}")

if __name__ == "__main__":
    filepath = r'c:\xampp\htdocs\Church_Management_System\Church_Management_System\components\Admin\attendance\AttendanceClient.tsx'
    find_imbalance_all(filepath)
