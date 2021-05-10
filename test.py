import json
from urllib import parse
import requests
from bs4 import BeautifulSoup
from janome.tokenizer import Tokenizer
from Google_URL import Google
from TextExtraction import TextExtraction
import pandas as pd

google = Google()
print("test")
text = TextExtraction()
print("test")
urls = google.Search("python　統計",type = "url",maximum = 10)
print(urls)
for url in urls:
    print(url)
    text.Disassembly(url = url)