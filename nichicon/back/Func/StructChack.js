var psql = require("./Postgre.js");


exports.StructChack = async function(Data,select){
    var StructType = await psql.PostgreSQLquery("select t1.typname from pg_catalog.pg_type t1 left outer join pg_catalog.pg_namespace t2 on t1.typnamespace = t2.oid left outer join pg_catalog.pg_tables t3 on t1.typname = t3.tablename left outer join pg_catalog.pg_sequences t4 on t1.typname = t4.sequencename where t2.nspname = 'public' and ( t1.typcategory = 'C' or t1.typcategory = 'E' ) and t3.tablename is null and t4.sequencename is null order by t1.typname;");
    StructType = StructType.map((data)=>data.typname);
    var ans = {}
    for await(var key of StructType){
        let element = await psql.PostgreSQLquery("SELECT attribute_name FROM information_schema.attributes WHERE udt_name = '"+key+"'");
        element = element.map((val)=>val.attribute_name);
        ans[key] = element
    }
    var data = {}
    for await(var table of select){
        data[table] = {}
        data[table].struct = {}
        data[table].table = Data[table];
        data[table].max = []
        var Struct = {}
        for await(var key of Object.keys(Data[table][0])){
            var st_ch = await psql.PostgreSQLquery(`SELECT pg_typeof(${key}) FROM ${table} LIMIT 1;`)
            st_ch = st_ch[0].pg_typeof.replace('[]','')
            if(StructType.includes(st_ch)){
                data[table].struct[key] = ans[st_ch];
                var array_length = await psql.PostgreSQLquery(`SELECT array_length(${key},1) FROM ${table} order by id;`);
                array_length = array_length.map((val)=> val.array_length);
                max = Math.max(...array_length);
                data[table].max.push({name:key,max:max});
                Struct[key] = [];
                for(let i=1;i<=max;i++){
                    var sql = "SELECT "
                    for await(var key2 of ans[st_ch]){
                        sql = sql + `${key}[${i}].${key2},`
                    }
                    sql = sql.slice(0,sql.length-1) + ` FROM ${table} order by id;`
                    var row = await psql.PostgreSQLquery(sql);
                    Struct[key][i-1] = row
                }
                Count = 0;
                data[table].table = data[table].table.map((val)=>{
                    if(val[key]){
                        val[key] = [];
                        for(var i=0;i<array_length[Count];i++){
                            val[key][i] = Struct[key][i][Count];
                        }
                    }
                    else{
                        val[key] = null;
                    }
                    Count++;
                    return val
                })
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
