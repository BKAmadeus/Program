import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import Checkbox from '@mui/material/Checkbox';
import React from 'react'
import * as func from "../Func/func";


import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';


const re = /\d{2}(\d{2})-(\d{2})-(\d{2}).*/
const re_dessign = /設番:(.*)/u
const parts1 = ["陽極箔","陰極箔","電解紙","耐圧紙","素子止めテープ","-リード","+リード","-タブ","+タブ"]
//巻取のエラーコード一覧(意味は分かりません)
const windingError = [391,326,319,392,330,344,351,399]
const rubberError = [373,393,380,370,360]

export function FullScreenDialog(FSD:any) {
    const [Data,setData] = React.useState<any>();
    const handleClickOpen = () => {
        const result = re_dessign.exec(FSD.val);
        if(result){
            const result2 = FSD.table.filter((val:any)=>val.dessign === result[1]);
            var post = {flg:"WordDataCalculation",Product:result2[0],tables:FSD.tables};
            func.postData(post)
            .then((data:any) => {
            console.log("chack:",{data:result2[0],cul:data.culculation,WorkData:data.WorkData});
            setData({data:result2[0],cul:data.culculation,WorkData:data.WorkData});
            })
        }
        FSD.setOpen(true);
    };

    const handleClose = () => {
        FSD.setOpen(false);
    };

    React.useEffect(()=>{
    },[])

    return (
        <div>
        <Button variant="outlined" onClick={handleClickOpen}>
            Open full-screen dialog
        </Button>
        <Dialog
            fullScreen
            open={FSD.open}
            onClose={handleClose}
        >
            <AppBar sx={{ position: 'relative' }}>
            <Toolbar>
                <IconButton
                edge="start"
                color="inherit"
                onClick={handleClose}
                aria-label="close"
                >
                <CloseIcon />
                </IconButton>
                <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                Sound
                </Typography>
                <Button autoFocus color="inherit" onClick={handleClose}>
                save
                </Button>
            </Toolbar>
            </AppBar>
            {Data? 
            <div>
                <table border={1} key={"table"}>
                    <tbody key={"body"}>
                        {/*製品情報チェック項目*/}
                        <tr>
                            <th><Checkbox />手配No.</th>
                            <th><Checkbox />ロットNo.</th>
                            <th><Checkbox />納入先</th>
                            <th><Checkbox />受注数</th>
                        </tr>
                        <tr>
                            <td>{Data.data.search_number}</td>
                            <td>{Data.data.deadline.replace(re,"$1$2$3-")+Data.data.lot}</td>
                            <td>{Data.data.destination}</td>
                            <td>{Data.data.quantity}</td>
                        </tr>
                        <tr>
                            <th><Checkbox />品番</th>
                            <th><Checkbox />設番</th>
                            <th><Checkbox />定格</th>
                            <th><Checkbox />サイズ</th>
                        </tr>
                        <tr>
                            <td>{Data.data.code}</td>
                            <td>{Data.data.dessign}</td>
                            <td>{(Data.data.code[0] === 'J'?parseFloat(Data.data.capacitance)/(10**6)+"F  ":parseFloat(Data.data.capacitance)+"μF  ")+Data.data.voltage+"V"}</td>
                            <td>{"φ"+parseFloat(Data.data.diameter)+"X"+parseFloat(Data.data.l_dimension)+"L"}</td>
                        </tr>
                        {/*巻取機使用部材*/}
                        <tr>
                            <td></td>
                            <th>コード</th>
                            <th>ロットNo.</th>
                            <th>厚み</th>
                            <th>幅</th>
                            <th>長さ</th>
                        </tr>
                        {Data.cul.parts.map((val:any)=>{
                            if(parts1.includes(val.name)){
                                return(
                                    <tr key={val.name}>
                                        <th><Checkbox />{val.name}</th>
                                        <td>{val.code}</td>
                                        <td><input/></td>
                                        <td>{val.thickness?val.thickness+"μm":""}</td>
                                        <td>{val.range?val.range+"mm":""}</td>
                                        <td>{val.length?func.Round(parseFloat(val.length),2)+"mm":""}</td>
                                    </tr>
                                )
                            }
                            return""
                        })}
                        <tr>
                            <th colSpan={2}>巻取機No.</th>
                            <td colSpan={2}><input/></td>
                        </tr>
                        {/*加締入力群*/}
                        <tr>
                            <th rowSpan={5}>
                                加締
                            </th>
                            <th colSpan={2}>
                                極性
                            </th>
                            <th colSpan={2}>
                                加締全長寸法<br/>{"(+)"+func.Round(parseFloat(Data.cul.parts[0].length))+" (-)"+func.Round(parseFloat(Data.cul.parts[1].length))}
                            </th>
                            <th>
                                Lo+S寸法
                                <br/>{parseFloat(Data.WorkData["l0"].reference)+parseFloat(Data.WorkData["s"].reference)}
                                <br/>{func.Round(parseFloat(Data.WorkData["l0"].reference)+parseFloat(Data.WorkData["s"].reference)+parseFloat(Data.WorkData["l0"].limit[0])+parseFloat(Data.WorkData["s"].limit[0]),3)+"~"+func.Round(parseFloat(Data.WorkData["l0"].reference)+parseFloat(Data.WorkData["s"].reference)+parseFloat(Data.WorkData["l0"].limit[1])+parseFloat(Data.WorkData["s"].limit[1]),3)}
                            </th>
                            <th>
                                加締厚
                                <br/>{parseFloat(Data.WorkData["swage_thickness"].reference)}
                                <br/>{func.Round(parseFloat(Data.WorkData["swage_thickness"].reference) + parseFloat(Data.WorkData["swage_thickness"].limit[0]),3) +"~"+func.Round(parseFloat(Data.WorkData["swage_thickness"].reference) + parseFloat(Data.WorkData["swage_thickness"].limit[1]),3)}
                            </th>
                            <th>
                                花びら形状
                            </th>
                            <th>
                                加締接触抵抗
                            </th>
                            <th>
                                加締点数
                            </th>
                        </tr>
                        {[...Array(4)].map((_, index) => {
                            return (
                            <tr key={index}>
                                {index%2===0?<th rowSpan={2}>{index/2+1}回目</th>:""}
                                <th>{index%2===0?"+極":"-極"}</th>
                                <td><input/></td>
                                <td><input/></td>
                                <td><input/></td>
                                <td>
                                    <RadioGroup>
                                        <FormControlLabel value="A" control={<Radio />} label="A" />
                                        <FormControlLabel value="B" control={<Radio />} label="B" />
                                        <FormControlLabel value="C" control={<Radio />} label="C" />
                                    </RadioGroup>
                                </td>
                                <td><input/></td>
                                <td><input/></td>
                                <td>{Data.WorkData.swage}<Checkbox /></td>
                            </tr>
                            )
                        })}
                        {/*巻取入力群*/}
                        <tr>
                            <th rowSpan={3}>
                                巻取
                            </th>
                            <th></th>
                            <th>G寸法
                                <br/>{Data.WorkData.g.reference}
                                <br/>{func.Round(parseFloat(Data.WorkData.g.reference) + parseFloat(Data.WorkData.g.limit[0]),3) +"~"+func.Round(parseFloat(Data.WorkData.g.reference) + parseFloat(Data.WorkData.g.limit[1]),3)}
                            </th>
                            <th>P寸法
                                <br/>{Data.WorkData.p2.reference}
                                <br/>{func.Round(parseFloat(Data.WorkData.p2.reference) + parseFloat(Data.WorkData.p2.limit[0]),3) +"~"+func.Round(parseFloat(Data.WorkData.p2.reference) + parseFloat(Data.WorkData.p2.limit[1]),3)}
                            </th>
                            <th>素子径
                                <br/>{Data.WorkData.sizu.reference}
                                <br/>{func.Round(parseFloat(Data.WorkData.sizu.reference) + parseFloat(Data.WorkData.sizu.limit[0]),3) +"~"+func.Round(parseFloat(Data.WorkData.sizu.reference) + parseFloat(Data.WorkData.sizu.limit[1]),3)}
                            </th>
                            <th>
                                ショート検出
                            </th>
                            <th>
                                素子内部の状態確認
                            </th>
                            <th>
                                素子の外観状態
                            </th>
                        </tr>
                        {[...Array(2)].map((_,index)=>{
                            return(
                                <tr key={index}>
                                    <th>{index+1}回目</th>
                                    <td><input/></td>
                                    <td><input/></td>
                                    <td><input/></td>
                                    <td><Checkbox /></td>
                                    <td><Checkbox /></td>
                                    <td><Checkbox /></td>
                                </tr>
                            )
                        })}
                        <tr>
                            <th>不良コード</th>
                            {windingError.map((val:any)=>{return(<th key={val}>{val}</th>)})}
                            <th>合計</th>
                            <th>備考</th>
                            <th>回送数</th>
                        </tr>
                        {[...Array(2)].map((_,index)=>{
                            return(
                                <tr key={index}>
                                    <th>{index%2 === 0?"数量(巻取)":"数量(ゴム通し)"}</th>
                                    {windingError.map((val:any)=>{return(<td key={val}><input/></td>)})}
                                    <td></td>
                                    {index%2 === 0?<td rowSpan={2}>巻取工程にてｺﾞﾑ通しを行う場合は裏面組立工程のゴム品番、メーカーを確認し、ロットNo.の記入を行うこと</td>:<></>}
                                    {index%2 === 0?<td rowSpan={2}><input/></td>:<></>}
                                </tr>
                            )
                        })}
                        {/*ゴム通し*/}
                        <tr>
                            <th rowSpan={4}>ゴム通し</th>
                        </tr>
                        <tr>
                            <td>
                                <RadioGroup>
                                    <FormControlLabel value="手動" control={<Radio />} label="手動" />
                                    <FormControlLabel value="自動" control={<Radio />} label="自動" />
                                </RadioGroup>
                            </td>
                            <th>備考</th>
                            <td><input/></td>
                        </tr>
                        <tr>
                            {rubberError.map((val:any)=>{return(<th key={val}>{val}</th>)})}
                            <th>合計</th>
                        </tr>
                        <tr>
                            {rubberError.map((val:any)=>{return(<td key={val}><input/></td>)})}
                            <td></td>
                        </tr>
                        {/*含浸・乾燥、入力項目*/}
                        <tr>
                            <th rowSpan={2}>含浸・乾燥</th>
                            <th>真空乾燥条件</th>
                            <th>真空乾燥機No.</th>
                            <th><Checkbox/>電解液</th>
                            <th>電解液ロットNo.</th>
                            <th>水分(100ppm以下)</th>
                            <th>含浸条件</th>
                            <th>含浸用恒温槽No.</th>
                            <th>備考</th>
                        </tr>
                        <tr>
                            <td><input/></td>
                            <td><input/></td>
                            <th>{Data.cul.parts.map((val:any)=>{
                                if(val.name==='電解液'){
                                    return val.code
                                }
                                return ""
                                })}
                            </th>
                            <td><input/></td>
                            <td><input/></td>
                            <td><input/></td>
                            <td><input/></td>
                            <td><input/></td>
                        </tr>
                        {/*組立、入力項目*/}
                        <tr>
                            <th rowSpan={5}>組立</th>
                            <th><Checkbox/>封入指導票</th>
                            <th><Checkbox/>ケースコード</th>
                            <th><Checkbox/>ゴムコード</th>
                            <th>露点チェック</th>
                            <th>組立機No.</th>
                            <th><Checkbox/>X線確認</th>
                        </tr>
                        <tr>
                            <th>{Data.data.inclusion_guid}</th>
                            <td><input/></td>
                            <td><input/></td>
                            <td>作業前:<input/>℃<br/>作業後:<input/>℃</td>
                            <td><input/></td>
                        </tr>
                        <tr>
                            <th>φD</th>
                            <th>L寸</th>
                            <th>φA</th>
                            <th>B寸</th>
                            <th>E寸</th>
                            <th>P寸</th>
                            <th>φd</th>
                        </tr>
                        <tr>
                            <th>
                                {Data.WorkData.fai_d.reference+"  " + Data.WorkData.fai_d.limit[0]+"+"+Data.WorkData.fai_d.limit[1]}
                            <br/>{func.Round(parseFloat(Data.WorkData.fai_d.reference)+parseFloat(Data.WorkData.fai_d.limit[0]),3)+"~"+func.Round(parseFloat(Data.WorkData.fai_d.reference)+parseFloat(Data.WorkData.fai_d.limit[1]),3)}
                            </th>
                            <th>
                                {Data.WorkData.l.reference+"  " + Data.WorkData.l.limit[0]+"+"+Data.WorkData.l.limit[1]}
                            <br/>{func.Round(parseFloat(Data.WorkData.l.reference)+parseFloat(Data.WorkData.l.limit[0]),3)+"~"+func.Round(parseFloat(Data.WorkData.l.reference)+parseFloat(Data.WorkData.l.limit[1]),3)}
                            </th>
                            <th>
                                {Data.WorkData.a.reference+"  " + Data.WorkData.a.limit[0]+"+"+Data.WorkData.a.limit[1]}
                            <br/>{func.Round(parseFloat(Data.WorkData.a.reference)+parseFloat(Data.WorkData.a.limit[0]),3)+"~"+func.Round(parseFloat(Data.WorkData.a.reference)+parseFloat(Data.WorkData.a.limit[1]),3)}
                            </th>
                            <th>
                                {Data.WorkData.b.reference+"  " + Data.WorkData.b.limit[0]+"+"+Data.WorkData.b.limit[1]}
                            <br/>{func.Round(parseFloat(Data.WorkData.b.reference)+parseFloat(Data.WorkData.b.limit[0]),3)+"~"+func.Round(parseFloat(Data.WorkData.b.reference)+parseFloat(Data.WorkData.b.limit[1]),3)}
                            </th>
                            <th>
                                {Data.WorkData.e.reference+"  " + Data.WorkData.e.limit[0]+"+"+Data.WorkData.e.limit[1]}
                            <br/>{func.Round(parseFloat(Data.WorkData.e.reference)+parseFloat(Data.WorkData.e.limit[0]),3)+"~"+func.Round(parseFloat(Data.WorkData.e.reference)+parseFloat(Data.WorkData.e.limit[1]),3)}
                            </th>
                            <th>
                                {Data.WorkData.p.reference+"  " + Data.WorkData.p.limit[0]+"+"+Data.WorkData.p.limit[1]}
                            <br/>{func.Round(parseFloat(Data.WorkData.p.reference)+parseFloat(Data.WorkData.p.limit[0]),3)+"~"+func.Round(parseFloat(Data.WorkData.p.reference)+parseFloat(Data.WorkData.p.limit[1]),3)}
                            </th>
                            <th>
                                {Data.WorkData.fai_d2.reference+"  " + Data.WorkData.fai_d2.limit[0]+"+"+Data.WorkData.fai_d2.limit[1]}
                            <br/>{func.Round(parseFloat(Data.WorkData.fai_d2.reference)+parseFloat(Data.WorkData.fai_d2.limit[0]),3)+"~"+func.Round(parseFloat(Data.WorkData.fai_d2.reference)+parseFloat(Data.WorkData.fai_d2.limit[1]),3)}
                            </th>
                        </tr>
                        <tr>
                            <td><input/></td>
                            <td><input/></td>
                            <td><input/></td>
                            <td><input/></td>
                            <td><input/></td>
                            <td><input/></td>
                            <td><input/></td>
                        </tr>
                        {/*仕上*/}
                        <tr>
                            <th rowSpan={2}>仕上</th>
                            <th><Checkbox/>仕上指導票</th>
                            <th><Checkbox/>チューブロットNo.<br/>{Data.cul.parts.map((val:any)=>{
                                if(val.name==='外チューブ'){
                                    return val.code
                                }
                                return ""
                            })}</th>
                            <th>マシンNo.</th>
                            <th>仕上工程</th>
                            <th>備考:仕上がり状態確認<Checkbox/></th>
                        </tr>
                        <tr>
                            <th>{Data.data.finish_guid}</th>
                            <td><input/></td>
                            <td><input/></td>
                            <td>
                                <RadioGroup>
                                    <FormControlLabel value="手動" control={<Radio />} label="手動" />
                                    <FormControlLabel value="自動" control={<Radio />} label="自動" />
                                </RadioGroup>
                            </td>
                            <td><input/></td>
                        </tr>
                        {/*エージング*/}
                        <tr>
                            <th rowSpan={2}>エージング(特性選別)</th>
                            <th>エージング仕掛かり</th>
                            <th>マシンNo.</th>
                            <th>エージング条件</th>
                            <th>備考:治具取付け状態<Checkbox/></th>
                        </tr>
                        <tr>
                            <td>
                                <RadioGroup>
                                    <FormControlLabel value="手動" control={<Radio />} label="手動" />
                                    <FormControlLabel value="自動" control={<Radio />} label="自動" />
                                </RadioGroup>
                            </td>
                            <td><input/></td>
                            <td>{Data.data.aging_voltage+"V"+Data.data.aging_temperature+"℃"}<Checkbox/></td>
                            <td><input/></td>
                        </tr>
                        {/*特性選別*/}
                        <tr>
                            <th rowSpan={7}>特性選別</th>
                            <th>抜き取り選別</th>
                            <th>マシンNo.</th>
                            <th>備考</th>
                        </tr>
                        <tr>
                            <td>抜取 (n=50)<Checkbox/></td>
                            <td><input/></td>
                            <td><input/></td>
                        </tr>
                        <tr>
                            <th colSpan={4}>抜き取り検査成績表 : 抜き取りデータ (n=50 別紙添付)</th>
                        </tr>
                        <tr>
                            <th rowSpan={2}>項目</th>
                            <th>容量</th>
                            <th>ESR</th>
                            <th>漏れ電流</th>
                        </tr>
                        <tr>
                            <td>{(Data.data.code[0] === 'J'?parseFloat(Data.data.capacitance)/(10**6)+"F  ":parseFloat(Data.data.capacitance)+"μF  ")+"-"+Data.data.capacitance_tolerance_level_outside[0]+"~+"+Data.data.capacitance_tolerance_level_outside[1]}
                                {"    "+func.Round((Data.data.code[0] === 'J'?parseFloat(Data.data.capacitance)/(10**6):parseFloat(Data.data.capacitance))*((100-parseFloat(Data.data.capacitance_tolerance_level_outside[0]))/100),4)}
                                ~{func.Round((Data.data.code[0] === 'J'?parseFloat(Data.data.capacitance)/(10**6):parseFloat(Data.data.capacitance))*((100+parseFloat(Data.data.capacitance_tolerance_level_outside[1]))/100),4)}

                            </td>
                            <td>{Data.data.outside_esr}
                            </td>
                            <td>{Data.data.outside_leakage_current}
                            </td>
                        </tr>
                        <tr>
                            <th>社内規格値</th>
                            <td>{func.Round((Data.data.code[0] === 'J'?parseFloat(Data.data.capacitance)/(10**6):parseFloat(Data.data.capacitance))*((100-parseFloat(Data.data.capacitance_tolerance_level_inside[0]))/100),4)}
                                ~{func.Round((Data.data.code[0] === 'J'?parseFloat(Data.data.capacitance)/(10**6):parseFloat(Data.data.capacitance))*((100+parseFloat(Data.data.capacitance_tolerance_level_inside[1]))/100),4)}
                            </td>
                            <td>{"社内規格値:"+Data.data.inside_esr}</td>
                            <td>{Data.data.inside_leakage_current}</td>
                        </tr>
                        <tr>
                            <th>実測値</th>
                            <td><input/></td>
                            <td><input/></td>
                            <td><input/></td>
                        </tr>
                        {/*二次加工*/}
                        {Data.cul.product.machining?
                        <tr>
                            <th rowSpan={2}>二次加工</th>
                            <th><Checkbox/>二次加工指導票</th>
                            <th>マシンNo.</th>
                        </tr>
                        :<></>}
                    </tbody>
                </table>
            </div>
            :<></>}
        </Dialog>
        </div>
    );
}
