var { Client } = require('pg');
const fs = require('fs')

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
  host: '10.5.1.35',
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
  var beforesql = "select ";
  var aftersql = "update " + Data.name + " set ";
  var rows = {}
  for (var key in Data.row){
    beforesql = beforesql + key + ",";
    aftersql = aftersql + key + " = '" + Data.row[key] + "',";
  }
  beforesql = beforesql.slice(0,beforesql.length -1) + " from " + Data.name + " where " + Data.name + ".id = " + Data.row.id
  aftersql = aftersql.slice(0,aftersql.length -1) + " where " + Data.name + ".id = " + Data.row.id
  rows["name"] = Data.name;
  rows["before"] = await PostgreSQLquery(beforesql);
  await PostgreSQLquery(aftersql);
  rows["after"] = Data.row;
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