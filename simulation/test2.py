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


a = np.inf
b = np.inf * 3
print(b/a)
#beyondの各位置確かめ
"""
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


def bin2ecef(lat,lon,ht):
    n = lambda x: A / \
        math.sqrt(1.0 - E2 * math.sin(x * PI_180) ** 2)
    x = (n(lat) + ht) \
        * math.cos(lat * PI_180) \
        * math.cos(lon * PI_180)
    y = (n(lat) + ht) \
        * math.cos(lat * PI_180) \
        * math.sin(lon * PI_180)
    z = (n(lat) * (1.0 - E2) + ht) \
        * math.sin(lat * PI_180)
    return [x,y,z]

lat = 33.9804160018594
lon = 132.330851
B1 = np.array(bin2ecef(lat,lon,0))
A = [0,0,0]
#B = [-3549904.731645338,3895286.052426207,3580385.4359796937]
C = [-3549909.0812998367,3895285.2408522875,3580382.0292632077]
fig = plt.figure()
ax = Axes3D(fig)
ax.scatter(B1[0],B1[1],B1[2])
ax.scatter(C[0],C[1],C[2])
ax.plot([B1[0],C[0]],[B1[1],C[1]],[B1[2],C[2]],color = "red")
#B = [0,0,0]

a = B1[1]*C[2]-C[1]*B1[2]
b = B1[2]*C[0]-C[2]*B1[0]
c = B1[0]*C[1]-C[0]*B1[1]
d = -(a*A[0]+b*A[1]+c*A[2])
print(a,b,c,d)
a = (B1[1] - A[1])*(C[2] - A[2]) - (C[1] - A[1])*(B1[2] - A[2])
b = (B1[2] - A[2])*(C[0] - A[0]) - (C[2] - A[2])*(B1[0] - A[0])
c = (B1[0] - A[0])*(C[1] - A[1]) - (C[0] - A[0])*(B1[1] - A[1])
d = -(a*A[0]+b*A[1]+c*A[2])
print(a,b,c,d)
n = 20
test = np.zeros([(n)**2])
X = np.zeros([(n)**2])
Y = np.zeros([(n)**2])
count = 0
for x in np.linspace(-10000000,10000000,int(n)):
    for y in np.linspace(-10000000,10000000,int(n)):
        test[count] = (x*a+y*b-d)/c
        X[count] = x
        Y[count] = y
        count = count + 1

A = 6378137                 #a(地球楕円体長半径（赤道半径)
print(A)
#GRS80
ONE_F = 298.257222101       #1 / f(地球楕円体扁平率=(a - b) / a)
#WGS84
#ONE_F = 298.257223563
B = A * (1.0 - 1.0 / ONE_F) #b(地球楕円体極半径)
a2 = B1[0] / (A**2)
b2 = B1[1] / (A**2)
c2 = B1[2] / (B**2)

d2 = -1
test2 = np.zeros([(n)**2])
X2 = np.zeros([(n)**2])
Y2 = np.zeros([(n)**2])
count = 0
for x in np.linspace(-10000000,10000000,int(n)):
    for y in np.linspace(-10000000,10000000,int(n)):
        test2[count] = (x*a2+y*b2-d2)/c2
        X2[count] = x
        Y2[count] = y
        count = count + 1

a3 = C[0] / (A**2)
b3 = C[1] / (A**2)
c3 = C[2] / (B**2)
d3 = -1
test3 = np.zeros([(n)**2])
X3 = np.zeros([(n)**2])
Y3 = np.zeros([(n)**2])
count = 0
for x in np.linspace(-10000000,10000000,int(n)):
    for y in np.linspace(-10000000,10000000,int(n)):
        test3[count] = (x*a3+y*b3-d3)/c3
        X3[count] = x
        Y3[count] = y
        count = count + 1

fig = plt.figure()
ax = Axes3D(fig)
ax.scatter(X,Y,test)
ax.scatter(X2,Y2,test2)
ax.scatter(X3,Y3,test3)
plt.show()
#print(test)
#print(test2)
#print(test3)
an = a*a2 + b*b2 + c*c2
ans = an/(np.sqrt(a**2+b**2+c**2)*np.sqrt(a2**2+b2**2+c2**2))
print(np.arccos(ans))
an = a3*a2 + b3*b2 + c3*c2
ans = an/(np.sqrt(a3**2+b3**2+c3**2)*np.sqrt(a2**2+b2**2+c2**2))
print(np.arccos(ans))
an = a3*a + b3*b + c3*c
ans = an/(np.sqrt(a3**2+b3**2+c3**2)*np.sqrt(a**2+b**2+c**2))
print(np.arccos(ans))
s = np.array([[a,b,c],[a2,b2,c2],[a3,b3,c3]])
t = np.array([-d,-d2,-d3])
ans=np.linalg.solve(s,t)
print(s)
print(t)
print(ans)
ax.scatter(ans[0],ans[1],ans[2])
plt.show()
"""
#三元連立のスライス化確かめ
"""
a = cp.arange(6).reshape(2,3)
x1 = a[:,:,cp.newaxis,cp.newaxis]

b = cp.arange(6,12).reshape(2,3)
x2 = b[:,:,cp.newaxis,cp.newaxis]

c = cp.arange(12,18).reshape(2,3)
x3 = c[:,:,cp.newaxis,cp.newaxis]

d = cp.arange(18,24).reshape(2,3)
y1 = d[:,:,cp.newaxis,cp.newaxis]

e = cp.arange(24,30).reshape(2,3)
y2 = e[:,:,cp.newaxis,cp.newaxis]

f = cp.arange(30,36).reshape(2,3)
y3 = f[:,:,cp.newaxis,cp.newaxis]

g = cp.arange(36,42).reshape(2,3)
z1 = g[:,:,cp.newaxis,cp.newaxis]

h = cp.arange(42,48).reshape(2,3)
z2 = h[:,:,cp.newaxis,cp.newaxis]

i = cp.arange(48,54).reshape(2,3)
z3 = i[:,:,cp.newaxis,cp.newaxis]

x = cp.concatenate([x1,x2,x3],2)
y = cp.concatenate([y1,y2,y3],2)
z = cp.concatenate([z1,z2,z3],2)
d = cp.full((2,3,3),1)
d[:,:,2] = 0
print(d)
print(d.shape)
print(x)
print(x.shape)
print(y)
print(y.shape)
print(z)
print(z.shape)
xyz = cp.concatenate([x,y,z],3)
print(xyz)
print(xyz.shape)
ans = cp.linalg.solve(xyz,d)
print(ans)
print(ans.shape)
print(ans[:,:,0])
"""
#三元連立の確かめ
"""
def get_w_np(x, t):
    w = np.linalg.solve(x,t)
    print(w)
    return w

def get_w_cp(x, t):
    w = cp.linalg.solve(x,t)
    print(w)
    return w

left = cp.array([[[[5, -4, 6],
        [7, -6, 10],
        [4, 9, 7]],
        [[5, -4, 6],
        [7, -6, 10],
        [4, 9, 7]]],
        [[[5, -4, 6],
        [7, -6, 10],
        [4, 9, 7]],
        [[5, -4, 6],
        [7, -6, 10],
        [4, 9, 7]]]
])
print(left.shape)
right = cp.array([[[8, 14, 74],[8, 14, 74]],[[8, 14, 74],[8, 14, 74]]])
print(right.shape)
w = get_w_cp(left,right)
print(w.shape)
"""

#w = get_w_np(cp.asnumpy(left),cp.asnumpy(right))
#三角形の長さから角度を求める
"""
a = 4
b = 2
c = 3

s = (a+b+c)/2
S = np.sqrt(s*(s - a)*(s - b)*(s - c))
ah = (2*S)/a
B = np.arcsin(ah/c)
C = np.arcsin(ah/b)
print("B and C")
print(B,C,np.rad2deg(B),np.rad2deg(C))
bh = (2*S)/b
A = np.arcsin(bh/c)
C = np.arcsin(bh/a)
print("A and C")
print(A,C,np.rad2deg(A),np.rad2deg(C))
ch = (2*S)/c
A = np.arcsin(ch/b)
B = np.arcsin(ch/a)
print("A and B")
print(A,B,np.rad2deg(A),np.rad2deg(B))
cosC = (a**2 + b**2 - c**2) / (2*a*b)
C = np.arccos(cosC)
cosB = (a**2 - b**2 + c**2) / (2*a*c)
B = np.arccos(cosB)
cosA = (-a**2 + b**2 + c**2) / (2*c*b)
A = np.arccos(cosA)
print(A,B,C)
print(A+B+C)
print(np.rad2deg(A),np.rad2deg(B),np.rad2deg(C))
"""