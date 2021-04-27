# クライアントを作成
#client.py
import socket
import serial
import re
import random
from flask import Flask, request, jsonify
import cek
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


def ser(msg):
    s = serial.Serial("/dev/ttyUSB0",115200)

    line = s.readline()
    print(line)
    try:
        device = str(line)[4]
        value = str(line)[39:41]
        print(device+'+'+value)
    except IndexError:
        print("IndexError")
    s.close
    return device+value

def gameini():
    global devices
    global sensors
    print(devices)
    print(len(devices))
    sensors = [0] * len(devices)
    sensors[random.randrange(len(devices))] = 1
    print(sensors)

def game():
    start = datetime.now()
    end = start + timedelta(seconds=1)
    flg = 0
    while end >= datetime.now():
        msg = soc('game')
        global devices
        if str(msg)[41:49] > "FF0000000":
            for dev in devices:
                if dev == str(msg)[5:7]:
                    return devices.index(str(msg)[5:7])

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


ini()
gameini()
a = game()
print(a)



