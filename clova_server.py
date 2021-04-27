# coding: utf-8

from flask import Flask, request, jsonify
import cek
import socket
import serial
import re
import random
import threading
from datetime import datetime, timedelta
import random

global devices
global sensors
devices = []
sensors = []

def soc(msg):
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    # サーバを指定
    s.connect(('127.0.0.1', 50007))
    # サーバにメッセージを送る
    s.sendall(msg.encode("UTF-8"))
    # ネットワークのバッファサイズは1024。サーバからの文字列を取得する
    data = s.recv(1024)
    #
    return repr(data)


def gameini():
    global devices
    global sensors
    print(devices)
    print(len(devices))
    sensors = [0] * len(devices)
    cho = random.sample([0,1,-1], 2)
    sensors[cho[0]] = 1
    sensors[cho[1]] = -1
    print(sensors)
    
def ini():
    start = datetime.now()
    end = start + timedelta(seconds=10)
    flg = 0
    while end >= datetime.now():
        msg = soc('initial')
        global devices
        flg = 0
        if len(msg) == 61:
            #print("012345678901234567890123456789012345678901234567890123456789")
            #print(str(msg))
            #print(str(msg)[5:7]+" "+str(msg)[41:49])
            if str(msg)[41:49] > "F0000000":
                print(str(msg)[5:7]+" "+str(msg)[41:49])
            for dev in devices:
                if dev == str(msg)[5:7]:
                    flg = 1
                    break
            if flg == 0:
                devices.append(str(msg)[5:7])
                print(devices)
                flg = 1

def game():
    start = datetime.now()
    end = start + timedelta(seconds=50)
    flg = 0
    while end >= datetime.now():
        msg = soc('game')
        global devices
        if str(msg)[41:49] > "FF0000000":
            for dev in devices:
                if dev == str(msg)[5:7]:
                    return devices.index(str(msg)[5:7])
    return -1


app = Flask(__name__)

clova = cek.Clova(
    application_id="com.clova.twi",
    default_language="ja",
    debug_mode=True)

# /clova に対してのPOSTリクエストを受け付けるサーバーを立てる
@app.route('/clova', methods=['POST'])
def my_service():
    body_dict = clova.route(body=request.data, header=request.headers)
    response = jsonify(body_dict)
    response.headers['Content-Type'] = 'application/json;charset-UTF-8'
    return response

# 起動時の処理
@clova.handle.launch
def launch_request_handler(clova_request):
    welcome_japanese = cek.Message(message="宝探しをスタート", language="ja")
    response = clova.response([welcome_japanese])
    return response

# ヒントの発火箇所
@clova.handle.intent("Treasure_hunt")
def Hint(clova_request):
    global sensors
    print("hint")
    h = game()
    print(h)
    if h != -1:
        if sensors[h] == 0:
            message_japanese = cek.Message(message="何もなさそうな気がする！！", language="ja")
            response = clova.response([message_japanese])
            print("1")
            return response
        elif sensors[h] != 0:
            message_japanese = cek.Message(message="何かがある！！！", language="ja")
            response = clova.response([message_japanese])
            print("2")
            return response
    else:
        message_japanese = cek.Message(message="宝箱の前に立ってね", language="ja")
        response = clova.response([message_japanese])
        return response

# 探索の発火箇所
@clova.handle.intent("Search")
def Search(clova_request):
    global sensors
    print("seach")
    s = game()
    print(s)
    if s != -1:
        if sensors[s] == 0:
            message_japanese = cek.Message(message="残念！！外れだ！！", language="ja")
            print("3")
            response = clova.response([message_japanese])
            return response
        elif sensors[s] == 1:
            message_japanese = cek.Message(message="パンパカパーン！宝だ！", language="ja")
            response = clova.response([message_japanese])
            print("4")
            return response
        elif sensors[s] == -1:
            message_japanese = cek.Message(message="ドッカアーン！！！爆弾だあああァァ！！", language="ja")
            response = clova.response([message_japanese])
            print("5")
            return response
    else:
        message_japanese = cek.Message(message="宝箱の前に立って", language="ja")
        response = clova.response([message_japanese])
        return response
# 終了時
@clova.handle.end
def end_handler(clova_request):
    # Session ended, this handler can be used to clean up
    logger.info("Session ended.")

# 認識できなかった場合
@clova.handle.default
def default_handler(request):
    message_japanese = cek.Message(message="もう一度お願いします", language="ja")
    response = clova.response([message_japanese])
    return response


if __name__ == "__main__":
    ini()
    gameini()
    app.run()



