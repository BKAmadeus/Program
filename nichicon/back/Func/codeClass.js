
var psql = require("./Postgre.js");
var CP = require("./ChangePic.js");
var Struct = require("./StructChack.js");
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
const TrSei = /([A-Z])([A-Z])(\d{2})(\d{2})([A-Z])([A-Z])([A-Z])([A-Z])([A-Z])\w?/
const SMSei = /([A-Z])([A-Z])([A-Z])(\d)(\d{2,3}?)(\d{2,3})([A-Z])(\w?)/
const BLSei = /([A-Z])(\w{2})([A-Z0-9+-])(\d{2,3}?)(\d{2,3})([A-Z])(\w?)/
const BLSpecial_L = /素子長([0-9\.]+)\*?(UP|DOWN)-素子径.*/
const BLSpecial_F = /素子長.*-素子径(([0-9\.\*]+)(UP|DOWN)|アトビ)/
//許容差などの分解用
const Dessign = /([0-9A-Z]+)-?(.*)/
const Tube_code = /(P[0-9]+).*/
const Range_Read = /[\(\[]([\-0-9]+),([\-0-9]+).*/
//必要部材と禁止部材
const Tr_parts_prohibition = ['上打ち','端子板','圧力弁','ゴムパッキング','ワッシャ','ロックワッシャ','バンド','ボルト','ナイロンナット','ナイロンワッシャ']
const Tr_parts_indispensable = ['封口ゴム','+リード','-リード','ケース']
const SM_parts_prohibition = ['上打ち','封口ゴム','+リード','-リード']
const SM_parts_indispensable = ['端子板','圧力弁','ワッシャ','ゴムパッキング','ロックワッシャ','ケース']
const BL_parts_prohibition = ['封口ゴム','端子板','圧力弁','ゴムパッキング','ロックワッシャ','バンド','ボルト','ナイロンナット','ナイロンワッシャ']
const BL_parts_indispensable = ['上打ち','ワッシャ','ケース']

//計算結果を確認しなければいけない要素
const Confirmation_Ralculation_Results = ['陽極箔','陰極箔','電解紙','耐圧紙','素子止めテープ','外チューブ']
const Confirmation_Ralculation_Results_element = ['length','range','thickness','quantity','weight','area']

const ErrorList = {
    dessign_error_1:"設番重複",
    product_error_1:"品番重複",
    product_error_2:"品番なし",
    product_error_3:"品番エラー",
    product_error_4:"品番の許容差が違う",
    assembly_error_1:"組立形式なし",
    assembly_error_2:"組立形式と品番の種類が違う",
    assembly_error_3:"組立形式のバンドの項目不一致1",
    assembly_error_4:"組立形式のバンドの項目不一致2",
    assembly_error_5:'組立形式エラー',
    data_parts_error_1:"部材情報エラー1",
    data_parts_error_2:"部材情報エラー2",
    data_parts_error_3:"部材情報エラー3",
    data_parts_error_4:"Tr条件に合わない部材",
    data_parts_error_5:"SM条件に合わない部材",
    data_parts_error_6:"BL条件に合わない部材",
    parts_error_1:"必須部材不足",
    parts_error_2:"type必要部材不足",
    search_number_error_1:"手配No.重複",
    search_number_error_2:"手配No.が量産以外についている",
    size_error:"素子径のほうがφ径より大きい",
    picture_error_1:"画像無し"
}

const AttentionList = {
    data_parts_attention_1:"コスト情報がない",
    data_parts_attention_2:"指定値"
}

//面積計算を行うときに追加式が導入される設番
const setu = ["J2525","J2526","J2525-A","J2529","J2530","J2529-A","J2542","J2550","J2551","J2551-A","J2555","J2558","J2550-A","J2573","J2529-B","J2573-A","J2558-A","J2542-A","J2581","J2550-B","J2529-C","J2600","J2601","J2558-B","J2600-A"]

const cost_area_List = ['ap']
const cost_g_List = ['bl','lb','dg','gk']
const cost_m_List = ['pq','ge']

const SQLcolumns = async (table,data,columns) => {
    var change = await psql.PostgreSQLquery("SELECT * FROM " + table + " WHERE code = '" + data + "'");
    var ans = change[0][columns]
    if('available' in change[0] && change[0]['available'] === '2'){
        ans = data+"は現在登録できない";
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

const AnomalyRead = async (Data,anomaly,name,element,num=false) =>{
    var data = anomaly.filter((val)=>{return val.name === name && val.element === element});
    if(data.length !== 0){
        if(num){
            Data[element] = parseFloat(data[0].value);
        }
        else{
            Data[element] = data[0].value;
        }
        Data[element+"_attention"] = AttentionList.data_parts_attention_2;
    }
    return Data
}

const MachiningCode = async (code,diameter,l_dimension) =>{
    var ans = {};
    var hinka = await psql.PostgreSQLquery("SELECT * FROM hinkari WHERE code = '" + code + "'");
    if(hinka.length  !== 0){
        ans["machining_data"] = hinka;
        ans["machining_name"] = hinka[0].description
        ans["machining_fai_d"] = hinka[0].fai_d
        ans["machining_f"] = hinka[0].f
        ans["machining_l"] = hinka[0].l
        ans["machining_liter"] = hinka[0].liter
    }
    var kate = await psql.PostgreSQLquery("SELECT * FROM hinkate WHERE code = '" + code + "'");
    if(kate.length  !== 0){
        ans["machining_name"] = kate[0].description
        ans["machining_all_data"] = kate;
    }
    return ans
}

const ProductClass = async (PrData,flg) => {
    var ans={};
    ans["code"] = PrData[0];
    ans["breed"] = await SQLcolumns("hin01",PrData[1],"kind");
    ans["series"] = await SQLcolumns("hin01",PrData[1],"code");
    ans["series"] = ans["series"] + await SQLcolumns("hin02",PrData[2],"code");
    if(regex2.test(PrData[3])){
        ans["voltage"] = await SQLcolumns("hin03",PrData[3],"description");
    }
    else if(regex1.test(PrData[3])){
        ans["voltage"] = await SQLcolumns("hin04",PrData[3].substr(1,1),"description") * (10 ** parseFloat(PrData[3].substr(0,1)));
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
    }
    if(ans["capacitance"] <= 10){
        var tolerance = await SQLcolumns("hin05",PrData[5],"range");
        ans["tolerance"] = await RangeRead(tolerance);
        ans["plus_minus_num"] = await SQLcolumns("hin05",PrData[5],"available")
    }
    else{
        if(PrData[5] === 'A'){
            ans["ToleranceSpecial"] = true;
        }
        else{
            var tolerance = await SQLcolumns("hin05",PrData[5],"range");
            ans["tolerance"] = await RangeRead(tolerance);
        }
    }

    if(flg === 1){
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
                //ans["machining_data"] = await MachiningCode(hinka[1]);
            }
            else if(hinka[2] !== undefined){
                ans["machining"] = hinka[2];
                //ans["machining_data"] = await MachiningCode(hinka[2]);
            }
        }
        if(user !== null){
            ans["user_code"] = user[1];
            ans["user"] = await SQLcolumns("hinuser",user[1],"user");
        }
    }
    else if(flg === 2 || flg === 4){
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
        ans["mituban"] = mitu[1];
    }
    var hintoku = await psql.PostgreSQLquery("SELECT * FROM hintoku WHERE code = '" + PrData[0] + "'");
    for(var row of hintoku){
        if(row.description.includes('hinka') && row.description.includes('code')){
            ans["machining"] = row.truevalue;
            //ans["machinig_data"] = await MachiningCode(row.truevalue);
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
    return ans
};

const AssemblyClass = async (AsData,flg) => {
    let ans = {};
    ans["code"] = AsData[0];
    if(flg === 1){
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
        ans["special"] = sm08[0].description;
    }
    else if (flg === 3){
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
                var L_chack = bl08[0].description.match(BLSpecial_L);
                var F_chack = bl08[0].description.match(BLSpecial_F);
                if(L_chack !== null){
                    if(L_chack[2] === 'UP'){
                        ans["special_l_dimension"] = 1*parseFloat(L_chack[1]);
                    }
                    else if(L_chack[2] === 'DOWN'){
                        ans["special_l_dimension"] = -1*parseFloat(L_chack[1]);
                    }
                }
                if(F_chack !== null){
                    if(F_chack[3] === 'UP'){
                        ans["special_l_dimension"] = 1*parseFloat(F_chack[2]);
                    }
                    else if(F_chack[3] === 'DOWN'){
                        ans["special_l_dimension"] = -1*parseFloat(F_chack[2]);
                    }
                    else if(F_chack[1] === 'アトビ'){
                        ans["special"] = F_chack[1];
                    }
                }
            }
            ans["large"] = bl08[0].description;
        }
    }
    return ans
}

const BZIElementListStr = ['color','image_code','display','text_color','back1','back2','back3','cost_company','date','material_properties']
const BZIElementListNum = ['range','thickness','capacitance','weight_conversion_factor','fold_diameter','angle','cost']
const PartsClass = async (Data,tables) => {
    let ans = [];
    for await(var val of Data){
        var BZItable = tables[val.table_name].table.filter((item)=>item.code === val.code);
        let ANS = val;
        ANS["table"] = val.table_name;
        if(BZItable.length !== 0){
            for await(var key of Object.keys(BZItable[0])){
                if(BZIElementListStr.includes(key)){
                    ANS[key] = BZItable[0][key]
                }
                else if(BZIElementListNum.includes(key)){
                    ANS[key] = parseFloat(BZItable[0][key]);
                }
            }
        }
        ans.push(ANS);
    }
    return ans
}

const PartsChack = async (Data,tables) => {
    let ans = [];
    for await(var val of Data){
        var BZItable = tables[val.table].table.filter((item)=>item.code === val.code);
        let ANS = val;
        ANS["table"] = val.table
        if(BZItable.length !== 0){
            for await(var key of Object.keys(BZItable[0])){
                if(BZIElementListStr.includes(key)){
                    if(key === 'display' && val.key){
                        ANS[key] = val[key].filter((val)=>val);
                    }
                    else{
                        ANS[key] = BZItable[0][key]
                    }
                }
                else if(BZIElementListNum.includes(key)){
                    ANS[key] = parseFloat(BZItable[0][key]);
                }
            }
        }
        ans.push(ANS);
    }
    return ans
}

const TubeDisplay = async (Data,Tube) => {
    var TubeData = Tube.code.match(/P([0-9]+)\D+.+/);
    if(Tube.image_code){
        Data.Picture = await psql.PostgreSQLquery("SELECT * FROM image WHERE code = \'" + Tube.image_code + "\'");
    }
    else{
        Data.Picture = await psql.PostgreSQLquery("SELECT * FROM image WHERE code = \'" + Tube.code + "\'");
    }
    if(Data.Picture[0] !== undefined){
        //画像変換 base64 ⇔ Buffer
        Data.Picture[0].image_base64 = Buffer.from(Data.Picture[0].image).toString('base64');
        //const test = Buffer.from(Data.Picture[0].image_base64,'base64');
        //画像加工 後 base64化
        var DATA = await CP.PicChange(Data.Picture[0].image,Tube.color,Tube.text_color);
        Data.Picture[0].image_base64_2 = DATA.data
        Data.Picture[0].maxwidth = DATA.maxwidth
        Data.Picture[0].tube_code = TubeData[1];
    }
    return Data
}

const CalculationAssignment = async (Data,dns,flg_a=0) => {
    if(flg_a !== 0){
        if(Data.assembly.beading === "ビーディング無し" || Data.product.series === 'LAK' || Data.product.series === 'LAQ' || Data.product.series === 'LAS' || Data.product.series === 'LAR'){
            if(Data.assembly.l_dimension < 30) {
                Data['pq_range'] = 10
            }
            else if(Data.assembly.l_dimension <= 40) {
                Data['pq_range'] = 20
            }
            else if(Data.assembly.l_dimension <= 50) {
                Data['pq_range'] = 25
            }
        }
        else{
            if(Data.assembly.l_dimension <= 20){
                Data['pq_range'] = 5
            }
            else if(Data.assembly.l_dimension > 20){
                Data['pq_range'] = 10
            }
        }
    }
    if(Data.product.breed == '電気二重層コンデンサ'){
        var count = 0;
        for await(let i of Data.parts){
            if(i.name == '陽極箔'){
                var you = count;
            }
            else if(i.name == '陰極箔'){
                var ink = count;
            }
            else if(i.name == '電解紙'){
                var den = count;
            }
            else if(i.name == '耐圧紙'){
                var tai = count;
            }
            else if(i.name == '素子止めテープ'){
                var sosi = count;
            }
            else if(i.name == '+タブ'){
                var tab_p = count;
            }
            else if(i.name == '-タブ'){
                var tab = count;
            }
            else if(i.name == '外チューブ'){
                Data = await TubeDisplay(Data,i);
            }
            count = count + 1
        }
        var anomaly = dns.anomaly && dns.anomaly.length !== 0;
        if(anomaly){
            Data.parts[you] = await AnomalyRead(Data.parts[you],dns.anomaly,'陽極箔','capacitance',true);
            Data.parts[ink] = await AnomalyRead(Data.parts[ink],dns.anomaly,'陰極箔','capacitance',true);
        }
        Data.cotoff_factor = (Data.parts[you].capacitance + Data.parts[ink].capacitance) / (Data.parts[you].capacitance * Data.parts[ink].capacitance * dns.infiltration_rate / 100)
        Data.parts[you].area = (Data.product.capacitance / 10 ** 6) * (1+parseFloat(dns.target_value)/100) * Data.cotoff_factor;
        let dessign = setu.filter((val)=> val === dns.dessign);
        Another = (((Data.assembly.l_dimension == 11.5) & (Data.assembly.diameter == 8) & (dessign.length === 1)) | ((Data.assembly.l_dimension == 12.5) & (Data.assembly.diameter == 10) & (Data.parts[you].range == 7)) | ((Data.assembly.l_dimension == 20) & (Data.assembly.diameter == 8) & (Data.parts[you].range == 13.7)) | ((Data.assembly.l_dimension == 20) & (Data.assembly.diameter == 10) & (Data.parts[you].range == 13.7)))
        if(Another){
            Data.parts[you].area = Data.parts[you].area + 13 * Data.parts[you].range / 100
        }
        Data.parts[you].length = Data.parts[you].area * 100 / Data.parts[you].range
        Data.parts[you].weight = Data.parts[you].area * Data.parts[you].weight_conversion_factor

        if((Data.assembly.l_dimension === 11.5) & (Data.assembly.diameter == 8) & (flg_a == 1)){
            Data.parts[ink].length = Data.parts[you].length + 5
        }
        else{
            Data.parts[ink].length = Data.parts[you].length + 40
        }
        Data.parts[ink].area = Data.parts[ink].length * Data.parts[ink].range / 100
        Data.parts[ink].weight = Data.parts[ink].area * Data.parts[ink].weight_conversion_factor
        if (tai !== undefined){
            Data.total_thickness = (Data.parts[you].thickness * Data.parts[you].quantity + Data.parts[ink].thickness * Data.parts[ink].quantity + Data.parts[den].thickness * Data.parts[den].quantity + Data.parts[tai].thickness * Data.parts[tai].quantity) / 1000 + Number(dns.total_thickness_correction_factor)
        }
        else{
            Data.total_thickness = (Data.parts[you].thickness * Data.parts[you].quantity + Data.parts[ink].thickness * Data.parts[ink].quantity + Data.parts[den].thickness * Data.parts[den].quantity * 2) / 1000 + Number(dns.total_thickness_correction_factor)
        }
        Data.device_diameter = Math.sqrt(4/Math.PI*Data.total_thickness*Data.parts[you].length+(dns.core_diameter ** 2))

        if(tab_p !== undefined){
            if(Data.product.series == 'JAK'){
                Data.parts[den].rolling_length = 150
                var tab_qu = Data.parts[tab_p].quantity
            }
            else if(Data.parts[tab_p].quantity > 1){
                Data.parts[den].rolling_length = 110
                var tab_qu = Data.parts[tab_p].quantity
            }
            else{
                Data.parts[den].rolling_length = 60
                var tab_qu = 1
            }
        }
        else{
            Data.parts[den].rolling_length = 60
            var tab_qu = 1
        }
        
        Data.parts[den].length = Data.parts[den].rolling_length + (Data.parts[you].length * 1.03) + (Data.device_diameter * Math.PI * tab_qu)
        Data.parts[den].area = Data.parts[den].range * Data.parts[den].length * Data.parts[den].quantity / 100
        //重量換算係数に関する回答待ち:定数0.002をデータベース読み込み変数に直す。
        if('weight_conversion_factor' in Data.parts[den]){
            Data.parts[den].weight = Data.parts[den].area * Data.parts[den].weight_conversion_factor;
        }
        else{
            Data.parts[den].weight = Data.parts[den].area * 0.002;
            Data.parts[den].weight_conversion_factor_null = 0;
        }
        //----------------------------------------------------------------
        if(tai !== undefined){
            Data.parts[tai].length = Data.parts[den].rolling_length + (Data.parts[you].length * 1.03) + (Data.device_diameter * Math.PI * tab_qu)
            Data.parts[tai].quantity = Data.parts[den].quantity
            Data.parts[tai].area = Data.parts[tai].range * Data.parts[tai].length * Data.parts[tai].quantity / 100
            //重量換算係数に関する回答待ち:定数0.002をデータベース読み込み変数に直す。
            if('weight_conversion_factor' in Data.parts[tai]){
                Data.parts[tai].weight = Data.parts[tai].area * Data.parts[tai].weight_conversion_factor;
            }
            else{
                Data.parts[tai].weight = Data.parts[tai].area * 0.002;
                Data.parts[tai].weight_conversion_factor_null = 0;
            }
        }
        //----------------------------------------------------------------
        Data.parts[sosi].length = Data.device_diameter * Math.PI * 1.5
        Data.if_soshi_stop = (((Data.assembly.diameter**2) - (Data.device_diameter**2)) * Data.parts[sosi].range / 2) * (Math.PI / 4) / 1000 * 0.85
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

const SpecialDataCheck = async (data,Data) => {
    flg = false
    if(data.product.capacitance && Data.capacitance && Math.abs(Data.capacitance - data.product.capacitance) >= 0.00001){
        data.product.capacitance = parseFloat(Data.capacitance);
        flg = true
    }if(data.product.voltage && Data.voltage && Math.abs(Data.voltage - data.product.voltage) >= 0.0001){
        data.product.voltage = parseFloat(Data.voltage);
        flg = true
    }if(data.product.voltage && Data.voltage && Math.abs(Data.voltage - data.product.voltage) >= 0.0001){
        data.product.voltage = parseFloat(Data.voltage);
        flg = true
    }
    if(data.product.ToleranceSpecial){
        data.product.tolerance = Data.capacitance_tolerance_level_outside;
        flg = true
    }if(data.assembly.l_dimension && Data.l_dimension && Math.abs(data.assembly.l_dimension - Data.l_dimension) >= 0.00001){
        data.assembly.l_dimension = parseFloat(Data.l_dimension);
        flg = true
    }if(data.assembly.diameter && Data.diameter && Math.abs(data.assembly.diameter - Data.diameter) >= 0.00001){
        data.assembly.diameter = parseFloat(Data.diameter);
        flg = true
    }
    return flg
}

const ProductJudgment = async (Product,flg_p,data) =>{
    if(EDTr.indexOf(Product.substr(1,2)) > -1){
        flg_p = 1;
        var PrData = Product.match(HinTrSei);
        data["product"] = await ProductClass(PrData,flg_p,data.Product);
    }
    else{
        var PrData = Product.match(HinSMBLSei);
        if(EDSM.indexOf(Product.substr(1,2)) > -1){
            flg_p = 2;
            data["product"] = await ProductClass(PrData,flg_p);
        }
        else if(EDBL.indexOf(Product.substr(1,2)) > -1){
            flg_p = 3;
            data["product"] = await ProductClass(PrData,flg_p);
        }
        else if(HinSm.indexOf(Product.substr(9,2)) > -1){
            flg_p = 4;
            data["product"] = await ProductClass(PrData,flg_p);
        }
        else{
            flg_p = 5;
            data["product"] = await ProductClass(PrData,flg_p);
        }
    }
    return data,flg_p
}

const AssemblyJudgment = async (Assembly,flg_a,data) => {
    var as1 = await psql.PostgreSQLquery("SELECT code FROM tr01");
    //ここに組立形式テーブルのデータを呼び出す関数を入れる。
    if(as1[0].code.indexOf(Assembly.substr(0,1)) > -1){
        var AsData = Assembly.match(TrSei);
        flg_a = 1;
        data["assembly"] = await AssemblyClass(AsData,flg_a)
        data.type = "tr"
    }
    else if(Assembly.substr(1,2) !== 'AC' & !isNaN(Assembly.substr(3,1))){
        var AsData = Assembly.match(SMSei);
        flg_a = 2;
        data["assembly"] = await AssemblyClass(AsData,flg_a)
        data.type = "sm"
    }
    else{
        var AsData = Assembly.match(BLSei);
        flg_a = 3;
        data["assembly"] = await AssemblyClass(AsData,flg_a);
        data.type = "bl"
    }
    return data,flg_a
}

const ScheduleCall = async (dessign) => {
    var schedule = await psql.PostgreSQLquery("SELECT id,deadline,lot FROM production_schedule WHERE dessign = '"+dessign+"';")
    return schedule
}

exports.ReadCode = async (Data,flg) =>{
    let data ={}
    let flg2=0
    if(flg === 1){
        data,flg2 = await ProductJudgment(Data,flg2,data);
    }
    else if(flg === 2){
        data,flg2 = await AssemblyJudgment(Data,flg2,data);
    }
    return data
}

exports.CodeClassification = async function(Data){
    let data ={}
    var flg_p=0
    var flg_a=0
    if('Product' in Data){
        if(Data.Product && Data.Product.dessign){
            data["schedule"] = await ScheduleCall(Data.Product.dessign);
        }
        if(Data.Product !== "" && Data.Product !== null){
            if('code' in Data.Product){
                data,flg_p = await ProductJudgment(Data.Product.code,flg_p,data);
            }
            if('assembly' in Data.Product){
                data,flg_a = await AssemblyJudgment(Data.Product.assembly,flg_a,data);
            }
            if('parts' in Data.Product){
                data["parts"] = await PartsClass(Data.Product.parts,Data.tables);
                data = await CalculationAssignment(data,Data.Product,flg_a);
            }
            data["special"] = await SpecialDataCheck(data,Data.Product);
            if(data.product.machining){
                data["machining"] = await MachiningCode(data.product.machining,data.assembly.diameter,data.assembly.l_dimension);
            }
        }
    }
    return data
}

//productのテーブル列名とReactのデータの変換(必要なデータのみ)
const ExchangeData = async(Data) =>{
    var dns = {};
    //必要になり次第追加
    dns.total_thickness_correction_factor = Data.TotalThicknessCorrectionFactor;
    dns.core_diameter = Data.CoreDiameter;
    dns.dessign = Data.Dessign;
    dns.target_value = Data.TargetValue;
    dns.infiltration_rate = Data.ContentPercentage;
    dns.capacitance = Data.Capacitance;
    dns.voltage = Data.RatedVoltage;
    dns.capacitance_tolerance_level_outside = Data.CapacityTolerance;
    dns.l_dimension = Data.LSize;
    dns.diameter = Data.Diameter;
    dns.anomaly = Data.Anomaly;
    return dns
}

exports.ChackData = async function(flg,Data,Tables,state=0){
    var flg_p = 0
    var flg_a = 0
    let data ={}
    data.chack = false;
    dns = await ExchangeData(Data);
    if(Data){
        if(Data.ProductNumber){
            data,flg_p = await ProductJudgment(Data.ProductNumber,flg_p,data);
        }
        else{
            data.product.error = ErrorList.product_error_2;
            data.chack = true;
        }
        if(Data.AssembledForm){
            data,flg_a = await AssemblyJudgment(Data.AssembledForm,flg_p,data);
        }
        else{
            data.assembly.error = ErrorList.assembly_error_1;
            data.chack = true;
        }
        var Element = Data.Element.filter((val) =>{
            return val !== null && val.code
        });
        
        if(Element.length !== 0){
            data['parts'] = await PartsChack(Element,Tables);
            if(Data.TotalThicknessCorrectionFactor && Data.CoreDiameter && Data.Dessign && Data.TargetValue && Data.ContentPercentage){
                data = await CalculationAssignment(data,dns,flg_a);
                if(data.Picture && data.Picture.length !== 0){
                    if(data.Picture[0].image_base64 !== Data.SetPic){
                        data.Picture[0].image_base64 = Data.SetPic;
                        data.Picture[0].image_base64_2 = Data.ViewPic;
                    }
                }
                else if(!Data.SetPic){
                    data.pic_error = ErrorList.picture_error_1
                    data.chack = true;
                }
            }
            data["special"] = await SpecialDataCheck(data,dns);
            if(data.product.ToleranceSpecial === undefined && !(Math.abs(data.product.tolerance.plus - dns.capacitance_tolerance_level_outside.plus) <= 0.0001 && Math.abs(data.product.tolerance.minus - dns.capacitance_tolerance_level_outside.minus) <= 0.0001)){
                data.product.error = ErrorList.product_error_4
                data.chack = true;
            }
        }
        else{
            data.chack = true;
        }
    }
    if(flg === 6){
        if(flg_a !== flg_p){
            data.assembly.error = ErrorList.assembly_error_2;
            data.chack = true;
        }
        else{
            var Count = 0;
            var Count_t = 0;
            for(var key in data.parts){
                if(!data.parts[key].cost){
                    data.parts[key].cost_attention = AttentionList.data_parts_attention_1;
                }
                if(Confirmation_Ralculation_Results.includes(data.parts[key].name)){
                    Count_t = Count_t + 1;
                    if(data.parts[key].name === '素子止めテープ'){
                        if(!data.parts[key].length || !data.parts[key].range){
                            data.parts[key].error = ErrorList.data_parts_error_1
                            data.chack = true;
                        }
                    }
                    else if(data.parts[key].name === '外チューブ'){
                        for(var item of Confirmation_Ralculation_Results_element){
                            if(!data.parts[key].thickness || !data.parts[key].length || !data.parts[key].fold_diameter || !data.parts[key].color){
                                data.parts[key].error = ErrorList.data_parts_error_2
                                data.chack = true;
                            }
                        }
                    }
                    else{
                        for(var item of Confirmation_Ralculation_Results_element){
                            if(!data.parts[key][item]){
                                data.parts[key].error = ErrorList.data_parts_error_3
                                data.chack = true;
                            }
                        }
                    }
                }
                if(flg_a === 1){
                    if(Tr_parts_prohibition.includes(data.parts[key].name)){
                        data.parts[key].error = ErrorList.data_parts_error_4
                        data.chack = true;
                    }
                    else if(Tr_parts_indispensable.includes(data.parts[key].name)){
                        Count = Count + 1;
                    }
                }
                else if(flg_a === 2){
                    if(SM_parts_prohibition.includes(data.parts[key].name)){
                        data.parts[key].error = ErrorList.data_parts_error_5
                        data.chack = true;
                    }
                    else if(SM_parts_indispensable.includes(data.parts[key].name)){
                        Count = Count + 1;
                    }
                }
                else if(flg_a === 3){
                    if(BL_parts_prohibition.includes(data.parts[key].name)){
                        data.parts[key].error = ErrorList.data_parts_error_6
                        data.chack = true;
                    }
                    else if(BL_parts_indispensable.includes(data.parts[key].name)){
                        Count = Count + 1;
                    }
                }
            }
            if(Confirmation_Ralculation_Results.length !== Count_t){
                data.parts_error = ErrorList.parts_error_1
                data.chack = true;
            }
            if((flg_a === 1 && Count !== Tr_parts_indispensable.length) || (flg_a === 2 && Count !== SM_parts_indispensable.length) || (flg_a === 3 && Count !== BL_parts_indispensable.length)){
                data.parts_error = ErrorList.parts_error_2
                data.chack = true;
            }
        }
        if('band_available' in data.assembly){
            if(data.assembly.band_available === '0'){
                var count = 0;
                for(row of data.parts){
                    if(row.name === 'バンド'){
                        count = count + 1;
                    }
                }
                if(count !== 1){
                    data.assembly.error = ErrorList.assembly_error_3
                    data.chack = true;
                }
            }
            else if(data.assembly.band_available === '1'){
                for(row of data.parts){
                    if(row.name === 'バンド'){
                        data.assembly.error = ErrorList.assembly_error_4
                        data.chack = true;
                        break;
                    }
                }
            }
        }
        var chackstr = "は現在登録できない"
        for(row in data.product){
            if(chackstr.indexOf(data.product[row]) > -1){
                data.product.error = ErrorList.product_error_3
                data.chack = true;
            }
        }
        for(row in data.assembly){
            if(chackstr.indexOf(data.assembly[row]) > -1){
                data.assembly.error = ErrorList.assembly_error_5
                data.chack = true;
            }
        }
        if(data.if_soshi_stop<0){
            data.size_error = ErrorList.size_error
            data.chack = true;
        }
        var chack = await psql.PostgreSQLquery("SELECT code,dessign FROM product WHERE code = '" + Data.ProductNumber + "';");
        console.log("確認",chack,Data.ProductNumber);
        if(chack.length !== 0){
            data.product.error = ErrorList.product_error_1
            data.chack = true;
        }
        var chack = await psql.PostgreSQLquery("SELECT code,dessign FROM product WHERE dessign = '"+Data.Dessign+"';");
        
        if(chack.length !== 0){
            if(parseInt(state) === 3 && data.product.breed === '電気二重層コンデンサ'){
                var max = await psql.PostgreSQLquery("SELECT max(re[2]) FROM (SELECT REGEXP_MATCHES(dessign,'([A-Z]+)([0-9]+)-?(.*)') as re FROM product) as foo;")
                max = parseInt(max[0].max)+1;
                data.new_dessign = "J"+max;
            }
            else if(parseInt(state) === 4 && data.product.breed === '電気二重層コンデンサ'){
                var dessign = Data.Dessign.replace(/-[0-9A-Z]+/,"");
                var max = await psql.PostgreSQLquery("SELECT max(re[3]) FROM (SELECT REGEXP_MATCHES(dessign,'([A-Z]+)([0-9]+)-?(.*)') as re FROM product WHERE dessign like '"+dessign+"%') as foo WHERE re[3] ~ '[0-9]+';")
                if(!max[0].max){
                    max = 0;
                }
                else{
                    max = parseInt(max[0].max);
                }
                data.new_dessign = dessign+"-"+(max+1);
            }
        }
        if(Data.Search && Data.Classification === '量産'){
            var chack = await psql.PostgreSQLquery("SELECT code,search_number FROM product WHERE search_number = '"+Data.Search+"';");
            if(chack.length !== 0){
                data.search_number_error = ErrorList.search_number_error_1
                data.chack = true;
            }
        }
        else if(Data.Search){
            data.search_number_error = ErrorList.search_number_error_2
            data.chack = true;
        }
    }
    return {data:data,Data:Data}
}

exports.SabmitData = async function(Data){
    var id = await psql.PostgreSQLquery("SELECT MAX(id) FROM product;");
    const DESSIGN = Data.data.Dessign.match(Dessign);
    //生産計画ありかどうかの判定
    if(Data.state === 4){
        console.log("改訂の時事前に入っているデータがあるかどうか確認を行う")
    }
    //生産計画なしの場合↓生産計画ができたとき処理を追加テストすると面倒な処理なので現在はコメントアウト
    
    await psql.PostgreSQLquery("UPDATE product SET available = -1 WHERE dessign like '" + DESSIGN[1]+"%'");
    
    var SQL = "INSERT INTO product (id,available,author,creation_day,\
        code,dessign,assembly,winding_guid,inclusion_guid,finish_guid,\
        inside_esr,outside_esr,inside_dcr,outside_dcr,\
        outside_leakage_current,inside_leakage_current,aging_voltage,aging_time,aging_temperature,\
        core_diameter,total_thickness_correction_factor,infiltration_rate,target_value,\
        machining_guid,classification,destination,remarks,remarks2,\
        search_number,type,voltage,capacitance,l_dimension,diameter) VALUES("
    var column = [
        "ProductNumber","Dessign","AssembledForm","WindingGuid","InclusionGuid","FinishGuid",
        "ESRCo","ESR","DCRCo","DCR",
        "LeakageCurrent","LeakageCurrentCo","AppliedVoltage","AgingTime","Temperature",
        "CoreDiameter","TotalThicknessCorrectionFactor","ContentPercentage","TargetValue",
        "MachiningGuidance","Classification","Destination","Remarks","Remarks2",
        "Search","Type","RatedVoltage","Capacitance","LSize","Diameter"]
    
    var d = new Date();
    
    var today = d.getFullYear()+"-";
    today += (d.getMonth() + 1)+"-";
    today += d.getDate();
    SQL = SQL + String(id[0].max+1) +",2,'"+Data.UserData.name+"','"+today+"'"
    var Count = 1;
    for(var row of column){
        for(var key in Data.data){
            if(key === row){
                Count = Count + 1;
                var value = !Data.data[key]? ",null":",'"+String(Data.data[key])+"'";
                SQL = SQL + value;
            }
        }
    }
    SQL = SQL + ");"
    await psql.PostgreSQLquery(SQL);
    
    if(Data.data["CapacityToleranceCo"]){
        UPDATE = "UPDATE product SET capacitance_tolerance_level_inside = '["+Data.data.CapacityToleranceCo.minus+","+Data.data.CapacityToleranceCo.plus+"]' WHERE id = "+String(id[0].max+1)+";"
        await psql.PostgreSQLquery(UPDATE);
    }
    if(Data.data["CapacityTolerance"]){
        UPDATE = "UPDATE product SET capacitance_tolerance_level_outside = '["+Data.data.CapacityTolerance.minus+","+Data.data.CapacityTolerance.plus+"]' WHERE id = "+String(id[0].max+1)+";"
        await psql.PostgreSQLquery(UPDATE);
    }
    //新規画像保存
    //下はbase64→バイナリデータ変換
    const test = Buffer.from(Data.data.SetPic,'base64');
    value = [Buffer.from(test)]
    var Pic_data = await psql.PostgreSQLquery2("SELECT * FROM image WHERE image = $1",value);
    if(Pic_data.length === 0){
        var idmax = await psql.PostgreSQLquery("SELECT MAX(id) FROM image;");
        var ID = String(parseInt(idmax[0].max+1));
        INSERT = "INSERT INTO image(id,code,image,description) VALUES("+ID+",'img"+ID+"',$1,'チューブ用');"
        await psql.PostgreSQLquery2(INSERT,value);
    }

    Count = 1
    Elem = Data.data.Element.filter((val) =>{
        return val !== null && val.code
    })
    Pict = Data.data.Element[22].display.filter((val) =>{
        return val !== null && val.name
    })
    const tube = ['外チューブ','中チューブ','内チューブ','+タブ','-タブ'];
    const weight = ['電解液','素子固定材'];
    for(key in Elem){
        SC = String(Count);
        //保存するプロパティを名前ごとに決定する。
        if(tube.includes(Elem[key].name)){
            UPDATE = "UPDATE product SET parts["+SC+"].name = '"+Elem[key].name+"',parts["+SC+"].code = '"+Elem[key].code+"',parts["+SC+"].length = '"+Elem[key].length+"',parts["+SC+"].table_name = '"+Elem[key].table+"' WHERE id = "+String(id[0].max+1)+";"
            if(Elem[key].name === '外チューブ'){
                var tubecode = Elem[key].code.match(Tube_code);
                var angle = Data.data.Transform? Data.data.Transform:0;
                //
                UPDATE1 = "UPDATE ge SET color[1] = "+String(Elem[key].color[0])+",color[2] = "+String(Elem[key].color[1])+",color[3] = "
+String(Elem[key].color[2])+",angle = "+String(angle)+",text_color[1] = "+String(Elem[key].text_color[0])+",text_color[2] = "
+String(Elem[key].text_color[1])+",text_color[3] = "+String(Elem[key].text_color[2])
                if(!Data.data.PicSave && Data.data.image_code){
                    UPDATE1 = UPDATE1+",image_code = '"+Data.data.image_code+"'"
                }
                else if(Data.data.PicSave){
                    UPDATE1 = UPDATE1+",image_code = 'img"+ID+"'"
                }
                UPDATE1 = UPDATE1+" WHERE code like '"+tubecode[1]+"%'";
                await psql.PostgreSQLquery(UPDATE1);

                var CT = 1
                for(key in Pict){
                    UPDATE3 = "UPDATE ge SET display["+CT+"].name = '"+Pict[key].name+"',display["+CT+"].vertical = "+Pict[key].vertical+",display["+CT+"].horizon = "+Pict[key].horizon
                    if(Pict[key].after){
                        UPDATE3 = UPDATE3 +",display["+CT+"].after = '"+Pict[key].after+"'"
                    }
                    if(Pict[key].before){
                        UPDATE3 = UPDATE3 +",display["+CT+"].before = '"+Pict[key].before+"'"
                    }
                    UPDATE3 = UPDATE3 + " WHERE code like '"+tubecode[1]+"%'"
                    await psql.PostgreSQLquery(UPDATE3);
                    CT = CT + 1
                }
            }
        }
        else if(weight.includes(Elem[key].name)){
            UPDATE = "UPDATE product SET parts["+SC+"].name = '"+Elem[key].name+"',parts["+SC+"].code = '"+Elem[key].code+"',parts["+SC+"].weight = '"+Elem[key].weight+"',parts["+SC+"].table_name = '"+Elem[key].table+"' WHERE id = "+String(id[0].max+1)+";"
        }
        else{
            UPDATE = "UPDATE product SET parts["+SC+"].name = '"+Elem[key].name+"',parts["+SC+"].code = '"+Elem[key].code+"',parts["+SC+"].quantity = '"+Elem[key].quantity+"',parts["+SC+"].table_name = '"+Elem[key].table+"' WHERE id = "+String(id[0].max+1)+";"
        }
        Count = Count + 1;
        await psql.PostgreSQLquery(UPDATE);
    }
    
}