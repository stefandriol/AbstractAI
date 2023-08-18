import requests
from bs4 import BeautifulSoup

URL = "https://arxiv.org/list/hep-th/new"

def scrape_arxiv(url):
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')
    papers = []

    # Counter for "Not Found" occurrences
    not_found_counter = {
        "Title Not Found": 0,
        "Authors Not Found": 0,
        "Abstract Not Found": 0
    }

    # Find the main content div
    dlpage = soup.find('div', id='dlpage')

    # Extract the first and second <dl> tags
    dl_tags = dlpage.find_all('dl', limit=2)

    # bla
    for dl in dl_tags:
        meta_tags = dl.find_all('div', class_='meta')

        for meta in meta_tags:
            # Extract the title
            title_div = meta.find('div', class_='list-title mathjax')
            if title_div:
                title = title_div.text.replace("Title:", "").strip()
            else:
                title = "Title Not Found"
                not_found_counter["Title Not Found"] += 1

            # Extract all author names
            authors_div = meta.find('div', class_='list-authors')
            if authors_div:
                authors = [author.text.strip() for author in authors_div.find_all('a')]
            else:
                authors = ["Authors Not Found"]
                not_found_counter["Authors Not Found"] += 1

            # Extract the abstract
            abstract_p = meta.find('p', class_='mathjax')
            if abstract_p:
                abstract = abstract_p.text.strip()
            else:
                abstract = "Abstract Not Found"
                not_found_counter["Abstract Not Found"] += 1

            # Store data in a dictionary and append to the papers list
            paper_data = {
                "title": title,
                "authors": authors,
                "abstract": abstract
            }
            papers.append(paper_data)

    return papers, not_found_counter

if __name__ == "__main__":
    papers, not_found_counts = scrape_arxiv(URL)
    for paper in papers:
        print(f"Title: {paper['title']}")
        print(f"Authors: {', '.join(paper['authors'])}")
        print(f"Abstract: {paper['abstract']}")
        print('-'*100)

    print("\nCounts of 'Not Found':")
    for key, value in not_found_counts.items():
        print(f"{key}: {value}")
