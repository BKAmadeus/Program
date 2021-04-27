from pydrive.auth import GoogleAuth
from pydrive.drive import GoogleDrive
import glob
import os

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

    # アップロード結果を表示 --- (*3)
    #print(f['title'], f['id'])

def BackDrive(Foldername,Filename):
    titles = "title = " + '"' + Filename + '"'
    file_id = drive.ListFile({'q': titles}).GetList()[0]['id']
    f = drive.CreateFile({'id': file_id})
    f.GetContentFile(Foldername + "/" + Filename)

def DeleteDrive(Filename):
    titles = "title = " + '"' + Filename + '"'
    file_id = drive.ListFile({'q': titles}).GetList()[0]['id']
    f = drive.CreateFile({'id': file_id})
    f.Delete()

def FindDrive(Foldername):
    titles = "title = " + '"' + Foldername + '"'
    folder_id = drive.ListFile({'q': titles}).GetList()[0]['id']
    f = drive.ListFile({'q': '"{}" in parents'.format(folder_id)}).GetList()
    return f

def FolderBackDrive(file_list):
    for f in file_list:
        WriteName = "./" + f['title']
        f.GetContentFile(WriteName)
        f.Delete()

gauth = GoogleAuth()
gauth.CommandLineAuth()
print("ok")
# Google Driveのオブジェクトを得る --- (*1)
drive = GoogleDrive(gauth)
while True:
    try:
        Middle = glob.glob("./Middle/*")
        for M in Middle:
            GoDrive("output",M[9:],M)
            os.remove(M)

        result = glob.glob("./result/*")
        for R in result:
            GoDrive("output",R[9:],R)
            os.remove(R)

        init = FindDrive("input")
        if len(init) != 0:
            delete = FindDrive("output")
            print(len(delete))
            if len(delete) != 0:
                FolderBackDrive(delete)
            FolderBackDrive(init)
        """
        if len(Middle) == 3:
            GoDrive("output","Aggregation.csv","./Middle/Aggregation.csv")
            GoDrive("output","map.csv","./Middle/map.csv")
            GoDrive("output","node.xml","./Middle/node.xml")

            os.remove("./Middle/Aggregation.csv")
            os.remove("./Middle/map.csv")
            os.remove("./Middle/node.xml")
        result = glob.glob("./result/*")
        if len(result) == 2:
            GoDrive("output","result_Aggregation.csv","./result/result_Aggregation.csv")
            GoDrive("output","result_node.xml","./result/result_node.xml")

            os.remove("./result/result_Aggregation.csv")
            os.remove("./result/result_node.xml")
        init = FindDrive("input")
        if len(init) == 2:
            FolderBackDrive(init)
        """
    except:
        gauth = GoogleAuth()
        gauth.CommandLineAuth()
        print("ok")
        # Google Driveのオブジェクトを得る --- (*1)
        drive = GoogleDrive(gauth)

"""
print(Middle)
print(len(Middle))
GoDrive("wireless-sensor-network","test.jpg","test.jpg")
BackDrive("Middle","test.jpg")
input()
DeleteDrive("test.jpg")

f_folder = drive.CreateFile({'title': 'output',
                             'mimeType': 'application/vnd.google-apps.folder'})

f_folder.Upload()

f_folder = drive.CreateFile({'title': 'input',
                             'mimeType': 'application/vnd.google-apps.folder'})

f_folder.Upload()
"""