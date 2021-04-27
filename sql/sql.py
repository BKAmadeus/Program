import sqlite3
from contextlib import closing

dbname = 'database.db'

class sql:
    def __init__(self,dbname):
        self.db = dbname
        self.conn = closing(sqlite3.connect(dbname)):
        self.c = self.conn.cursor()

    def create_table(self, create_status, create_velue):
        createSV = []
        for SV in zip(create_velue,create_status):
            createSV = ' '.join(SV) + ', '
        createSV = ''.join(createSV)
        createSV = createSV[:-2]
        create = 'create table ' + self.db + ' (' + createSV + ')'
        self.c.execute(create)

    def print_sql(self,table,select):
        select = 'select ' + select +' from ' + table
        for row in c.execute(select):
            print(row)
    
    def insert(self, insert_status, insert_velue, insert_method):
        inS = ', '.join(map(str,insert_status))
        insert = 'insert into ' + self.db + '(' + inS + ') values ' + insert_method
        self.c.execute(sql, insert_velue)
