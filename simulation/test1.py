# 乱数のシードを固定
import os
import random
import numpy as np
import torch
import glob
from PIL import Image
from io import BytesIO
import torch
# ディープラーニングモデル
import torch.nn as nn
import torch.nn.functional as F
# MNISTの画像をダウンロードし、DataLoaderにする（TrainとTest）
from torchvision import datasets, transforms

import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d.axes3d import *
from mpl_toolkits.mplot3d import Axes3D

# データにノイズを加える関数の定義
import torchvision as tv
import torchvision.transforms.functional as TF

from torch.utils.data import TensorDataset, DataLoader

def perturb_imagedata(x):
    y = x.clone()
    batch_size = x.size(0)
    
    # ランダムなアフィン変換を実施
    trans = tv.transforms.RandomAffine(15, (0.2, 0.2,), (0.2, 0.75,))
    print(trans)
    for i in range(batch_size):
        y[i, 0] = TF.to_tensor(trans(TF.to_pil_image(y[i, 0])))
    # ノイズを加える
    noise = torch.randn(batch_size, 1, x.size(2), x.size(3))
    div = torch.randint(20, 30, (batch_size,),
                        dtype=torch.float32).view(batch_size, 1, 1, 1)
    y += noise / div

    return y

def random_affine(img, min_rot=None, max_rot=None, min_shear=None,
                  max_shear=None, min_scale=None, max_scale=None):
  # Takes and returns torch cuda tensors with channels 1st (1 img)
  # rot and shear params are in degrees
  # tf matrices need to be float32, returned as tensors
  # we don't do translations

  # https://github.com/pytorch/pytorch/issues/12362
  # https://stackoverflow.com/questions/42489310/matrix-inversion-3-3-python
  # -hard-coded-vs-numpy-linalg-inv

  # https://github.com/pytorch/vision/blob/master/torchvision/transforms
  # /functional.py#L623
  # RSS(a, scale, shear) = [cos(a) *scale   - sin(a + shear) * scale     0]
  #                        [ sin(a)*scale    cos(a + shear)*scale     0]
  #                        [     0                  0          1]
  # used by opencv functional _get_affine_matrix and
  # skimage.transform.AffineTransform

  assert (len(img.shape) == 3)
  a = np.radians(np.random.rand() * (max_rot - min_rot) + min_rot)
  shear = np.radians(np.random.rand() * (max_shear - min_shear) + min_shear)
  scale = np.random.rand() * (max_scale - min_scale) + min_scale

  affine1_to_2 = np.array([[np.cos(a) * scale, - np.sin(a + shear) * scale, 0.],
                           [np.sin(a) * scale, np.cos(a + shear) * scale, 0.],
                           [0., 0., 1.]], dtype=np.float32)  # 3x3

  affine2_to_1 = np.linalg.inv(affine1_to_2).astype(np.float32)

  affine1_to_2, affine2_to_1 = affine1_to_2[:2, :], affine2_to_1[:2, :]  # 2x3
  affine1_to_2, affine2_to_1 = torch.from_numpy(affine1_to_2).cuda(), \
                               torch.from_numpy(affine2_to_1).cuda()

  img = perform_affine_tf(img.unsqueeze(dim=0), affine1_to_2.unsqueeze(dim=0))
  img = img.squeeze(dim=0)

  return img, affine1_to_2, affine2_to_1

f = "test2.jpg"
"""
trans=transforms.Compose([transforms.RandomPerspective(distortion_scale=0.5, p=0.5, interpolation=3), transforms.ToTensor()])
files = glob.glob('./folder/*')
chack_img = torch.zeros(3,256,256)
for file in files:
    F = glob.glob(file+"/*")
    DATA = torch.zeros(len(F),3,256,256)
    print(file,len(F))
    count = 0
    for f in F:
        img = trans(Image.open(f))
        plt.imshow(img.permute(1, 2, 0))
        plt.show()
        if chack_img.shape == img:
            DATA[count,:,:,:] = img
            count = count + 1
    ds = TensorDataset(DATA)
    train_loader = DataLoader(ds,batch_size=10,shuffle=False)
    #for itr, X in enumerate(train_loader):
"""
device = 'cuda' if torch.cuda.is_available() else 'cpu'
print(device)
a = 8
x1_outs = torch.randn(1,1,16,16).to(device)
x2_outs, affine1_to_2, affine2_to_1 = random_affine(x1_outs,**affine_kwargs)
tf = torch.randn(1,2,3).to(device)
print(x1_outs)
grid = F.affine_grid(affine1_to_2, x1_outs.shape)
data_tf = F.grid_sample(x1_outs, grid, padding_mode="zeros")  # this can ONLY do bilinear
print(x1_outs)
n_i, k, h, w = x1_outs.shape
n_i2, r, c = tf.shape
print(n_i,k,h,w)
print(n_i2, r, c)

#p_i_j = F.conv2d(x1_outs, weight=x2_outs_inv,stride=a,padding=1)
#print(p_i_j.shape)