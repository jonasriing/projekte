import os
import random
import re
import sys

DAMPING = 0.85
SAMPLES = 10000


def main():
    if len(sys.argv) != 2:
        sys.exit("Usage: python pagerank.py corpus")
    corpus = crawl(sys.argv[1])
    ranks = sample_pagerank(corpus, DAMPING, SAMPLES)
    print(f"PageRank Results from Sampling (n = {SAMPLES})")
    for page in sorted(ranks):
        print(f"  {page}: {ranks[page]:.4f}")
    ranks = iterate_pagerank(corpus, DAMPING)
    print(f"PageRank Results from Iteration")
    for page in sorted(ranks):
        print(f"  {page}: {ranks[page]:.4f}")


def crawl(directory):
    """
    Parse a directory of HTML pages and check for links to other pages.
    Return a dictionary where each key is a page, and values are
    a list of all other pages in the corpus that are linked to by the page.
    """
    pages = dict()

    # Extract all links from HTML files
    for filename in os.listdir(directory):
        if not filename.endswith(".html"):
            continue
        with open(os.path.join(directory, filename)) as f:
            contents = f.read()
            links = re.findall(r"<a\s+(?:[^>]*?)href=\"([^\"]*)\"", contents)
            pages[filename] = set(links) - {filename}

    # Only include links to other pages in the corpus
    for filename in pages:
        pages[filename] = set(
            link for link in pages[filename]
            if link in pages
        )

    return pages


def transition_model(corpus, page, damping_factor):
    """
    Return a probability distribution over which page to visit next,
    given a current page.

    With probability `damping_factor`, choose a link at random
    linked to by `page`. With probability `1 - damping_factor`, choose
    a link at random chosen from all pages in the corpus.
    """
    probability_distribution = {}
    linked = corpus[page]
    if len(linked) != 0:
        for link in linked:
            probability_distribution[link] = damping_factor / len(corpus[page])
    else:
        for page in corpus:
            probability_distribution[page] = 1 / len(corpus)
        return probability_distribution
    for page in corpus:
        if page not in linked:
            probability_distribution[page] = (1 - damping_factor) / (len(corpus) - len(linked))
    return probability_distribution


def sample_pagerank(corpus, damping_factor, n):
    """
    Return PageRank values for each page by sampling `n` pages
    according to transition model, starting with a page at random.

    Return a dictionary where keys are page names, and values are
    their estimated PageRank value (a value between 0 and 1). All
    PageRank values should sum to 1.
    """
    page_count = []
    current_page = random.choice(list(corpus))
    
    for _ in range(n):
        model = transition_model(corpus, current_page, damping_factor)
        choice = random.choices(list(model.keys()), weights=[model[item] for item in model], k=1)[0]
        page_count.append(choice)
        current_page = choice

    page_rank = {}

    for page in corpus.keys():
        page_rank[page] = page_count.count(page) / len(page_count)

    return page_rank


def iterate_pagerank(corpus, damping_factor):
    """
    Return PageRank values for each page by iteratively updating
    PageRank values until convergence.

    Return a dictionary where keys are page names, and values are
    their estimated PageRank value (a value between 0 and 1). All
    PageRank values should sum to 1.
    """
    pages = {}
    for page in corpus:
        pages[page] = 1 / len(corpus)

    # Treshold yet to be determined
    while True:

        # iterate over every page
        for page in pages:
            sum = 0

            # iterate over everypage that links to page
            for mentioned in pages:
                if page in corpus[mentioned]:
                    sum += pages[mentioned] / len(corpus[mentioned])
                if len(corpus[mentioned]) == 0:
                    sum += pages[mentioned] / len(corpus)

            new_value = (1 - damping_factor) / len(pages) + damping_factor * sum

            # Check for convergence
            if abs(new_value - pages[page]) < .001:
                break

            pages[page] = new_value

        return pages


if __name__ == "__main__":
    main()
