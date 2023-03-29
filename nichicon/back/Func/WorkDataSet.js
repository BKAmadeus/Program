var psql = require("./Postgre.js");
const ReferenceRangeRe = /([0-9\.]*),"[\[\()](.*),(.*)[\]\)]"/
const workdata_assembly_NOT_array = ["diameter","l_dimension","product_code","swage","tab_code"];
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

exports.WorkData = async function(){
    var data = await psql.PostgreSQLquery('SELECT * FROM product,production_schedule WHERE production_schedule.dessign = product.dessign ORDER BY production_schedule.id;')
    var StructType = await psql.PostgreSQLquery("SELECT t1.typname FROM pg_catalog.pg_type t1 left outer join pg_catalog.pg_namespace t2 on t1.typnamespace = t2.oid left outer join pg_catalog.pg_tables t3 on t1.typname = t3.tablename left outer join pg_catalog.pg_sequences t4 on t1.typname = t4.sequencename where t2.nspname = 'public' and ( t1.typcategory = 'C' or t1.typcategory = 'E' ) and t3.tablename is null and t4.sequencename is null order by t1.typname;");
    StructType = StructType.map((val)=>val.typname);
    var ans = {}
    for await(var key of StructType){
        let element = await psql.PostgreSQLquery("SELECT attribute_name FROM information_schema.attributes WHERE udt_name = '"+key+"' order by ordinal_position;");
        element = element.map((val)=>val.attribute_name);
        ans[key] = element
    }
    var table_name = ["product","production_schedule"]
    for (var tablename of table_name){
        var columns = await psql.PostgreSQLquery("SELECT column_name FROM information_schema.columns where table_name='"+tablename+"' order by ordinal_position;")
        for await(var key of columns){
            var st_ch = await psql.PostgreSQLquery(`SELECT pg_typeof(${tablename}.${key.column_name}) FROM product,production_schedule LIMIT 1;`)
            st_ch = st_ch[0].pg_typeof.replace('[]','')
            if(StructType.includes(st_ch)){
                for(var i in data){
                    if(data[i][key.column_name]){
                        var Split = data[i][key.column_name].split(/\(|\)/);
                        Split = Split.filter((_,index)=>index%2===1);
                        var ANS = [];
                        for(var j in Split){
                            var array = Split[j].split(',');
                            var elem = {};
                            for(var k in array){
                                elem[ans[st_ch][k]] = array[k].replace(/[\\\"|\\\'|'|"]/g,'')
                            }
                            ANS.push(elem);
                        }
                        data[i][key.column_name] = ANS;
                    }
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
        if(!workdata_assembly_NOT_array.includes(key)  && DataSet[key]){
            DataSet[key] = await ReferenceRange(DataSet[key])
        }
    }
    const swage_thickness = await psql.PostgreSQLquery("SELECT swage_thickness FROM workdata_tab WHERE tabcode = '"+DataSet["tab_code"]+"' and plus_foil_thickness = "+cul.parts[0].thickness)
    DataSet["swage_thickness"] = await ReferenceRange(swage_thickness[0].swage_thickness)
    SQL = "SELECT suzi_diameter FROM workdata_suzi_diameter WHERE diameter = "+data.Product.diameter+""
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

exports.WorkDataSetSQL = async function(data){
    var array_length = await psql.PostgreSQLquery(`SELECT array_length(schedule,1) FROM production_schedule WHERE id = ${data.id} and deadline = '${data.deadline}'`);
    var number = array_length[0]["array_length"]? parseFloat(array_length[0]["array_length"])+1:1;
    var SQL = "UPDATE production_schedule SET progress = " + data.progress;
    for(var key in data.schedule){
        SQL+=",schedule["+number+"]."+key+" = '"+ data.schedule[key] + "'";
    }
    SQL+=" WHERE id = "+data.id+" and deadline = '"+data.deadline+"'";
    await psql.PostgreSQLquery(SQL);
}