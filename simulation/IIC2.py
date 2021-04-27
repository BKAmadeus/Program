# 乱数のシードを固定
import os
import random
import numpy as np
import torch
import glob
from PIL import Image
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d.axes3d import *
from mpl_toolkits.mplot3d import Axes3D
import itertools
from io import BytesIO
import glob
import torchvision.transforms as tvt
import numpy as np
import torchvision
from torch.utils.data import TensorDataset, DataLoader
import torch.optim as optim
from torchvision import datasets, transforms

# データにノイズを加える関数の定義
import torchvision as tv
import torchvision.transforms.functional as TF

# パッケージのimport
import torch
import torch.nn as nn
import torch.nn.functional as F

jitter_tf = tvt.ColorJitter(brightness=0.4, contrast=0.4, saturation=0.4, hue=0.125)

SEED_VALUE = 1234  # これはなんでも良い
os.environ['PYTHONHASHSEED'] = str(SEED_VALUE)
random.seed(SEED_VALUE)
np.random.seed(SEED_VALUE)
torch.manual_seed(SEED_VALUE)  # PyTorchを使う場合

# GPUが使えるときにはGPUに（Google Colaboratoryの場合はランタイムからGPUを指定）
device = 'cuda' if torch.cuda.is_available() else 'cpu'
print(device)
# GPUを使用。cudaと出力されるのを確認する。

# IISによる損失関数の定義
# 参考：https://github.com/RuABraun/phone-clustering/blob/master/mnist_basic.py
import sys

import torch.nn.init as init


def weight_init(m):
    """重み初期化"""
    if isinstance(m, nn.Conv2d):
        init.xavier_normal_(m.weight.data)
        if m.bias is not None:
            init.normal_(m.bias.data)
    elif isinstance(m, nn.BatchNorm2d):
        init.normal_(m.weight.data, mean=1, std=0.02)
        init.constant_(m.bias.data, 0)
    elif isinstance(m, nn.Linear):
        # Xavier
        #init.xavier_normal_(m.weight.data)

        # He 
        init.kaiming_normal_(m.weight.data)
        
        if m.bias is not None:
            init.normal_(m.bias.data)

def random_affine(img, min_rot=-30., max_rot=30., min_shear=-10.,
                  max_shear=10., min_scale=0.8, max_scale=1.2):

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

    return img, affine2_to_1

def perform_affine_tf(data, tf_matrices):
    # expects 4D tensor, we preserve gradients if there are any

    n_i, k, h, w = data.shape
    n_i2, r, c = tf_matrices.shape
    assert (n_i == n_i2)
    assert (r == 2 and c == 3)

    grid = F.affine_grid(tf_matrices, data.shape)  # output should be same size
    data = data.to(device)
    data_tf = F.grid_sample(data, grid,
                            padding_mode="zeros")  # this can ONLY do bilinear

    return data_tf

def IID_segmentation_loss(x1_outs, x2_outs_inv, EPS=sys.float_info.epsilon):
    #x1_outs = x1_outs.permute(1, 0, 2, 3).contiguous().to(device)
    #x2_outs_inv = x2_outs_inv.permute(1, 0, 2, 3).contiguous().to(device)
    #x1_outs = x1_outs.permute(1, 0, 2, 3).contiguous()
    #x2_outs_inv = x2_outs_inv.permute(1, 0, 2, 3).contiguous()
    #x2_outs_inv = perform_affine_tf(x2_outs, all_affine2_to_1)
    #bn, k, h, w = x1_outs.shape

    x1_outs = x1_outs.permute(1, 0, 2, 3).contiguous()  # k, ni, h, w
    x2_outs_inv = x2_outs_inv.permute(1, 0, 2, 3).contiguous()  # k, ni, h, w
    
    p_i_j = F.conv2d(x1_outs, weight=x2_outs_inv,padding=(0,0))
    p_i_j = p_i_j.sum(dim=2, keepdim=False).sum(dim=2, keepdim=False)
    current_norm = float(p_i_j.sum())
    p_i_j = p_i_j / current_norm

    # symmetrise
    p_i_j = (p_i_j + p_i_j.t()) / 2.

    # compute marginals
    p_i_mat = p_i_j.sum(dim=1).unsqueeze(1)  # k, 1
    p_j_mat = p_i_j.sum(dim=0).unsqueeze(0)  # 1, k

    # for log stability; tiny values cancelled out by mult with p_i_j anyway
    p_i_j[(p_i_j < EPS).data] = EPS
    p_i_mat[(p_i_mat < EPS).data] = EPS
    p_j_mat[(p_j_mat < EPS).data] = EPS

    alpha = 1.0

    #loss = -1*(p_i_j * (torch.log(p_i_j) - alpha *
    #                    torch.log(p_j) - alpha*torch.log(p_i))).sum()
    # maximise information
    loss = (-p_i_j * (torch.log(p_i_j) - alpha * torch.log(p_i_mat) -
                      alpha * torch.log(p_j_mat))).sum()
    return loss

"""
class NetIIC(nn.Module):
    def __init__(self,input_num,output_num):
        super(NetIIC, self).__init__()

        self.conv1 = nn.Conv2d(input_num, 12, 2, 1, bias=False)
        self.bn1 = nn.BatchNorm2d(12)
        self.conv1_ = nn.Conv2d(12, 12, 2, 1, bias=False)
        self.bn1_ = nn.BatchNorm2d(12)
        self.conv2 = nn.Conv2d(12, 24, 2, 1, bias=False)
        self.bn2 = nn.BatchNorm2d(24)
        self.conv2_ = nn.Conv2d(24, 24, 2, 1, bias=False)
        self.bn2_ = nn.BatchNorm2d(24)
        self.conv3 = nn.Conv2d(24, 32, 2, 1, bias=False)
        self.bn3 = nn.BatchNorm2d(32)
        self.conv3_ = nn.Conv2d(32, 32, 2, 1, bias=False)
        self.bn3_ = nn.BatchNorm2d(32)
        self.conv4 = nn.Conv2d(32, 64, 2, 1, bias=False)
        self.bn4 = nn.BatchNorm2d(64)
        self.conv4_ = nn.Conv2d(64, 128, 2, 1, bias=False)
        self.bn4_ = nn.BatchNorm2d(128)
        self.conv5 = nn.Conv2d(128, 128, 2, 1, bias=False)
        self.bn5 = nn.BatchNorm2d(128)
        self.conv5_ = nn.Conv2d(128, 256, 2, 1, bias=False)
        self.bn5_ = nn.BatchNorm2d(256)
        self.conv6 = nn.Conv2d(256, 256, 2, 1, bias=False)
        self.bn6 = nn.BatchNorm2d(256)
        self.conv6_ = nn.Conv2d(256, 256, 2, 1, bias=False)
        self.bn6_ = nn.BatchNorm2d(256)
        self.conv7 = nn.Conv2d(256, 256, 2, 1, bias=False)
        self.bn7 = nn.BatchNorm2d(256)
        self.conv7_ = nn.Conv2d(256, 512, 2, 1, bias=False)
        self.bn7_ = nn.BatchNorm2d(512)
        self.conv8 = nn.Conv2d(512, 256, 2, 1, bias=False)
        self.bn8 = nn.BatchNorm2d(256)
        self.conv8_ = nn.Conv2d(256, 512, 2, 1, bias=False)
        self.bn8_ = nn.BatchNorm2d(512)

        self.pool1 = nn.MaxPool2d(2, stride=2, return_indices=True)
        self.pool2 = nn.MaxPool2d(2, stride=2, return_indices=True)
        self.pool3 = nn.MaxPool2d(2, stride=2, return_indices=True)
        self.pool4 = nn.MaxPool2d(2, stride=2, return_indices=True)


        self.unconv1 = nn.ConvTranspose2d(512, 256, 2, 1, bias=False)
        self.unbn1 = nn.BatchNorm2d(256)
        self.unconv1_ = nn.ConvTranspose2d(256, 512, 2, 1, bias=False)
        self.unbn1_ = nn.BatchNorm2d(512)
        self.unconv2 = nn.ConvTranspose2d(512, 256, 2, 1, bias=False)
        self.unbn2 = nn.BatchNorm2d(256)
        self.unconv2_ = nn.ConvTranspose2d(256, 256, 2, 1, bias=False)
        self.unbn2_ = nn.BatchNorm2d(256)
        self.unconv3 = nn.ConvTranspose2d(256, 256, 2, 1, bias=False)
        self.unbn3 = nn.BatchNorm2d(256)
        self.unconv3_ = nn.ConvTranspose2d(256, 128, 2, 1, bias=False)
        self.unbn3_ = nn.BatchNorm2d(128)
        self.unconv4 = nn.ConvTranspose2d(128, 128, 2, 1, bias=False)
        self.unbn4 = nn.BatchNorm2d(128)
        self.unconv4_ = nn.ConvTranspose2d(128, 128, 3, 1, bias=False)
        self.unbn4_ = nn.BatchNorm2d(128)

        self.unconv5 = nn.ConvTranspose2d(128, 32, 2, 1, bias=False)
        self.unbn5 = nn.BatchNorm2d(32)
        self.unconv5_ = nn.ConvTranspose2d(32, 32, 2, 1, bias=False)
        self.unbn5_ = nn.BatchNorm2d(32)
        self.unconv6 = nn.ConvTranspose2d(32, 32, 2, 1, bias=False)
        self.unbn6 = nn.BatchNorm2d(32)
        self.unconv6_ = nn.ConvTranspose2d(32, 24, 2, 1, bias=False)
        self.unbn6_ = nn.BatchNorm2d(24)
        self.unconv7 = nn.ConvTranspose2d(24, 24, 2, 1, bias=False)
        self.unbn7 = nn.BatchNorm2d(24)
        self.unconv7_ = nn.ConvTranspose2d(24, 12, 2, 1, bias=False)
        self.unbn7_ = nn.BatchNorm2d(12)
        self.unconv8 = nn.ConvTranspose2d(12, 12, 2, 1, bias=False)
        self.unbn8 = nn.BatchNorm2d(12)
        self.unconv8_ = nn.ConvTranspose2d(12, output_num, 2, 1, bias=False)
        self.unbn8_ = nn.BatchNorm2d(output_num)


        self.unpool1 = nn.MaxUnpool2d(2,stride=2)
        self.unpool2 = nn.MaxUnpool2d(2,stride=2)
        self.unpool3 = nn.MaxUnpool2d(2,stride=2)
        self.unpool4 = nn.MaxUnpool2d(2,stride=2)

        self.softmax = nn.Softmax2d()


        # 0-9に対応すると期待したい10種類のクラス

    def forward(self, x):
        x = F.relu(self.bn1(self.conv1(x)))
        x = F.relu(self.bn1_(self.conv1_(x)))
        x = F.relu(self.bn2(self.conv2(x)))
        x = F.relu(self.bn2_(self.conv2_(x)))
        x, indices1 = self.pool1(x)
        x = F.relu(self.bn3(self.conv3(x)))
        x = F.relu(self.bn3_(self.conv3_(x)))
        x = F.relu(self.bn4(self.conv4(x)))
        x = F.relu(self.bn4_(self.conv4_(x)))
        x, indices2 = self.pool2(x)
        x = F.relu(self.bn5(self.conv5(x)))
        x = F.relu(self.bn5_(self.conv5_(x)))
        x = F.relu(self.bn6(self.conv6(x)))
        x = F.relu(self.bn6_(self.conv6_(x)))
        x, indices3 = self.pool3(x)
        x = F.relu(self.bn7(self.conv7(x)))
        x = F.relu(self.bn7_(self.conv7_(x)))
        x = F.relu(self.bn8(self.conv8(x)))
        x = F.relu(self.bn8_(self.conv8_(x)))
        x, indices4 = self.pool4(x)


        x = self.unpool4(x, indices4)
        x = F.relu(self.unbn1(self.unconv1(x)))
        x = F.relu(self.unbn1_(self.unconv1_(x)))
        x = F.relu(self.unbn2(self.unconv2(x)))
        x = F.relu(self.unbn2_(self.unconv2_(x)))
        x = self.unpool3(x, indices3)
        x = F.relu(self.unbn3(self.unconv3(x)))
        x = F.relu(self.unbn3_(self.unconv3_(x)))
        x = F.relu(self.unbn4(self.unconv4(x)))
        x = F.relu(self.unbn4_(self.unconv4_(x)))
        x = self.unpool2(x, indices2)
        x = F.relu(self.unbn5(self.unconv5(x)))
        x = F.relu(self.unbn5_(self.unconv5_(x)))
        x = F.relu(self.unbn6(self.unconv6(x)))
        x = F.relu(self.unbn6_(self.unconv6_(x)))
        x = self.unpool1(x, indices1)
        x = F.relu(self.unbn7(self.unconv7(x)))
        x = F.relu(self.unbn7_(self.unconv7_(x)))
        x = F.relu(self.unbn8(self.unconv8(x)))
        x = F.relu(self.unbn8_(self.unconv8_(x)))
        
        x = self.softmax(x)
        
        return x
"""
class PSPNet(nn.Module):
    def __init__(self, n_classes):
        super(PSPNet, self).__init__()

        # パラメータ設定
        block_config = [3, 4, 6, 3]  # resnet50
        img_size = 256
        img_size_8 = 32  # img_sizeの1/8に

        # 4つのモジュールを構成するサブネットワークの用意
        self.feature_conv = FeatureMap_convolution()
        self.feature_res_1 = ResidualBlockPSP(
            n_blocks=block_config[0], in_channels=128, mid_channels=64, out_channels=256, stride=1, dilation=1)
        self.feature_res_2 = ResidualBlockPSP(
            n_blocks=block_config[1], in_channels=256, mid_channels=128, out_channels=512, stride=2, dilation=1)
        self.feature_dilated_res_1 = ResidualBlockPSP(
            n_blocks=block_config[2], in_channels=512, mid_channels=256, out_channels=1024, stride=1, dilation=2)
        self.feature_dilated_res_2 = ResidualBlockPSP(
            n_blocks=block_config[3], in_channels=1024, mid_channels=512, out_channels=2048, stride=1, dilation=4)

        self.pyramid_pooling = PyramidPooling(in_channels=2048, pool_sizes=[
            6, 3, 2, 1], height=img_size_8, width=img_size_8)

        self.decode_feature = DecodePSPFeature(
            height=img_size, width=img_size, n_classes=n_classes)

        self.aux = AuxiliaryPSPlayers(
            in_channels=1024, height=img_size, width=img_size, n_classes=n_classes)

    def forward(self, x):
        x = self.feature_conv(x)
        x = self.feature_res_1(x)
        x = self.feature_res_2(x)
        x = self.feature_dilated_res_1(x)

        x = self.feature_dilated_res_2(x)

        x = self.pyramid_pooling(x)
        output = self.decode_feature(x)

        return output

class conv2DBatchNormRelu(nn.Module):
    def __init__(self, in_channels, out_channels, kernel_size, stride, padding, dilation, bias):
        super(conv2DBatchNormRelu, self).__init__()
        self.conv = nn.Conv2d(in_channels, out_channels,
                              kernel_size, stride, padding, dilation, bias=bias)
        self.batchnorm = nn.BatchNorm2d(out_channels)
        self.relu = nn.ReLU(inplace=True)
        # inplase設定で入力を保存せずに出力を計算し、メモリ削減する

    def forward(self, x):
        x = self.conv(x)
        x = self.batchnorm(x)
        outputs = self.relu(x)

        return outputs
    
class FeatureMap_convolution(nn.Module):
    def __init__(self):
        '''構成するネットワークを用意'''
        super(FeatureMap_convolution, self).__init__()

        # 畳み込み層1
        in_channels, out_channels, kernel_size, stride, padding, dilation, bias = 3, 64, 3, 2, 1, 1, False
        self.cbnr_1 = conv2DBatchNormRelu(
            in_channels, out_channels, kernel_size, stride, padding, dilation, bias)

        # 畳み込み層2
        in_channels, out_channels, kernel_size, stride, padding, dilation, bias = 64, 64, 3, 1, 1, 1, False
        self.cbnr_2 = conv2DBatchNormRelu(
            in_channels, out_channels, kernel_size, stride, padding, dilation, bias)

        # 畳み込み層3
        in_channels, out_channels, kernel_size, stride, padding, dilation, bias = 64, 128, 3, 1, 1, 1, False
        self.cbnr_3 = conv2DBatchNormRelu(
            in_channels, out_channels, kernel_size, stride, padding, dilation, bias)

        # MaxPooling層
        self.maxpool = nn.MaxPool2d(kernel_size=3, stride=2, padding=1)

    def forward(self, x):
        x = self.cbnr_1(x)
        x = self.cbnr_2(x)
        x = self.cbnr_3(x)
        outputs = self.maxpool(x)
        return outputs

class ResidualBlockPSP(nn.Sequential):
    def __init__(self, n_blocks, in_channels, mid_channels, out_channels, stride, dilation):
        super(ResidualBlockPSP, self).__init__()

        # bottleNeckPSPの用意
        self.add_module(
            "block1",
            bottleNeckPSP(in_channels, mid_channels,
                          out_channels, stride, dilation)
        )

        # bottleNeckIdentifyPSPの繰り返しの用意
        for i in range(n_blocks - 1):
            self.add_module(
                "block" + str(i+2),
                bottleNeckIdentifyPSP(
                    out_channels, mid_channels, stride, dilation)
            )

class conv2DBatchNorm(nn.Module):
    def __init__(self, in_channels, out_channels, kernel_size, stride, padding, dilation, bias):
        super(conv2DBatchNorm, self).__init__()
        self.conv = nn.Conv2d(in_channels, out_channels,
                              kernel_size, stride, padding, dilation, bias=bias)
        self.batchnorm = nn.BatchNorm2d(out_channels)

    def forward(self, x):
        x = self.conv(x)
        outputs = self.batchnorm(x)

        return outputs

class bottleNeckPSP(nn.Module):
    def __init__(self, in_channels, mid_channels, out_channels, stride, dilation):
        super(bottleNeckPSP, self).__init__()

        self.cbr_1 = conv2DBatchNormRelu(
            in_channels, mid_channels, kernel_size=1, stride=1, padding=0, dilation=1, bias=False)
        self.cbr_2 = conv2DBatchNormRelu(
            mid_channels, mid_channels, kernel_size=3, stride=stride, padding=dilation, dilation=dilation, bias=False)
        self.cb_3 = conv2DBatchNorm(
            mid_channels, out_channels, kernel_size=1, stride=1, padding=0, dilation=1, bias=False)

        # スキップ結合
        self.cb_residual = conv2DBatchNorm(
            in_channels, out_channels, kernel_size=1, stride=stride, padding=0, dilation=1, bias=False)

        self.relu = nn.ReLU(inplace=True)

    def forward(self, x):
        conv = self.cb_3(self.cbr_2(self.cbr_1(x)))
        residual = self.cb_residual(x)
        return self.relu(conv + residual)

class bottleNeckIdentifyPSP(nn.Module):
    def __init__(self, in_channels, mid_channels, stride, dilation):
        super(bottleNeckIdentifyPSP, self).__init__()

        self.cbr_1 = conv2DBatchNormRelu(
            in_channels, mid_channels, kernel_size=1, stride=1, padding=0, dilation=1, bias=False)
        self.cbr_2 = conv2DBatchNormRelu(
            mid_channels, mid_channels, kernel_size=3, stride=1, padding=dilation, dilation=dilation, bias=False)
        self.cb_3 = conv2DBatchNorm(
            mid_channels, in_channels, kernel_size=1, stride=1, padding=0, dilation=1, bias=False)
        self.relu = nn.ReLU(inplace=True)

    def forward(self, x):
        conv = self.cb_3(self.cbr_2(self.cbr_1(x)))
        residual = x
        return self.relu(conv + residual)

class PyramidPooling(nn.Module):
    def __init__(self, in_channels, pool_sizes, height, width):
        super(PyramidPooling, self).__init__()

        # forwardで使用する画像サイズ
        self.height = height
        self.width = width

        # 各畳み込み層の出力チャネル数
        out_channels = int(in_channels / len(pool_sizes))

        # 各畳み込み層を作成
        # この実装方法は愚直すぎてfor文で書きたいところですが、分かりやすさを優先しています
        # pool_sizes: [6, 3, 2, 1]
        self.avpool_1 = nn.AdaptiveAvgPool2d(output_size=pool_sizes[0])
        self.cbr_1 = conv2DBatchNormRelu(
            in_channels, out_channels, kernel_size=1, stride=1, padding=0, dilation=1, bias=False)

        self.avpool_2 = nn.AdaptiveAvgPool2d(output_size=pool_sizes[1])
        self.cbr_2 = conv2DBatchNormRelu(
            in_channels, out_channels, kernel_size=1, stride=1, padding=0, dilation=1, bias=False)

        self.avpool_3 = nn.AdaptiveAvgPool2d(output_size=pool_sizes[2])
        self.cbr_3 = conv2DBatchNormRelu(
            in_channels, out_channels, kernel_size=1, stride=1, padding=0, dilation=1, bias=False)

        self.avpool_4 = nn.AdaptiveAvgPool2d(output_size=pool_sizes[3])
        self.cbr_4 = conv2DBatchNormRelu(
            in_channels, out_channels, kernel_size=1, stride=1, padding=0, dilation=1, bias=False)

    def forward(self, x):

        out1 = self.cbr_1(self.avpool_1(x))
        out1 = F.interpolate(out1, size=(
            self.height, self.width), mode="bilinear", align_corners=True)

        out2 = self.cbr_2(self.avpool_2(x))
        out2 = F.interpolate(out2, size=(
            self.height, self.width), mode="bilinear", align_corners=True)

        out3 = self.cbr_3(self.avpool_3(x))
        out3 = F.interpolate(out3, size=(
            self.height, self.width), mode="bilinear", align_corners=True)

        out4 = self.cbr_4(self.avpool_4(x))
        out4 = F.interpolate(out4, size=(
            self.height, self.width), mode="bilinear", align_corners=True)

        # 最終的に結合させる、dim=1でチャネル数の次元で結合
        output = torch.cat([x, out1, out2, out3, out4], dim=1)

        return output

class DecodePSPFeature(nn.Module):
    def __init__(self, height, width, n_classes):
        super(DecodePSPFeature, self).__init__()

        # forwardで使用する画像サイズ
        self.height = height
        self.width = width

        self.cbr = conv2DBatchNormRelu(
            in_channels=4096, out_channels=512, kernel_size=3, stride=1, padding=1, dilation=1, bias=False)
        self.dropout = nn.Dropout2d(p=0.1)
        self.classification = nn.Conv2d(
            in_channels=512, out_channels=n_classes, kernel_size=1, stride=1, padding=0)

    def forward(self, x):
        x = self.cbr(x)
        x = self.dropout(x)
        x = self.classification(x)
        output = F.interpolate(
            x, size=(self.height, self.width), mode="bilinear", align_corners=True)

        return output

class AuxiliaryPSPlayers(nn.Module):
    def __init__(self, in_channels, height, width, n_classes):
        super(AuxiliaryPSPlayers, self).__init__()

        # forwardで使用する画像サイズ
        self.height = height
        self.width = width

        self.cbr = conv2DBatchNormRelu(
            in_channels=in_channels, out_channels=256, kernel_size=3, stride=1, padding=1, dilation=1, bias=False)
        self.dropout = nn.Dropout2d(p=0.1)
        self.classification = nn.Conv2d(
            in_channels=256, out_channels=n_classes, kernel_size=1, stride=1, padding=0)

    def forward(self, x):
        x = self.cbr(x)
        x = self.dropout(x)
        x = self.classification(x)
        output = F.interpolate(
            x, size=(self.height, self.width), mode="bilinear", align_corners=True)

        return output


# モデルの定義

files = glob.glob('./folder/*')
# 画像ファイルパスから読み込み

# 訓練の実施
total_patch = 3
total_epoch = 100
# モデル
model = PSPNet(n_classes=10)
#print(model.state_dict().keys())
#print(model.state_dict()['feature_conv.cbnr_1.conv.weight'])
#model = NetIIC(3,10)
#model.apply(weight_init)
#model.load_state_dict(torch.load('model.pth',map_location='cpu'))
model.to(device)
model.load_state_dict(torch.load('Amodel.pth',map_location=device))
trans=transforms.Compose([transforms.RandomPerspective(distortion_scale=0.5, p=0.5, interpolation=3), transforms.ToTensor()])

# 最適化関数を設定
optimizer = optim.SGD([
    {'params': model.feature_conv.parameters(), 'lr': 1e-3},
    {'params': model.feature_res_1.parameters(), 'lr': 1e-3},
    {'params': model.feature_res_2.parameters(), 'lr': 1e-3},
    {'params': model.feature_dilated_res_1.parameters(), 'lr': 1e-3},
    {'params': model.feature_dilated_res_2.parameters(), 'lr': 1e-3},
    {'params': model.pyramid_pooling.parameters(), 'lr': 1e-3},
    {'params': model.decode_feature.parameters(), 'lr': 1e-2},
    {'params': model.aux.parameters(), 'lr': 1e-2},
], momentum=0.9, weight_decay=0.0001)
#train_loader
def train(total_patch,total_epoch, model, optimizer, device, file):
    chack_img = np.zeros((256,256,3))
    count = torch.tensor(0)
    model.train()
    scheduler = torch.optim.lr_scheduler.CosineAnnealingWarmRestarts(
        optimizer, T_0=2, T_mult=2)
    for file in files:
        F = glob.glob(file+"/*")
        DATA = torch.zeros(len(F),3,256,256)
        DATA_tf = torch.zeros(len(F),3,256,256)
        print(file,len(F))
        for f in F:
            img = Image.open(f)
            if np.array(img).shape == chack_img.shape:
                img_p = jitter_tf(img)
                img_array = torchvision.transforms.functional.to_tensor(img)
                img_array_p = trans(img_p)
                DATA[count,:,:,:] = img_array
                DATA_tf[count,:,:,:] = img_array_p
                count = count + 1
        ds = TensorDataset(DATA , DATA_tf)
        loader = DataLoader(ds, batch_size=total_patch, shuffle=True)
        for epoch in range(total_epoch):
            scheduler.step()
            optimizer.zero_grad()
            for itr, (X,X_p) in enumerate(loader):
                out = X.to(device)
                out_p = X_p.to(device)
                out = model(out)
                arg = torch.argmax(out, dim=1)
                print(arg[0,:,:].shape)
                for i in range(3):
                    plt.imshow(X[i,:,:,:].permute(1, 2, 0))
                    plt.show()
                    print(arg[i,:,:])
                    plt.imshow(arg[i,:,:].permute(0,1).to('cpu'))
                    plt.show()
                out_p = model(out_p)
                loss = IID_segmentation_loss(out,out_p)
                loss.backward()
                #loss = torch.tensor(loss, requires_grad = True)
                # 損失を減らすように更新
                if (itr+1) % 25 == 0:
                    print("epoch : ",epoch,"chack :",itr*total_patch,"   loss : ",loss)
                    optimizer.step()# 学習率変化
                    optimizer.zero_grad()
                    torch.save(model.state_dict(), 'Amodel.pth')
        count = 0
            

    return model, optimizer

#-1278.4463
model_trained, optimizer = train(
    total_patch, total_epoch, model, optimizer, device, files)
