import requests
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta
import json

# Initialize
categories = ['hep-th', 'hep-ph', 'gr-qc']  # Add more categories as needed
base_url = "http://export.arxiv.org/api/query?search_query=cat:{}&sortBy=submittedDate&sortOrder=descending&start=0&max_results=60"
paper_ids = set()
papers_info = []

for category in categories:
    response = requests.get(base_url.format(category))
    root = ET.fromstring(response.content)

    # Extract the latest_date from the first entry
    latest_date_str = root.find('{http://www.w3.org/2005/Atom}entry/{http://www.w3.org/2005/Atom}published').text
    latest_date = datetime.strptime(latest_date_str, '%Y-%m-%dT%H:%M:%SZ').date()
    start_window = datetime.combine(latest_date - timedelta(days=1), datetime.min.time()) + timedelta(hours=18)
    end_window = datetime.combine(latest_date, datetime.min.time()) + timedelta(hours=18)

    for entry in root.findall('{http://www.w3.org/2005/Atom}entry'):
        published_str = entry.find('{http://www.w3.org/2005/Atom}published').text
        published_datetime = datetime.strptime(published_str, '%Y-%m-%dT%H:%M:%SZ')

        # Check if the paper is within the 24h window
        if start_window <= published_datetime < end_window:
            paper_id = entry.find('{http://www.w3.org/2005/Atom}id').text.split('/')[-1].split('v')[0]

            # Check if paper_id is not already processed
            if paper_id not in paper_ids:
                paper_ids.add(paper_id)
                title = entry.find('{http://www.w3.org/2005/Atom}title').text
                abstract = entry.find('{http://www.w3.org/2005/Atom}summary').text
                authors = [author.find('{http://www.w3.org/2005/Atom}name').text for author in entry.findall('{http://www.w3.org/2005/Atom}author')]
                link = entry.find('{http://www.w3.org/2005/Atom}link[@rel="alternate"]').attrib['href']
                paper_cat = entry.find('{http://arxiv.org/schemas/atom}primary_category').attrib['term']
                paper_crosslist = [cat.attrib['term'] for cat in entry.findall('{http://www.w3.org/2005/Atom}category') if cat.attrib['term'] != paper_cat]

                papers_info.append({
                    'paper_id': paper_id,
                    'publication_datetime': published_datetime.isoformat(),
                    'title': title,
                    'abstract': abstract,
                    'authors': authors,
                    'link': link,
                    'paper_cat': paper_cat,
                    'paper_crosslist': paper_crosslist
                })
        else:
            break

# Convert the collected papers info to JSON and save to a file
with open('papers_info.json', 'w') as json_file:
    json.dump(papers_info, json_file, indent=4)

print("Information saved to papers_info.json")

#%%
# Check: There is a problem with first 2 "new" entries in hep-ph!
# these should have appeared as new yesterday, not today!

import json

# Load the JSON data from the file
with open('papers_info.json', 'r') as json_file:
    papers = json.load(json_file)

# Sort the papers based on publication_datetime in descending order (from newest to oldest)
papers = sorted(papers, key=lambda x: x['publication_datetime'], reverse=False)


# Initialize counters and lists for titles
hep_th_count = 0
hep_ph_count = 0
gr_qc_count = 0
other_count = 0
hep_th_titles = []
hep_ph_titles = []
gr_qc_titles = []
other_papers_info = []
other_titles = []

# Iterate over the papers and count based on paper_cat
for paper in papers:
    if paper['paper_cat'] == 'hep-th':
        hep_th_count += 1
        hep_th_titles.append(f"{paper['title']} (Submitted: {paper['publication_datetime']})")
    elif paper['paper_cat'] == 'hep-ph':
        hep_ph_count += 1
        hep_ph_titles.append(f"{paper['title']} (Submitted: {paper['publication_datetime']})")
    elif paper['paper_cat'] == 'gr-qc':
        gr_qc_count += 1
        gr_qc_titles.append(f"{paper['title']} (Submitted: {paper['publication_datetime']})")
    else:
        other_count += 1
        other_titles.append(f"{paper['title']} (Submitted: {paper['publication_datetime']})")
        other_papers_info.append(paper)

# Print the results
print(f"Total number of papers: {len(papers)}")
print(f"\nNumber of papers with paper_cat = hep-th: {hep_th_count}")
print("Titles:")
for title in hep_th_titles:
    print(f"- {title}")

print(f"\nNumber of papers with paper_cat = hep-ph: {hep_ph_count}")
print("Titles:")
for title in hep_ph_titles:
    print(f"- {title}")

print(f"\nNumber of papers with paper_cat = gr-qc: {gr_qc_count}")
print("Titles:")
for title in gr_qc_titles:
    print(f"- {title}")

print(f"\nNumber of papers in other categories: {other_count}")
print("Titles:")
for title in other_titles:
    print(f"- {title}")