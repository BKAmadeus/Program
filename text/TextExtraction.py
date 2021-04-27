# python3
# bs-select-2.py
from janome.tokenizer import Tokenizer
#from keras.preprocessing.text import Tokenizer
from bs4 import BeautifulSoup
import urllib.request as req
import pandas as pd
import re

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
	
	def Disassembly(self,url = "text"):
		# urlopen()でデータを取得
		res = req.urlopen(url)
		# BeautifulSoup()で解析
		soup = BeautifulSoup(res, 'html.parser')
		# 任意のデータを抽出
		title1 = soup.find("h1").string
		print("title = ", title1)
		p_list = soup.find_all("p")
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