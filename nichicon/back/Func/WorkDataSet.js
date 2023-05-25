var psql = require("./Postgre.js");
var ST = require(`./StructChack.js`);
var FC = require(`./func.js`);
const ReferenceRangeRe = /([0-9\.]*),"[\[\()](.*),(.*)[\]\)]"/
const workdata_assembly_NOT_array = ["id","diameter","l_dimension","product_code","swage","tab_code"];
const workdata_suzi_diameter = ["capacitance","l_dimension"];

exports.ReferenceRange = async function(Data){
    const reference_range = Data.match(ReferenceRangeRe);
    if(!reference_range[1]){
        reference_range[1] = null;
    }
    if(!reference_range[2]){
        reference_range[2] = null;
    }
    if(!reference_range[3]){
        reference_range[3] = null;
    }
    Data = {reference:reference_range[1],limit:[reference_range[2],reference_range[3]]}
    return Data
}

const ReferenceRange = async function(Data){
    const reference_range = Data.match(ReferenceRangeRe);
    if(!reference_range[1]){
        reference_range[1] = null;
    }
    if(!reference_range[2]){
        reference_range[2] = null;
    }
    if(!reference_range[3]){
        reference_range[3] = null;
    }
    Data = {reference:reference_range[1],limit:[reference_range[2],reference_range[3]]}
    return Data
}

exports.ScheduleSubmit = async function(Data){
    id = await psql.PostgreSQLquery("SELECT MIN(id + 1) AS id FROM production_schedule WHERE (id + 1) NOT IN (SELECT id FROM production_schedule);")
    lot = await psql.PostgreSQLquery(`SELECT MAX(lot) FROM production_schedule WHERE dessign = '${Data.new.dessign}' and deadline = '${Data.new.dessign}';`);
    console.log(lot.length);
    console.log(id);
    if(!FC.Hollow2(id[0].id)){
        id = 0;
    }
    else{
        id = parseFloat(id[0].id);
    }
    if(!FC.Hollow2(lot[0].max)){
        lot = 0;
    }
    else{
        lot = parseFloat(lot[0].max)+1;
    }

    console.log("date",Data.new.deadline);
    console.log(`INSERT INTO production_schedule (id,deadline,dessign,lot,destination,quantity) VALUES(${id},'${Data.new.deadline}','${Data.new.dessign}',${lot},'${Data.new.destination}',${Data.new.quantity})`);
    await psql.PostgreSQLquery(`INSERT INTO production_schedule (id,deadline,dessign,lot,destination,quantity) VALUES(${id},'${Data.new.deadline}','${Data.new.dessign}',${lot},'${Data.new.destination}',${Data.new.quantity})`);
}

exports.WorkData = async function(){
    var data = await psql.PostgreSQLquery('SELECT * FROM product,production_schedule WHERE production_schedule.dessign = product.dessign ORDER BY production_schedule.id;')
    var StructType = await psql.PostgreSQLquery("SELECT t1.typname FROM pg_catalog.pg_type t1 left outer join pg_catalog.pg_namespace t2 on t1.typnamespace = t2.oid left outer join pg_catalog.pg_tables t3 on t1.typname = t3.tablename left outer join pg_catalog.pg_sequences t4 on t1.typname = t4.sequencename where t2.nspname = 'public' and ( t1.typcategory = 'C' or t1.typcategory = 'E' ) and t3.tablename is null and t4.sequencename is null order by t1.typname;");
    StructType = StructType.map((val)=>val.typname);
    var ans = {}
    for await(var key of StructType){
        ans[key] = await ST.TypeRecall(key,StructType);
    }
    var table_name = ["product","production_schedule"]
    for (var table of table_name){
        var Struct = {};
        var columns = await psql.PostgreSQLquery("SELECT column_name FROM information_schema.columns where table_name='"+table+"' order by ordinal_position;");
        columns = columns.map(val=>val.column_name);
        for await(var key of columns){
            var st_ch = await psql.PostgreSQLquery(`SELECT pg_typeof(${key}) FROM ${table} LIMIT 1;`);
            var check = st_ch[0].pg_typeof;
            st_ch = st_ch[0].pg_typeof.replace('[]','')
            if(StructType.includes(st_ch)){
                if(check.indexOf('[]') === -1){
                    Count = 0;
                    Struct[key] = await ST.StructSQL(1,table,key,ans[st_ch]);
                    data = data.map((val)=>{
                        if(val[key]){
                            val[key] = [];
                            val[key] = Struct[key][Count];
                        }
                        else{
                            val[key] = null;
                        }
                        Count++;
                        return val
                    })
                }
                else{
                    var array_length = await psql.PostgreSQLquery(`SELECT array_length(${key},1) FROM ${table} order by id;`);
                    var max = array_length.reduce((max,val)=> !val?max:(val.array_length>max?val.array_length:max),0);
                    Struct[key] = await ST.StructSQL(0,table,key,ans[st_ch],"",max);
                    data = data.map((val,index)=>{
                        if(val[key]){
                            val[key] = [];
                            for(var i=0; i<array_length[index].array_length;i++){
                                val[key][i] = Struct[key][i][index];
                            }
                        }
                        else{
                            val[key] = null;
                        }
                        return val
                    })
                }
            }
        }
    }
    return data
}

exports.WorkDataCulculation = async function(cul,data){
    DataSet = await psql.PostgreSQLquery("SELECT * FROM workdata_assembly WHERE product_code ='"+data.Product.code+"' and diameter ="+data.Product.diameter+" and l_dimension = "+data.Product.l_dimension);
    if(DataSet.length === 0){
        DataSet = await psql.PostgreSQLquery("SELECT * FROM workdata_assembly WHERE diameter ="+data.Product.diameter+" and l_dimension = "+data.Product.l_dimension)
    }
    DataSet = DataSet[0];
    for(var key of Object.keys(DataSet)){
        if(!workdata_assembly_NOT_array.includes(key) && DataSet[key]){
            DataSet[key] = await ReferenceRange(DataSet[key])
        }
    }
    const swage_thickness = await psql.PostgreSQLquery("SELECT swage_thickness FROM workdata_tab WHERE tabcode = '"+DataSet["tab_code"]+"' and plus_foil_thickness = "+cul.parts[0].thickness)
    DataSet["swage_thickness"] = await ReferenceRange(swage_thickness[0].swage_thickness)
    var SQL = "SELECT suzi_diameter FROM workdata_suzi_diameter WHERE diameter = "+data.Product.diameter+""
    for await(WSD of workdata_suzi_diameter){
        SQL+=" and ("+WSD+" = '"+data.Product[WSD]+"' or "+WSD+" IS NULL)";
    }
    let sizu = await psql.PostgreSQLquery(SQL);
    if(sizu.length === 1){
        DataSet["sizu"] = await ReferenceRange(sizu[0].suzi_diameter);
    }
    else if(sizu.length <= 2){
        sizu = sizu.filter((val)=>!(val.capacitance) || !(val.l_dimension))
        DataSet["sizu"] = await ReferenceRange(sizu[0].suzi_diameter);
    }
    return {culculation:cul,WorkData:DataSet}
}

exports.BaseSubmitSQL = async function(data){
    var array_length = await psql.PostgreSQLquery(`SELECT array_length(schedule,1) FROM production_schedule WHERE id = ${data.id} and deadline = '${data.deadline}'`);
    var number = array_length[0]["array_length"]? parseFloat(array_length[0]["array_length"])+1:1;
    var SQL = "UPDATE production_schedule SET progress = " + data.progress;
    for(var key in data.schedule){
        SQL+=",schedule["+number+"]."+key+" = '"+ data.schedule[key] + "'";
    }
    SQL+=" WHERE id = "+data.id+" and deadline = '"+data.deadline+"'";
    await psql.PostgreSQLquery(SQL);
}

const WindingCheck = ["陽極箔","陰極箔","電解紙","電解紙2","耐圧紙","素子止めテープ","-リード","+リード","-タブ","+タブ"];
const WindingPartsRow = ["thickness","range","length","lot_number","code","name"];
exports.WindingSabmitData = async function(Data){
    console.log("確認データ",Data)
    var sqls = {};
    for(var row of WindingPartsRow){
        sqls[row] = [];
    }
    //var sql = `UPDATE production_schedule SET winding[${Data.count}] = `
    Data.data.check = true;
    Data.data.parts = Data.data.parts.map((val)=>{
        if(val && WindingCheck.includes(val.name)){
            for (row of WindingPartsRow){
                sqls[row].push(val[row]?'"'+val[row]+'"':"null")
            }
            if(!val.lot_number || !val.code || !val.check ||
            (Data.WindingList.thickness.includes(val.name) && !val.thickness) ||
            (Data.WindingList.range.includes(val.name) && !val.range) ||
            (Data.WindingList.length.includes(val.name) && !val.length)){
                Data.data.check = false;
                val.error = '必要データなし';
            }
        }
        return val
    })
    if(Data.state === 0 || (Data.data.check && Data.state === 1)){
        for(row of WindingPartsRow){
            var sql = `UPDATE production_schedule SET winding[${Data.count}].${row} = '{${sqls[row].join(',')}}' WHERE id = ${Data.data.id} and deadline = '${Data.data.deadline}'`
            console.log(sql);
        }
        sql = `UPDATE production_schedule SET winding[${Data.count}].close = ${Data.state === 1} WHERE id = ${Data.data.id} and deadline = '${Data.data.deadline}'`
        console.log(sql);
    }
    console.log(Data.data.CaulkingAndWinding);
    console.log(Data.data.winding_machine);
    console.log(Object.keys(Data.data.CaulkingAndWinding));
    return Data
}

exports.CurlingStartSubmit = async function(Data){
    var id = await psql.PostgreSQLquery(`SELECT MAX(id) FROM curling_data;`);
    id = parseInt(id[0].max)+1;
    if(!id){
        id = 0;
    }
    start = FC.Today();
    //console.log(`INSERT INTO curling_data (id,start,equipment,lot_number,search,l_dimension,after,voltage,finish) VALUES(${id},'${start}','${Data.data.equipment}','${Data.data.lot_number}',${Data.data.search},${Data.data.l_dimension},${Data.data.after},${Data.data.voltage},false)`);
    await psql.PostgreSQLquery(`INSERT INTO curling_data (id,start,equipment,lot_number,search,l_dimension,after,voltage,finish) VALUES(${id},'${start}','${Data.data.equipment}','${Data.data.lot_number}',${Data.data.search},${Data.data.l_dimension},${Data.data.after},${Data.data.voltage},false)`);
    return new Date(start).toISOString()
}

exports.CurlingDataSubmit = async function(Data){
    start = FC.Today();
    console.log(Data)
    console.log(`UPDATE curling_data SET finish = ${Data.data.finish},data = ARRAY_APPEND(data,'("${start}","{${Data.data.measurement.join(',')}}",${Data.data.error})'::curling) WHERE finish = false and equipment = '${Data.data.equipment}'`);
    await psql.PostgreSQLquery(`UPDATE curling_data SET finish = ${Data.data.finish},data = ARRAY_APPEND(data,'("${start}","{${Data.data.measurement.join(',')}}",${Data.data.error})'::curling) WHERE finish = false and equipment = '${Data.data.equipment}'`);
    return new Date(start).toISOString()
}

exports.ExaminationInit_test = async function(Data){
    console.log(Data);
    var id = await psql.PostgreSQLquery(`SELECT MAX(id) FROM examination;`);
    id = parseInt(id[0].max)+1;
    if(!id){
        id = 0;
    }
    console.log(`INSERT INTO examination (id,search_number,lot_number,place,state,type) VALUES(${id},${Data.data.search_number},'${Data.data.lot_number}','${Data.data.place}',0,'${Data.data.type}')`);
    psql.PostgreSQLquery(`INSERT INTO examination (id,search_number,lot_number,place,state,type) VALUES(${id},${Data.data.search_number},'${Data.data.lot_number}','${Data.data.place}',0,'${Data.data.type}')`)
}