# -*- coding: utf-8 -*-
"""
bp1.pyプログラム
バックプロパゲーションによるニューラルネットの学習  
誤差の推移や，学習結果となる結合係数などを出力します
使い方　c:\>python bp1.py < data.txt
"""
# モジュールのインポート
import numpy as np
import csv
import math
import sys
import random

# グローバル変数
INPUTNO = 2       #入力層のセル数
HIDDENNO = 2      #中間層のセル数
MIDNO = 4         #中間層の数
OUTPUTNO = 2      #出力層のセル数
ALPHA = 1         #学習係数
SEED = 65535      #乱数のシード
MAXINPUTNO = 100  #データの最大個数
BIGNUM = 100.0    #誤差の初期値
LIMIT = 0.001     #誤差の上限値

# 下請け関数の定義
# getdata()関数
def getdata(e):
    """学習データの読み込み"""
    n_of_e = 0   #データセットの個数
    # データの入力
    for line in sys.stdin : 
        e[n_of_e] = [float(num) for num in line.split()]
        n_of_e += 1
    return n_of_e 
# getdata()関数の終わり

# forward()関数
def forward(wh,ws,wo,hi,e):
    """順方向の計算"""
    #hiの計算
    if MIDNO != 1:
        for i in range(HIDDENNO):
            u = 0.0
            for j in range(INPUTNO):
                u += e[j] * ws[i][j]
            u -= ws[i][INPUTNO] #しきい値の処理
            hi[0][i] = f(u)

        for i in range(1,MIDNO):
            for j in range(HIDDENNO):
                u = 0.0
                for k in range(HIDDENNO):
                    u += hi[i - 1][k] * wh[i - 1][j][k]
                u -= wh[i - 1][j][HIDDENNO]
                hi[i][j] = f(u)
        #出力oの計算
        o = [0.0 for i in range(OUTPUTNO)]
        for i in range(OUTPUTNO):
            for j in range(HIDDENNO):
                o[i] += hi[MIDNO - 1][j] * wo[i][j]
            o[i] -= wo[i][HIDDENNO] #しきい値の処理
            o[i] = f(o[i])
      
    return o
# forward()関数の終わり

# f()関数
def f(u):
    """伝達関数"""
    #シグモイド関数の計算
    return 1.0/(1.0 + math.exp(-u))
 
# f()関数の終わり

# olearn()関数
def olearn(wo,hi,e,o):
    """出力層の重み学習"""
    for k in range(OUTPUTNO):
        #誤差の計算
        d = (e[INPUTNO + k] - o[k]) * o[k] * (1 - o[k])
        #重みの学習
        for i in range(HIDDENNO):
            wo[k][i] += ALPHA * hi[MIDNO - 1][i] * d
        #しきい値の学習
        wo[k][HIDDENNO] += ALPHA * (-1.0) * d
    return 
# olearn()関数の終わり

# hlearn()関数
def hlearn(wh,wo,ws,hi,e,o):
    """中間層の重み学習"""
    dj = [[0.0 for i in range(HIDDENNO)]
            for j in range(OUTPUTNO)]
    #中間層の各セルjを対象
    for k in range(OUTPUTNO):
        for j in range(HIDDENNO):
            dj[k][j] = hi[MIDNO - 1][j] * (1 - hi[MIDNO - 1][j]) * wo[k][j] * (e[INPUTNO + k] - o[k]) * o[k] * (1 - o[k])
            #i番目の重みを処理
            for i in range(HIDDENNO):
                wh[MIDNO - 2][j][i] += ALPHA * hi[MIDNO - 1][j] * dj[k][j]
            #しきい値の学習
            wh[MIDNO - 2][j][HIDDENNO] += ALPHA * (-1.0) * dj[k][j]

    for k in range(OUTPUTNO):
        for m in range(1,MIDNO - 1)[::-1]:
            for j in range(HIDDENNO):
                dj[k][j] *= hi[m][j] * (1 - hi[m][j]) * wh[m][k][j]
                for i in range(HIDDENNO):
                    wh[m - 1][j][i] += ALPHA * hi[m][j] * dj[k][j]
                wh[m - 1][j][HIDDENNO] += ALPHA * (-1.0) * dj[k][j]

    for k in range(OUTPUTNO):
        for j in range(HIDDENNO):
            dj[k][j] *= hi[0][j] * (1 - hi[0][j]) * wh[1][k][j]
            for i in range(INPUTNO):
                ws[j][i] += ALPHA * hi[0][j] * dj[k][j]
            ws[j][INPUTNO] += ALPHA * (-1.0) * dj[k][j]
    return 
# hlearn()関数の終わり

def InitialArrayWh():
    Input = np.random.uniform(-1,1,[INPUTNO,HIDDENNO,HIDDENNO])
    print(Input)

# メイン実行部
#乱数の初期化
random.seed(SEED)

#変数の準備
wh = [[[np.random.uniform(-1,1) for i in range(HIDDENNO + 1)]
        for j in range(HIDDENNO)]
        for k in range(MIDNO - 1)]     #2番目から中間層最後の中間層の重み
ws = [[np.random.uniform(-1,1) for i in range(INPUTNO + 1)]
        for j in range(HIDDENNO)]      #1番目の中間層の重み
wo = [[random.uniform(-1,1)
        for i in range(HIDDENNO + 1)]
        for j in range(OUTPUTNO)]      #出力層の重み
e = [[0.0 for i in range(INPUTNO + 1)] 
        for j in range(MAXINPUTNO)]       #学習データセット
hi = [[0 for i in range(HIDDENNO)]
        for k in range(MIDNO)]          #中間層から中間層への出力    #中間層から出力層への出力
err = BIGNUM                            #誤差の評価

#結合荷重の初期値の出力
print(wh,wo)

#学習データの読み込み
n_of_e = getdata(e)
print("学習データの個数:",n_of_e)

#学習
count = 0
"""
o = forward(wh,ws,wo,hi,e[0])
print("o = :")
print(o)
print("hi = :")
print(hi)
print("hi[MIDNO - 1] = :")
print(hi[MIDNO - 1])
print("開始前wo = :")
print(wo)
olearn(wo,hi,e[0],o)
print("開始後wo = :")
print(wo)
print("開始前のws = :")
print(ws)
hlearn(wh,wo,ws,hi,e[0],o)
print("開始後のwo = :")
print(wo)
print("開始後のws = :")
print(ws)
"""
while err > LIMIT :
    err = 0.0
    for j in range(n_of_e):
        #順方向の計算
        o = forward(wh,ws,wo,hi,e[j])
        #出力層の重みの調整
        olearn(wo,hi,e[j],o)
        #中間層の重みの調整
        hlearn(wh,wo,ws,hi,e[j],o)
        #誤差の積算
        for k in range(OUTPUTNO):
            err += (o[k] - e[j][INPUTNO + k]) * (o[k] - e[j][INPUTNO + k]) 
    count += 1
    #誤差の出力
    print(count," ",err)
#結合荷重の出力
print(wh,wo)

#学習データに対する出力 
for i in range(n_of_e):
    print(i,":",e[i],"->",forward(wh,wo,hi,e[i]))
# bp1.pyの終わり
