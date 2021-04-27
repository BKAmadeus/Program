import pandas as pd
import matplotlib.pyplot as plt
import matplotlib
from mpl_toolkits.mplot3d.axes3d import *
import numpy as np
import xml.etree.ElementTree as ET
import io
import requests
from PIL import Image
import math
import csv
import subprocess
import os
import Vincenty
import datetime

zoom = 15

zoom_map = 15

def CsvWrite(cv,file):
    f = open(file,'w', newline='')
    write = csv.writer(f)
    write.writerows(cv)

def SharpenXY(tile,sx,sy,ex,ey,zoom):
    sla,slo = tile2latlon(sx*256,sy*256,zoom)
    startX,startY = latlon2tile2(sla,slo,zoom)
    ela,elo = tile2latlon(ex*256,ey*256,zoom)
    endX,endY = latlon2tile2(ela,elo,zoom)
    stX = startX % 256
    stY = startY % 256
    y,x = tile.shape
    enX = x - (256 - endX % 256)
    enY = y - (256 - endY % 256)
    tile = tile[stY:enY,stX:enX]
    return [tile,sla,slo,ela,elo]


def tile2latlon(x, y, z):
    L = 85.05112878
    lon = ((x / 2.0**(z+7) )-1) * 180
    lat = 180/math.pi * (math.asin(math.tanh(-math.pi/2**(z+7)*y + np.arctanh(math.sin(math.pi/180*L)))))
    return [lat, lon]

def latlon2tile2(lat, lon, z):
    L = 85.05112878
    x = int((lon/180 + 1) * 2**(z+7))
    y = int( (2**(z+7) / math.pi * ( -np.arctanh(math.sin(math.pi*lat/180)) + np.arctanh(math.sin(math.pi*L/180)) ) ))
    return [x,y]

def ReadHeaderNone(file):
    a = pd.read_csv(file,header=None,encoding="utf-8_sig")
    return a

def get_tail_num(lat, lon, zoom):
    # https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Python
    lat_rad = math.radians(lat)
    n = 2.0 ** zoom
    xtile = (lon + 180.0) / 360.0 * n
    ytile = (1.0 - math.log(math.tan(lat_rad) + (1 / math.cos(lat_rad))) / math.pi) / 2.0 * n
    return (xtile, ytile)

def fetch_tile(z, x, y):
    u = 0.01
    url = "https://cyberjapandata.gsi.go.jp/xyz/dem5a_png/{z}/{x}/{y}.png".format(z=z,x=x,y=y)
    try:
        Img = np.array(Image.open(io.BytesIO(requests.get(url).content)))
        df = pow(2,16) * Img[:,:,0] + pow(2,8) * Img[:,:,1] + Img[:,:,2]
        df = np.where(df < pow(2,23), df * u, df)
        df = np.where(df == pow(2,23), 0, df)
        df = np.where(df > pow(2,23), (df - pow(2,24)) * u , df)
        return df
    except:
        url = "https://cyberjapandata.gsi.go.jp/xyz/dem5b_png/{z}/{x}/{y}.png".format(z=z,x=x,y=y)
        try:
            Img = np.array(Image.open(io.BytesIO(requests.get(url).content)))
            df = pow(2,16) * Img[:,:,0] + pow(2,8) * Img[:,:,1] + Img[:,:,2]
            df = np.where(df < pow(2,23), df * u, df)
            df = np.where(df == pow(2,23), 0, df)
            df = np.where(df > pow(2,23), (df - pow(2,24)) * u , df)
            return df
        except:
            url = "https://cyberjapandata.gsi.go.jp/xyz/dem5a/{z}/{x}/{y}.txt".format(z=z, x=x, y=y)
            try:
                df =  pd.read_csv(url, header=None,encoding="utf-8_sig").replace("e", 0.)
                df = df.astype(np.float)
                return df.values
            except:
                try:
                    url = "https://cyberjapandata.gsi.go.jp/xyz/dem5b/{z}/{x}/{y}.txt".format(z=z, x=x, y=y)
                    df =  pd.read_csv(url, header=None,encoding="utf-8_sig").replace("e", 0.)
                    df = df.astype(np.float)
                    return df.values
                except:
                    df = np.zeros((256,256))
                    return df
    
    return df
def fileWriteAll(tile,xy):
    CsvWrite(tile,'Practice\map.csv')
    CsvWrite(xy,'Practice\latlon.csv')
    returncode = subprocess.call("matlab -r -nodesktop -nosplash Equally",shell=True)
    now = datetime.datetime.now().strftime('%Y-%m-%d-%H%M%S')
    returncode = subprocess.call("mkdir sampledataset\\" + now,shell=True)
    returncode = subprocess.call("copy node.xml Practice\\",shell=True)
    returncode = subprocess.call("move node.xml sampledataset\\" + now,shell=True)
    returncode = subprocess.call("move mapselect.txt sampledataset\\" + now,shell=True)


def fetch_all_tiles(north_west, south_east):
    """ 北西端・南東端のタイル座標を指定して、長方形領域の標高タイルを取得 """
    assert north_west[0] == south_east[0], "タイル座標のzが一致していません"
    x_range = range(north_west[1], south_east[1]+1)
    y_range = range(north_west[2], south_east[2]+1)
    return  np.concatenate(
        [
            np.concatenate(
                [fetch_tile(north_west[0], x, y) for y in y_range],
                axis=0
            ) for x in x_range
        ],
        axis=1
    )

def fetch_tile_map(z, x, y):
    url = "https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg".format(z=z,x=x,y=y)
    try:
        Img = np.array(Image.open(io.BytesIO(requests.get(url, headers = {'User-agent': 'your bot 0.1'}).content)))
        return Img
    except:
        df = np.zeros((256,256,3))
        return df
    
    return df

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


while True:
    try:
        se = ReadHeaderNone('mapselect.txt')
        # XMLファイルを解析
        tree = ET.parse('node.xml') 
        # XMLを取得
        root = tree.getroot()
    except:
        continue
    sx,sy = get_tail_num(se.at[0,0],se.at[0,1],zoom)
    ex,ey = get_tail_num(se.at[1,0],se.at[1,1],zoom)
    tile = fetch_all_tiles((zoom, int(sx), int(sy)), (zoom, int(ex), int(ey)))
    tile,slat,slon,elat,elon = SharpenXY(tile,sx,sy,ex,ey,zoom)
    y,x = tile.shape
    lat = np.linspace(slat,elat,y)
    lon = np.linspace(slon,elon,x)
    X,Y = np.meshgrid(lon,lat)
    xy = []
    xy.append(lat)
    xy.append(lon)
    a = Vincenty.vincenty_inverse(lat[0],lon[0],lat[1],lon[0])
    b = Vincenty.vincenty_inverse(lat[0],lon[0],lat[0],lon[1])
    xy.append([a,b])
    fileWriteAll(tile,xy)
    sx,sy = get_tail_num(slat,slon,zoom_map)
    ex,ey = get_tail_num(elat,elon,zoom_map)
    tile = fetch_all_tiles_map((zoom_map, int(sx), int(sy)), (zoom_map, int(ex), int(ey)))
    tile,slat,slon,elat,elon = SharpenXY_map(tile,sx,sy,ex,ey,zoom_map)
    matplotlib.image.imsave('Practice/map.jpg',tile)

    zoom_map = 18
    sx,sy = get_tail_num(slat,slon,zoom_map)
    ex,ey = get_tail_num(elat,elon,zoom_map)
    tile = fetch_all_tiles_map((zoom_map, int(sx), int(sy)), (zoom_map, int(ex), int(ey)))
    tile,slat,slon,elat,elon = SharpenXY_map(tile,sx,sy,ex,ey,zoom_map)
    matplotlib.image.imsave('Practice/map_18.jpg',tile)

    y,x,z = tile.shape
    img = Image.open('Practice/do2.jpg')
    img_resize = img.resize((x, y))
    img_resize.save('Practice/do2.jpg')
    img = Image.open('Practice/gral.jpg')
    img_resize = img.resize((x, y))
    img_resize.save('Practice/gral.jpg')