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

zoom_map = 14

zoom = 15
#パッチサイズ
patch = 15
#メインループパッチ
RanPatch = 12

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

#学校位置と高さ
ulat = 34.369873
ulon = 132.343964
uhigh = 56
high = 10
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

"""
#広島湾全域
slat = 34.406951
slon = 132.120587
elat = 33.824717
elon = 132.707782

#def Getgeoid(latitude,longtitude):
#    url='https://vldb.gsi.go.jp/sokuchi/surveycalc/geoid/calcgh/cgi/geoidcalc.pl?outputType=json&latitude={latitude}&longitude={longtitude}'.format(latitude=latitude,longtitude=longtitude)
#    try:
#        req = urllib.request.Request(url)
#        body = json.load(urllib.request.urlopen(req))
#        geoidHeight = float(body['OutputData']['geoidHeight'])
#    except:
#        geoidHeight = 0.0
#    return geoidHeight

def bin2ecef(lat,lon,ht):
    n = lambda x: A / \
        cp.sqrt(1.0 - E2 * cp.sin(x * PI_180) ** 2)
    x = (n(lat) + ht) \
        * cp.cos(lat * PI_180) \
        * cp.cos(lon * PI_180)
    y = (n(lat) + ht) \
        * cp.cos(lat * PI_180) \
        * cp.sin(lon * PI_180)
    z = (n(lat) * (1.0 - E2) + ht) \
        * cp.sin(lat * PI_180)
    del lat,lon,ht,n
    return [x,y,z]

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

def fetch_tile(z, x, y):
    u = 0.01
    url = "https://cyberjapandata.gsi.go.jp/xyz/dem5a_png/{z}/{x}/{y}.png".format(z=z,x=x,y=y)
    try:
        Img = np.array(Image.open(io.BytesIO(requests.get(url, headers = {'User-agent': 'your bot 0.1'}).content)))
        df = pow(2,16) * Img[:,:,0] + pow(2,8) * Img[:,:,1] + Img[:,:,2]
        df = np.where(df < pow(2,23), df * u, df)
        df = np.where(df == pow(2,23), 0, df)
        df = np.where(df > pow(2,23), (df - pow(2,24)) * u , df)
        return df
    except:
        url = "https://cyberjapandata.gsi.go.jp/xyz/dem5b_png/{z}/{x}/{y}.png".format(z=z,x=x,y=y)
        try:
            Img = np.array(Image.open(io.BytesIO(requests.get(url, headers = {'User-agent': 'your bot 0.1'}).content)))
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

def fetch_tile_map(z, x, y):
    url = "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png".format(z=z,x=x,y=y)
    try:
        Img = plt.imread(io.BytesIO(requests.get(url, headers = {'User-agent': 'your bot 0.1'}).content))
        return Img
    except:
        df = np.zeros((256,256,4))
        return df
    
    return df

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
    return [tile,sla,slo,ela,elo,stX,stY]

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

#def Earth(X,Y,tile):
#    geoid = Getgeoid(X,Y)
#    print(geoid)
#    tile = tile + geoid
#    del geoid
#    x,y,z = bin2ecef(X,Y,tile)
#    del X,Y,tile
#    return [x,y,z]

def ecef2bin(x,y,z):
    p = cp.sqrt(x*x + y*y)
    sita = (180/cp.pi) * cp.arctan2(z*A,p*B)
    lat = (180/cp.pi) * cp.arctan2(z+ED2*B*(cp.sin(sita*PI_180) ** 3),(p-E2*A*(cp.cos(sita*PI_180) ** 3)))
    del sita
    lon = (180/cp.pi) * cp.arctan2(y,x)
    height = (p / cp.cos(lat * PI_180)) - (A / cp.sqrt(1.0 - E2 * (cp.sin(lat * PI_180) ** 2)))
    del p,x,y,z
    return [lat,lon,height]

def RadioRange(top,ander,xpixel,ypixel,Z,ux,uy,uz):
    X,Y,MS = StraightPosition(top,ander,ux,uy,uz,Z)
    X = cp.where(MS <= 0,X,cp.nan)
    Y = cp.where(MS <= 0,Y,cp.nan)
    TZ = cp.where(MS <= 0,Z[top:ander,:],cp.nan)
    d = getDistance3D(ux*xpixel,uy*ypixel,uz,X*xpixel,Y*ypixel,TZ)
    gain = TwoWave(d,uz,high+TZ,920,4,16)
    print(gain.shape,top,ander)
    return cp.asnumpy(gain)

def write(cv,file):
    f = open(file,'w', newline='')
    write = csv.writer(f)
    write.writerows(cv)

def StraightPosition(top,ander,UX,UY,UZ,Z):
    y,x = Z[top:ander].shape
    X,Y = np.meshgrid(range(x) , range(top,ander))
    X = cp.array(X)
    Y = cp.array(Y)
    Tilt = (UY - Y)/(UX - X)
    Section = Tilt*(-1*X) + Y

    MinY = cp.where(Y < UY,Y,UY)
    MaxY = cp.where(Y > UY,Y,UY)

    MinX = cp.where(X < UX,X,UX)
    MaxX = cp.where(X > UX,X,UX)

    TiltYZ = (Z[top:ander,:] + high - UZ)/(Y - UY)
    SectionYZ = TiltYZ * -UY + UZ
    TiltXZ = (Z[top:ander,:] + high - UZ)/(X - UX)
    SectionXZ = TiltXZ * -UX + UZ
    MaxElevation = cp.full((y,x), -1000)
    y,x = Z.shape
    Max = x if x > y else y
    ArrayI = cp.arange(Max)
    for i in ArrayI:
        RY = cp.where((MinY < i) & (MaxY > i),i,Y)
        RX = cp.where(Y != RY,cp.around((RY - Section)/Tilt),X)
        RX = cp.where(UX == X,UX,RX)
        RZ = Z[RY.astype(cp.int32),RX.astype(cp.int32)] - (RY * TiltYZ + SectionYZ)
        MaxElevation = cp.where((cp.around(RZ,3) > MaxElevation),cp.around(RZ,3),MaxElevation)
        del RX,RY,RZ
        LX = cp.where((MinX < i) & (MaxX > i),i,X)
        LY = cp.where(X != LX,cp.around(LX * Tilt + Section),Y)
        LZ = Z[LY.astype(cp.int32),LX.astype(cp.int32)] - (LX * TiltXZ + SectionXZ)
        MaxElevation = cp.where((cp.around(LZ,3) > MaxElevation),cp.around(LZ,3),MaxElevation)
        del LX,LY,LZ
    return [X,Y,MaxElevation]

def TwoWave(d,ht,hr,f,r,outd):#2波モデル
    lam = 3*10**2/f
    e0 = cp.sqrt(d**2 + (ht - hr)**2)
    d2 = cp.sqrt(d**2 + (ht + hr)**2)
    q = 2 * cp.pi * (e0 - d2) / lam
    atan = cp.arctan(d/(ht + hr))
    angle = atan * 180 / cp.pi
    cos = cp.cos((90 - angle) * cp.pi / 180)
    sin = cp.sin((90 - angle) * cp.pi / 180)
    R = (sin - cp.sqrt(r - cos**2))/(sin + cp.sqrt(r - cos**2))
    g = (lam/4/cp.pi)**2 * ( (1/e0 + R * cp.cos(q)/d2)**2 + (R * cp.sin(q)/d2)**2)
    gain = 10 * cp.log10(g) + outd
    return gain

def getDistance3D(x1,y1,z1,x2,y2,z2):
    d = cp.sqrt((x1-x2)**2 + (y1-y2)**2 + (z1-z2)**2)
    return d

def Vectorlen(x,y,z):
    d = cp.sqrt(x**2 + y**2 + z**2)
    return d

def Horizon(X,Y,Z,ux,uy,uz,ander):
    a = uy*Z - Y*uz
    b = uz*X - Z*ux
    c = ux*Y - X*uy
    dx,dy,dz = Polar(a,b,c,ux,uy,uz,X,Y,Z)
    a = getDistance3D(dx,dy,dz,X,Y,Z)
    b = getDistance3D(dx,dy,dz,ux,uy,uz)
    c = getDistance3D(X,Y,Z,ux,uy,uz)
    cosA = (-a**2 + b**2 + c**2) / (2*c*b)
    Angle = cp.arccos(cosA)
    Hori = c * cp.sin(Angle)
    return Hori

def Polar(x1,y1,z1,x2,y2,z2,x3,y3,z3):
    X1 = x1[:,:,cp.newaxis,cp.newaxis]
    X2 = cp.full((X1.shape), x2/(A**2))
    X3 = x3[:,:,cp.newaxis,cp.newaxis] / (A**2)
    X = cp.concatenate([X1,X2,X3],2)
    del X1,X2,X3,x1
    Y1 = y1[:,:,cp.newaxis,cp.newaxis]
    Y2 = cp.full((Y1.shape), y2/(A**2))
    Y3 = y3[:,:,cp.newaxis,cp.newaxis] / (A**2)
    Y = cp.concatenate([Y1,Y2,Y3],2)
    del Y1,Y2,Y3,y1
    Z1 = z1[:,:,cp.newaxis,cp.newaxis]
    Z2 = cp.full((Z1.shape), z2/(B**2))
    Z3 = z3[:,:,cp.newaxis,cp.newaxis] / (B**2)
    Z = cp.concatenate([Z1,Z2,Z3],2)
    del Z1,Z2,Z3,z1
    xyz = cp.concatenate([X,Y,Z],3)
    del X,Y,Z
    y,x,t,g = xyz.shape
    d = cp.full((y,x,t), 1)
    d[:,:,0] = 0
    ans = cp.linalg.solve(xyz,d)
    return [ans[:,:,0],ans[:,:,1],ans[:,:,2]]


def get_beyond(top,ander,XY,ulat,ulon):
    Z = cp.zeros(XY[0,:,:].shape)
    TX,TY,TZ = bin2ecef(XY[0,:,:],XY[1,:,:],Z)
    tux,tuy,tuz = bin2ecef(ulat,ulon,0)
    Z = Horizon(TX,TY,TZ,tux,tuy,tuz,ander)
    print(Z.shape,top,ander)
    return [cp.asnumpy(TX),cp.asnumpy(TY),cp.asnumpy(TZ),cp.asnumpy(Z)]

def UPosition(ulat,ulon,lat,lon):
    uy = Nearest(lat,ulat)
    ux = Nearest(lon,ulon)
    return [ux,uy]

def Nearest(array,t):
    array = abs(array - t)
    v = np.argmin(array)
    return v


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



sx,sy = get_tail_num(slat,slon,zoom)
ex,ey = get_tail_num(elat,elon,zoom)
print(sx,sy)
print(ex,ey)

start = time.time()
tile = fetch_all_tiles((zoom, int(sx), int(sy)), (zoom, int(ex), int(ey)))
tile,slat,slon,elat,elon,stx,sty = SharpenXY(tile,sx,sy,ex,ey,zoom)
y,x = tile.shape
print(tile.shape)
Amin = np.unravel_index(np.argmin(tile), tile.shape)
pr = np.array(np.around(np.linspace(0,y,patch)),dtype = np.int64)
Y,X = np.meshgrid(np.linspace(slon,elon,x),np.linspace(slat,elat,y))
ux,uy = UPosition(ulat,ulon,X[:,0],Y[0,:])
print(ux,uy)
uz = uhigh + tile[uy,ux]
XYZ = np.array([X,Y,tile])
print(pr)
XYZ[0,uy,ux] = XYZ[0,uy+1,ux+1]
XYZ[1,uy,ux] = XYZ[1,uy+1,ux+1]
XYZ[2,uy,ux] = XYZ[2,uy+1,ux+1]
beyond = np.concatenate([get_beyond(pr[i],pr[i+1],cp.array(XYZ[0:2,pr[i]:pr[i+1],:]),ulat,ulon) for i in np.arange(patch-1)],axis=1)
XYZ[0,uy,ux] = ulat
XYZ[1,uy,ux] = ulon
XYZ[2,uy,ux] = uz
beyond[3,uy,ux] = 0
write(beyond[3,:,:],"beyond0_1.csv")
XYZ[2,:,:] = XYZ[2,:,:] - beyond[3,:,:]
xpixel = Vincenty.vincenty_inverse(X[0,0],Y[0,0],X[1,0],Y[0,0])
ypixel = Vincenty.vincenty_inverse(X[0,0],Y[0,0],X[0,0],Y[0,1])
pr = np.array(np.around(np.linspace(0,y,RanPatch)),dtype = np.int64)
print(pr)
"""
fig = plt.figure()
ax = Axes3D(fig)
ax.plot_surface(XYZ[0,:,:],XYZ[1,:,:],-beyond[3,:,:],alpha=0.6)
ax.scatter(XYZ[0,uy,ux],XYZ[1,uy,ux],uz,c='red')
fig = plt.figure()
ax = Axes3D(fig)
ax.plot_surface(XYZ[0,:,:],XYZ[1,:,:],XYZ[2,:,:],alpha=0.6)
ax.scatter(XYZ[0,uy,ux],XYZ[1,uy,ux],uz,c='red')
"""

fig = plt.figure()
ax = Axes3D(fig)
ax.plot_surface(XYZ[0,:,:],XYZ[1,:,:],-beyond[3,:,:],alpha=0.6)
ax.scatter(XYZ[0,uy,ux],XYZ[1,uy,ux],uz,c='red')

RSSI = np.concatenate([RadioRange(pr[i],pr[i+1],xpixel,ypixel,cp.array(XYZ[2,:,:]),ux,uy,uz) for i in np.arange(RanPatch-1)],axis=0)
sx,sy = get_tail_num(slat,slon,zoom_map)
ex,ey = get_tail_num(elat,elon,zoom_map)
tile = fetch_all_tiles_map((zoom_map, int(sx), int(sy)), (zoom_map, int(ex), int(ey)))
tile,slat,slon,elat,elon = SharpenXY_map(tile,sx,sy,ex,ey,zoom_map)
print(RSSI.shape)
print(tile.shape)

fig,ax = plt.subplots()
ax.contourf(XYZ[1,:,:],XYZ[0,:,:],RSSI,alpha=0.2)
mappable0 = ax.pcolor(XYZ[1,:,:],XYZ[0,:,:],RSSI, cmap="RdBu",alpha = 0.2)
fig.colorbar(mappable0, ax=ax)
ax.plot(XYZ[1,uy,ux],XYZ[0,uy,ux],marker="*",markersize=10,c='red')

xlim = ax.get_xlim()
ylim = ax.get_ylim()
ax.imshow(tile,extent=[*xlim,*ylim], aspect='auto',alpha=1)

plt.show()
