import json
import requests

data = {'id': 1, 'name': 'hoge'}
json_str = json.dumps(data, ensure_ascii=False, indent=2)

print(json_str)

def xxxx_post(request):
    python_obj = json.loads(request.raw_post_data)  # RequestのBodyが直接JSON文字列となるようPOSTしてもらう
    return python_obj
a = requests.get('http://127.0.0.1:8000/api/v1/books/')
print(a.text)
a = xxxx_post(requests.get('http://127.0.0.1:8000/api/v1/books/'))
#print()
print(a)