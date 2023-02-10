const mssql  = require('mssql');
const Exclusion_db = ['master','tempdb','model','msdb']

const MSSQL = async function(Data) {
    var config = {
      user: 'KV',
      password: 'nichicon',
      server: 'NNAGANODB01', // You can use 'localhost\\instance' to connect to named instance
      database: Data.database,
      options: {
        encrypt: false, // Use this if you're on Windows Azure
      }
    }
    await mssql.connect(config);
    const result = await mssql.query(Data.SQL);
    mssql.close()
    return result.recordset
    //result = await mssql.query`select TOP 1000 * from AG_33LINE`
}

exports.SQLServerTables = async function(){
    data = {}
    ans= []
    data["SQL"] = "SELECT name FROM sys.databases";
    data["database"] = "";
    databases = await MSSQL(data);
    data["SQL"] = "SELECT name FROM sys.objects where type = 'U'";
    for(i in databases){
        if(!Exclusion_db.includes(databases[i].name)){
            ANS = {}
            ANS["DB"] = databases[i].name
            data["database"] = databases[i].name
            ANS["tables"] = (await MSSQL(data)).map(data=>data.name);
            ans.push(ANS);
        }
    }
    return ans
}