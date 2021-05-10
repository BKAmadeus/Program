#Googleの検索結果の上位サイトのtitle,h1,h2,h3,,記事文字数を取得し、スプレットシートに出力
import sys
import requests
import bs4
import urllib.parse

class Google:
    def __init__(self):
        self.output = []
        self.columns = ['検索順位','url','titleタグ','h1タグ','h2タグ','h3タグ','記事文字数']


    #置換用
    def replace_n(self,str_data):
        return str_data.replace('¥n','').replace('¥r','')

    #文字列用
    def concat_list(self,list_data):
        str_data = ''
        for j in range(len(list_data)):
            str_data = str_data + self.replace_n(list_data[j].getText()).strip() + '¥n'
        return str_data.rstrip("¥n")

    def Search(self,list_keyword,type='all',maximum=100):
        if type == 'all':
            self.output.append(self.columns)
        
        search_url = 'https://www.google.co.jp/search?hl=ja&num={}&q={}'.format(maximum,' '.join(list_keyword))
        res_google = requests.get(search_url)
        res_google.raise_for_status()

        #BeautifulSoupで掲載サイトのURLを取得
        bs4_google = bs4.BeautifulSoup(res_google.text, 'html.parser')
        #print(bs4_google.prettify())
        link_google = bs4_google.select('.kCrYT > a')

        for i in range(len(link_google)):
            #余計な文字の削除
            sita_url = link_google[i].get('href').split('&sa=U&')[0].replace('/url?q=','')
            if type == 'all':
                #URLに日本語が含まれている場合、エンコードされているのでデコードする
                sita_url = urllib.parse.unquote(urllib.parse.unquote(sita_url))

            if 'https://' in sita_url or 'http://' in sita_url:
                #サイトの内容を解析
                try:
                    res_sita = requests.get(sita_url)
                    res_sita.encoding = 'utf-8'
                except:
                    continue
                bs4_sita = bs4.BeautifulSoup(res_sita.text, 'html.parser')


                #データを初期化
                if type == 'all' or type == 'title':
                    title_sita = ''
                if type == 'all':
                    h1_sita = ''
                    h2_sita = ''
                    h3_sita = ''
                    mojisu_sita = 0

                #データを所得
                if type == 'all' or type == 'title':
                    if bs4_sita.select('title'):
                        title_sita = self.replace_n(bs4_sita.select('title')[0].getText())
                if type == 'all':
                    if bs4_sita.select('h1'):
                        h1_sita = self.concat_list(bs4_sita.select('h1'))
                    if bs4_sita.select('h2'):
                        h2_sita = self.concat_list(bs4_sita.select('h2'))
                    if bs4_sita.select('h3'):
                        h3_sita = self.concat_list(bs4_sita.select('h3'))
                    if bs4_sita.select('body'):
                        mojisu_sita = len(bs4_sita.select('body')[0].getText())
                
                #データをリストに入れておく
                if type == 'all':
                    output_data_new = i+1, sita_url, title_sita, h1_sita, h2_sita, h3_sita, mojisu_sita
                elif type == 'title':
                    output_data_new = i+1, sita_url, title_sita
                elif  type == 'url':
                    output_data_new = sita_url
                self.output.append(output_data_new)
        return self.output
