import pandas as pd
import matplotlib.pyplot as plt
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
import urllib.request 
import cv2
import keyboard
import requests

def face(image):
    cascPath = "haarcascade_frontalface_alt.xml"
    cascade = cv2.CascadeClassifier(cascPath)
    image_gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    facerect = cascade.detectMultiScale(image_gray, scaleFactor=1.1, minNeighbors=1, minSize=(1, 1))
    return facerect


# URLと保存パスを指定
url = "http://192.168.0.8/capture"
sensURL = "http://sens-a.local/"
r = requests.get(sensURL)
temp = r.text[7:11]
fig,ax = plt.subplots()
test = np.array(Image.open(io.BytesIO(requests.get(url).content)))
print(test.shape)
lines = ax.imshow(test)
count = 0
# ダウンロード --- (※1)
while True:
    Img = Image.open(io.BytesIO(requests.get(url).content))
    test = np.array(Img)
    facerect = face(test)
    print(facerect)
    print(len(facerect))
    lines.set_data(test)
    if (float(temp) < 30) and (len(facerect) == 1):
        count = count + 1
        savename = 'folder/' + str(count) + '.jpg'
        Img.save(savename,quality=95)
    r = requests.get(sensURL)
    temp = r.text[7:11]
    plt.pause(0.001)
    
