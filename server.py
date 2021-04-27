#server.py
import socket
import serial
import re
import random
from flask import Flask, request, jsonify
import cek
import threading

# AF = IPv4 という意味
# TCP/IP の場合は、SOCK_STREAM を使う
with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
    # IPアドレスとポートを指定
    s.bind(('0.0.0.0', 50007))
    # 1 接続
    s.listen(1)
    # connection するまで待つ
    while True:
        ser = serial.Serial("/dev/ttyUSB0",115200)
        line = ser.readline()
        device = str(line)[4]
        # 誰かがアクセスしてきたら、コネクションとアドレスを入れる
        conn, addr = s.accept()
        with conn:
            while True:
                # データを受け取る
                data = conn.recv(1024)
                if not data:
                    break
                print('data : {}, addr: {}'.format(data, addr))
                # クライアントにデータを返す(b -> byte でないといけない)
                msg = str(line).encode("UTF-8")
                conn.sendall(msg)

