var { Client } = require('pg');
const fs = require('fs');
var Struct = require("./StructChack.js");

const UPDATE_PATH = './Update/Update.json'
const ADD_PATH = './Add/Add.json'
const DELETE_PATH = './Delete/Delete.json'
// Jsonファイル読み込み
const Updatefile = fs.readFileSync(UPDATE_PATH)
const Addfile = fs.readFileSync(ADD_PATH)
const Deletefile = fs.readFileSync(DELETE_PATH)
// データを文字列に変換
const UpdatedataJSON = Updatefile.toString()
const AdddataJSON = Addfile.toString()
const DeletedataJSON = Deletefile.toString()
// データをオブジェクト形式に変換
let UpdateData = JSON.parse(UpdatedataJSON)
let AddData = JSON.parse(AdddataJSON)
let DeleteData = JSON.parse(DeletedataJSON)

var client = new Client({
  user: 'postgres',
  host: 'localhost',
  port: 5432,
  database: 'nichicon',
  password: 'NICHICON'
})

client.connect()

exports.PostgreSQLquery2 = async function(SQL,values){
  result = await client.query(SQL,values);
  return result.rows
}

exports.PostgreSQLquery = async function(SQL) {
  result = await client.query(SQL)
  return result.rows
}

PostgreSQLquery = async function(SQL) {
  result = await client.query(SQL)
  return result.rows
}

exports.TableRead = async function(table) {
  var data ={}
  for await (var key of table){
    const sql = "select * from " + key.value + " order by id;"
    data[key.value] = await PostgreSQLquery(sql);
  }
  return data
}

exports.DeleteDataRows = function(Data) { 
  var sql = "delete from " + Data.name + " where " + Data.name + ".id = " + Data.row.id;
  PostgreSQLquery(sql);
}

exports.UpdateDataRows = async function(Data){
  var beforesql = "SELECT ";
  var aftersql = "UPDATE " + Data.table_name + " SET ";
  var rows = {}
  var struct = {};
  var structlist = Object.keys(Data.struct);
  var associationlist = Object.keys(Data.association);
  for (var key in Data.data){
    if(Data.data[key] && Data.data[key].length !== 0){
      if(structlist.includes(key)){
        for(var index in Data.data[key]){
          var array_length = await psql.PostgreSQLquery(`SELECT array_length(${key},1) FROM ${table_name} WHERE id = ${Data.data.id} order by id;`);
          var max = array_length[0].array_length;
          struct[key] = await Struct.StructSQL(0,Data.table_name,key,structlist,` WHERE id = ${Data.data.id}`,max);
          for(var key2 in Data.data[key][index]){
            if(Data.data[key][index][key2]){
              aftersql+=`${key}[${index+1}].${key2} = '${Data.data[key][index][key2]}',`;
            }
            else{
              aftersql+=`${key}[${index}].${key2} = null,`;
            }
          }
        }
      }
      else if(associationlist.includes(key)){
        for(var key2 in Data.data[key]){
          beforesql+=`(${key}).${key2} as ${key+"_"+key2},`;
          aftersql +=`${key}.${key2} = '${Data.data[key][key2]}',`;
        }
      }
      else{
        beforesql+=`${key},`
        aftersql +=`${key} = '${Data.data[key]}',`
      }
    }
    else{
      beforesql+=`${key},`
      aftersql+=`${key} = null,`
    }
  }
  beforesql = `${beforesql.slice(0,beforesql.length -1)} from ${Data.table_name} where id = ${Data.data.id}`;
  aftersql = `${aftersql.slice(0,aftersql.length -1)} where id = ${Data.data.id}`;
  rows["table"] = Data.table_name;
  rows["before"] = await PostgreSQLquery(beforesql);
  try{
    await PostgreSQLquery(aftersql);
  }catch(e){
    console.log(e);
    rows["error"] = true;
  }
  rows["after"] = Data.data;
  return rows
}

exports.UpdateDataWriteJSON = function(row) {
  let now = new Date();
  now = now.toFormat("YYYY/MM/DD-HH:MI:SS");
  UpdateData[now] = (row);
  const Json = JSON.stringify(UpdateData, null, 2);
  fs.writeFileSync(UPDATE_PATH,Json);
  return UpdateData
}

exports.DeleteDataWriteJSON = function(row) {
  let now = new Date();
  now = now.toFormat("YYYY/MM/DD-HH:MI:SS");
  DeleteData[now] = (row);
  const Json = JSON.stringify(DeleteData, null, 2);
  fs.writeFileSync(UPDATE_PATH,Json);
  return DeleteData
}

exports.AddDataWriteJSON = function(row) {
  let now = new Date();
  now = now.toFormat("YYYY/MM/DD-HH:MI:SS");
  AddData[now] = (row);
  const Json = JSON.stringify(AddData, null, 2);
  fs.writeFileSync(UPDATE_PATH,Json);
  return AddData
}