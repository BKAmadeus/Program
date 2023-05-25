var psql = require("./Postgre.js");

const StructSELECTSQL = async (flg,table,column,structlist,SELECT="",max=0) => {
    if(flg===0){
        Struct = [];
        for(let i=1;i<=max;i++){
            var sql = "SELECT "
            for await(var column2 of Object.keys(structlist)){
                sql = sql + `${column}[${i}].${column2},`
            }
            sql = sql.slice(0,sql.length-1) + ` FROM ${table} ${SELECT} order by id;`
            var row = await psql.PostgreSQLquery(sql);
            Struct[i-1] = row
        }
    }
    else if(flg===1){
        var sql = "SELECT "
        for await(var column2 of Object.keys(structlist)){
            sql = sql + `(${column}).${column2},`
        }
        sql = sql.slice(0,sql.length-1) + ` FROM ${table} ${SELECT} order by id;`
        var row = await psql.PostgreSQLquery(sql);
        Struct = row;
    }
    return Struct
}

exports.TypeRecall = async (key,StructType) => {
    let element = await psql.PostgreSQLquery("SELECT attribute_name,attribute_udt_name FROM information_schema.attributes WHERE udt_name = '"+key+"'");
    var ans = {};
    for await(var val of element){
        var attribute_udt_name2 = val.attribute_udt_name.replace('_','')
        if(StructType.includes(attribute_udt_name2)){
            ans[val.attribute_name] = await TypeRecall(attribute_udt_name2,StructType)
        }
        else {
            ans[val.attribute_name] = val.attribute_name
        }
    };
    return ans
}

const TypeRecall = async (key,StructType) => {
    let element = await psql.PostgreSQLquery("SELECT attribute_name,attribute_udt_name FROM information_schema.attributes WHERE udt_name = '"+key+"'");
    var ans = {};
    for await(var val of element){
        var attribute_udt_name2 = val.attribute_udt_name.replace('_','')
        if(StructType.includes(attribute_udt_name2)){
            ans[val.attribute_name] = await TypeRecall(attribute_udt_name2,StructType)
        }
        else {
            ans[val.attribute_name] = val.attribute_name
        }
    };
    return ans
}

exports.StructSQL = async function(flg,table,column,structlist,SELECT="",array_length=null){
    return await StructSELECTSQL(flg,table,column,structlist,SELECT,array_length);
}

exports.StructChack = async function(Data,select){
    var StructType = await psql.PostgreSQLquery("select t1.typname from pg_catalog.pg_type t1 left outer join pg_catalog.pg_namespace t2 on t1.typnamespace = t2.oid left outer join pg_catalog.pg_tables t3 on t1.typname = t3.tablename left outer join pg_catalog.pg_sequences t4 on t1.typname = t4.sequencename where t2.nspname = 'public' and ( t1.typcategory = 'C' or t1.typcategory = 'E' ) and t3.tablename is null and t4.sequencename is null order by t1.typname;");
    StructType = StructType.map((data)=>data.typname);
    var ans = {}
    for await(var key of StructType){
        ans[key] = await TypeRecall(key,StructType);
    }
    var data = {};
    for await(var table of select){
        data[table] = {}
        data[table].struct = {}
        data[table].association = {}
        data[table].table = Data[table];
        var Struct = {}
        if(data[table].table.length !== 0){
            for await(var key of Object.keys(Data[table][0])){
                var st_ch = await psql.PostgreSQLquery(`SELECT pg_typeof(${key}) FROM ${table} LIMIT 1;`)
                var check = st_ch[0].pg_typeof
                st_ch = st_ch[0].pg_typeof.replace('[]','')
                if(ans[st_ch]){
                    if(check.indexOf('[]') === -1){
                        Count = 0;
                        data[table].association[key] = ans[st_ch];
                        Struct[key] = await StructSELECTSQL(1,table,key,ans[st_ch]);
                        data[table].table = data[table].table.map((val)=>{
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
                        data[table].struct[key] = ans[st_ch];
                        var array_length = await psql.PostgreSQLquery(`SELECT array_length(${key},1) FROM ${table} order by id;`);
                        var max = array_length.reduce((max,val)=> !val?max:(val.array_length>max?val.array_length:max),0);
                        Struct[key] = await StructSELECTSQL(0,table,key,ans[st_ch],"",max);
                        data[table].table = data[table].table.map((val,index)=>{
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
    }
    return data
}

exports.StructArrays = async function(table_name,equipment_names){
    var StructType = await psql.PostgreSQLquery("select t1.typname from pg_catalog.pg_type t1 left outer join pg_catalog.pg_namespace t2 on t1.typnamespace = t2.oid left outer join pg_catalog.pg_tables t3 on t1.typname = t3.tablename left outer join pg_catalog.pg_sequences t4 on t1.typname = t4.sequencename where t2.nspname = 'public' and ( t1.typcategory = 'C' or t1.typcategory = 'E' ) and t3.tablename is null and t4.sequencename is null order by t1.typname;");
    StructType = StructType.map((data)=>data.typname);
    var ans = {}
    for await(var key of StructType){
        let element = await psql.PostgreSQLquery("SELECT attribute_name FROM information_schema.attributes WHERE udt_name = '"+key+"'");
        element = element.map((val)=>val.attribute_name);
        ans[key] = element
    }
    var data = {}
    data[table_name] = []
    var columns = await psql.PostgreSQLquery("select column_name from information_schema.columns where table_name='"+table_name+"' order by ordinal_position;")
    var SQL_element1 = "";
    var SQL_element2 = "";
    var Struct_column = [];
    for(var column of columns){
        var st_ch = await psql.PostgreSQLquery(`SELECT pg_typeof(${column.column_name}) FROM ${table_name} LIMIT 1;`)
        st_ch = st_ch[0].pg_typeof.replace('[]','')
        if(StructType.includes(st_ch)){
            Struct_column.push(column.column_name);
            for(var key2 of ans[st_ch]){
                SQL_element2 = SQL_element2 + ",(unnest("+column.column_name+"))." + key2
            }
        }
        else{
            SQL_element1 = SQL_element1 + "," + column.column_name
        }
    }
    var SQL1 = "SELECT " + SQL_element1.slice(1) + " FROM "+table_name+" WHERE "+Struct_column.join(' IS NULL and ')+" IS NULL ORDER BY id;"
    var SQL2 = "SELECT " + SQL_element2.slice(1) + " FROM "+table_name+" ORDER BY id;"
    var data1 = await psql.PostgreSQLquery(SQL1)
    var data2 = await psql.PostgreSQLquery(SQL2)
    var columns = [];
    equipment = {};
    for(var name of equipment_names){
        columns = [];
        for(var column of ans['execution_order']){
            columns.push("(unnest("+name+".execution_order))."+column)
        }
        var as_foo = "(SELECT code as equipment_code,"+columns.join(',')+" FROM "+name+") as foo"
        var as_data1 = "(SELECT product.*,foo.*,foo.dessign as dessign2 FROM "+as_foo+",product WHERE foo.dessign = product.dessign) as data1"
        var SQL = "SELECT * FROM "+as_data1+",production_schedule WHERE production_schedule.dessign = data1.dessign2 and production_schedule.deadline = data1.deadline and production_schedule.lot = data1.lot;";
        try{
            equipment[name] = await psql.PostgreSQLquery(SQL);
        } catch( e ){
            console.log("確認用",e);
        }
    }
    return {NotStart:data1,started:data2,equipment:equipment}
}

