import sys

def find_imbalance(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    stack = [] # Store (char, line, col)
    for i, line in enumerate(lines):
        for j, char in enumerate(line):
            if char == '{':
                stack.append(('{', i+1, j+1))
            elif char == '}':
                if not stack:
                    print(f"ERROR: Extra '}}' at line {i+1}, col {j+1}")
                else:
                    stack.pop()
                    
    if stack:
        for char, line, col in stack:
            print(f"ERROR: Unclosed '{char}' from line {line}, col {col}")

if __name__ == "__main__":
    filepath = r'c:\xampp\htdocs\Church_Management_System\Church_Management_System\components\Admin\attendance\AttendanceClient.tsx'
    find_imbalance(filepath)
