from PIL import Image
import cv2
import matplotlib.pyplot as plt
import numpy as np
"""
im1 = cv2.imread('Practice/do2.png')
im2 = cv2.imread('Practice/do2.png')

im_v = cv2.hconcat([im1, im1])
cv2.imwrite('Practice/do2.png', im_v)
"""
img = Image.open('Practice/do2.png')
img2 = Image.open('Practice/map.jpg')

img_resize = img.resize((img2.width, img2.height))
img_resize.save('Practice/do2.png')

#img_resize_lanczos = img.resize((256, 256), Image.LANCZOS)
#img_resize_lanczos.save('data/dst/lena_pillow_resize_lanczos.jpg')