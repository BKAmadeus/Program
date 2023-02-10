var psql = require("./Postgre.js");

const ReferenceRange = async function(Data){
    const reference_range = Data.match(/([0-9\.]*),"[\[\()](.*),(.*)[\]\)]"/);
    if(!reference_range[1]){
        reference_range[1] = 0
    }
    if(!reference_range[2]){
        reference_range[2] = 0
    }
    if(!reference_range[3]){
        reference_range[3] = 0
    }
    Data = {reference:reference_range[1],limit:[reference_range[2],reference_range[3]]}
    return Data
}

exports.WorkData = async function(){
    var data = await psql.PostgreSQLquery('SELECT * FROM product,production_schedule WHERE production_schedule.dessign = product.dessign ORDER BY production_schedule.id;')
    var StructType = await psql.PostgreSQLquery("select t1.typname from pg_catalog.pg_type t1 left outer join pg_catalog.pg_namespace t2 on t1.typnamespace = t2.oid left outer join pg_catalog.pg_tables t3 on t1.typname = t3.tablename left outer join pg_catalog.pg_sequences t4 on t1.typname = t4.sequencename where t2.nspname = 'public' and ( t1.typcategory = 'C' or t1.typcategory = 'E' ) and t3.tablename is null and t4.sequencename is null order by t1.typname;");
    StructType = StructType.map((val)=>val.typname);
    var ans = {}
    for await(var key of StructType){
        let element = await psql.PostgreSQLquery("SELECT attribute_name FROM information_schema.attributes WHERE udt_name = '"+key+"' order by ordinal_position;");
        element = element.map((val)=>val.attribute_name);
        ans[key] = element
    }
    var table_name = ["product","production_schedule"]
    for (var tablename of table_name){
        var columns = await psql.PostgreSQLquery("select column_name from information_schema.columns where table_name='"+tablename+"' order by ordinal_position;")
        for await(var key of columns){
            var st_ch = await psql.PostgreSQLquery(`SELECT pg_typeof(${tablename}.${key.column_name}) FROM product,production_schedule LIMIT 1;`)
            st_ch = st_ch[0].pg_typeof.replace('[]','')
            if(StructType.includes(st_ch)){
                if(st_ch === 'element'){
                    for(var i in data){
                        if(data[i][key.column_name]){
                            var Split = data[i][key.column_name].split(/\(|\)/);
                            Split = Split.filter((_,index)=>index%2===1);
                            var ANS = [];
                            for(var j in Split){
                                var array = Split[j].split(',');
                                var elem = {};
                                for(var k in array){
                                    elem[ans[st_ch][k]] = array[k]
                                }
                                var test = await psql.PostgreSQLquery("SELECT * FROM "+elem.table_name+" WHERE code = '"+elem.code+"';")
                                elem["TableData"] = test[0]
                                ANS.push(elem);
                            }
                            data[i][key.column_name] = ANS;
                        }
                    }
                }
                else{
                    for(var i in data){
                        if(data[i][key.column_name]){
                            var Split = data[i][key.column_name].split(/\(|\)/);
                            Split = Split.filter((_,index)=>index%2===1);
                            var ANS = [];
                            for(var j in Split){
                                var array = Split[j].split(',');
                                var elem = {};
                                for(var k in array){
                                    elem[ans[st_ch][k]] = array[k]
                                }
                                ANS.push(elem);
                            }
                            data[i][key.column_name] = ANS;
                        }
                    }
                }
            }
        }

    }
    return data
}

const workdata_assembly_NOT_array = ["diameter","l_dimension","product_code","swage","tab_code","l0max"]
exports.WorkDataCulculation = async function(cul,data){
    DataSet = await psql.PostgreSQLquery("SELECT * FROM workdata_assembly WHERE product_code ='"+data.Product.code+"' and diameter ="+data.Product.diameter+" and l_dimension = "+data.Product.l_dimension)
    if(DataSet.length === 0){
        DataSet = await psql.PostgreSQLquery("SELECT * FROM workdata_assembly WHERE diameter ="+data.Product.diameter+" and l_dimension = "+data.Product.l_dimension)
    }
    DataSet = DataSet[0];
    for(var key of Object.keys(DataSet)){
        if(!workdata_assembly_NOT_array.includes(key)){
            DataSet[key] = await ReferenceRange(DataSet[key])
        }
    }
    const swage_thickness = await psql.PostgreSQLquery("SELECT swage_thickness FROM workdata_tab WHERE tabcode = '"+DataSet["tab_code"]+"' and plus_foil_thickness = "+cul.parts[0].thickness)
    DataSet["swage_thickness"] = await ReferenceRange(swage_thickness[0].swage_thickness)
    const sizu = await psql.PostgreSQLquery("SELECT suzi_diameter FROM workdata_suzi_diameter WHERE diameter = "+data.Product.diameter);
    DataSet["sizu"] = await ReferenceRange(sizu[0].suzi_diameter);
    return {culculation:cul,WorkData:DataSet}
}