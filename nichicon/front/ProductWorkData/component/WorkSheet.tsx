import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Checkbox from '@mui/material/Checkbox';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import React from 'react'
import * as func from "../../Components/func";
//アイコン
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
//import CatchingPokemonIcon from '@mui/icons-material/CatchingPokemon';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import {DataSetCalculation,DataSetConstant} from '../../Components/ProductSelect';
import {CreatePicture} from '../../Components/CreatePicter';

//CSS関係
import styled from "styled-components";
import './style.css';

import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';

import {Camera} from '../../Components/Camera';
//import { CreatePicture } from '../ProductSpecification/CreatePicter';
import {CapacitanceToleranceLevelInside,MachiningRideArray,MachiningTapingArray,MachiningLFormingArray,re,re_dessign} from '../../Data/Data';
import type { FormProps } from '../../Data/Data';
import { useForm } from 'react-hook-form';
import { TextField } from '@mui/material';

const parts1 = ["陽極箔","陰極箔","電解紙","耐圧紙","素子止めテープ","-リード","+リード","-タブ","+タブ"];
//巻取のエラーコード一覧(意味は分かりません)
const windingError = [391,326,319,392,330,344,351,399];
//ゴム通しのエラーコード一覧(意味は分からん)
const rubberError = [373,393,380,370,360];
//外観検査のエラーコード一覧(イミフ)
const appearanceError = [327,329,332,334,335,340,341,379,385,386,389,383,384,360,348,501];

const Complete = styled.div`
  display: grid;
  grid-template-columns: 100px 200px;
  color: blue;
`


export function FullScreenDialog(FSD:any) {
    const [Data,setData] = React.useState<any>();
    const [Pict,setPict] = React.useState<any>();
    const { register, watch, resetField, setValue } = useForm<FormProps>();
    const watchBase = watch(`Base`);
    const watchProgress = watch(`Progress`);
    const watchStartTime = watch(`StartTime`);
    const watchPicSelect = watch(`PictureSelect`)
    //const [Pict,setPict] = React.useState<any>();
    //setPict(CreatePicture(watchPicSelect,watch,resetField,register,state));
    const handleClickOpen = () => {
        const result = re_dessign.exec(FSD.val);
        if(result){
            const result2 = FSD.table.filter((val:any)=>val.dessign === result[1]);
            var post = {flg:"WorkDataCalculation",Product:result2[0],tables:FSD.tables};
            func.postData(post)
            .then((data:any) => {
                console.log("chack:",{data:result2[0],cul:data.culculation,WorkData:data.WorkData});
                setData({data:result2[0],cul:data.culculation,WorkData:data.WorkData});
                DataSetConstant(result2[0],setValue);
                DataSetCalculation(data.culculation,setValue);
            })
        }
        FSD.setOpen(true);
    };

    const handleClose = () => {
        FSD.setOpen(false);
    };

    const handleBase = () => {
        let date = new Date();
        if(watchBase){
            var Baseflg = true;
            for(var boo in watchBase){
                if(!watchBase[boo]){
                    Baseflg = false;
                }
            }
            if(Baseflg && watchStartTime !== undefined){
                setValue(`EndTime`,date);
                console.log(watchStartTime,watch(`EndTime`));
                var post = {flg:"WorkDataBaseCompletion",progress:1,id:Data.data.id,deadline:Data.data.deadline,
                schedule:{start_time:watchStartTime.toLocaleString(),end_time:watch(`EndTime`).toLocaleString(),process:0}};
                func.postData(post);
                setValue(`Progress`,1);
                setValue(`StartTime`,undefined);
            }
        }
    }

    const handleWinding = () => {
        var ElementFlg = true;
        var Element = watch(`parts`).map((val)=>{
            let ans = {};
            if(parts1.includes(val.name)){
                if(!val.check || !val.lot_number){
                    ElementFlg = false;
                }
                else{
                    ans["lot_number"] = val.lot_number;
                    ans["name"] = val.name;
                    ans["table_name"] = val.table_name;
                    ans["code"] = val.code;
                }
            }
            return ans
        })
        console.log(Element);
        if(ElementFlg){
            console.log("部材問題なし");
            if(watch(`winding_machine`)){
                console.log("巻取機問題なし");
                var WindingFlg = true;
                watch(`CaulkingAndWinding`).map((val)=>{
                    Object.keys(val).map((key)=>{
                        if(!val[key]){
                            WindingFlg = false;
                        }
                        return ""
                    })
                    return ""
                })
                if(WindingFlg){
                    console.log(watch(`CaulkingAndWinding`).length+"回目巻取入力問題なし");
                }
            }
        }

    }

    React.useEffect(()=>{
        setValue(`CaulkingAndWinding_number`,1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[])

    React.useEffect(()=>{
        if(watchPicSelect){
            setPict(CreatePicture(watchPicSelect,watch,resetField,register,0));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[watchPicSelect])

    return (
        <div>
        <Button variant="outlined" onClick={handleClickOpen}>
            {FSD.val}
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
                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        {watchProgress >= 1?
                        <Complete><Typography variant="h6">基本情報</Typography><CheckCircleIcon/></Complete>
                        :<Typography variant="h6">基本情報</Typography>}
                    </AccordionSummary>
                    <Button onClick={()=>{setValue(`StartTime`,new Date())}} disabled={watchProgress >= 1}>作業開始</Button>
                    <table border={1} key={"base"}>
                        <tbody key={"body"}>
                            {/*製品情報チェック項目*/}
                            <tr>
                                <th><Checkbox {...register(`Base.0`)} disabled={watchProgress >= 1 || watchStartTime === undefined}/>手配No.</th>
                                <th><Checkbox {...register(`Base.1`)} disabled={watchProgress >= 1 || watchStartTime === undefined}/>ロットNo.</th>
                                <th><Checkbox {...register(`Base.2`)} disabled={watchProgress >= 1 || watchStartTime === undefined}/>納入先</th>
                                <th><Checkbox {...register(`Base.3`)} disabled={watchProgress >= 1 || watchStartTime === undefined}/>受注数</th>
                            </tr>
                            <tr>
                                <td>{Data.data.search_number}</td>
                                <td>{Data.data.deadline.replace(re,"$1$2$3-")+Data.data.lot}</td>
                                <td>{Data.data.destination}</td>
                                <td>{Data.data.quantity}</td>
                            </tr>
                            <tr>
                                <th><Checkbox {...register(`Base.4`)} disabled={watchProgress >= 1 || watchStartTime === undefined}/>品番</th>
                                <th><Checkbox {...register(`Base.5`)} disabled={watchProgress >= 1 || watchStartTime === undefined}/>設番</th>
                                <th><Checkbox {...register(`Base.6`)} disabled={watchProgress >= 1 || watchStartTime === undefined}/>定格</th>
                                <th><Checkbox {...register(`Base.7`)} disabled={watchProgress >= 1 || watchStartTime === undefined}/>サイズ</th>
                            </tr>
                            <tr>
                                <td>{Data.data.code}</td>
                                <td>{Data.data.dessign}</td>
                                <td>{(Data.data.code[0] === 'J'?parseFloat(Data.data.capacitance)/(10**6)+"F  ":parseFloat(Data.data.capacitance)+"μF  ")+Data.data.voltage+"V"}</td>
                                <td>{"φ"+parseFloat(Data.data.diameter)+"X"+parseFloat(Data.data.l_dimension)+"L"}</td>
                            </tr>
                        </tbody>
                    </table>
                    <Button onClick={handleBase} disabled={watchProgress >= 1 || watchStartTime === undefined}>作業完了</Button>
                </Accordion>
                
                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        {watchProgress >= 2?
                        <Complete><Typography variant="h6">巻取</Typography><CheckCircleIcon/></Complete>
                        :<Typography variant="h6">巻取</Typography>}
                    </AccordionSummary>
                    <Button onClick={()=>{setValue(`StartTime`,new Date())}} disabled={watchProgress >= 2}>作業開始</Button>
                    <table border={1} key={"winding"}>
                        <tbody key={"body"}>
                            {/*巻取機使用部材*/}
                            <tr>
                                <th rowSpan={watch(`parts`).filter((val:any)=>parts1.includes(val.name)).length+2}>巻取部材</th>
                                <th className='yoko'>使用部材名</th>
                                <th>コード</th>
                                <th>ロットNo.</th>
                                <th>厚み</th>
                                <th>幅</th>
                                <th>長さ</th>
                            </tr>
                            {watch(`parts`).map((val:any,index:number)=>{
                                if(parts1.includes(val.name)){
                                    return(
                                        <tr key={val.name}>
                                            <th><Checkbox {...register(`parts.${index}.check`)}/>{val.name}</th>
                                            <td>{val.code}</td>
                                            <td><TextField {...register(`parts.${index}.lot_number`)}/></td>
                                            <td>{val.thickness?val.thickness+"μm":""}</td>
                                            <td>{val.range?val.range+"mm":""}</td>
                                            <td>{val.length?func.Round(parseFloat(val.length),2)+"mm":""}</td>
                                        </tr>
                                    )
                                }
                                return""
                            })}
                            <tr>
                                <th>巻取機No.</th>
                                <td><TextField {...register(`winding_machine`)}/></td>
                            </tr>
                            {/*加締入力群*/}
                            <tr>
                                <th rowSpan={watch(`CaulkingAndWinding_number`)+2}>
                                    加締
                                </th>
                                <th colSpan={2}>
                                    極性
                                </th>
                                <th>
                                    加締全長寸法<br/>{"(+)"+func.Round(parseFloat(Data.cul.parts[0].length))+" (-)"+func.Round(parseFloat(Data.cul.parts[1].length))}
                                </th>
                                <th>
                                    Lo+S寸法
                                    <br/>{parseFloat(Data.WorkData["l0"].reference)+parseFloat(Data.WorkData["s"].reference)}
                                    <br/>{func.Round(parseFloat(Data.WorkData["l0"].limit[0])+parseFloat(Data.WorkData["s"].limit[0]),3)+"~"+func.Round(parseFloat(Data.WorkData["l0"].limit[1])+parseFloat(Data.WorkData["s"].limit[1]),3)}
                                </th>
                                <th>
                                    加締厚
                                    <br/>{parseFloat(Data.WorkData["swage_thickness"].reference)}
                                    <br/>{func.Round(parseFloat(Data.WorkData["swage_thickness"].limit[0]),3) +"~"+func.Round(parseFloat(Data.WorkData["swage_thickness"].limit[1]),3)}
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
                            {[...Array(watch(`CaulkingAndWinding_number`))].map((_, index) => ([
                                        <tr key={index+"+"}>
                                            <th rowSpan={2}>{index+1}回目</th>
                                            <th>+極</th>
                                            <td><TextField type="number" {...register(`CaulkingAndWinding.${index}.full_length_plus`)}/></td>
                                            <td><TextField type="number" {...register(`CaulkingAndWinding.${index}.los_plus`)}/></td>
                                            <td><TextField type="number" {...register(`CaulkingAndWinding.${index}.thickness_plus`)}/></td>
                                            <td>
                                                <RadioGroup {...register(`CaulkingAndWinding.${index}.petal_shape_plus`)}>
                                                    <FormControlLabel value="A" control={<Radio />} label="A"/>
                                                    <FormControlLabel value="B" control={<Radio />} label="B"/>
                                                    <FormControlLabel value="C" control={<Radio />} label="C"/>
                                                </RadioGroup>
                                            </td>
                                            <td><TextField type="number" {...register(`CaulkingAndWinding.${index}.contact_resistance_plus`)}/></td>
                                            <td>{Data.WorkData.swage}<Checkbox onChange={(e)=>{e.target.checked?setValue(`CaulkingAndWinding.${index}.swage_plus`,Data.WorkData.swage):setValue(`CaulkingAndWinding.${index}.swage_plus`,null)}}/></td>
                                        </tr>,
                                        <tr key={index+"-"}>
                                            <th>-極</th>
                                            <td><TextField type="number" {...register(`CaulkingAndWinding.${index}.full_length_minus`)}/></td>
                                            <td><TextField type="number" {...register(`CaulkingAndWinding.${index}.los_minus`)}/></td>
                                            <td><TextField type="number" {...register(`CaulkingAndWinding.${index}.thickness_minus`)}/></td>
                                            <td>
                                                <RadioGroup {...register(`CaulkingAndWinding.${index}.petal_shape_minus`)}>
                                                    <FormControlLabel value="A" control={<Radio />} label="A"/>
                                                    <FormControlLabel value="B" control={<Radio />} label="B"/>
                                                    <FormControlLabel value="C" control={<Radio />} label="C"/>
                                                </RadioGroup>
                                            </td>
                                            <td><TextField type="number" {...register(`CaulkingAndWinding.${index}.contact_resistance_minus`)}/></td>
                                            <td>{Data.WorkData.swage}<Checkbox onChange={(e)=>{e.target.checked?setValue(`CaulkingAndWinding.${index}.swage_minus`,Data.WorkData.swage):setValue(`CaulkingAndWinding.${index}.swage_minus`,null)}}/></td>
                                        </tr>
                                ])
                            )}
                            {/*巻取入力群*/}
                            <tr>
                                <th rowSpan={watch(`CaulkingAndWinding_number`)+4}>
                                    巻取
                                </th>
                                <th></th>
                                <th>G寸法
                                    <br/>{Data.WorkData.g.reference}
                                    <br/>{func.Round(parseFloat(Data.WorkData.g.limit[0]),3)}~{func.Round(parseFloat(Data.WorkData.g.limit[1]),3)}
                                </th>
                                <th>P寸法
                                    <br/>{Data.WorkData.p2.reference}
                                    <br/>{func.Round(parseFloat(Data.WorkData.p2.limit[0]),3)}~{func.Round(parseFloat(Data.WorkData.p2.limit[1]),3)}
                                </th>
                                <th>素子径
                                    <br/>{Data.WorkData.sizu.reference}
                                    <br/>{func.Round(parseFloat(Data.WorkData.sizu.limit[0]),3)}~{func.Round(parseFloat(Data.WorkData.sizu.limit[1]),3)}
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
                            {[...Array(watch(`CaulkingAndWinding_number`))].map((_,index)=>{
                                return(
                                    <tr key={index}>
                                        <th>{index+1}回目</th>
                                        <td><TextField type="number" {...register(`CaulkingAndWinding.${index}.g`)}/></td>
                                        <td><TextField type="number" {...register(`CaulkingAndWinding.${index}.p`)}/></td>
                                        <td><TextField type="number" {...register(`CaulkingAndWinding.${index}.diameter`)}/></td>
                                        <td><Checkbox {...register(`CaulkingAndWinding.${index}.short_check`)}/></td>
                                        <td><Checkbox {...register(`CaulkingAndWinding.${index}.internal_state`)}/></td>
                                        <td><Checkbox {...register(`CaulkingAndWinding.${index}.appearance`)}/></td>
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
                            <tr>
                                <th>数量(巻取)</th>
                                {windingError.map((val:any,index:number)=>{return(<td key={val}><TextField type="number" {...register(`WindingError.${index}.windingquantity`)}/></td>)})}
                                <td>{watch(`WindingError`).reduce((sum,val) => val.windingquantity?sum+parseFloat(val.windingquantity):sum,0)}</td>
                                <td rowSpan={2}>巻取工程にてｺﾞﾑ通しを行う場合は裏面組立工程のゴム品番、メーカーを確認し、ロットNo.の記入を行うこと</td>
                                <td rowSpan={2}><TextField type="number" {...register(`WindingQuantity`)}/></td>
                            </tr>
                            <tr>
                                <th>数量(ゴム通し)</th>
                                {windingError.map((val:any,index:number)=>{return(<td key={val}><TextField type="number" {...register(`WindingError.${index}.rubberquantity`)}/></td>)})}
                                <td>{watch(`WindingError`).reduce((sum,val) => val.rubberquantity?sum+parseFloat(val.rubberquantity):sum,0)}</td>
                            </tr>
                                
                        </tbody>
                    </table>
                    <Button onClick={handleWinding} disabled={watchProgress >= 2 || watchStartTime === undefined}>作業完了</Button>
                </Accordion>

                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6">ゴム通し</Typography>
                    </AccordionSummary>
                    <table border={1} key={"rubber"}>
                        <tbody key={"body"}>
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
                        </tbody>
                    </table>
                </Accordion>

                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6">含浸・乾燥</Typography>
                    </AccordionSummary>
                    <table border={1} key={"impregnation"}>
                        <tbody key={"body"}>
                            
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
                        </tbody>
                    </table>
                </Accordion>

                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6">組立</Typography>
                    </AccordionSummary>
                    <table border={1} key={"assembly"}>
                        <tbody key={"body"}>
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
                                    {Data.WorkData.fai_d.reference}
                                <br/>{func.Round(parseFloat(Data.WorkData.fai_d.limit[0]),3)}~{func.Round(parseFloat(Data.WorkData.fai_d.limit[1]),3)}
                                </th>
                                <th>
                                    {Data.WorkData.l.reference}
                                <br/>{func.Round(parseFloat(Data.WorkData.l.limit[0]),3)}~{func.Round(parseFloat(Data.WorkData.l.limit[1]),3)}
                                </th>
                                <th>
                                    {Data.WorkData.a.reference}
                                <br/>{func.Round(parseFloat(Data.WorkData.a.limit[0]),3)}~{func.Round(parseFloat(Data.WorkData.a.limit[1]),3)}
                                </th>
                                <th>
                                    {Data.WorkData.b.reference}
                                <br/>{func.Round(parseFloat(Data.WorkData.b.reference)+parseFloat(Data.WorkData.b.limit[0]),3)+"~"+func.Round(parseFloat(Data.WorkData.b.reference)+parseFloat(Data.WorkData.b.limit[1]),3)}
                                </th>
                                <th>
                                    {Data.WorkData.e.reference}
                                <br/>{func.Round(parseFloat(Data.WorkData.e.limit[0]),3)}~{func.Round(parseFloat(Data.WorkData.e.limit[1]),3)}
                                </th>
                                <th>
                                    {Data.WorkData.p.reference}
                                <br/>{func.Round(parseFloat(Data.WorkData.p.limit[0]),3)}~{func.Round(parseFloat(Data.WorkData.p.limit[1]),3)}
                                </th>
                                <th>
                                    {Data.WorkData.fai_d2.reference}
                                <br/>{func.Round(parseFloat(Data.WorkData.fai_d2.limit[0]),3)}~{func.Round(parseFloat(Data.WorkData.fai_d2.limit[1]),3)}
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
                        </tbody>
                    </table>
                </Accordion>

                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6">仕上</Typography>
                    </AccordionSummary>
                    <table border={1} key={"end"}>
                        <tbody key={"body"}>
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
                            
                        </tbody>
                    </table>
                </Accordion>

                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6">エージング</Typography>
                    </AccordionSummary>
                    <table border={1} key={"aging"}>
                        <tbody key={"body"}>
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
                            
                        </tbody>
                    </table>
                </Accordion>

                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6">特性選別</Typography>
                    </AccordionSummary>
                <table border={1} key={"characteristic_sorting"}>
                    <tbody key={"body"}>
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
                            <td>{(Data.data.code[0] === 'J'?parseFloat(Data.data.capacitance)/(10**6)+"F  ":parseFloat(Data.data.capacitance)+"μF  ")+"-"+Data.data.capacitance_tolerance_level_outside.replace(CapacitanceToleranceLevelInside,"$1")}~+{Data.data.capacitance_tolerance_level_outside.replace(CapacitanceToleranceLevelInside,"$2")}
                                {" "+func.Round((Data.data.code[0] === 'J'?parseFloat(Data.data.capacitance)/(10**6):parseFloat(Data.data.capacitance))*(100+parseFloat(Data.data.capacitance_tolerance_level_outside.replace(CapacitanceToleranceLevelInside,"$1")))/100,4)}
                                ~{func.Round((Data.data.code[0] === 'J'?parseFloat(Data.data.capacitance)/(10**6):parseFloat(Data.data.capacitance))*(100+parseFloat(Data.data.capacitance_tolerance_level_outside.replace(CapacitanceToleranceLevelInside,"$2")))/100,4)}
                            </td>
                            <td>{Data.data.outside_esr}
                            </td>
                            <td>{Data.data.outside_leakage_current}
                            </td>
                        </tr>
                        <tr>
                            <th>社内規格値</th>
                            <td>{func.Round((Data.data.code[0] === 'J'?parseFloat(Data.data.capacitance)/(10**6):parseFloat(Data.data.capacitance))*((100+parseFloat(Data.data.capacitance_tolerance_level_inside.replace(CapacitanceToleranceLevelInside,"$1")))/100),4)}
                                ~{func.Round((Data.data.code[0] === 'J'?parseFloat(Data.data.capacitance)/(10**6):parseFloat(Data.data.capacitance))*((100+parseFloat(Data.data.capacitance_tolerance_level_inside.replace(CapacitanceToleranceLevelInside,"$2")))/100),4)}
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
                        
                    </tbody>
                </table>
                </Accordion>

                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6">2次加工</Typography>
                    </AccordionSummary>
                <table border={1} key={"machining"}>
                    <tbody key={"body"}>
                        {/*二次加工*/}
                        {Data.cul.product.machining?<>
                            <tr>
                                <th rowSpan={2}>二次加工</th>
                                <th><Checkbox/>二次加工指導票</th>
                                <th>マシンNo.</th>
                                {Data.cul.machining.Type === 'ride'?<>
                                    {Object.keys(Data.cul.machining).map((key:string)=>{
                                        if(Data.cul.machining[key] && MachiningRideArray.includes(key)){
                                            return (
                                                <th key={key}>
                                                    {key}寸法<br/>{Data.cul.machining[key].reference}
                                                    <br/>{Data.cul.machining[key].limit[0]}~{Data.cul.machining[key].limit[1]}
                                                </th>
                                            )
                                        }
                                        return null
                                    })}
                                </>:<></>}
                                {Data.cul.machining.Type === 'Lforming'?<>
                                    {Object.keys(Data.cul.machining).map((key:string)=>{
                                        if(Data.cul.machining[key] && MachiningLFormingArray.includes(key)){
                                            return (
                                                <th key={key}>
                                                    {key}寸法<br/>{Data.cul.machining[key].reference}
                                                    <br/>{Data.cul.machining[key].limit[0]}~{Data.cul.machining[key].limit[1]}
                                                </th>
                                            )
                                        }
                                        return null
                                    })}
                                </>:<></>}
                                {Data.cul.machining.Type === 'Taping'?<>
                                    <th><Checkbox/>治具取付け確認</th>
                                    {Object.keys(Data.cul.machining).map((key:string)=>{
                                        if(Data.cul.machining[key] && MachiningTapingArray.includes(key)){
                                            return (
                                                <th key={key}>
                                                    {key}寸法<br/>{Data.cul.machining[key].reference}
                                                    <br/>{Data.cul.machining[key].limit[0]}~{Data.cul.machining[key].limit[1]}
                                                </th>
                                            )
                                        }
                                        return null
                                    })}
                                </>:<></>}
                                <th>備考</th>
                            </tr>
                            <tr>
                                <td>{Data.data.machining_guid}</td>
                                <td><input/></td>
                                {Object.keys(Data.cul.machining).map((key:any)=>{
                                    if(Data.cul.machining.Type === 'ride'){
                                        if(Data.cul.machining[key] && MachiningRideArray.includes(key)){
                                            return <td key={key}><input/></td>
                                        }
                                    }
                                    else if(Data.cul.machining.Type === 'Lforming'){
                                        if(Data.cul.machining[key] && MachiningLFormingArray.includes(key)){
                                            return <td key={key}><input/></td>
                                        }
                                    }
                                    else if(Data.cul.machining.Type === 'Taping'){
                                        if(Data.cul.machining[key] && MachiningTapingArray.includes(key)){
                                            return <td key={key}><input/></td>
                                        }
                                    }
                                    return null
                                })
                                }
                                <td><input/></td>
                            </tr>
                        </>:<></>}
                    </tbody>
                </table>
                </Accordion>
                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6">外観検査</Typography>
                    </AccordionSummary>
                <table border={1} key={"appearance"}>
                    <tbody key={"body"}>
                        {/*外観検査*/}
                        <tr key={"外観検査"}>
                            <th rowSpan={4}>外観検査</th>
                            <th>備考</th>
                            <th>梱包前数量確認欄</th>
                            <th>端数</th>
                        </tr>
                        <tr>
                            <td><input/></td>
                            <td><input/></td>
                            <td><input/></td>
                        </tr>
                        <tr>
                            {appearanceError.map((val:any)=>{
                                return <th key={val}>{val}</th>
                            })}
                        </tr>
                        <tr>
                            {appearanceError.map((val:any)=>{
                                return <td key={val}><input/></td>
                            })}
                        </tr>
                    </tbody>
                </table>
                </Accordion>

                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6">出荷検査</Typography>
                    </AccordionSummary>
                <table border={1} key={"outgoing_inspection"}>
                    <tbody key={"body"}>
                        <tr key={"出荷検査"}>
                            <th rowSpan={6}>出荷検査</th>
                            <th colSpan={4}>チューブカメラ</th>
                            <th colSpan={6}>チューブ表示</th>
                        </tr>
                        <tr>
                            <td colSpan={4}><Camera/></td>
                            <td colSpan={6}><Checkbox/>{Pict}</td>
                        </tr>
                        <tr>
                            {Data.cul.product.secretNo?Data.cul.product.sercretNo.outgoing_inspection_check.map((val:any,index:number)=>(<th key={index}>{val}</th>)):<></>}
                            <th>製品長さmm:L0<br/>{Data.WorkData.l0max.reference}
                            <br/>{Data.WorkData.l0max.limit[0]}~{Data.WorkData.l0max.limit[1]}</th>
                            <th>製品直径mm:D0<br/>{Data.WorkData.d0max.reference}
                            <br/>{Data.WorkData.d0max.limit[0]}~{Data.WorkData.d0max.limit[1]}</th>
                            {Data.cul.machining?
                                Data.cul.machining.Type === 'ride'?<th>端子長さmm<br/>{Data.cul.machining.l.reference}
                                <br/>{Data.cul.machining.l.limit[0]}~{Data.cul.machining.l.limit[1]}</th>
                                :Data.cul.machining.Type === 'Lforming'?<>
                                <th>端子折り曲げ方向確認</th>
                                <th>端子長さK:mm<br/>{Data.cul.machining.k.reference}
                                <br/>{Data.cul.machining.k.limit[0]}~{Data.cul.machining.k.limit[1]}</th>
                                <th>端子長さℓ:mm<br/>{Data.cul.machining.liter.reference}
                                <br/>{Data.cul.machining.liter.limit[0]}~{Data.cul.machining.liter.limit[1]}</th></>
                                :Data.cul.machining.Type === 'Taping'?<>
                                <th>治具による確認(テーピング品)</th></>:<></>
                                :<>
                                <th>端子長さmm:+<br/>{Data.WorkData.ride_p.reference}
                                <br/>{Data.WorkData.ride_p.limit[0]}~{Data.WorkData.ride_p.limit[1]}</th>
                                <th>端子長さmm:-<br/>{Data.WorkData.ride_m.reference}
                                <br/>{Data.WorkData.ride_m.limit[0]}~{Data.WorkData.ride_m.limit[1]}</th>
                            </>}
                            <th>測定温度℃</th>
                            <th>測定湿度%</th>
                            <th>測定数</th>
                            <th>キープ</th>
                        </tr>
                        <tr>
                            {Data.cul.product.secretNo?Data.cul.product.sercretNo.outgoing_inspection_check.map((val:any,index:number)=>(<td key={index}><Checkbox/></td>)):<></>}
                            <td><input/></td>
                            <td><input/></td>
                            {Data.cul.machining?
                            Data.cul.machining.Type === 'ride'?<td><input/></td>:
                            Data.cul.machining.Type === 'Lforming'?<><td><Checkbox/></td><td><input/></td><td><input/></td></>:
                            Data.cul.machining.Type === 'Taping'?<><td><Checkbox/></td></>:
                            <></>:
                            <></>}
                            <td><input/></td>
                            <td><input/></td>
                            <td><input/></td>
                            <td><input/></td>
                        </tr>
                        
                    </tbody>
                </table>
                </Accordion>

            </div>
            :<></>}
        </Dialog>
        </div>
    );
}
