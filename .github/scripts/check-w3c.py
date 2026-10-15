#!/usr/bin/env python3
"""Проверка index.html через W3C Nu validator. Ненулевой код возврата при ошибках."""
import json
import subprocess
import sys

result = subprocess.run(
    [
        "curl", "-s", "--max-time", "60",
        "-H", "Content-Type: text/html; charset=utf-8",
        "--data-binary", "@index.html",
        "https://validator.w3.org/nu/?out=json",
    ],
    capture_output=True, text=True, timeout=90,
)
if result.returncode != 0:
    # Валидатор недоступен — не блокируем CI сетевой ошибкой
    print(f"W3C validator unreachable (curl exit {result.returncode}) — skip")
    sys.exit(0)

try:
    data = json.loads(result.stdout)
except json.JSONDecodeError:
    print("W3C validator returned non-JSON — skip")
    sys.exit(0)

errors = [m for m in data.get("messages", []) if m.get("type") == "error"]
for m in errors:
    print(f"error line {m.get('lastLine')}: {m.get('message')}")
print(f"W3C errors: {len(errors)}")
sys.exit(1 if errors else 0)