# -*- coding: utf-8 -*-
"""
bp1.pyプログラム
バックプロパゲーションによるニューラルネットの学習  
誤差の推移や，学習結果となる結合係数などを出力します
使い方　c:\>python bp1.py < data.txt
"""
# モジュールのインポート
import math
import sys
import random

# グローバル変2
INPUTNO = 2       #入力層のセル数
HIDDENNO = 3      #中間層のセル数
ALPHA = 10         #学習係数
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
def forward(wh,wo,hi,e):
    """順方向の計算"""
    #hiの計算
    for i in range(HIDDENNO):
        u = 0.0
        for j in range(INPUTNO):
            u += e[j] * wh[i][j]
        u -= wh[i][INPUTNO] #しきい値の処理
        hi[i] = f(u)
    #出力oの計算
    o=0.0
    for i in range(HIDDENNO):
        o += hi[i] * wo[i]
    o -= wo[HIDDENNO] #しきい値の処理
    return f(o)
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
    #誤差の計算
    d = (e[INPUTNO] - o) * o * (1 - o)
    #重みの学習
    for i in range(HIDDENNO):
        wo[i] += ALPHA * hi[i] * d
    #しきい値の学習
    wo[HIDDENNO] += ALPHA * (-1.0) * d
    return 
# olearn()関数の終わり

# hlearn()関数
def hlearn(wh,wo,hi,e,o):
    """中間層の重み学習"""
    #中間層の各セルjを対象
    for j in range(HIDDENNO):
        dj = hi[j] * (1 - hi[j]) * wo[j] * (e[INPUTNO] - o) * o * (1 - o)
        #i番目の重みを処理
        for i in range(INPUTNO):
            wh[j][i] += ALPHA * e[i] * dj
        #しきい値の学習
        wh[j][INPUTNO] += ALPHA * (-1.0) * dj
    return 
# hlearn()関数の終わり

# メイン実行部
#乱数の初期化
random.seed(SEED)

#変数の準備
wh = [[random.uniform(-1,1) for i in range(INPUTNO + 1)]
       for j in range(HIDDENNO)]        #中間層の重み
wo = [random.uniform(-1,1)
      for i in range(HIDDENNO + 1)]     #出力層の重み
e = [[0.0 for i in range(INPUTNO + 1)] 
      for j in range(MAXINPUTNO)]       #学習データセット
hi = [0 for i in range(HIDDENNO)]   #中間層の出力
err = BIGNUM                            #誤差の評価

#結合荷重の初期値の出力
print(wh,wo)

#学習データの読み込み
n_of_e = getdata(e)
print("学習データの個数:",n_of_e)

#学習
count = 0
while err > LIMIT :
    err = 0.0
    for j in range(n_of_e):
        #順方向の計算
        o = forward(wh,wo,hi,e[j])
        #出力層の重みの調整
        olearn(wo,hi,e[j],o)
        #中間層の重みの調整
        hlearn(wh,wo,hi,e[j],o)
        #誤差の積算
        err += (o - e[j][INPUTNO]) * (o - e[j][INPUTNO]) 
    count += 1
    #誤差の出力
    print(count," ",err)
#結合荷重の出力
print(wh,wo)

#学習データに対する出力 
for i in range(n_of_e):
    print(i,":",e[i],"->",forward(wh,wo,hi,e[i]))
# bp1.pyの終わり
