import MySQLdb    #SQL編　★SQLClientを利用

con = MySQLdb.connect(
user = 'root',				#SQLに接続する
password = 'EnableBK21',			
host = 'localhost',				
database = 'test_db',		
charset = "utf8")		
cursor = con.cursor()
#sql = 'create table test (id int, content varchar(32))'
#cursor.execute(sql)
#sql = "insert into test values(1, '100yen')"
#cursor.execute(sql) # 1つ目のレコードを挿入
datas = [
        (2, 'foo'),
        (3, 'bar')
    ]
data = (2,'hoge')
sql = "insert into test values(%s, %s)"
cursor.execute(sql,data) # 2つ目のレコードを挿入
sql = 'delete from test where id=%s'
cursor.execute(sql, (1,))
cursor.execute(sql, (2,))
cursor.execute(sql, (3,))
con.commit()    # コミットする
cursor.close()
con.close()

"""
lista = ['A', 'B', 'C']
listb = ['int', 'varchar(64)', 'int']
result = zip(lista,listb)
print(result)
test = []
for re in result:
    print(re)
    test.extend(' '.join(re) + ', ')
test = ''.join(test)
print(test[:-2])
user = (1, 'Taro', 20, 'male')
print(', '.join(map(str,user)))
"""