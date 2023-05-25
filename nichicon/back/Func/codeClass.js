
var psql = require("./Postgre.js");
var CP = require("./ChangePic.js");
var sds = require("./WorkDataSet.js");
var fnc = require("./func.js");
//var ST = require("./StructChack.js");
//2022/09/13 これからテーブル名hin~~,sm~~,bl~~,tr~~の列名を変更した場合、このプログラムの修正が必要になる。

const HinSm = ["SM","BM","CM","SE","BE","CE","TE"]
const EDTr = ["UM","UW","UK","UA","UC","UH"]
const EDSM = ["JD","JL"]
const EDBL = ["JC"]
//品番はTrとSM,BLで読み方が違うのでそれ用に二つ列名と正規表現
const HinTrSei =   /([A-Z])([A-Z]{2})([A-Z0-9]{2})([0-9A-Z]{3})([A-Z])([A-Z])([A-Z])(.*)/
const HinSMBLSei = /([A-Z])([A-Z]{2})([A-Z0-9]{2})([0-9A-Z]{3})([A-Z])([A-Z]{2})(.*)/
const regex1 = /\d[A-Z]/
const regex2 = /[A-Z]\d/
const HinTrOutKA = /^\d([A-Z]{2}).*|^[A-Z].{2}([A-Z]{2}).*/
const HinTrOutUser = /^[A-Z]([A-Z]{2}).*/
const HinBLOut = /^([A-Z])([A-Z]{2}).*|^([A-Z])(\d{2}).*|^([A-Z]).*|.([A-Z]{2}).*/
const HinSMOut = /^([A-Z])([A-Z]{2}).*|^([A-Z]?).*/
const HinOuter = /.{5}([A-Z]).*/
//それぞれのコードに入ってくるのが数値、アルファベット、何桁～何桁を合わせて読み込みそれぞれのカラムに登録するための正規表現
const TrSei = /([A-Z])([A-Z])(\d{2})(\d{2})([A-Z])([A-Z])([A-Z])([A-Z])([A-Z]).*/
const SMSei = /([A-Z])([A-Z])([A-Z])(\d)(\d{2,3}?)(\d{2,3})([A-Z])([0-9A-Z]?).*/
const BLSei = /([A-Z])(\w{2})([A-Z0-9+-])(\d{2,3}?)(\d{2,3})([A-Z])([0-9A-Z]?).*/
const BLSpecial_L = /素子長([0-9\.]+)\*?(UP|DOWN)-素子径.*/
const BLSpecial_F = /素子長.*-素子径(([0-9\.\*]+)(UP|DOWN)|アトビ)/
//許容差などの分解用
const Dessign = /([0-9A-Z]+)-?(.*)/
const Range_Read = /[\(\[]([\-0-9]+),([\-0-9]+).*/
//必要部材と禁止部材
const CheckParts1 = {
    'tr':{
        prohibition:['+リードタブ','-リードタブ','保護紙','保護箔'],
        indispensable:['+リード棒','-リード棒']
    },
    'sm':{
        prohibition:['+リード棒','-リード棒'],
        indispensable:['+リードタブ','-リードタブ']
    },
    'bl':{
        prohibition:['+リード棒','-リード棒'],
        indispensable:['+リードタブ','-リードタブ']
    },
}

const CheckParts2 ={
    'tr':{
        prohibition:['モールド端子板','端子板','圧力弁','ワッシャ','ロックワッシャ','バンド','ボルト','ナイロンナット','ナイロンワッシャ'],
        indispensable:['ゴムパッキング']
    },
    'sm':{
        prohibition:['モールド端子板'],
        indispensable:['端子板','圧力弁','ワッシャ','ゴムパッキング','ロックワッシャ']
    },
    'bl':{
        prohibition:['端子板','圧力弁','ゴムパッキング','ロックワッシャ','バンド','ボルト','ナイロンナット','ナイロンワッシャ'],
        indispensable:['モールド端子板','ワッシャ']
    }
}

const AssemblyStandardFoil = ['陽極箔','陰極箔','電解紙','素子止めテープ'];
const Tab = ['+リードタブ','-リードタブ'];
const parts_liquid = ['電解液','素子固定材'];
const AssemblyTube = ["外チューブ"];
const Foil = ['陽極箔','陰極箔'];
const AssemblyCheckFields = ["core_diameter","inclusion_guid","finish_guid","gauge_number"];
const MachiningRideNotArray = ["id","code","description","diameter","liter","available","instruction"];
const MachiningTapingNotArray = ["id","code","description","diameter_range","l_dimension_range"];
const MachiningLFormingNotArray = ["id","code","description"];
const BZIElementListStr = ['display_code','back1','back2','back3','cost_company','date','slite','material_properties',
'table_name','type','series','tolerance','color','text_color','alternative_codes'];
const BZIElementListNum = ['range','thickness','ave_capacitance','max_capacitance','weight_conversion_factor','fold_diameter','angle','cost'
,'capacitance','voltage','formation_voltage'];

const CheckStepOne = ["capacitance_tolerance_level_inside","gauge_number","classification","destination"];
const CheckStepTwo = ["core_diameter","winding_guid","infiltration_rate"];
const CheckStepThree = ["inclusion_guid","finish_guid"];
const CheckStepFour = ["aging_voltage","aging_temperature","aging_time","aging_current"];
const AssemblyRequiredFields = ["l_dimension","diameter"];
//計算結果を確認しなければいけない要素
//const Confirmation_Ralculation_Results = ['陽極箔','陰極箔','電解紙','電解紙2','電解紙3','素子止めテープ','外チューブ'];
const Step2CheckParts = {
    '陽極箔':['code','length','range','thickness','quantity','weight','area','capacitance'],
    '陰極箔':['code','length','range','thickness','quantity','weight','area','capacitance'],
    '電解紙':['code','length','range','thickness','quantity','weight','area'],
    '電解紙2':['code','length','range','thickness','quantity','weight','area'],
    '電解紙3':['code','length','range','thickness','quantity','weight','area'],
    '素子止めテープ':['code','length','range','quantity']
}

const CheckData = {
    '陽極箔':['code','length','range','thickness','quantity','weight','area','capacitance'],
    '陰極箔':['code','length','range','thickness','quantity','weight','area','capacitance'],
    '電解紙':['code','length','range','thickness','quantity','weight','area'],
    '電解紙2':['code','length','range','thickness','quantity','weight','area'],
    '電解紙3':['code','length','range','thickness','quantity','weight','area'],
    '素子止めテープ':['code','length','range','quantity'],
    '外チューブ':['code','length','thickness','quantity','fold_diameter','material_properties'],
    '見積外チューブ':['length','thickness','fold_diameter','material_properties'],
    '梱包1':['code','quantity']
}
//const Confirmation_Ralculation_Results_element = ['code','length','range','thickness','quantity','weight','area'];

const ErrorList = {
    dessign_error_1:"設番/設番シリーズなし",
    product_error_1:"品番重複",
    product_error_2:"品番なし",
    product_error_3:"品番エラー",
    product_error_4:"品番の許容差が違う",
    capacitance_error:"許容される静電容量の値を超えている",
    assembly_error_1:"組立形式なし",
    assembly_error_2:"組立形式と品番の種類が違う",
    assembly_error_3:"組立形式のバンドの項目不一致1",
    assembly_error_4:"組立形式のバンドの項目不一致2",
    assembly_error_5:'組立形式エラー',
    assembly_error_6:'組立形式重複',
    assembly_error_7:'組立形式がデータベース内にない',
    data_parts_error_1:"部材情報が足りない",
    data_parts_error_4:"Tr,BL,SMの条件に合わない部材",
    data_parts_error_7:"100V以下に電解紙3コードある",
    data_parts_error_8:"重量換算係数がない",
    diameter_error:"φ径異常",
    l_dimension_error:"L寸異常",
    parts_error_0:"部材無し",
    parts_error_1:"必須部材不足",
    parts_error_2:"type必要部材不足",
    parts_error_3:"テーブル内にコード無し",
    search_number_error_1:"手配No.重複",
    search_number_error_2:"手配No.が量産以外についている",
    size_error:"素子径のほうがφ径より大きい",
    NullError:"設定値なし",
    infiltration_rate_Error:"化成電圧もしくは入力値とチェック無し",
    calculation_error:"計算式に必要なデータが足りていない",
    picture_error_1:"画像無し",
    tube_error_1:"記入無し",
    tube_error_2:"作成:重複あり",
    tube_error_3:"修正:重複無し",
    special_error_1:"チェックがあるのに数値が同じ",
    pre_wind_length_Error:"数値がないか設定値外",
    device_length_error_1:"素子長/紙長さ無しor数値異常",
    device_length_error_2:"巻きズラシ数値無し",
    device_length_error_3:"巻きズラシ合計が不一致",
}

const AttentionList = {
    data_parts_attention_1:"コスト情報がない",
    data_parts_attention_2:"指定値"
}

//面積計算を行うときに追加式が導入される設番
const setu = ["J2525","J2526","J2525-A","J2529","J2530","J2529-A","J2542","J2550","J2551","J2551-A","J2555","J2558","J2550-A","J2573","J2529-B","J2573-A","J2558-A","J2542-A","J2581","J2550-B","J2529-C","J2600","J2601","J2558-B","J2600-A"]

const cost_area_List = ['ap','ae','an'];
const cost_g_List = ['bl','lb','dg','gk'];
const cost_m_List = ['pq','ge'];

const PartsIndex = async (data,names) => {
    var ans = {};
    data.map((val,id)=>{
        if(val && val.name && names.includes(val.name)){
            var index = names.indexOf(val.name);
            ans[names[index]] = id;
        }
    })
    return ans
}

const SQLcolumns = async (table,data,columns) => {
    var change = await psql.PostgreSQLquery("SELECT * FROM " + table + " WHERE code = '" + data + "'");
    var ans = change[0][columns]
    if('available' in change[0] && change[0]['available'] === '2'){
        ans = data+"は現在登録されていない";
    }
    return ans
}

const RangeRead = async (tolerance) =>{
    var Tolerance = tolerance.match(Range_Read);
    ans = {};
    ans["plus"] = parseFloat(Tolerance[2]);
    ans["minus"] = parseFloat(Tolerance[1]);
    return ans
}

const MachiningCode = async (code,diameter,l_dimension) =>{
    var ans = {};
    var hinka = await psql.PostgreSQLquery("SELECT * FROM hinkari WHERE code = '" + code + "' and diameter = "+diameter);
    var kate = await psql.PostgreSQLquery("SELECT * FROM hinkate WHERE code = '" + code + "' and diameter_range @> "+diameter+"::numeric and l_dimension_range @> "+l_dimension+"::numeric");
    var kal = await psql.PostgreSQLquery("SELECT * FROM hinkal WHERE code = '"+code+"' and (l_dimension_range).reference = "+l_dimension);
    if(hinka.length !== 0){
        ans["Type"] = 'ride';
        for await (var key of Object.keys(hinka[0])){
            if(!MachiningRideNotArray.includes(key) && hinka[0][key]){
                ans[key] = await sds.ReferenceRange(hinka[0][key]);
            }
            else{
                ans[key] = hinka[0][key];
            }
        }
    }
    else if(kate.length !== 0){
        ans["Type"] = 'Taping';
        for await (var key of Object.keys(kate[0])){
            if(!MachiningTapingNotArray.includes(key) && kate[0][key]){
                ans[key] = await sds.ReferenceRange(kate[0][key]);
            }
            else{
                ans[key] = kate[0][key];
            }
        }
    }
    else if(kal.length !== 0){
        ans["Type"] = 'Lforming';
        for await (var key of Object.keys(kal[0])){
            if((!MachiningLFormingNotArray.includes(key)) && kal[0][key]){
                ans[key] = await sds.ReferenceRange(kal[0][key]);
            }
            else{
                ans[key] = kal[0][key];
            }
        }

    }
    return ans
}

const ProductClass = async (PrData,flg) => {
    var ans={};
    ans["code"] = PrData[0];
    ans["breed"] = await SQLcolumns("hin01",PrData[1],"kind");
    ans["series"] = await SQLcolumns("hin01",PrData[1],"code");
    ans["series"] = ans["series"] + await SQLcolumns("hin02",PrData[2],"code");
    ans["tolerance_special"] = false;
    if(regex2.test(PrData[3])){
        ans["voltage"] = await SQLcolumns("hin03",PrData[3],"voltage");
        ans["surge_voltage"] = await SQLcolumns("hin03",PrData[3],"surge_voltage");
        if(!ans["surge_voltage"]){
            if(ans["voltage"] >= 200){
                ans["surge_voltage"] = ans["voltage"] + 50;
            }
            else{
                ans["surge_voltage"] = Math.ceil(ans["voltage"] * 1.25);
            }
        }
    }
    else if(regex1.test(PrData[3])){
        ans["voltage"] = await SQLcolumns("hin04",PrData[3].substr(1,1),"voltage") * (10 ** parseFloat(PrData[3].substr(0,1)));
        if(ans["voltage"] >= 200){
            ans["surge_voltage"] = ans["voltage"] + 50;
        }
        else{
            ans["surge_voltage"] = Math.ceil(ans["voltage"] * 1.25);
        }
    }
    PrData[4] = await PrData[4].replace("R",".");
    if(parseFloat(PrData[4]) === NaN) {
        ans["capacitance"] = await SQLcolumns("hinse",PrData[4],"description");
    }
    else if(parseFloat(PrData[4]) % 1 !== 0){
        ans["capacitance"] = parseFloat(PrData[4])
    }
    else{
        ans["capacitance"] = parseFloat(PrData[4].substr(0,2)) * (10 ** parseFloat(PrData[4].substr(2,1)));
        ans["capacitance_move"] = 10 ** parseFloat(PrData[4].substr(2,1));
    }
    if(ans["capacitance"] <= 10){
        var tolerance = await SQLcolumns("hin05",PrData[5],"range");
        ans["capacitance_tolerance_level_outside"] = await RangeRead(tolerance);
        ans["plus_minus_num"] = await SQLcolumns("hin05",PrData[5],"available")
    }
    else{
        if(PrData[5] === 'A'){
            ans["tolerance_special"] = true;
        }
        else{
            var tolerance = await SQLcolumns("hin05",PrData[5],"range");
            ans["capacitance_tolerance_level_outside"] = await RangeRead(tolerance);
        }
    }
    if(flg === 1){
        ans["type"] = "tr";
        var hin07 = await psql.PostgreSQLquery("SELECT * FROM hin07 WHERE code = '" + PrData[6] + "'");
        ans["case"] = hin07[0].case
        ans["vent"] = hin07[0].vent
        ans["rubber"] = hin07[0].rubber
        var hin08 = await psql.PostgreSQLquery("SELECT * FROM hin08 WHERE code = '" + PrData[7] + "'");
        ans["tube"] = hin08[0].tube
        ans["seal"] = hin08[0].seal
        ans["lead"] = hin08[0].lead
        var user = PrData[8].match(HinTrOutUser);
        var hinka = PrData[8].match(HinTrOutKA);
        var mitu = PrData[8].match(HinOuter);
        if(hinka !== null){
            if(hinka[1] !== undefined){
                ans["machining"] = hinka[1];
            }
            else if(hinka[2] !== undefined){
                ans["machining"] = hinka[2];
            }
        }
        if(user !== null){
            ans["user_code"] = user[1];
            ans["user"] = await SQLcolumns("hinuser",user[1],"user");
        }
    }
    else if(flg === 2 || flg === 4){
        ans["type"] = "sm";
        Change = await psql.PostgreSQLquery("SELECT * FROM hin06 WHERE code = '" + PrData[6] + "'");
        ans["port"] = Change[0].description
        ans["port_left"] = Change[0].left
        ans["port_right"] = Change[0].right
        var band = PrData[7].match(HinSMOut);
        if(band[1] !== undefined){
            ans["casedia"] = await SQLcolumns("hincasedia",band[1],"fai_d");
            var ban = await psql.PostgreSQLquery("SELECT * FROM hinband WHERE code = '" + band[2] + "'");
            ans["band"] = ban;
            var user = await psql.PostgreSQLquery("SELECT * FROM hinuser WHERE code = '" + band[2] + "'");
            ans["user"] = user;
        }
        else if(band[3] !== undefined){
            if(band[3] === ''){
                var ban = await psql.PostgreSQLquery("SELECT * FROM hinband WHERE code IS NULL");
                ans["band"] = ban;
            }
            else{
                var ban = await psql.PostgreSQLquery("SELECT * FROM hinband WHERE code = '" + band[3] + "'");
                if('description' in ban){
                    ans["band"] = ban[0].description
                }
                else{
                    ans["casedia"] = await SQLcolumns("hincasedia",band[3],"fai_d");
                    ban = await psql.PostgreSQLquery("SELECT * FROM hinband WHERE code IS NULL AND id = 0");
                    ans["band"] = ban[0].description
                }
            }
        }
        var mitu = PrData[7].match(HinOuter);
    }
    else if(flg === 3 || flg === 5){
        ans["type"] = "bl";
        Change = await psql.PostgreSQLquery("SELECT * FROM hin06 WHERE code = '" + PrData[6] + "'");
        ans["port"] = Change[0].description
        ans["port_left"] = Change[0].left
        ans["port_right"] = Change[0].right
        var casedia = PrData[7].match(HinBLOut);
        if(casedia !== null){
            if(PrData[6] === 'ER' & casedia[1] !== undefined){
                ans['casedia'] = await SQLcolumns("hincasedia",casedia[1],"fai_d")
                ans['pitch'] = SQLcolumns("hinpitch",casedia[2],"description")
            }
            else if(PrData[6] === 'ER' & casedia[6] !== undefined){
                ans['pitch'] = SQLcolumns("hinpitch",casedia[6],"description")
            }
            else if(casedia[1] !== undefined){
                //ans['casedia'] = await SQLcolumns("hincasedia",casedia[1],"fai_d")
                ans['serial_number'] = casedia[1]
                ans['user'] = await SQLcolumns("hinuser",casedia[2],"user")
            }
            else if(casedia[3] !== undefined){
                ans['casedia'] = await SQLcolumns("hincasedia",casedia[3],"fai_d")
                ans['casehigh'] = casedia[4]
            }
            else if(casedia[5] !== undefined){
                ans['casedia'] = await SQLcolumns("hincasedia",casedia[5],"fai_d")
            }
        }
        var mitu = PrData[7].match(HinOuter);
    }

    if(mitu !== null){
        var SeacretNo = await psql.PostgreSQLquery("SELECT * FROM hinmitu WHERE code = '"+mitu[1]+"'")
        ans["secretNo"] = SeacretNo[0];
    }
    var hintoku = await psql.PostgreSQLquery("SELECT * FROM hintoku WHERE code = '" + PrData[0] + "'");
    for(var row of hintoku){
        if(row.description.includes('hinka') && row.description.includes('code')){
            ans["machining"] = row.truevalue;
        }
        if(row.description.includes('hinuser') && row.description.includes('code')){
            ans["user_code"] = row.truevalue;
            ans["user"] = await SQLcolumns("hinuser",row.truevalue,"user");
        }
        if(row.description.includes('hinuser') && row.description.includes('description')){
            ans["user"] = row.truevalue;
        }
        if(row.description.includes('hinse') && row.description.includes('description')){
            ans["capacitance"] = row.truevalue;
        }
    }
    if(ans.type === 'bl' && ans.voltage === 250 && ans.surge_voltage === 300){
        ans.surge_voltage === 270;
    }
    return ans
};

const AssemblyClass = async (AsData,flg) => {
    let ans = {};
    ans["code"] = AsData[0];
    if(flg === 1){
        ans["type"] = "tr";
        ans["adoption"] = await SQLcolumns("tr01",AsData[1],"description"); 
        ans["case"] = await SQLcolumns("tr02",AsData[2],"description");
        ans["diameter"] = parseFloat(AsData[3]);
        ans["l_dimension"] = parseFloat(AsData[4]);
        ans["seal_structure"] = await SQLcolumns("tr05",AsData[5],"description");
        ans["seal_material"] = await SQLcolumns("tr06",AsData[6],"description");
        ans["ride_material"] = await SQLcolumns("tr07",AsData[7],"description");
        ans["ride_length"] = await SQLcolumns("tr08",AsData[8],"description");
        ans["tube_material"] = await SQLcolumns("tr09",AsData[9],"description");
    }
    else if (flg === 2){
        ans["type"] = "sm";
        ans["adoption"] = await SQLcolumns("sm01",AsData[1],"description"); 
        ans["terminal_shape"] = await SQLcolumns("sm02",AsData[2],"description"); 
        ans["band"] = await SQLcolumns("sm03",AsData[3],"description");
        ans["band_available"] = await SQLcolumns("sm03",AsData[3],"available");
        ans["diameter"] = parseFloat(AsData[5]);
        ans["l_dimension"] = parseFloat(AsData[6]);
        ans["shape"] = await SQLcolumns("sm07",AsData[7],"description");
        if(AsData[8] === ''){
            var sm08 = await psql.PostgreSQLquery("SELECT * FROM sm08 WHERE code IS NULL");
        }
        else{
            var sm08 = await psql.PostgreSQLquery("SELECT * FROM sm08 WHERE code = '" + AsData[8] + "'");
        }
        ans["special_description"] = sm08[0].description;
        ans["special"] = AsData[8];
    }
    else if (flg === 3){
        ans["type"] = "bl";
        ans["adoption"] = await SQLcolumns("bl01",AsData[1],"description");
        ans["port"] = await SQLcolumns("bl02",AsData[2],"description");
        ans["port_pitch"] = await SQLcolumns("bl03",AsData[3],"description");
        ans["diameter"] = parseFloat(AsData[4]);
        ans["l_dimension"] = parseFloat(AsData[5]);
        var bl06 = await psql.PostgreSQLquery("SELECT * FROM bl06 WHERE code = '" + AsData[6] + "'");
        ans["port_num"] = bl06[0].values;
        ans["beading"] = bl06[0].description;
        if(ans["diameter"]<=40 & ans["l_dimension"]<=90){
            if(AsData[7]===''){
                var bl07 = await psql.PostgreSQLquery("SELECT * FROM bl07 WHERE code IS NULL");
            }
            else{
                var bl07 = await psql.PostgreSQLquery("SELECT * FROM bl07 WHERE code = '" + AsData[7] + "'");
            }
            ans["board_terminal"] = bl07[0].description;
        }
        else{
            if(AsData[7]===''){
                var bl08 = await psql.PostgreSQLquery("SELECT * FROM bl08 WHERE code IS NULL");
            }
            else{
                var bl08 = await psql.PostgreSQLquery("SELECT * FROM bl08 WHERE code = '" + AsData[7] + "'");
                var L_check = bl08[0].description.match(BLSpecial_L);
                var F_check = bl08[0].description.match(BLSpecial_F);
                if(L_check !== null){
                    if(L_check[2] === 'UP'){
                        ans["special_l_dimension"] = 1*parseFloat(L_check[1]);
                    }
                    else if(L_check[2] === 'DOWN'){
                        ans["special_l_dimension"] = -1*parseFloat(L_check[1]);
                    }
                }
                if(F_check !== null){
                    if(F_check[3] === 'UP'){
                        ans["special_l_dimension"] = 1*parseFloat(F_check[2]);
                    }
                    else if(F_check[3] === 'DOWN'){
                        ans["special_l_dimension"] = -1*parseFloat(F_check[2]);
                    }
                    else if(F_check[1] === 'アトビ'){
                        ans["special_description"] = F_check[1];
                    }
                }
            }
            ans["large"] = bl08[0].description;
            ans["special"] = AsData[7];
        }
    }
    return ans
}

const HandoverItem = ["table_name","name","code"];
const HandoverItemNum = ["quantity","range","length"];
const PartsClass = async (Data,tables) => {
    let ans = [];
    for await(var val of Data.parts){
        let ANS = {};
        for (var item of HandoverItem){
            val[item]?ANS[item] = val[item]:"";
        }
        for (item of HandoverItemNum){
            val[item]?ANS[item] = parseFloat(val[item]):"";
        }
        if(val.code){
            var BZItable = tables[val.table_name].table.filter((item)=>item.code === val.code);
            if(BZItable.length !== 0){
                for await(var key of Object.keys(BZItable[0])){
                    if(BZIElementListStr.includes(key)){
                        if(key === 'display_code'){
                            ANS[key] = BZItable[0][key]
                            var display = tables['display'].table.filter((val2)=>ANS[key] === val2.code);
                            Data['Picture'] = display[0];
                        }
                        else{
                            ANS[key] = BZItable[0][key]
                        }
                    }
                    else if(key === 'min_capacitance'){
                        ANS["capacitance"] = parseFloat(BZItable[0][key]);
                    }
                    else if(BZIElementListNum.includes(key)){
                        ANS[key] = parseFloat(BZItable[0][key]);
                    }
                }
            }
        }
        ans.push(ANS);
    }
    Data['parts'] = ans
    return Data
}

const PartsChack = async (Data,parts,tables) => {
    let ans = [];
    for await(var val of parts){
        //let ANS = val;
        let ANS = {};
        for (var item of HandoverItem){
            ANS[item] = val[item];
        }
        for (item of HandoverItemNum){
            ANS[item] = parseFloat(val[item]);
        }
        if(val.code){
            var BZItable = tables[val.table_name].table.filter((item)=>item.code === val.code);
            if(BZItable.length !== 0){
                for await(var key of Object.keys(BZItable[0])){
                    if(BZIElementListStr.includes(key)){
                        if(key === 'display_code'){
                            ANS[key] = BZItable[0][key];
                            var display = tables['display'].table.filter((val2)=>ANS[key] === val2.code);
                            Data['Picture'] = display[0];
                        }
                        else{
                            ANS[key] = BZItable[0][key]
                        }
                    }
                    else if(key === 'min_capacitance'){
                        ANS["capacitance"] = parseFloat(BZItable[0][key]);
                    }
                    else if(BZIElementListNum.includes(key)){
                        ANS[key] = parseFloat(BZItable[0][key]);
                    }
                }
            }
            else{
                ANS = val;
                ANS["error"] = ErrorList.parts_error_3;
            }
        }
        ans.push(ANS);
    }
    Data['parts'] = ans
    return Data
}

const Display = async (Data,color,text_color) => {
    if(Data){
        //画像変換 base64 ⇔ Buffer
        var image = await psql.PostgreSQLquery(`SELECT * FROM image WHERE code ='${Data.image_code}'`);
        if(image.length !== 0){
            Data.SetPic = Buffer.from(image[0].image).toString('base64');
            //const test = Buffer.from(row.SetPic,'base64');
            //画像加工 後 base64化
            var DATA = await CP.PicChange(image[0].image,color,text_color);
            Data.ViewPic = DATA.data;
            Data.width = DATA.width;
            Data.height = DATA.height;
        }
    }
    return Data
}
//10**3で割るのはμAからmAに変換している.
//10**6で割っているのは静電容量をμFからFに変換している
const LeakCurrent = async(Data) =>{
    if(Data.product.series.slice(0,1) === 'J'){
        Data["outside_leakage_current"] = Data.product.capacitance / 2 / (10**6);
        Data["inside_leakage_current"] = (Data.product.capacitance / 2) * 0.9 / (10**6);
    }
    else{
        var SQL = `SELECT * FROM leak_current WHERE (series = '${Data.product.series.slice(1,3)}' or series IS NULL)`
        SQL+= ` and voltage @> ${Data.product.voltage}::numeric and capacitance @> ${Data.product.capacitance}::numeric`
        SQL+= ` and (type = '${Data.product.type}' or type = 'all')`
        var specialLeak = await psql.PostgreSQLquery(SQL)
        if(specialLeak.length !== 0){
            var data = specialLeak[0];
            if(data.in_sqrt){
                var in_vol_cap = Math.sqrt(Data.product.voltage*Data.product.capacitance)
            }
            else {
                var in_vol_cap = Data.product.voltage*Data.product.capacitance;
            }
            if(data.out_sqrt){
                var out_vol_cap = Math.sqrt(Data.product.voltage*Data.product.capacitance)
            }
            else {
                var out_vol_cap = Data.product.voltage*Data.product.capacitance;
            }
            Data["outside_leakage_current"] = out_vol_cap * data.out_multiplication / data.out_division / (10**3);
            Data["inside_leakage_current"] = in_vol_cap * data.in_multiplication / data.in_division / (10**3);
        }
        else{
            Data["outside_leakage_current"] = Math.sqrt(Data.product.voltage*Data.product.capacitance) * 3 / (10**3);
            Data["inside_leakage_current"] = Math.sqrt(Data.product.voltage*Data.product.capacitance) / (10**3);
        }
    }
    if(Data.product.breed === 'アルミニウム電解コンデンサ'){
        Data["aging_current"] = Data["inside_leakage_current"]*2;
    }
    return Data
}

const CalculationAssignment = async (Data,dns) => {
    var count = 0;
    var denList = [];
    for await(let i of Data.parts){
        if(i.name.indexOf('電解紙') !== -1){
            denList.push(count);
        }
        if(i.name === '陽極箔'){
            var you = count;
        }
        else if(i.name === '陰極箔'){
            var ink = count;
        }
        else if(i.name === '保護箔'){
            var hog = count;
        }
        else if(i.name === '保護紙'){
            var hos = count;
        }
        else if(i.name === '+リードタブ'){
            var ptab = count;
        }
        else if(i.name === '-リードタブ'){
            var mtab = count;
        }
        else if(i.name === '素子止めテープ'){
            var sosi = count;
        }
        else if(i.name === '電解液'){
            var paste = count;
        }
        else if(i.name === '素子固定材'){
            var gk = count;
        }
        else if(i.name === '外チューブ' && i.display_code){
            if(Data.Picture){
                Data.Picture = await Display(Data.Picture,i.color,i.text_color);
            }
        }
        count = count + 1
    }
    Data.cotoff_factor = (Data.parts[you].capacitance + Data.parts[ink].capacitance) / (Data.parts[you].capacitance * Data.parts[ink].capacitance * Data.infiltration_rate / 100)

    Data.parts[you].area = (Data.product.capacitance / 10 ** 6) * (1+parseFloat(dns.target_value)/100) * Data.cotoff_factor;
    let dessign = setu.filter((val)=> val === dns.dessign);
    Another = (((Data.assembly.l_dimension == 11.5) & (Data.assembly.diameter == 8) & (dessign.length === 1)) | ((Data.assembly.l_dimension == 12.5) & (Data.assembly.diameter == 10) & (Data.parts[you].range == 7)) | ((Data.assembly.l_dimension == 20) & (Data.assembly.diameter == 8) & (Data.parts[you].range == 13.7)) | ((Data.assembly.l_dimension == 20) & (Data.assembly.diameter == 10) & (Data.parts[you].range == 13.7)))
    if(Another){
        Data.parts[you].area = Data.parts[you].area + 13 * Data.parts[you].range / 100
    }
    Data.parts[you].length = Data.parts[you].area * 100 / Data.parts[you].range
    Data.parts[you].weight = Data.parts[you].area * Data.parts[you].weight_conversion_factor
    
    Data.parts[paste].weight = 0;
    if((Data.assembly.l_dimension === 11.5) & (Data.assembly.diameter == 8) & (Data.assembly.type == 'tr')){
        Data.parts[ink].length = Data.parts[you].length + 5
    }
    else if(Data.assembly.type === 'sm'){
        Data.parts[ink].length = Data.parts[denList[0]].length
    }
    else{
        Data.parts[ink].length = Data.parts[you].length + 40
    }
    Data.parts[ink].area = Data.parts[ink].length * Data.parts[ink].range / 100
    Data.parts[ink].weight = Data.parts[ink].area * Data.parts[ink].weight_conversion_factor
    Data.total_thickness = 0;
    for(var index of [you,ink].concat(denList)){
        Data.total_thickness+= Data.parts[index].thickness * Data.parts[index].quantity
    }
    Data.total_thickness = Data.total_thickness / 1000 + Number(dns.total_thickness_correction_factor);
    Data.device_diameter = Math.sqrt(4/Math.PI*Data.total_thickness*Data.parts[you].length+(dns.core_diameter ** 2))
    if(mtab && ptab){
        if(Data.product.series.indexOf('AK') !== -1){
            if(!dns.pre_wind_length || dns.pre_wind_length < 150 || dns.pre_wind_length > 300){
                Data.before_winding_length_Error = ErrorList.pre_wind_length_Error;
                Data.check = true;
                dns.pre_wind_length = 150;
            }
            Data.pre_wind_length = dns.pre_wind_length;
            var tab_qu = Data.parts[ptab].quantity
        }
        else if(Data.parts[ptab].quantity > 1){
            Data.pre_wind_length = 110
            var tab_qu = Data.parts[ptab].quantity
        }
        else{
            Data.pre_wind_length = 60
            var tab_qu = 1
        }
        //タブ長さ計算
        if(Data.assembly.diameter > 40){
            Data.parts[ptab].length = Data.parts[ink].range + Data.assembly.diameter;
            Data.parts[mtab].length = Data.parts[ink].range + Data.assembly.diameter;
        }else if(Data.assembly.diameter <= 40){
            Data.parts[ptab].length = Data.parts[ink].range + 40;
            Data.parts[mtab].length = Data.parts[ink].range + 40;
        }
        //保護箔
        if(hog){
            Data.parts[hog].length = Data.assembly.type == 'bl'?100:150;
            Data.parts[hog].quantity = Data.parts[mtab].quantity;
            Data.parts[hog].area = Data.parts[hog].range * Data.parts[hog].length * Data.parts[hog].quantity / 100;
            Data.parts[hog].weight = Data.parts[hog].area * Data.parts[hog].weight_conversion_factor;
        }
        //保護紙
        if(hos && Data.parts[denList[0]].range){
            Data.parts[hos].length = Data.parts[denList[0]].range;
            Data.parts[hos].quantity = Data.parts[ptab].quantity;
        }
    }
    else{
        Data.pre_wind_length = 60
        var tab_qu = 1
    }
    for await(index of denList){
        Data.parts[index].length = Data.pre_wind_length + (Data.parts[you].length * 1.03) + (Data.device_diameter * Math.PI * tab_qu)
        Data.parts[index].area = Data.parts[index].range * Data.parts[index].length * Data.parts[index].quantity / 100
        if('weight_conversion_factor' in Data.parts[index]){
            Data.parts[index].weight = Data.parts[index].area * Data.parts[index].weight_conversion_factor;
        }
        else{
            //後の式に問題があると問題なのでここで1.2を仮定する.
            Data.parts[index].weight = Data.parts[index].area * 1.2;
            Data.parts[index].error = ErrorList.data_parts_error_8;
            Data.check = true;
        }
        Data.parts[paste].weight += (Data.parts[index].length / 10) * (Data.parts[index].range/10) * (Data.parts[index].thickness/10000) * Data.parts[index].quantity
    }
    if(Data.assembly.type == 'tr' || Data.assembly.type == 'sm'){
        Data.parts[paste].weight = Data.parts[paste].weight * 2;
    }
    else if(Data.assembly.type == 'bl' && Data.assembly.diameter >= 30 && Data.assembly.l_dimension >= 50){
        Data.parts[paste].weight = Data.parts[paste].weight * 1.1;
    }
    else if(Data.assembly.type == 'bl'){
        Data.parts[paste].weight = Data.parts[paste].weight * 1.2;
    }
    Data.parts[sosi].length = Data.device_diameter * Math.PI * 1.5;
    if(gk){
        //EDLCだと下記の式だった、式自体がかなり近いがとりあえずプレミアに統一
        //Data.parts[gk].weight = (((Data.assembly.diameter**2) - (Data.device_diameter**2)) * Data.device_length / 2) * (Math.PI / 4) / 1000 * 0.85
        Data.parts[gk].weight = ((Data.assembly.diameter**2) - (Data.device_diameter**2)) * 0.00047 * Data.device_length * 0.86;
    }
    
    for (var key in Data.parts){
        if(cost_area_List.includes(Data.parts[key].table_name)){
            Data.parts[key].cost = Data.parts[key].cost/10000*Data.parts[key].area;
        }
        else if(cost_g_List.includes(Data.parts[key].table_name)){
            Data.parts[key].cost = Data.parts[key].cost*Data.parts[key].weight;
        }
        else if(cost_m_List.includes(Data.parts[key].table_name)){
            Data.parts[key].cost = Data.parts[key].cost/1000*Data.parts[key].length;
        }
        else{
            Data.parts[key].cost = Data.parts[key].cost*Data.parts[key].quantity;
        }
    }
    return Data
}

const SpecialDataCheck = async (data,Data,check=false) => {
    flg = false
    var test1;
    var test2;
    if(data.parts){
        test1 = await PartsIndex(data.parts,Foil);
    }
    if(Data.parts){
        test2 = await PartsIndex(Data.parts,Foil);
    }
    if(data.product){
        var Cap = Data.capacitance?Data.capacitance:Data.Product && Data.Product.capacitance?Data.Product.capacitance:undefined;
        if(fnc.Hollow2(data.product.capacitance) && Cap && (0 > (Cap - data.product.capacitance) || (Cap - data.product.capacitance) >= data.product.capacitance_move)){
            data["capacitance_Error"] = ErrorList.capacitance_error;
            data.product.capacitance = Cap;
            data.check = true;
        }else if(((Data.Product && Data.Product.capacitanceSpecial) || check) && Math.abs(Cap - data.product.capacitance) >= 0.001){
            data.product.capacitance = Cap;
            if(check){
                data.product.capacitanceSpecial = true;
            }
        }
        if(data.product.tolerance_special){
            data.product.capacitance_tolerance_level_outside = Data.capacitance_tolerance_level_outside;
            flg = true
        }else if(!data.product.tolerance_special && Data.Product && Data.Product.capacitance_tolerance_level_outside && 
            Data.Product.capacitance_tolerance_level_outside.plus && 
            Data.Product.capacitance_tolerance_level_outside.minus && 
            !(Math.abs(data.product.capacitance_tolerance_level_outside.plus - Data.Product.capacitance_tolerance_level_outside.plus) <= 0.0001 && 
            Math.abs(data.product.capacitance_tolerance_level_outside.minus - Data.Product.capacitance_tolerance_level_outside.minus) <= 0.0001)){
            data.product.error = ErrorList.product_error_4
            data.check = true;
        }
    }
    if(Data.LeakCurrentCheck || check){
        if((Math.abs(Data.outside_leakage_current - data.outside_leakage_current) > 0.0001 || 
        Math.abs(Data.inside_leakage_current - data.inside_leakage_current) > 0.0001) && check){
            data.LeakCurrentCheck = true
        }
        data.outside_leakage_current = Data.outside_leakage_current;
        data.inside_leakage_current = Data.inside_leakage_current;
    }if((Data.InfiltrationRateCheck || check) && Data.infiltration_rate){        
        if(test1 && data.parts[test1['陽極箔']].formation_voltage && !data.infiltration_rate){
            if(data.product.voltage >= 160 || (0 > data.parts[test1['陽極箔']].formation_voltage || data.parts[test1['陽極箔']].formation_voltage > 199)){
                data.infiltration_rate = 97
            }
            else{
                data.infiltration_rate = 92
            }
        }
        else{
            data.infiltration_rate = 90
        }
        if(Math.abs(Data.infiltration_rate - data.infiltration_rate) > 0.0001 && check){
            data.InfiltrationRateCheck = true
        }
        data.infiltration_rate = Data.infiltration_rate;
    }if(test1 && test2 && Data.parts[test2['陽極箔']].capacitance && data.parts[test1['陽極箔']].capacitance && (Data.parts[test2['陽極箔']].CapacitanceSpecial || check)){
        if(Math.abs(Data.parts[test2['陽極箔']].capacitance - data.parts[test1['陽極箔']].capacitance) <= 0.00001 && !check){
            data.parts[test1['陽極箔']].error = ErrorList.special_error_1;
        }else if(Math.abs(Data.parts[test2['陽極箔']].capacitance - data.parts[test1['陽極箔']].capacitance) > 0.00001 && check){data.parts[test1['陽極箔']].CapacitanceSpecial = true}
        data.parts[test1['陽極箔']].capacitance = Data.parts[test2['陽極箔']].capacitance;
    }if(test1 && test2 && Data.parts[test2['陰極箔']].capacitance && data.parts[test1['陰極箔']].capacitance && (Data.parts[test2['陰極箔']].CapacitanceSpecial || check)){
        if(Math.abs(Data.parts[test2['陰極箔']].capacitance - data.parts[test1['陰極箔']].capacitance) <= 0.00001 && !check){
            data.parts[test1['陰極箔']].error = ErrorList.special_error_1;
        }else if(Math.abs(Data.parts[test2['陰極箔']].capacitance - data.parts[test1['陰極箔']].capacitance) > 0.00001 && check){data.parts[test1['陰極箔']].CapacitanceSpecial = true}
        data.parts[test1['陰極箔']].capacitance = Data.parts[test2['陰極箔']].capacitance;
    }
    //組立形式の呼び出しで呼び出された組立形式から外れた数値が入っている場合
    if(data.assembly){
        var l_dimension = Data.l_dimension?Data.l_dimension:Data.Assembly && Data.Assembly.l_dimension?Data.Assembly.l_dimension:null;
        var diameter = Data.diameter?Data.diameter:Data.Assembly && Data.Assembly.diameter?Data.Assembly.diameter:null;
        if(data.assembly.l_dimension && l_dimension && Math.abs(data.assembly.l_dimension - l_dimension) >= 0.00001){
            if(0<(l_dimension - data.assembly.l_dimension) && (l_dimension - data.assembly.l_dimension) < 1){
                data.assembly.l_dimension = parseFloat(l_dimension);
                flg = true;
            }else{
                data["l_dimension_Error"] = ErrorList.l_dimension_error;
                data.assembly.l_dimension = parseFloat(l_dimension);
                flg = true
            }
        }if(data.assembly.diameter && diameter && Math.abs(data.assembly.diameter - diameter) >= 0.00001){
            if(0<(diameter - data.assembly.diameter) && (diameter - data.assembly.diameter) < 1){
                data.assembly.diameter = parseFloat(diameter);
                flg = true;
            }else{
                data["diameter_Error"] = ErrorList.diameter_error;
                data.assembly.diameter = parseFloat(diameter);
                flg = true
            }
        }
    }
    //異常値(現在は箔の静電容量だけを引っ張ってくる後は異常値と認めない)
    if(data.anomaly){
        data.anomaly.map((val)=>{
            if(val["name"] === '陽極箔' && val["element"] === 'capacitance'){
                data.parts[test1['陽極箔']].capacitance = parseFloat(val.value);
                data.parts[test1['陽極箔']].CapacitanceSpecial = true;
            }if(val["name"] === '陰極箔' && val["element"] === 'capacitance'){
                data.parts[test1['陰極箔']].capacitance = parseFloat(val.value);
                data.parts[test1['陰極箔']].CapacitanceSpecial = true;
            }if(val["name"] === '先巻長さ' && val["element"] === 'length'){
                data.pre_wind_length = parseFloat(val.value);
                data.BeforeWindingCheck = true;
            }
        })
    }
    return flg
}

const ProductJudgment = async (Product,data) =>{
    if(EDTr.indexOf(Product.substr(1,2)) > -1){
        var PrData = Product.match(HinTrSei);
        data["product"] = await ProductClass(PrData,1);
    }
    else{
        var PrData = Product.match(HinSMBLSei);
        if(EDSM.indexOf(Product.substr(1,2)) > -1){
            data["product"] = await ProductClass(PrData,2);
        }
        else if(EDBL.indexOf(Product.substr(1,2)) > -1){
            data["product"] = await ProductClass(PrData,3);
        }
        else if(HinSm.indexOf(Product.substr(9,2)) > -1){
            data["product"] = await ProductClass(PrData,4);
        }
        else{
            data["product"] = await ProductClass(PrData,5);
        }
    }
    data["product"]["PrData"] = PrData;
    return data
}

const AssemblyJudgment = async (Assembly,data) => {
    var as1 = await psql.PostgreSQLquery("SELECT code FROM tr01");
    //ここに組立形式テーブルのデータを呼び出す関数を入れる。
    if(as1[0].code.indexOf(Assembly.substr(0,1)) > -1){
        var AsData = Assembly.match(TrSei);
        data["assembly"] = await AssemblyClass(AsData,1)
        data.type = "tr"
    }
    else if(Assembly.substr(1,2) !== 'AC' & !isNaN(Assembly.substr(3,1))){
        var AsData = Assembly.match(SMSei);
        data["assembly"] = await AssemblyClass(AsData,2)
        data.type = "sm"
    }
    else{
        var AsData = Assembly.match(BLSei);
        data["assembly"] = await AssemblyClass(AsData,3);
        data.type = "bl"
    }
    data["assembly"]["AsData"] = AsData;
    return data
}

const ScheduleCall = async (dessign) => {
    var schedule = await psql.PostgreSQLquery("SELECT id,deadline,lot FROM production_schedule WHERE dessign = '"+dessign+"';")
    return schedule
}

exports.ReadCode = async (Data,flg) =>{
    let data ={}
    if(flg === 1){
        data = await ProductJudgment(Data.Product.code,data);
        if(!Data.LeakCurrentCheck){
            data = await LeakCurrent(data);
        }
    }
    else if(flg === 2){
        data = await AssemblyJudgment(Data.Assembly.code,data);
    }
    return data
}

exports.CodeAssembly = async function(Data){
    let data = {};
    data = await AssemblyJudgment(Data.data.code,data);
    let parts = [];
    for await(row of Data.data.parts){
        parts.push(row);
    }
    data["parts"] = parts;
    data["core_diameter"] = Data.data.core_diameter;
    data["special"] = await SpecialDataCheck(data,Data.data);
    return data
}
//テーブルから呼び出した製品仕様書をデータ化する。
exports.CodeClassification = async function(Data){
    let data ={}
    if('Product' in Data){
        if(Data.Product && Data.Product.dessign){
            data["schedule"] = await ScheduleCall(Data.Product.dessign);
        }
        if(Data.Product !== "" && Data.Product !== null){
            if('code' in Data.Product){
                data = await ProductJudgment(Data.Product.code,data);
                data = await LeakCurrent(data);
            }
            if('assembly' in Data.Product){
                data = await AssemblyJudgment(Data.Product.assembly,data);
            }
            if('parts' in Data.Product){
                data.parts = Data.Product.parts;
                data = await PartsClass(data,Data.tables)
                //ここだけ特殊にする
                data["special"] = await SpecialDataCheck(data,Data.Product,true);
                data = await CalculationAssignment(data,Data.Product);
            }
            if(data.product.machining){
                data["machining"] = await MachiningCode(data.product.machining,data.assembly.diameter,data.assembly.l_dimension);
            }
        }
    }
    return data
}
//変更した数値で計算や呼び出しを行い、チェックする。
//製品仕様書チェック
const CheckProdcutColumn = ["code","capacitance","voltage","capacitance_tolerance_level_outside"];
const CheckAssemblyColumn = ["code","diameter","l_dimension"];
exports.Calculation = async function(Data,Tables,state,step){
    let data = {};
    data.check = false;
    if(Data){
        //1step以降ずっと行う物::製品性能
        if(step >= 0){
            if(Data.Product.code){
                data = await ProductJudgment(Data.Product.code,data);
                data = await LeakCurrent(data);
            }
            else{
                data.product.error = ErrorList.product_error_2;
                data.check = true;
            }
            //エラーチェック
            for (var row of CheckProdcutColumn){
                if(row = 'capacitance_tolerance_level_outside'){
                    if(!fnc.Hollow2(Data.Product[row].plus) || !fnc.Hollow2(Data.Product[row].minus)){
                        data.product.error = ErrorList.product_error_4;
                        data.check = true;
                    }
                }
                else if(!Data.Product[row]){
                    data.product.error = ErrorList.product_error_4;
                    data.check = true;
                }
            }
            if(Data.Assembly.code){
                data = await AssemblyJudgment(Data.Assembly.code,data);
            }
            else{
                data.assembly = {};
                data.assembly.error = ErrorList.assembly_error_1;
                data.check = true;
            }
            if(data.product.machining && data.assembly.l_dimension && data.assembly.diameter){
                data["machining"] = await MachiningCode(data.product.machining,data.assembly.diameter,data.assembly.l_dimension);
            }
            data["special"] = await SpecialDataCheck(data,Data);
            for(row of CheckAssemblyColumn){
                if(!Data.Assembly[row]){
                    data.assembly.error = ErrorList.product_error_4;
                    data.check = true;
                }
            }
            if(Data.Product.type !== Data.Assembly.type){
                data.assembly.error = ErrorList.assembly_error_2
                data.check = true;
            }
            for(row of CheckStepOne){
                if(row === "capacitance_tolerance_level_inside"){
                    if(!fnc.Hollow2(Data[row].minus) || !fnc.Hollow2(Data[row].plus)){
                        data[row+"_Error"] = ErrorList.NullError;
                        data.check = true;
                    }
                }
                else if(!Data[row] && row === 'gauge_number' && Data["classification"] === '見積'){
                    continue;
                }
                else if(!Data[row]){
                    data[row+"_Error"] = ErrorList.NullError;
                    data.check = true;
                }
            }
            if(Data.search_number && Data.classification === '量産'){
                var check = await psql.PostgreSQLquery("SELECT code,search_number FROM product WHERE search_number = '"+Data.search_number+"';");
                if(check.length !== 0){
                    data.search_number_Error = ErrorList.search_number_error_1
                    data.check = true;
                }
            }
            else if(Data.search_number || Data.classification === '量産'){
                data.search_number_Error = ErrorList.search_number_error_2
                data.check = true;
            }
            var checkstr = "は現在登録されていない"
            for(row in data.product){
                if(checkstr.indexOf(data.product[row]) > -1){
                    data.product.error = ErrorList.product_error_3
                    data.check = true;
                }
            }
            for(row in data.assembly){
                if(checkstr.indexOf(data.assembly[row]) > -1){
                    data.assembly.error = ErrorList.assembly_error_5
                    data.check = true;
                }
            }
            if('band_available' in data.assembly){
                if(data.assembly.band_available === '0'){
                    var count = 0;
                    for(row of Data.parts){
                        if(row.name === 'バンド'){
                            count = count + 1;
                        }
                    }
                    if(count !== 1){
                        data.assembly.error = ErrorList.assembly_error_3
                        data.check = true;
                    }
                }
                else if(data.assembly.band_available === '1'){
                    for(row of data.parts){
                        if(row.name === 'バンド'){
                            data.assembly.error = ErrorList.assembly_error_4
                            data.check = true;
                            break;
                        }
                    }
                }
            }
            if(!(1 <= state && state <= 2)){
                var check = await psql.PostgreSQLquery("SELECT code,dessign FROM product WHERE code = '" + Data.Product.code + "';");
                if(check.length !== 0 && state !== 4){
                    data.product.error = ErrorList.product_error_1;
                    data.check = true;
                }
                if(Data.dessign_ && state === 3){
                    var max = await psql.PostgreSQLquery(`SELECT max(re[2]) FROM (SELECT REGEXP_MATCHES(dessign,'([A-Z]+)([0-9]+)-?(.*)') as re FROM product) as foo WHERE re[1] = '${Data.dessign_}';`)
                    max = parseInt(max[0].max)+1;
                    data.dessign = Data.dessign_+max;
                }else if(Data.dessign && state === 4){
                    var dessign = Data.dessign.replace(/-[0-9A-Z]+/,"");
                    var max = await psql.PostgreSQLquery("SELECT max(re[3]) FROM (SELECT REGEXP_MATCHES(dessign,'([A-Z]+)([0-9]+)-?(.*)') as re FROM product WHERE dessign like '"+dessign+"%') as foo WHERE re[3] ~ '[0-9]+';")
                    if(!max[0].max){
                        max = 0;
                    }
                    else{
                        max = parseInt(max[0].max);
                    }
                    data.dessign = dessign+"-"+(max+1);
                }
                else{
                    data.dessign_Error = ErrorList.dessign_error_1;
                    data.check = true;
                }
            }
        }
        //2step以降::加締・巻取
        if(step >= 1){
            var Element = Data.parts.filter((val) => val !== null && val.name);
            for await(row of CheckStepTwo){
                if(!Data[row]){
                    data[row+"_Error"] = ErrorList.NullError;
                    data.check = true;
                }
            }
            if(Element.length !== 0 && !data.check){
                data = await PartsChack(data,Element,Tables);
                data["special"] = await SpecialDataCheck(data,Data);
                if(fnc.Hollow2(Data.total_thickness_correction_factor) && Data.core_diameter && Data.dessign && fnc.Hollow2(Data.target_value) && Data.infiltration_rate){
                    data = await CalculationAssignment(data,Data);
                    if(data.Picture && data.Picture.length !== 0){
                        if(data.Picture.SetPic !== Data.Picture.SetPic){
                            data.Picture.SetPic = Data.Picture.SetPic;
                            data.Picture.ViewPic = Data.Picture.ViewPic;
                        }
                    }
                    else if(step >= 2 && !Data.Picture.SetPic){
                        data.pic_Error = ErrorList.picture_error_1;
                        data.check = true;
                    }
                }
                else{
                    data.parts_Error = ErrorList.calculation_error;
                    data.check = true;
                }
            }
            else{
                data.parts_Error = ErrorList.parts_error_1;
                data.check = true;
            }
            //チェック
            var WindShift = 0; //素子長と巻きズラシの幅一致確認用
            var Count = 0; //必要部材カウント
            for(var key in data.parts){
                if(data.parts[key]){
                    if(!data.parts[key].cost){
                        data.parts[key].cost_attention = AttentionList.data_parts_attention_1;
                    }
                    //素子長、巻きズラシ確認
                    if(data.parts[key].name === '陽極箔'){
                        WindShift += data.parts[key].range;
                    }
                    if(data.parts[key].name === '電解紙'){
                        if(!Data.device_length || !data.parts[key].range || (Data.device_length - data.parts[key].range) < 0){
                            data.device_length_Error = ErrorList.device_length_error_1;
                            data.check = true;
                        }
                        else if((Data.device_length - data.parts[key].range) > 0){
                            if(fnc.Hollow2(Data.wind_shift_top) && fnc.Hollow2(Data.wind_shift_under)){
                                WindShift += Data.wind_shift_top + Data.wind_shift_under;
                                if(data.parts[key].range !== WindShift){
                                    data.device_length_Error = ErrorList.device_length_error_3;
                                    data.check = true;
                                }
                            }
                            else{
                                data.device_length_Error = ErrorList.device_length_error_2;
                                data.check = true;
                            }
                        }
                    }
                    if(Step2CheckParts[data.parts[key].name] !== undefined){
                        if(data.parts[key].error){
                            data.check = true;
                        }
                        for await(var row of Step2CheckParts[data.parts[key].name]){
                            if(!data.parts[key][row]){
                                data.parts[key].error = ErrorList.data_parts_error_1;
                                data.check = true;
                            }
                        }
                    }
                    if(CheckParts1[Data.Assembly.type].prohibition.includes(data.parts[key].name)){
                        data.parts[key].error = ErrorList.data_parts_error_4
                        data.check = true;
                    }
                    else if(CheckParts1[Data.Assembly.type].indispensable.includes(data.parts[key].name)){
                        Count = Count + 1;
                        if(data.parts[key].error){
                            data.check = true;
                        }
                    }
                }
            }
            if(CheckParts1[Data.Assembly.type].indispensable.length !== Count){
                data.parts_Error = ErrorList.parts_error_2;
                data.check = true;
            }
        }
        //3step以降::含浸・組立
        if(step >= 2){
            Count = 0; //部材確認用
            for await(row of CheckStepThree){
                if(!Data[row]){
                    data[row+"_Error"] = ErrorList.NullError;
                    data.check = true;
                }
            }
            for(var key in data.parts){
                if(data.parts[key]){
                    if(CheckData[data.parts[key].name] !== undefined){
                        if(data.parts[key].error){
                            data.check = true;
                        }
                        if(Data["classification"] === '見積' && data.parts[key].name === '外チューブ'){
                            for await(var row of CheckData['見積外チューブ']){
                                if(!data.parts[key][row]){
                                    data.parts[key].error = ErrorList.data_parts_error_1;
                                    data.check = true;
                                }
                            }
                        }
                        else{
                            for await(var row of CheckData[data.parts[key].name]){
                                if(!data.parts[key][row]){
                                    data.parts[key].error = ErrorList.data_parts_error_1;
                                    data.check = true;
                                }
                            }
                        }
                    }
                    if(CheckParts2[Data.Assembly.type].prohibition.includes(data.parts[key].name)){
                        data.parts[key].error = ErrorList.data_parts_error_4;
                        data.check = true;
                    }
                    else if(CheckParts2[Data.Assembly.type].indispensable.includes(data.parts[key].name)){
                        Count = Count + 1;
                        if(data.parts[key].error){
                            data.check = true;
                        }
                    }
                }
            }
            if(CheckParts2[Data.Assembly.type].indispensable.length !== Count){
                data.parts_Error = ErrorList.parts_error_2;
                data.check = true;
            }
        }
        //4step以降::エージング
        if(step >= 3){
            var Count = 0; //部材確認用
            for await(row of CheckStepFour){
                if(row === 'aging_time'){
                    if(data.product.breed === '電気二重層コンデンサ' && !Data[row]){
                        data[row+"_Error"] = ErrorList.NullError;
                        data.check = true;
                    }
                }
                else if(row === 'aging_current'){
                    if(data.product.breed === 'アルミニウム電解コンデンサ' && !Data[row]){
                        data[row+"_Error"] = ErrorList.NullError;
                        data.check = true;
                    }
                }
                else if(!Data[row]){
                    data[row+"_Error"] = ErrorList.NullError;
                    data.check = true;
                }
            }
            for(var key in data.parts){
                if(data.parts[key]){
                    if(data.parts[key].name === '梱包箱' && Data.classification !== '見積'){
                        if(!data.parts[key].code && !data.parts[key].quantity){
                            data.parts[key].error = ErrorList.data_parts_error_1;
                            data.check = true;
                        }
                    }
                }
            }
        }
        //5step以降::二次加工コードだがチェックする項目がない
        //if(step >= 4){
        //}
    }
    return data
}

//製品仕様書登録SQL
exports.SabmitData = async function(Data){
    var id = await psql.PostgreSQLquery("SELECT MAX(id) FROM product;");
    id = parseInt(id[0].max)+1
    var today = fnc.Today();
    //生産計画ありかどうかの判定
    if(Data.state === 4){
        console.log("改訂の時事前に生産計画に入っているデータがあるかどうか確認を行う");
    }
    //生産計画なしの場合↓生産計画ができたとき処理を追加テストすると面倒な処理なので現在はコメントアウト
    //照査
    if(Data.state === 2 && Data.permit){
        await psql.PostgreSQLquery(`UPDATE product SET available = 1,approval = ARRAY_APPEND(approval,'("照査","${Data.UserData.code}","${today}",${Data.data.autor_comment?'"'+Data.data.autor_comment+'"':'null'})'::approval) WHERE dessign = '${Data.data.dessign}'`);
    }else if(Data.state === 2 && !Data.permit){
        await psql.PostgreSQLquery(`UPDATE product SET available = -2,approval = ARRAY_APPEND(approval,'("照査棄却","${Data.UserData.code}","${today}",${Data.data.autor_comment?'"'+Data.data.autor_comment+'"':'null'})'::approval) WHERE dessign = '${Data.data.dessign}'`);
    }//引き上げ承認
    else if(Data.state === 1.5 && Data.permit){
        await psql.PostgreSQLquery(`UPDATE product SET available = 0,approval[3] = '("引き上げ承認","${Data.UserData.code}","${today}",${Data.data.autor_comment?'"'+Data.data.autor_comment+'"':'null'})'::approval WHERE dessign = '${Data.data.dessign}'`);
    }else if(Data.state === 1.5 && !Data.permit){
        await psql.PostgreSQLquery(`UPDATE product SET available = -2,approval[3] = '("引き上げ棄却","${Data.UserData.code}","${today}",${Data.data.autor_comment?'"'+Data.data.autor_comment+'"':'null'})'::approval WHERE dessign = '${Data.data.dessign}'`);
    }
    //承認
    else if(Data.state === 1 && Data.permit){
        const DESSIGN = Data.data.dessign.match(Dessign);
        await psql.PostgreSQLquery(`UPDATE product SET available = -1 WHERE dessign like '${DESSIGN[1]}%' and dessign != '${Data.data.dessign}'`);
        await psql.PostgreSQLquery(`UPDATE product SET available = 0,approval = ARRAY_APPEND(approval,'("承認","${Data.UserData.code}","${today}",${Data.data.autor_comment?'"'+Data.data.autor_comment+'"':'null'})'::approval) WHERE dessign = '${Data.data.dessign}'`);
    }else if(Data.state === 1 && !Data.permit){
        await psql.PostgreSQLquery(`UPDATE product SET available = -2,approval = ARRAY_APPEND(approval,'("承認棄却","${Data.UserData.code}","${today}",${Data.data.autor_comment?'"'+Data.data.autor_comment+'"':'null'})'::approval) WHERE dessign = '${Data.data.dessign}'`);
    }//改訂、作成
    else if(Data.state === 3 || Data.state === 4){
        var SQL = "INSERT INTO product (id,available,code,capacitance,voltage,"
        SQL+=`capacitance_tolerance_level_outside) VALUES(${id},2`;
        for (row of CheckProdcutColumn){
            if(row === 'capacitance_tolerance_level_outside'){
                SQL+=",'["+Data.data.Product.capacitance_tolerance_level_outside.minus+","+Data.data.Product.capacitance_tolerance_level_outside.plus+"]'"
            }
            else if(fnc.Hollow2(Data.data.Product[row])){
                SQL+=",'"+Data.data.Product[row]+"'";
            }
        }
        SQL = SQL + ");"
        await psql.PostgreSQLquery(SQL);
        //作成、修正者登録
        SQL = `UPDATE product SET approval = ARRAY_APPEND(approval,'("${Data.state===3?"作成":"改訂"}","${Data.UserData.code}","${today}",${Data.data.autor_comment?'"'+Data.data.autor_comment+'"':'null'})'::approval) WHERE id = ${id}`
        await psql.PostgreSQLquery(SQL);
        //異常値
        test1 = await PartsIndex(Data.data.parts,Foil);
        if(Data.data.parts[test1['陽極箔']].CapacitanceSpecial){
            SQL = `UPDATE product SET anomaly = ARRAY_APPEND(anomaly,'("陽極箔","capacitance","${Data.data.parts[test1['陽極箔']].capacitance}")'::anomaly) WHERE id = ${id}`
            await psql.PostgreSQLquery(SQL);
        }if(Data.data.parts[test1['陰極箔']].CapacitanceSpecial){
            SQL = `UPDATE product SET anomaly = ARRAY_APPEND(anomaly,'("陰極箔","capacitance","${Data.data.parts[test1['陰極箔']].capacitance}")'::anomaly) WHERE id = ${id}`
            await psql.PostgreSQLquery(SQL);
        }if(150 <= Data.data.pre_wind_length && Data.data.pre_wind_length >= 300){
            SQL = `UPDATE product SET anomaly = ARRAY_APPEND(anomaly,'("先巻長さ","length","${Data.data.pre_wind_length}")'::anomaly) WHERE id = ${id}`
            await psql.PostgreSQLquery(SQL);
        }
        
        SQL = "UPDATE product SET ";
        for(row of CheckAssemblyColumn){
            if(row === "code"){
                SQL+= "assembly = '"+Data.data.Assembly[row]+"',";
            }
            else{
                SQL+= row + " = '"+Data.data.Assembly[row]+"',";
            }
        }
        SQL =`${SQL.slice(0,SQL.length -1)} WHERE id = ${id};`
        await psql.PostgreSQLquery(SQL);

        SQL = "UPDATE product SET ";
        var column = ["dessign","winding_guid","inclusion_guid","finish_guid",
            "inside_esr","outside_esr","inside_dcr","outside_dcr","capacitance_tolerance_level_inside",
            "outside_leakage_current","inside_leakage_current","aging_voltage","aging_time","aging_current","aging_temperature",
            "core_diameter","total_thickness_correction_factor","infiltration_rate","target_value",
            "machining_guid","classification","destination",
            "search_number","type","impregnation_comment","aging_comment","gauge_number","wind_shift_top","wind_shift_under","wind_shift_range","device_length"];
        
        for(var index in column){
            if(column[index] === 'capacitance_tolerance_level_inside'){
                SQL+= column[index]+" = '["+Data.data[column[index]].minus+","+Data.data[column[index]].plus+"]',"
            }
            else if(column[index] === 'wind_shift_range'){
                if(fnc.Hollow2(Data.wind_shift_top) && fnc.Hollow2(Data.wind_shift_under) && !Data.wind_shift_check){
                    SQL+= column[index]+" = '["+Data.data["wind_shift_range"].minus+","+Data.data["wind_shift_range"].plus+"]',"
                }
                else if(Data.wind_shift_check){
                    SQL+= column[index]+" = '["+Data.data["wind_shift_range2"].minus+","+Data.data["wind_shift_range2"].plus+"]',"
                }
            }
            else if(fnc.Hollow2(Data.data[column[index]])){
                SQL+= column[index]+" = '"+Data.data[column[index]]+"',"
            }
        }
        SQL = SQL.slice(0,SQL.length -1) + " WHERE id = "+String(id)+";"
        await psql.PostgreSQLquery(SQL);
        
        Count = 1;
        Elem = Data.data.parts.filter((val) =>val && val.name && val.table_name);
        const length = ['外チューブ','中チューブ','内チューブ','+リードタブ','-リードタブ'];
        const weight = ['電解液','素子固定材'];
        const foil = ['陽極箔','陰極箔'];
        for(key in Elem){
            SC = String(Count);
            //保存するプロパティを名前ごとに決定する。
            UPDATE = `UPDATE product SET parts[${SC}].name = '${Elem[key].name}',parts[${SC}].code = ${Elem[key].code?"'"+Elem[key].code+"'":"null"},parts[${SC}].table_name = '${Elem[key].table_name}',`
            if(length.includes(Elem[key].name)){
                UPDATE+= `parts[${SC}].quantity = ${Elem[key].quantity?Elem[key].quantity:"null"},parts[${SC}].length = ${Elem[key].length} WHERE id = ${id}; `
            }
            else if(weight.includes(Elem[key].name)){
                UPDATE+= `parts[${SC}].weight = ${Elem[key].weight} WHERE id = ${id}; `
            }
            else if(foil.includes(Elem[key].name)){
                UPDATE+= `parts[${SC}].quantity = ${Elem[key].quantity?Elem[key].quantity:"null"},parts[${SC}].range = ${Elem[key].range} WHERE id = ${id};`
            }
            else{
                UPDATE+= `parts[${SC}].quantity = ${Elem[key].quantity?Elem[key].quantity:"null"} WHERE id = ${id}; `
            }
            Count = Count + 1;
            await psql.PostgreSQLquery(UPDATE);
        }

    }
    
}

exports.FoilStandard = async function(Data){
    var data = {}
    data = await AssemblyJudgment(Data.data.Assembly.code,data);
    data["special"] = await SpecialDataCheck(data,Data.data.Assembly);
    data.assembly.special = data.assembly.special? data.assembly.special:null;
    var tablelist = Data.tables.assembly.table.filter((val)=>{
        return (val.type === data.type && val.special === data.assembly.special && 
            parseFloat(val.diameter) === data.assembly.diameter && parseFloat(val.l_dimension) === data.assembly.l_dimension && val.foil_template)
    })
    ans = tablelist[0];
    let parts = [];
    for await(row of ans.parts){
        if(AssemblyStandardFoil.includes(row.name)){
            parts.push(row);
        }
    }
    data["parts"] = parts;
    data["core_diameter"] = ans.core_diameter;
    return data
}

exports.AssemblyCheck = async function(Data){
    var data = {};
    var flg = 0;
    data.check = false;
    if(Data.data.Assembly && Data.data.Assembly.code){
        data,flg = await AssemblyJudgment(Data.data.Assembly.code,data);
        check = await psql.PostgreSQLquery("SELECT * FROM assembly WHERE code = '"+Data.data.Assembly.code+"'");
        if(Data.state === 4){
            if(check.length !== 0){
                data.assembly.error = ErrorList.assembly_error_6;
                data.check = true;
            }
        }
        else{
            if(check.length === 0){
                data.assembly.error = ErrorList.assembly_error_7;
                data.check = true;
            }
        }
    }
    else{
        data.assembly = {};
        data.assembly.error = ErrorList.assembly_error_1;
        data.check = true;
        for(row of AssemblyRequiredFields){
            data[row+"_Error"] = ErrorList.NullError;
            data.check = true;
        }
    }
    if(Data.data.parts){
        var parts = []
        for await(row of Data.data.parts){
            if(row && row.name){
                delete row.error;
                //標準箔幅
                if(AssemblyStandardFoil.includes(row.name)){
                    if(!row.range){
                        row.error = ErrorList.data_parts_error_1;
                        data.check = true;
                    }
                }//チューブは折径と長さを設定:標準箔変更時には必要ない
                else if(AssemblyTube.includes(row.name) && Data.state !== 3){
                    if(!row.length){
                        row.error = ErrorList.data_parts_error_1;
                        data.check = true;
                    }
                }//タブは幅と厚みを設定:標準箔変更時には必要ない
                else if(Tab.includes(row.name) && Data.state !== 3){
                    if(!row.range){
                        row.error = ErrorList.data_parts_error_1;
                        data.check = true;
                    }
                }//液体(個数カウントできない):標準箔変更時には必要ない
                else if(parts_liquid.includes(row.name) && Data.state !== 3){
                    if(!row.code){
                        row.error = ErrorList.data_parts_error_1;
                        data.check = true;
                    }
                }//それ以外:標準箔変更時には必要ない
                else if(Data.state !== 3){
                    if(!row.code || !row.quantity){
                        row.error = ErrorList.data_parts_error_1;
                        data.check = true;
                    }
                }
                parts.push(row);
            }
        }
        data["parts"] = parts;
    }
    if(Data.data.Assembly){
        data["special"] = await SpecialDataCheck(data,Data.data.Assembly);
        for(row of AssemblyRequiredFields){
            if(!Data.data.Assembly[row]){
                data[row+"_Error"] = ErrorList.NullError;
                data.check = true;
            }
        }
    }
    for(row of AssemblyCheckFields){
        //標準箔変更時には、巻芯径が変更されるためチェックする
        if(!Data.data[row] && (["core_diameter"].includes(row) || Data.state !== 3)){
            data[row+"_Error"] = ErrorList.NullError;
            data.check = true;
        }
    }
    return data
}

//標準箔幅と同じ値になっているかのチェック
const AssemblyPartsCheck = async(Data) => {
    var WHERE = ` WHERE type = '${Data.data.type}' and special ${Data.data.Assembly.special?"= '"+Data.data.Assembly.special+"'":"IS NULL"} and `;
    WHERE+= `diameter = ${Data.data.Assembly.diameter} and l_dimension = ${Data.data.Assembly.l_dimension} and foil_template`
    check = check = await psql.PostgreSQLquery(`SELECT * FROM assembly ${WHERE}`);
    let ans = true;
    if(check.length !== 0){
        max = await psql.PostgreSQLquery("SELECT MAX(array_length(parts,1)) FROM assembly");
        max = max[0].max;
        for(row of AssemblyStandardFoil){
            var elem = Data.data.parts.filter(val=>val && val.name === row);
            let flg = false;
            for(i = 1;i<=max;i++){
                check = await psql.PostgreSQLquery(`SELECT * FROM assembly ${WHERE} and parts[${i}].name = '${row}' and parts[${i}].range = ${elem[0].range}`);
                if(check.length !== 0){
                    flg = true;
                    break;
                }
            }
            if(!flg){
                ans = false;
            }
        }
        core = await psql.PostgreSQLquery(`SELECT * FROM assembly ${WHERE} and core_diameter = ${Data.data.core_diameter}`);
        if(core.length === 0){
            ans = false;
        }
    }
    return ans
}

const AssemblySubmitCode = ["code","l_dimension","diameter","special"];
const AssemblySubmitRow = ["winding_machine","inclusion_guid","finish_guid","gauge_number","core_diameter","type"];
exports.AssemblySubmit = async function(Data){
    var standard = await AssemblyPartsCheck(Data);
    var today = fnc.Today();
    //作成と修正
    if(3 <= Data.state && Data.state <= 4){
        var id = await psql.PostgreSQLquery("SELECT MAX(id) FROM assembly;");
        id = parseInt(id[0].max)+1;
        var SQL = `INSERT INTO assembly (id,available,code,l_dimension,diameter,special,winding_machine,inclusion_guid,finish_guid,gauge_number,core_diameter,type,foil_template) VALUES(`
        SQL+=`${id},${2}`
        for(row of AssemblySubmitCode){
            if(Data.data.Assembly[row]){
                SQL+=",'"+Data.data.Assembly[row]+"'";
            }
            else{
                SQL+=",null";
            }
        }
        for(row of AssemblySubmitRow){
            if(Data.data[row]){
                SQL+=",'"+Data.data[row]+"'";
            }
            else{
                SQL+=",null";
            }
        }
        SQL+= `,${standard});`
        await psql.PostgreSQLquery(SQL);
        //作成者登録
        SQL = `UPDATE assembly SET approval = ARRAY_APPEND(approval,'("${Data.state===4?"作成":"修正"}","${Data.UserData.code}","${today}",${Data.data.autor_comment?'"'+Data.data.autor_comment+'"':"null"})'::approval) WHERE id = ${id}`;
        await psql.PostgreSQLquery(SQL);
        i = 1
        for(row of Data.data.parts){
            if(row && row.name && row.table_name){
                let UPDATE = `UPDATE assembly SET parts[${i}].name = '${row.name}',parts[${i}].table_name = '${row.table_name}',`
                if(AssemblyStandardFoil.includes(row.name)){
                    UPDATE+=`parts[${i}].range = ${row.range},`;
                    i++
                }
                else if(Tab.includes(row.name)){
                    UPDATE+=`parts[${i}].range = ${row.range},`;
                    i++
                }
                else if(AssemblyTube.includes(row.name)){
                    UPDATE+=`parts[${i}].length = ${row.length},`;
                    i++
                }
                else if(parts_liquid.includes(row.name)){
                    UPDATE+=`parts[${i}].code = '${row.code}',`;
                    i++
                }
                else{
                    UPDATE+=`parts[${i}].code = '${row.code}',parts[${i}].quantity = ${row.quantity},`;
                    i++
                }
                UPDATE = UPDATE.slice(0,UPDATE.length -1) + ` WHERE id = ${id}`
                await psql.PostgreSQLquery(UPDATE);
            }
        }
        await psql.PostgreSQLquery(`UPDATE assembly SET special_foil = ${Data.special} WHERE id = ${id}`);
    }//標準箔の変更
    else if(Data.state === 5){
        var SQL = "UPDATE assembly SET ";
        var WHERE = ` WHERE type = '${Data.data.type}' and special ${Data.data.Assembly.special?"= '"+Data.data.Assembly.special+"'":"IS NULL"} and `;
        WHERE+= `diameter = ${Data.data.Assembly.diameter} and l_dimension = ${Data.data.Assembly.l_dimension} and foil_template`
        var StandardList = ["core_diameter"];
        for(row of StandardList){
            SQL+= row +" = '"+Data.data[row]+"',";
        }
        SQL = SQL.slice(0,SQL.length -1) + WHERE;
        await psql.PostgreSQLquery(SQL);
        max = await psql.PostgreSQLquery("SELECT MAX(array_length(parts,1)) FROM assembly");
        max = max[0].max;
        for(row of AssemblyStandardFoil){
            var elem = Data.data.parts.filter(val=>val && val.name === row);
            for(i = 1;i<=max;i++){
                let SQL2 = `UPDATE parts[${i}].range = ${elem[0].range} ${WHERE} and parts[${i}].name = '${row}'`;
                await psql.PostgreSQLquery(SQL2);
            }
        }
    }
    //照査
    else if(Data.state === 2 && Data.permit){
        await psql.PostgreSQLquery(`UPDATE assembly SET available = 1,approval = ARRAY_APPEND(approval,'("照査","${Data.UserData.code}","${today}",${Data.data.autor_comment?'"'+Data.data.autor_comment+'"':"null"})'::approval) WHERE id = ${Data.data.id}`);
    }else if(Data.state === 2 && !Data.permit){
        await psql.PostgreSQLquery(`UPDATE assembly SET available = -2,approval = ARRAY_APPEND(approval,'("照査棄却","${Data.UserData.code}","${today}",${Data.data.autor_comment?'"'+Data.data.autor_comment+'"':"null"})'::approval) WHERE id = ${Data.data.id}`);
    }//承認
    else if(Data.state === 1 && Data.permit){
        await psql.PostgreSQLquery(`UPDATE assembly SET available = -1 WHERE code = '${Data.data.Assembly.code}'`);
        await psql.PostgreSQLquery(`UPDATE assembly SET available = 0,approval = ARRAY_APPEND(approval,'("承認","${Data.UserData.code}","${today}",${Data.data.autor_comment?'"'+Data.data.autor_comment+'"':"null"})'::approval) WHERE id = ${Data.data.id}`);
    }else if(Data.state === 1 && !Data.permit){
        await psql.PostgreSQLquery(`UPDATE assembly SET available = -2,approval = ARRAY_APPEND(approval,'("承認棄却","${Data.UserData.code}","${today}",${Data.data.autor_comment?'"'+Data.data.autor_comment+'"':"null"})'::approval) WHERE id = ${Data.data.id}`);
    }//引き上げ承認
    else if(Data.state === 1.5 && Data.permit){
        await psql.PostgreSQLquery(`UPDATE assembly SET available = 0,approval[3] = '("引き上げ承認","${Data.UserData.code}","${today}",${Data.data.autor_comment?'"'+Data.data.autor_comment+'"':'null'})'::approval WHERE id = ${Data.data.id}`);
    }else if(Data.state === 1.5 && !Data.permit){
        await psql.PostgreSQLquery(`UPDATE assembly SET available = -2,approval[3] = '("引き上げ棄却","${Data.UserData.code}","${today}",${Data.data.autor_comment?'"'+Data.data.autor_comment+'"':'null'})'::approval WHERE id = ${Data.data.id}`);
    }
}

exports.DisplayCode = async function(Data){
    var data = {};
    data.Picture = await Display(Data.data,Data.Tube.color,Data.Tube.text_color);
    return data
}

const TubeCheckPic = ["description","angle","SetPic","ViewPic","width","height"];
exports.TubeCheck = async function(Data){
    var data = {};
    data["Picture"] = {};
    if(!Data.data.Picture.code){
        data.Picture["code_error"] = ErrorList.tube_error_1;
        data['flg'] = true;
    }
    else{
        var check = await psql.PostgreSQLquery(`SELECT * FROM display WHERE code = '${Data.data.Picture.code}'`)
        if(Data.state === 3 && check.length !== 0){
            data.Picture["code_error"] = ErrorList.tube_error_2;
            data['flg'] = true;
        }
        else if(Data.state === 4 && check.length === 0){
            data.Picture["code_error"] = ErrorList.tube_error_3;
            data['flg'] = true;
        }
    }
    for(var row of TubeCheckPic){
        if(!Data.data.Picture[row]){
            data['flg'] = true;
            data.Picture[row+"_error"] = ErrorList.tube_error_1;
        }
    }
    for(var row of Data.data.Picture.display){
        if(row && row.name){
            if(row.name.includes('文字')){
                if(!(row.vertical && row.horizon && row.before)){
                    data['flg'] = true;
                    data.Picture["display_error"] = ErrorList.tube_error_1;
                }
            }
            else{
                if(!(row.vertical && row.horizon)){
                    data['flg'] = true;
                    data.Picture["display_error"] = ErrorList.tube_error_1;
                }
            }
        }
    }
    return data
}

exports.TubeSubmit = async function(Data){
    var today = fnc.Today();
    if(Data.state === 3 || Data.state === 4){
        var id = await psql.PostgreSQLquery("SELECT MAX(id) FROM display;");
        id = parseInt(id[0].max)+1;
        var SQL = `INSERT INTO display (id,available,code,description,angle) VALUES(`
        SQL+=`${id},${2},'${Data.data.Picture.code}','${Data.data.Picture.description}',${Data.data.Picture.angle})`
        await psql.PostgreSQLquery(SQL);
        SQL = `UPDATE display SET approval = ARRAY_APPEND(approval,'("${Data.state === 3?"作成":"修正"}","${Data.UserData.code}","${today}",${Data.data.autor_comment?'"'+Data.data.autor_comment+'"':"null"})'::approval) WHERE id = ${id}`;
        await psql.PostgreSQLquery(SQL);
        const test = Buffer.from(Data.data.Picture.SetPic,'base64');
        value = [Buffer.from(test)]
        var Pic_data = await psql.PostgreSQLquery2("SELECT * FROM image WHERE image = $1",value);
        if(Pic_data.length === 0){
            var idmax = await psql.PostgreSQLquery("SELECT MAX(id) FROM image;");
            var ID = parseInt(idmax[0].max)+1;
            var code = `img${ID}`;
            INSERT = `INSERT INTO image(id,code,image,description) VALUES(${ID},'img${ID}',$1,'チューブ用');`
            await psql.PostgreSQLquery2(INSERT,value);
        }
        else{
            var ID = Pic_data[0].id;
            var code = Pic_data[0].code;
        }
        Pict = Data.data.Picture.display.filter((val) =>{
            return val && val.name
        })
        UPDATE1 = `UPDATE display SET color[1] = ${Data.data.Picture.color[0]},color[2] = ${Data.data.Picture.color[1]},color[3] = ${Data.data.Picture.color[2]},`
        UPDATE1+= `text_color[1] = ${Data.data.Picture.text_color[0]},text_color[2] = ${Data.data.Picture.text_color[1]},text_color[3] = ${Data.data.Picture.text_color[2]},`
        UPDATE1+= `soko_color[1] = ${Data.data.Picture.Soko_color[0]},soko_color[2] = ${Data.data.Picture.Soko_color[1]},soko_color[3] = ${Data.data.Picture.Soko_color[2]},`
        UPDATE1+= `soko_text_color[1] = ${Data.data.Picture.Soko_text_color[0]},soko_text_color[2] = ${Data.data.Picture.Soko_text_color[1]},soko_text_color[3] = ${Data.data.Picture.Soko_text_color[2]},`
        UPDATE1+= `image_code = '${code}'`
        UPDATE1 = UPDATE1+` WHERE code = '${Data.data.Picture.code}'`;
        await psql.PostgreSQLquery(UPDATE1);

        var CT = 1
        for(key in Pict){
            UPDATE3 = `UPDATE display SET display[${CT}].name = '${Pict[key].name}',display[${CT}].vertical = ${Pict[key].vertical},display[${CT}].horizon = ${Pict[key].horizon}`
            if(Pict[key].after){
                UPDATE3 = UPDATE3 +`,display[${CT}].after = '${Pict[key].after}'`
            }
            if(Pict[key].before){
                UPDATE3 = UPDATE3 +`,display[${CT}].before = '${Pict[key].before}'`
            }
            UPDATE3 = UPDATE3 + ` WHERE code = '${Data.data.Picture.code}'`;
            await psql.PostgreSQLquery(UPDATE3);
            CT = CT + 1;
        }
    }
    //照査
    else if(Data.state === 2 && Data.permit){
        await psql.PostgreSQLquery(`UPDATE display SET available = 1,approval = ARRAY_APPEND(approval,'("照査","${Data.UserData.code}","${today}",${Data.data.autor_comment?'"'+Data.data.autor_comment+'"':"null"})'::approval) WHERE id = ${Data.data.id}`);
    }else if(Data.state === 2 && !Data.permit){
        await psql.PostgreSQLquery(`UPDATE display SET available = -2,approval = ARRAY_APPEND(approval,'("照査棄却","${Data.UserData.code}","${today}",${Data.data.autor_comment?'"'+Data.data.autor_comment+'"':"null"})'::approval) WHERE id = ${Data.data.id}`);
    }//承認
    else if(Data.state === 1 && Data.permit){
        await psql.PostgreSQLquery(`UPDATE display SET available = -1 WHERE code = '${Data.data.Picture.code}'`);
        await psql.PostgreSQLquery(`UPDATE display SET available = 0,approval = ARRAY_APPEND(approval,'("承認","${Data.UserData.code}","${today}",${Data.data.autor_comment?'"'+Data.data.autor_comment+'"':"null"})'::approval) WHERE id = ${Data.data.id}`);
    }else if(Data.state === 1 && !Data.permit){
        await psql.PostgreSQLquery(`UPDATE display SET available = -2,approval = ARRAY_APPEND(approval,'("承認棄却","${Data.UserData.code}","${today}",${Data.data.autor_comment?'"'+Data.data.autor_comment+'"':"null"})'::approval) WHERE id = ${Data.data.id}`);
    }//引き上げ承認
    else if(Data.state === 1.5 && Data.permit){
        await psql.PostgreSQLquery(`UPDATE display SET available = 0,approval[3] = '("引き上げ承認","${Data.UserData.code}","${today}",${Data.data.autor_comment?'"'+Data.data.autor_comment+'"':'null'})'::approval WHERE id = ${Data.data.id}`);
    }else if(Data.state === 1.5 && !Data.permit){
        await psql.PostgreSQLquery(`UPDATE display SET available = -2,approval[3] = '("引き上げ棄却","${Data.UserData.code}","${today}",${Data.data.autor_comment?'"'+Data.data.autor_comment+'"':'null'})'::approval WHERE id = ${Data.data.id}`);
    }
    
}