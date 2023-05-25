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
const fs = require('fs');

const server = require('https').createServer({
  key: fs.readFileSync('./SSL/privatekey.pem'),
  cert: fs.readFileSync('./SSL/cert.pem'),
}, app)
// jsonの受け取り:limitは画像送信用2枚3枚送るようになったら変更する
app.use(express.json({limit: '25mb'}));

// cors対策
app.use((_, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "https://10.5.1.35:3000");
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
    console.log(req.body.flg)
    switch(req.body.flg) {
      case 0:
        res.json(await psql.PostgreSQLquery("SELECT pg_stat_user_tables.relname AS name,pg_description.description AS description FROM pg_stat_user_tables,pg_description WHERE pg_stat_user_tables.relname IN ( SELECT relname AS name FROM pg_stat_user_tables) AND pg_stat_user_tables.relid=pg_description.objoid AND pg_description.objsubid=0 AND pg_stat_user_tables.schemaname=current_schema() ORDER BY name;"));
        //res.json(await psql.PostgreSQLquery("select * from tablelist order by description"));
        break
      case 1:
        var tables = await psql.TableRead(req.body.select);
        var select = req.body.select.map((val)=> val.value);
        res.json(await Struct.StructChack(tables,select));
        break
      case 2:
        var rows = await psql.UpdateDataRows(req.body);
        UpdateData = psql.UpdateDataWriteJSON(rows);
        break
      case 'TableUpdate':
        var rows = await psql.UpdateDataRows(req.body);
        if(rows["error"]){
          res.json("error");
        }
        else{
          res.json(await psql.UpdateDataWriteJSON(rows));
        }
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
      case 'Calculation':
        res.json(await code.Calculation(req.body.data,req.body.tables,req.body.state,req.body.step));
        break
      case 8:
        code.SabmitData(req.body);
        break
      case 9:
        pr = await CP.PicChange(Buffer.from(req.body.Pic,'base64'),req.body.color,req.body.text_color);
        res.json(pr)
        break
      case 11:
        pr = await MS.SQLServerTables();
        res.json(pr)
        break
      case 'schedule_initData':
        var tablename = await psql.PostgreSQLquery("select tablename from pg_tables where schemaname not in('pg_catalog','information_schema') and tablename like 'equipment%' order by tablename;")
        var select = tablename.map((val)=>{return {value:val.tablename}});
        var tables = await psql.TableRead(select)
        var select = select.map((val)=> val.value)
        res.json({table:await Struct.StructChack(tables,select),schedule:await Struct.StructArrays(req.body.value,select)});
        break
      case 'WorkDataInit':
        res.json(await sds.WorkData(req.body.data));
        break
      case 'WorkDataCalculation':
        pr = await code.CodeClassification(req.body);
        pr["winding"] = req.body.Product.winding;
        res.json(await sds.WorkDataCulculation(pr,req.body))
        break
      case 'WorkDataBaseCompletion':
        res.json(await sds.BaseSubmitSQL(req.body));
        break
      case 'WorkDataWindingProcess':
        res.json(await sds.WindingSabmitData(req.body));
        break
      case "CurlingStart":
        res.json(await sds.CurlingStartSubmit(req.body));
        break
      case "CurlingData":
        res.json(await sds.CurlingDataSubmit(req.body));
        break
      case "ExaminationInit":
        res.json(await psql.PostgreSQLquery(`SELECT * FROM examination WHERE state < 2 or ('${req.body.start}' <= finish and finish <= '${req.body.end}') or finish IS NULL order by id`));
        break
      case "ExaminationSet":
        await sds.ExaminationInit_test(req.body);
        res.json(true);
        break
      case "ExaminationChange":
        await psql.PostgreSQLquery(`UPDATE examination SET state = ${req.body.data.state},finish=${req.body.data.state===2?"'"+req.body.now+"'":"null"} WHERE id = ${req.body.val.id} and lot_number = '${req.body.val.lot_number}'`);
        res.json(true);
        break
      case 'NewProductionSchedule':
        data = await code.Calculation(req.body.data,req.body.tables,req.body.state,req.body.step)
        if(!data.check){
          await sds.ScheduleSubmit(req.body);
        }
        res.json(data)
        break
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
        break
      case "assembly":
        pr = await code.CodeAssembly(req.body);
        res.json(pr);
        break
      case "UserCodes":
        var SQL = "SELECT code,name,post,affiliations FROM employee_info WHERE "
        var codes = req.body.codes.map((val)=>"code = '"+val+"'")
        codes = codes.join(' or ')
        res.json(await psql.PostgreSQLquery(SQL+codes));
        break
      case "FoilStandard":
        var ans = await code.FoilStandard(req.body);
        res.json(ans)
        break
      case "AssemblyCheck":
        var ans = await code.AssemblyCheck(req.body);
        res.json(ans);
        break
      case "AssemblySubmit":
        await code.AssemblySubmit(req.body);
        break
      case "TubeList":
        res.json(await code.DisplayCode(req.body));
        break
      case "ProductNumberCheck":
        res.json(await code.ReadCode(req.body,1));
        break
      case "TubeCheck":
        res.json(await code.TubeCheck(req.body));
        break
      case "TubeSubmit":
        await code.TubeSubmit(req.body);
        break
    }
  } catch (error) {
  }
});

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});


      //case 10:
      //  pr = await code.ReadCode(req.body.data,flg=req.body.check);
      //  res.json(pr)