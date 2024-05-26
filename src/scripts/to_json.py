import csv
import json

with open("src/scripts/scenes.csv", "r", encoding="utf-8") as csv_file:
    csv_reader = csv.DictReader(csv_file)
    data = list(csv_reader)

with open("src/scripts/scenes.json", "w", encoding="utf-8") as json_file:
    json.dump(data, json_file, ensure_ascii=False, indent=4)

print("done")
