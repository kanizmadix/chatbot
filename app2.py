import requests
from bs4 import BeautifulSoup
import json
import csv
import markdown

# Make a request to the website
req = requests.get("https://hyperverge.co/")

# Parse the HTML content using BeautifulSoup
soup = BeautifulSoup(req.content, "html.parser")

# Extract relevant information from the HTML (adjust this based on your requirements)
title = soup.title.text
meta_description = soup.find("meta", {"name": "description"})["content"]
text_content = " ".join(soup.stripped_strings)

# Convert text to markdown format
markdown_content = markdown.markdown(text_content)

# Save the markdown content to a file
with open("output.md", "w", encoding="utf-8") as file:
    file.write(markdown_content)

# Save the extracted information to a JSON file
json_data = {
    "title": title,
    "meta_description": meta_description,
    "text_content": text_content
}

with open("output.json", "w", encoding="utf-8") as json_file:
    json.dump(json_data, json_file, ensure_ascii=False, indent=2)

print("JSON file created: output.json")

# Save the extracted information to a CSV file
csv_data = [["Title", "Meta Description", "Text Content"],
            [title, meta_description, text_content]]

with open("output.csv", "w", encoding="utf-8", newline="") as csv_file:
    csv_writer = csv.writer(csv_file)
    csv_writer.writerows(csv_data)  

print("CSV file created: output.csv")
