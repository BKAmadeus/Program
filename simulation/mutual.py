import numpy as np
from sklearn.metrics.cluster import adjusted_mutual_info_score


def mutual_information(X, Y, bins=10):
    # 同時確率分布p(x,y)の計算
    p_xy, xedges, yedges = np.histogram2d(X, Y, bins=bins, density=True)
    print("test")
    print(p_xy.shape)
    # p(x)p(y)の計算
    p_x, _ = np.histogram(X, bins=xedges, density=True)
    p_y, _ = np.histogram(Y, bins=yedges, density=True)
    p_x_y = p_x[:, np.newaxis] * p_y
    print(p_x.shape)
    print(p_y.shape)
    print(p_x_y.shape)
    print("test")
    # dx と dy
    dx = xedges[1] - xedges[0]
    dy = yedges[1] - yedges[0]
    # 積分の要素
    elem = p_xy * np.ma.log(p_xy / p_x_y)
    # 相互情報量とp(x, y), p(x)p(y)を出力
    return np.sum(elem * dx * dy), p_xy, p_x_y

N = 1000
X = np.random.normal(loc=0, scale=1, size=N)

p_x, edges = np.histogram(X, bins=10, density=True)

# 何も考えずに確率密度の和を取った場合，当然1にはならない
print(np.sum(p_x))  # 出力例: 1.580769264599771
r = np.random.randn(100,3)
print("test")
print(r.shape)
# ビン幅を考慮して和を取ると1になる
dx = edges[1] - edges[0]
print(np.sum(p_x * dx))  # 出力例: 1.0000000000000002

import matplotlib.pyplot as plt

# sin波とcos波
t = np.linspace(-5, 5, num=1000)
X = np.sin(2 * np.pi * t)
Y = np.cos(3 * np.pi * t)
"""
arr = np.arange(1000).reshape(10,10,10)
print(arr[1].shape,arr[2].shape)
mi, p_xy, p_x_y = mutual_information(arr[1],arr[2], bins=30)
print(p_xy.shape,p_x_y.shape)
"""
# 相互情報量の計算
print(X.shape,Y.shape)
mi, p_xy, p_x_y = mutual_information(X, Y, bins=30)
a = adjusted_mutual_info_score(X,Y)
b = np.random.randn(1000)
c = np.random.randn(1000)
B = adjusted_mutual_info_score(b,c)
print(B)
print(a)
print(p_xy.shape,p_x_y.shape)

# 結果の出力
plt.figure(dpi=100)
ax1 = plt.subplot(121)
ax2 = plt.subplot(122)
ax1.set_title(r'$P_{XY}(x, y)$')
ax1.imshow(p_xy)
ax2.set_title(r'$P_{X}(x) P_{Y}(y)$')
ax2.imshow(p_x_y)
plt.suptitle('MI = {}'.format(mi))
plt.show()