import sys

def trace_nesting(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    level = 0
    for i, line in enumerate(lines):
        for char in line:
            if char == '{':
                level += 1
            elif char == '}':
                level -= 1
        
        if level < 0:
            print(f"ERROR: Level dropped below 0 at line {i+1}")
            return
            
    print(f"Final level: {level}")
    if level != 0:
        print("Mismatched braces detected.")

if __name__ == "__main__":
    filepath = r'c:\xampp\htdocs\Church_Management_System\Church_Management_System\components\Admin\attendance\AttendanceClient.tsx'
    trace_nesting(filepath)
