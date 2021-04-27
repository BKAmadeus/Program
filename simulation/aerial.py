import pandas as pd
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d.axes3d import *
from mpl_toolkits.mplot3d import Axes3D
import numpy as np
import io
import requests
from PIL import Image
import math
import Vincenty
import time
from multiprocessing import Pool
import cupy as cp
import csv
import sys
import random
import cv2


zoom_map = 18
#パッチサイズ
patch = 2
#メインループパッチ
RanPatch = 2

PI_180 = math.pi / 180  
A = 6378137                 #a(地球楕円体長半径（赤道半径)
#GRS80
ONE_F = 298.257222101       #1 / f(地球楕円体扁平率=(a - b) / a)
#WGS84
#ONE_F = 298.257223563
B = A * (1.0 - 1.0 / ONE_F) #b(地球楕円体極半径)
E2 = (1.0 / ONE_F) * (2 - (1.0 /ONE_F))
                            #e^2 = 2 * f - f * f
ED2 = E2 * A * A / (B * B)  #e'^2 = (a^2 - b^2) / b^2

"""
#極小範囲
slat = 34.37     #float(slat)
slon = 132.342   #float(slon)
elat = 34.3675     
elon = 132.345

#小範囲
slat = 34.40     #float(slat)
slon = 132.3   #float(slon)
elat = 34.335     #float(elat)
elon = 132.375        #float(elon)

#広域
slat = 34.4    
slon = 132.325   #float(slon)
elat = 34.025     #float(elat)
elon = 132.675        #float(elon)

#beyondのチェック用
slat = 34.391226
slon = 132.330851
elat = 33.980416
elon = 132.375414

#広島湾全域
slat = 34.406951
slon = 132.120587
elat = 33.824717
elon = 132.707782

#ランダム抜出 
slat = 34.445300
slon = 132.234170
elat = 34.340574
elon = 132.449405
"""


#ランダム抜出
slat = 35.504789
slon = 132.443398
elat = 34.363861
elon = 136.614211


#def Getgeoid(latitude,longtitude):
#    url='https://vldb.gsi.go.jp/sokuchi/surveycalc/geoid/calcgh/cgi/geoidcalc.pl?outputType=json&latitude={latitude}&longitude={longtitude}'.format(latitude=latitude,longtitude=longtitude)
#    try:
#        req = urllib.request.Request(url)
#        body = json.load(urllib.request.urlopen(req))
#        geoidHeight = float(body['OutputData']['geoidHeight'])
#    except:
#        geoidHeight = 0.0
#    return geoidHeight


def tile2latlon(x, y, z):
    L = 85.05112878
    lon = ((x / 2.0**(z+7) )-1) * 180
    lat = 180/np.pi * (np.arcsin(np.tanh(-np.pi/2**(z+7)*y + np.arctanh(np.sin(np.pi/180*L)))))
    return [lat, lon]

def latlon2tile2(lat, lon, z):
    L = 85.05112878
    x = int((lon/180 + 1) * 2**(z+7))
    y = int( (2**(z+7) / np.pi * ( -np.arctanh(np.sin(np.pi*lat/180)) + np.arctanh(np.sin(np.pi*L/180)) ) ))
    return [x,y]

def get_tail_num(lat, lon, zoom):
    # https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Python
    lat_rad = math.radians(lat)
    n = 2.0 ** zoom
    xtile = (lon + 180.0) / 360.0 * n
    ytile = (1.0 - np.log(np.tan(lat_rad) + (1 / np.cos(lat_rad))) / np.pi) / 2.0 * n
    return (xtile, ytile)

def fetch_tile_map(z, x, y):
    url = "https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg".format(z=z,x=x,y=y)
    error = 0
    try:
        Img = np.array(Image.open(io.BytesIO(requests.get(url, headers = {'User-agent': 'your bot 0.1'}).content)))
        return (Img,error)
    except:
        df = np.zeros((256,256,3))
        print("error")
        error = 1
        return (df,error)
    return (df,error)

def fetch_all_tiles_map(north_west, south_east):
    """ 北西端・南東端のタイル座標を指定して、長方形領域の標高タイルを取得 """
    assert north_west[0] == south_east[0], "タイル座標のzが一致していません"
    x_range = range(north_west[1], south_east[1]+1)
    y_range = range(north_west[2], south_east[2]+1)
    return  np.concatenate(
        [
            np.concatenate(
                [fetch_tile_map(north_west[0], x, y) for y in y_range],
                axis=0
            ) for x in x_range
        ],
        axis=1
    )

def SharpenXY_map(tile,sx,sy,ex,ey,zoom):
    sla,slo = tile2latlon(sx*256,sy*256,zoom)
    startX,startY = latlon2tile2(sla,slo,zoom)
    ela,elo = tile2latlon(ex*256,ey*256,zoom)
    endX,endY = latlon2tile2(ela,elo,zoom)
    stX = startX % 256
    stY = startY % 256
    y,x,z = tile.shape
    enX = x - (256 - endX % 256)
    enY = y - (256 - endY % 256)
    tile = tile[stY:enY,stX:enX]
    return [tile,sla,slo,ela,elo]

def write(cv,file):
    f = open(file,'w', newline='')
    write = csv.writer(f)
    write.writerows(cv)

def detect_green_color(img):
    # HSV色空間に変換
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)

    # 緑色のHSVの値域1
    hsv_min = np.array([30, 64, 0])
    hsv_max = np.array([90,255,255])

    # 緑色領域のマスク（255：赤色、0：赤色以外）    
    mask = cv2.inRange(hsv, hsv_min, hsv_max)
    
    # マスキング処理
    masked_img = cv2.bitwise_and(img, img, mask=mask)

    return mask, masked_img

#34.313117 132.254453
#34.233169 132.350919
#slat = input("Start latitube :")
#slon = input("Start longitube :")
#elat = input("End latitube :")
#elon = input("End longitube :")
#slat = float(slat)
#slon = float(slon)
#elat = float(elat)
#elon = float(elon)
MAXFILE = 50000
print(random.sample(range(10), k=5))
sx,sy = get_tail_num(slat,slon,zoom_map)
ex,ey = get_tail_num(elat,elon,zoom_map)
print(sx,ex)
print(sy,ey)
test = int(ex)- int(sx) + 1
x = np.linspace(int(sx),int(ex),test)
test = int(ey)- int(sy) + 1
y = np.linspace(int(sy),int(ey),test)
print(len(x))
print(len(y))
randx = random.choices(x, k = MAXFILE)
randy = random.choices(y, k = MAXFILE)
print(randx)
print(randy)
for i in range(MAXFILE):
    get,error = fetch_tile_map(zoom_map, int(randx[i]), int(randy[i]))
    if error == 0:
        name = "folder/" + str(int(randx[i])) + "-" + str(int(randy[i])) + ".jpg"
        cv2.imwrite(name, get)
#tile = fetch_all_tiles_map((zoom_map, int(sx), int(sy)), (zoom_map, int(ex), int(ey)))
#tile,slat,slon,elat,elon = SharpenXY_map(tile,sx,sy,ex,ey,zoom_map)
#print(tile.shape)

"""
import numpy as np
from matplotlib import pyplot as plt

cv2.imwrite('tile_18.jpg', tile)
img = tile
mask,mask_img = detect_green_color(img)
cv2.imwrite('opencv_masks.jpg', mask)
th, im_th = cv2.threshold(img, 128, 255, cv2.THRESH_BINARY)
mask,mask_img = detect_green_color(im_th)
print(th)
# 128.0
cv2.imwrite('opencv_th.jpg', im_th)
cv2.imwrite('opencv_img.jpg', img)
cv2.imwrite('opencv_mask.jpg', mask)
cv2.imwrite('opencv_maskimg.jpg', mask_img)
write(mask,"mask.csv")
edges = cv2.Canny(img,100,200)

plt.subplot(121),plt.imshow(img,cmap = 'gray')
plt.title('Original Image'), plt.xticks([]), plt.yticks([])
plt.subplot(122),plt.imshow(edges,cmap = 'gray')
plt.title('Edge Image'), plt.xticks([]), plt.yticks([])

plt.show()
"""