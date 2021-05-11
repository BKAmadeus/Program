# python3
# bs-select-2.py
from janome.tokenizer import Tokenizer
#from keras.preprocessing.text import Tokenizer
from bs4 import BeautifulSoup
import requests as req
import pandas as pd
import re
import MeCab
import sys
url = "https://su-gi-rx.com/2018/03/28/text-mining-2/"
class TextExtraction:
	def __init__(self):
		self.df = pd.DataFrame(index = ["表層形",
          						"品詞",
          						"品詞細分類1",
          						"品詞細分類2",
          						"品詞細分類3",
          						"活用型",
         						"活用形",
          						"原形",
          						"読み",
          						"発音"])
		print(self.df)
	
	def Disassembly(self,url):
		# BeautifulSoup()で解析
		html = req.get(url).text
		soup = BeautifulSoup(html,"html.parser")
		for script in soup(["script", "style"]):
			script.decompose()
		text = soup.get_text()
		lines = [line.strip() for line in text.splitlines()]
		text="\n".join(line for line in lines if line)
		print(text)
		p_list = re.findall(r'\w+',text)
		t = Tokenizer()
		count = 0
		for p in p_list:
			print(p)
			for token in t.tokenize(p, stream=True):
				print(token)
				test = [token.surface,
						token.part_of_speech.split(',')[0],
						token.part_of_speech.split(',')[1],
						token.part_of_speech.split(',')[2],
						token.part_of_speech.split(',')[3],
						token.infl_type,
						token.infl_form,
						token.base_form,
						token.reading,
						token.phonetic]
				s = pd.Series(test,self.df.index)
				self.df[count] = s
				count = count + 1
				#pd.append(pd.Series(token))
		print(self.df)
		print(self.df.loc["表層形"])
		"""
		# 任意のデータを抽出
		title1 = soup.find("h1").string
		print("title = ", title1)
		p_list = soup.find_all("p")
		print(p_list)
		t = Tokenizer()
		count = 0
		for p in p_list:
			s = str(p.get_text())
			for token in t.tokenize(s, stream=True):
				test = [token.surface,
						token.part_of_speech.split(',')[0],
						token.part_of_speech.split(',')[1],
						token.part_of_speech.split(',')[2],
						token.part_of_speech.split(',')[3],
						token.infl_type,
						token.infl_form,
						token.base_form,
						token.reading,
						token.phonetic]
				s = pd.Series(test,self.df.index)
				self.df[count] = s
				count = count + 1
				#pd.append(pd.Series(token))
		print(self.df)
		print(self.df.loc["表層形"])
		"""