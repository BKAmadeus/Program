import json
from urllib import parse
import requests
from bs4 import BeautifulSoup
from janome.tokenizer import Tokenizer
from Google_URL import Google
from TextExtraction import TextExtraction
import pandas as pd

google = Google()
text = TextExtraction()
urls = google.Search("ドラえもん",type = "text",maximum = 10)
print(urls)
for url in urls:
    print(url)
    text.Disassembly(url = url)