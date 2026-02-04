with open("logs_combined.txt", "r", encoding="utf-8", errors="ignore") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "ERROR" in line or "Exception" in line or "500 Internal" in line:
        print(f"--- MATCH at line {i} ---")
        start = max(0, i - 10)
        end = min(len(lines), i + 20)
        for j in range(start, end):
            print(lines[j].strip())
        print("-" * 20)
