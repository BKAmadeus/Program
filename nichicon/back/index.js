const express = require("express");
const app = express();
const port = 3001;
var psql = require("./Func/Postgre.js");
var code = require("./Func/codeClass.js");
var Struct = require("./Func/StructChack.js");
var sds = require("./Func/WorkDataSet.js");
var MS = require("./Func/MSSQL.js");
require('date-utils');
var CP = require("./Func/ChangePic.js");

// jsonの受け取り:limitは画像送信用2枚3枚送るようになったら変更する
app.use(express.json({limit: '25mb'}));

// cors対策
app.use((_, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://10.5.1.35:3000");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTION"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.get("/", (_, res) => {
  res.send("server");
});

// postの処理
app.post("/", async function (req, res) {
  try {
    console.log(req.body)
    switch(req.body.flg) {
      case 0:
        res.json(await psql.PostgreSQLquery("SELECT pg_stat_user_tables.relname AS name,pg_description.description AS description FROM pg_stat_user_tables,pg_description WHERE pg_stat_user_tables.relname IN ( SELECT relname AS name FROM pg_stat_user_tables) AND pg_stat_user_tables.relid=pg_description.objoid AND pg_description.objsubid=0 AND pg_stat_user_tables.schemaname=current_schema() ORDER BY name;"));
        //res.json(await psql.PostgreSQLquery("select * from tablelist order by description"));
        break
      case 1:
        var tables = await psql.TableRead(req.body.select)
        var select = req.body.select.map((val)=> val.value)
        res.json(await Struct.StructChack(tables,select));
        break
      case 2:
        rows = await psql.UpdateDataRows(req.body);
        UpdateData = psql.UpdateDataWriteJSON(rows);
        break
      case 3:
        AddData = psql.AddDataWriteJSON(req.body);
        break
      case 4:
        DeleteData = psql.DeleteDataWriteJSON(req.body);
        psql.DeleteDataRows(req.body);
        break
      case 5:
        pr = await code.CodeClassification(req.body);
        res.json(pr);
        break
      case 6:
        pr = await code.ChackData(req.body.flg,req.body.ChackData,req.body.tables,req.body.state);
        res.json(pr);
        break
      case 7:
        pr = await code.ChackData(req.body.flg,req.body.ChackData,req.body.tables);
        res.json(pr);
        break
      case 8:
        code.SabmitData(req.body);
        break
      case 9:
        pr = await CP.PicChange(Buffer.from(req.body.Pic,'base64'),req.body.color,req.body.text_color);
        res.json(pr)
      case 11:
        pr = await MS.SQLServerTables();
        res.json(pr)
      case 'schedule_initData':
        var tablename = await psql.PostgreSQLquery("select tablename from pg_tables where schemaname not in('pg_catalog','information_schema') and tablename like 'equipment%' order by tablename;")
        var select = tablename.map((val)=>{return {value:val.tablename}});
        var tables = await psql.TableRead(select)
        var select = select.map((val)=> val.value)
        res.json({table:await Struct.StructChack(tables,select),schedule:await Struct.StructArrays(req.body.value,select)});
      case 'WorkDataInit':
        res.json(await sds.WorkData());
      case 'WordDataCalculation':
        pr = await code.CodeClassification(req.body);
        res.json(await sds.WorkDataCulculation(pr,req.body))
      case "login":
        pr = await psql.PostgreSQLquery("SELECT * FROM employee_info WHERE code = '"+req.body.user+"' and password = '"+req.body.password+"'");
        if(pr.length === 1){
          ans = pr[0]
          ans["flg"] = true;
          res.json(ans);
        }
        else{
          res.json({flg:false});
        }
    }
  } catch (error) {
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});


      //case 10:
      //  pr = await code.ReadCode(req.body.data,flg=req.body.check);
      //  res.json(pr)