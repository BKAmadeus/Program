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
import re
import datetime
import random

fig, ax = plt.subplots(3)
tempURL = "http://sens-a.local/"

def sensor(URL):
    try:
        temp = requests.get(tempURL)
        sens = temp.text.split(',')
    except:
        sens = sensor(URL)
    return sens
        
a = sensor(tempURL)
Sensor = np.array(a)
print(a)

count = 0
Count = np.array(count)
while True:
    count = count + 1
    #Count = np.append(Count,count)
    a = np.array(sensor(tempURL),dtype=np.int64)
    #Sensor = np.block([[Sensor],[a]])
    ax[0].scatter(count,a[0],color = 'blue')
    ax[1].scatter(count,a[1],color = 'red')
    ax[2].scatter(count,a[2],color = 'green')
    ax[0].set_title('temp')
    ax[1].set_title('co2ppm')
    ax[2].set_title('photo')
    plt.tight_layout() # ラベル・タイトルが被らないように配置
    plt.pause(60)
    fig.savefig("test.png")