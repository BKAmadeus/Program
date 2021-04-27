from pydrive.auth import GoogleAuth
from pydrive.drive import GoogleDrive
import glob
import os
#認証を行う
gauth = GoogleAuth()
gauth.CommandLineAuth()
print("ok")
drive = GoogleDrive(gauth)

file_list = drive.ListFile().GetList()


print(len(file_list))
# 9

print(type(file_list[0]))
def GoDrive(foldername,WriteFilename,ReadFilename):
    titles = "title = " + '"' + foldername + '"'
    folder_id = drive.ListFile({'q': titles}).GetList()[0]['id']
    #print(folder_id)
    # 画像ファイルをアップロード --- (*2)
    f = drive.CreateFile({
        'parents': [{"id": folder_id}],
        'title': WriteFilename,
        })
    f.SetContentFile(ReadFilename)
    f.Upload()

GoDrive("input","node.xml","./GDtest/node.xml")
GoDrive("input","mapselect.txt","./GDtest/mapselect.txt")
