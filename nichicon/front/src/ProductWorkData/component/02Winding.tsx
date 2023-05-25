import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Checkbox from '@mui/material/Checkbox';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import * as func from "../../Components/func";
import Autocomplete from '@mui/material/Autocomplete';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';

//アイコン
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
//import CatchingPokemonIcon from '@mui/icons-material/CatchingPokemon';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

//CSS関係
import styled from "styled-components";
import '../../style.css';

import React from 'react'

import {WindingList} from '../../Data/Data';

const parts1 = ["陽極箔","陰極箔","電解紙","電解紙2","耐圧紙","素子止めテープ","-リード","+リード","-タブ","+タブ"];
const foil = ["陽極箔","陰極箔"];
//巻取のエラーコード一覧(意味は分かりません)
const windingError = [391,326,319,392,330,344,351,399];
const Complete = styled.div`
  display: grid;
  grid-template-columns: 100px 200px;
  color: blue;
`
const Cell = styled.td`
  background-image: linear-gradient(to right top, transparent calc(50% - 0.5px), #999 50%, #999 calc(50% + 0.5px), transparent calc(50% + 1px));
`

export function Winding(W:any) {
    const watchProgress = W.watch(`progress`);
    const watchStartTime = W.watch(`StartTime`);
    const [count,setCount] = React.useState<number>((W.Data.data.winding?W.Data.data.winding.length+1:1));
    const [state,setState] = React.useState<number>(0);
    const [open,setOpen] = React.useState<boolean[]>([false,false,false,false]);
    const [check,setCheck] = React.useState<boolean[]>([false,false,false]);
    const [parts,setParts] = React.useState<any>();
    const [equipment,setEquipment] = React.useState<any>();
    const [caulking,setCaulking] = React.useState<any>({});
    //const [winding,setWinding] = React.useState<any>({});
    const [pIndex,setPIndex] = React.useState<number>();
    const handleWinding = () => {
        func.postData({flg:'WorkDataWindingProcess',state:state,data:W.watch(),WindingList:WindingList,count:count}).then((Data:any) => {
            if(Data.data.check){
                W.setValue(`progress`,2);
                W.setValue(`StartTime`,undefined);
                setCount(count+1);
            }
        })
    }

    const handleCodeChange2 = (data:any)=> {
        if(data){
            setParts((prev:any) => ({ ...prev, lot_number:null }));
            setParts((prev:any) => ({ ...prev, code:data.code }));
        }
    }

    const PartsCheck = (val:any,index:number) =>{
        setParts(val);
        setPIndex(index);
        setOpen((p)=>p.map((val,index)=>(index === 0?true:val)));
    }

    const TemporarilySubmit = (flg:number=-1) => {
        if(flg === -1){
            setOpen((p)=>p.map((val,index)=>(index === 0?false:val)));
            W.setValue(`parts.${pIndex}.check`,true);
            for(var row in parts){
                W.setValue(`parts.${pIndex}.${row}`,parts[row]);
            }
        }
        else{
            setOpen((p)=>p.map((val,index)=>(index === flg+1?false:val)));
            setCheck((p)=>p.map((val,index)=>(index === flg?true:val)));
            if(flg===0){
                W.setValue(`Equipment`,equipment);
            }
            else if(flg === 1){
                for(row in caulking){
                    W.setValue(`CaulkingAndWinding.${count-1}.${row}`,caulking[row]);
                }
            }
        }
    }

    const handleCaulkingAndWinding = (index:number) => {
        setOpen((p)=>p.map((val,i)=>(i === 2?true:val)));
        setCaulking(W.watch(`CaulkingAndWinding.${index}`));
    }
    
    return (
        <Accordion disabled={watchProgress < 1}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                {watchProgress >= 2?
                <Complete><Typography variant="h6">巻取</Typography><CheckCircleIcon/></Complete>
                :<Typography variant="h6">巻取</Typography>}
            </AccordionSummary>
            <Button onClick={()=>{W.setValue(`StartTime`,new Date())}} disabled={watchProgress === 2}>作業開始</Button>
            <div>
                <RadioGroup onChange={(e)=>setState(parseFloat(e.target.value))} defaultValue={0}>
                    <FormControlLabel value={0} control={<Radio />} label="一時保管" disabled={!W.watch(`StartTime`)}/>
                    <FormControlLabel value={1} control={<Radio />} label={count+"回目保存"} disabled={!W.watch(`StartTime`)}/>
                    <FormControlLabel value={2} control={<Radio />} label="巻取終了:不良品数入力" disabled={!W.watch(`StartTime`)}/>
                </RadioGroup>
            </div>
            {state !== 2?
            <table border={1} key={"winding"}>
                <tbody key={"body"}>
                    {/*巻取機使用部材*/}
                    <tr>
                        <th rowSpan={W.watch(`parts`).filter((val:any)=>parts1.includes(val.name)).length+2}>巻取部材</th>
                        <th colSpan={2}>チェック:使用部材名</th>
                        <th>コード</th>
                        <th>ロットNo.</th>
                        <th>数量</th>
                        <th>厚み μm</th>
                        <th>幅 mm</th>
                        <th>長さ mm</th>
                    </tr>
                    {W.watch(`parts`).map((val:any,index:number)=>{
                        if(parts1.includes(val.name)){
                            return(
                                <tr key={val.name}>
                                    <th colSpan={2}><Button variant="contained" onClick={()=>PartsCheck(val,index)} disabled={!W.watch(`StartTime`)}>入力</Button>
                                    <Checkbox checked={W.watch(`parts.${index}.check`)?W.watch(`parts.${index}.check`):false} {...W.register(`parts.${index}.check`)} disabled/>{val.name}</th>
                                    <td>{val.code}</td>
                                    <td>{val.lot_number}</td>
                                    <td>{func.Round(W.watch(`parts.${index}.quantity`))}</td>
                                    {!WindingList.thickness.includes(val.name)?<Cell></Cell>:<td>{func.Round(parseFloat(W.watch(`parts.${index}.thickness`)),2)}</td>}
                                    {!WindingList.range.includes(val.name)?<Cell></Cell>:<td>{func.Round(parseFloat(W.watch(`parts.${index}.range`)),2)}</td>}
                                    {!WindingList.length.includes(val.name)?<Cell></Cell>:<td>{func.Round(parseFloat(W.watch(`parts.${index}.length`)),2)}</td>}
                                </tr>
                            )
                        }
                        return ""
                    })}
                    <tr>
                        <th colSpan={2}>
                            <Button variant="contained" onClick={()=>setOpen((p)=>p.map((val,index)=>(index === 1?true:val)))} disabled={!W.watch(`StartTime`)}>入力</Button>
                            <Checkbox  checked={check[0]} disabled/>
                            巻取機No.
                        </th>
                        <td colSpan={2}>{W.watch(`winding_machine`)}</td>
                    </tr>
                    {/*加締入力群*/}
                    <tr>
                        <th rowSpan={count+2}>
                            加締
                        </th>
                        <th colSpan={2}>
                            極性
                        </th>
                        <th>
                            加締全長寸法<br/>{"(+)"+func.Round(parseFloat(W.Data.cul.parts[0].length))+" (-)"+func.Round(parseFloat(W.Data.cul.parts[1].length))}
                        </th>
                        <th>
                            Lo+S寸法
                            <br/>{parseFloat(W.Data.WorkData["l0"].reference)+parseFloat(W.Data.WorkData["s"].reference)}
                            <br/>{func.Round(parseFloat(W.Data.WorkData["l0"].limit[0])+parseFloat(W.Data.WorkData["s"].limit[0]),3)+"~"+func.Round(parseFloat(W.Data.WorkData["l0"].limit[1])+parseFloat(W.Data.WorkData["s"].limit[1]),3)}
                        </th>
                        <th>
                            加締厚
                            <br/>{parseFloat(W.Data.WorkData["swage_thickness"].reference)}
                            <br/>{func.Round(parseFloat(W.Data.WorkData["swage_thickness"].limit[0]),3) +"~"+func.Round(parseFloat(W.Data.WorkData["swage_thickness"].limit[1]),3)}
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
                    {[...Array(count)].map((_, index) => ([
                        <tr key={index+"+"}>
                            <th rowSpan={2}>
                                {index+1 === count?
                                <Button variant="contained"
                                 onClick={()=>handleCaulkingAndWinding(index)}
                                 disabled={!W.watch(`StartTime`)}>入力
                                </Button>:<></>}
                                {index+1}回目
                            </th>
                            <th>+極</th>
                            <td>{W.watch(`CaulkingAndWinding.${index}.full_length_plus`)}</td>
                            <td>{W.watch(`CaulkingAndWinding.${index}.los_plus`)}</td>
                            <td>{W.watch(`CaulkingAndWinding.${index}.thickness_plus`)}</td>
                            <td>{W.watch(`CaulkingAndWinding.${index}.petal_shape_plus`)}</td>
                            <td>{W.watch(`CaulkingAndWinding.${index}.contact_resistance_plus`)}</td>
                            <td>{W.watch(`CaulkingAndWinding.${index}.swage_plus`)}</td>
                        </tr>,
                        <tr key={index+"-"}>
                            <th>-極</th>
                            <td>{W.watch(`CaulkingAndWinding.${index}.full_length_minus`)}</td>
                            <td>{W.watch(`CaulkingAndWinding.${index}.los_minus`)}</td>
                            <td>{W.watch(`CaulkingAndWinding.${index}.thickness_minus`)}</td>
                            <td>{W.watch(`CaulkingAndWinding.${index}.petal_shape_minus`)}</td>
                            <td>{W.watch(`CaulkingAndWinding.${index}.contact_resistance_minus`)}</td>
                            <td>{W.watch(`CaulkingAndWinding.${index}.swage_minus`)}</td>
                        </tr>
                    ]))}
                    {/*巻取入力群*/}
                    <tr>
                        <th rowSpan={count+4}>
                            巻取
                        </th>
                        <th></th>
                        <th>G寸法
                            <br/>{W.Data.WorkData.g.reference}
                            <br/>{func.Round(parseFloat(W.Data.WorkData.g.limit[0]),3)}~{func.Round(parseFloat(W.Data.WorkData.g.limit[1]),3)}
                        </th>
                        <th>P寸法
                            <br/>{W.Data.WorkData.p2.reference}
                            <br/>{func.Round(parseFloat(W.Data.WorkData.p2.limit[0]),3)}~{func.Round(parseFloat(W.Data.WorkData.p2.limit[1]),3)}
                        </th>
                        <th>素子径
                            <br/>{W.Data.WorkData.sizu.reference}
                            <br/>{func.Round(parseFloat(W.Data.WorkData.sizu.limit[0]),3)}~{func.Round(parseFloat(W.Data.WorkData.sizu.limit[1]),3)}
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
                    {[...Array(count)].map((_,index)=>{
                        return(
                            <tr key={index}>
                                <th>
                                    {index+1}回目
                                </th>
                                <td><TextField type="number" {...W.register(`CaulkingAndWinding.${index}.g`)} disabled={!W.watch(`StartTime`)}/></td>
                                <td><TextField type="number" {...W.register(`CaulkingAndWinding.${index}.p`)} disabled={!W.watch(`StartTime`)}/></td>
                                <td><TextField type="number" {...W.register(`CaulkingAndWinding.${index}.diameter`)} disabled={!W.watch(`StartTime`)}/></td>
                                <td><Checkbox {...W.register(`CaulkingAndWinding.${index}.short_check`)} disabled={!W.watch(`StartTime`)}/></td>
                                <td><Checkbox {...W.register(`CaulkingAndWinding.${index}.internal_state`)} disabled={!W.watch(`StartTime`)}/></td>
                                <td><Checkbox {...W.register(`CaulkingAndWinding.${index}.appearance`)} disabled={!W.watch(`StartTime`)}/></td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>:
            <table border={1} key={"error"}>
                <tbody>
                    {/*不良品数入力群*/}
                    <tr>
                        <th>不良コード</th>
                        {windingError.map((val:any)=>{return(<th key={val}>{val}</th>)})}
                        <th>合計</th>
                        <th>備考</th>
                        <th>回送数</th>
                    </tr>
                    <tr>
                        <th>数量(巻取)</th>
                        {windingError.map((val:any,index:number)=>{return(<td key={val}><TextField type="number" {...W.register(`WindingError.${index}.windingquantity`)} disabled={!W.watch(`StartTime`) || state !== 2}/></td>)})}
                        <td>{W.watch(`WindingError`).reduce((sum:any,val:any) => val.windingquantity?sum+parseFloat(val.windingquantity):sum,0)}</td>
                        <td rowSpan={2}>巻取工程にてｺﾞﾑ通しを行う場合は裏面組立工程のゴム品番、メーカーを確認し、ロットNo.の記入を行うこと</td>
                        <td rowSpan={2}><TextField type="number" {...W.register(`WindingQuantity`)} disabled={!W.watch(`StartTime`) || state !== 2}/></td>
                    </tr>
                    <tr>
                        <th>数量(ゴム通し)</th>
                        {windingError.map((val:any,index:number)=>{return(<td key={val}><TextField type="number" {...W.register(`WindingError.${index}.rubberquantity`)} disabled={!W.watch(`StartTime`) || state !== 2}/></td>)})}
                        <td>{W.watch(`WindingError`).reduce((sum:any,val:any) => val.rubberquantity?sum+parseFloat(val.rubberquantity):sum,0)}</td>
                    </tr>
                </tbody>
            </table>}
            <Button onClick={handleWinding} disabled={watchProgress === 2 || watchStartTime === undefined}>作業完了</Button>
            <Dialog  open={open[0]} onClose={()=>setOpen((p)=>p.map((val,index)=>(index === 0?false:val)))}>
                {parts?
                <table>
                    <tbody>
                        <tr>
                            <th>使用部材名</th>
                            <th>{parts.name}</th>
                        </tr>
                        <tr>
                            <th>コード</th>
                            <td>{foil.includes(parts.name) && parts.alternative_codes?
                            <section>
                                <label>{parts.code}</label>
                                <Autocomplete
                                    options={W.tables[parts.table_name].table.filter((item:any)=>parts.alternative_codes.includes(item.code) || parts.default_code === item.code)}
                                    getOptionLabel={(option: any) => option.code}
                                    onChange={(_,data)=>handleCodeChange2(data)}
                                    renderInput={(params) => (<TextField {...params} variant="filled"/>)}
                                />
                            </section>
                            :parts.code}
                            </td>
                        </tr>
                        <tr>
                            <th>ロットNo.</th>
                            <td><TextField value={parts.lot_number?parts.lot_number:null} onChange={(e)=>setParts((prev:any)=>({...prev,lot_number:e.target.value}))}/></td>
                        </tr>
                        <tr>
                            <th>数量</th>
                            <td>{func.Round(parts.quantity)}</td>
                        </tr>
                        <tr>
                            <th>厚み μm</th>
                            {!WindingList.thickness.includes(parts.name)?<Cell></Cell>:<td><TextField value={func.Round(parseFloat(parts.thickness),2)} onChange={(e)=>setParts((prev:any)=>({...prev,thickness:parseFloat(e.target.value)}))} variant="filled"/></td>}
                        </tr>
                        <tr>
                            <th>幅 mm</th>
                            {!WindingList.range.includes(parts.name)?<Cell></Cell>:<td><TextField value={func.Round(parseFloat(parts.range),2)} onChange={(e)=>setParts((prev:any)=>({...prev,range:parseFloat(e.target.value)}))} variant="filled"/></td>}
                        </tr>
                        <tr>
                            <th>長さ mm</th>
                            {!WindingList.length.includes(parts.name)?<Cell></Cell>:<td><TextField value={func.Round(parseFloat(parts.length),2)} onChange={(e)=>setParts((prev:any)=>({...prev,length:parseFloat(e.target.value)}))} variant="filled"/></td>}
                        </tr>
                    </tbody>
                </table>
                :<></>}
                <Button onClick={()=>TemporarilySubmit()} color="success" variant="contained">登録</Button>
                
            </Dialog>
            <Dialog open={open[1]} onClose={()=>setOpen((p)=>p.map((val,index)=>(index === 1?false:val)))}>
                <table>
                    <tbody>
                        <tr>
                            <th>巻取機No.</th>
                            <td><TextField value={equipment} onChange={(e)=>setEquipment(e.target.value)} disabled={!W.watch(`StartTime`)} variant="filled"/></td>
                        </tr>
                    </tbody>
                </table>
                <Button onClick={()=>TemporarilySubmit(0)} color="success" variant="contained">登録</Button>
            </Dialog>
            <Dialog open={open[2]} onClose={()=>setOpen((p)=>p.map((val,index)=>(index === 2?false:val)))}>
                {/*ここから、フロントを完成させてからバックエンドを作る*/}
                <table>
                    <tbody>
                        <tr>
                            <th rowSpan={2}>加締</th>
                            <th colSpan={2}>{count}回目</th>
                        </tr>
                        <tr>
                            <th>+極</th>
                            <th>-極</th>
                        </tr>
                        <tr>
                            <th>
                                加締全長寸法<br/>{"(+)"+func.Round(parseFloat(W.Data.cul.parts[0].length))+" (-)"+func.Round(parseFloat(W.Data.cul.parts[1].length))}
                            </th>
                            <td><TextField type="number" value={caulking.full_length_plus} onChange={(e)=>setCaulking((p:any)=>({...p,full_length_plus:parseFloat(e.target.value)}))}/></td>
                            <td><TextField type="number" value={caulking.full_length_minus} onChange={(e)=>setCaulking((p:any)=>({...p,full_length_minus:parseFloat(e.target.value)}))}/></td>
                        </tr>
                        <tr>
                            <th>
                                Lo+S寸法
                                <br/>{parseFloat(W.Data.WorkData["l0"].reference)+parseFloat(W.Data.WorkData["s"].reference)}
                                <br/>{func.Round(parseFloat(W.Data.WorkData["l0"].limit[0])+parseFloat(W.Data.WorkData["s"].limit[0]),3)+"~"+func.Round(parseFloat(W.Data.WorkData["l0"].limit[1])+parseFloat(W.Data.WorkData["s"].limit[1]),3)}
                            </th>
                            <td><TextField type="number" value={caulking.los_plus} onChange={(e)=>setCaulking((p:any)=>({...p,los_plus:parseFloat(e.target.value)}))}/></td>
                            <td><TextField type="number" value={caulking.los_minus} onChange={(e)=>setCaulking((p:any)=>({...p,los_minus:parseFloat(e.target.value)}))}/></td>
                        </tr>
                        <tr>
                            <th>
                                加締厚
                                <br/>{parseFloat(W.Data.WorkData["swage_thickness"].reference)}
                                <br/>{func.Round(parseFloat(W.Data.WorkData["swage_thickness"].limit[0]),3) +"~"+func.Round(parseFloat(W.Data.WorkData["swage_thickness"].limit[1]),3)}
                            </th>
                            <td><TextField type="number" value={caulking.thickness_plus} onChange={(e)=>setCaulking((p:any)=>({...p,thickness_plus:parseFloat(e.target.value)}))}/></td>
                            <td><TextField type="number" value={caulking.thickness_minus} onChange={(e)=>setCaulking((p:any)=>({...p,thickness_minus:parseFloat(e.target.value)}))}/></td>
                        </tr>
                        <tr>
                            <th>花びら形状</th>
                            <td>
                                <RadioGroup value={caulking.petal_shape_plus?caulking.petal_shape_plus:""} onChange={(e)=>setCaulking((p:any)=>({...p,petal_shape_plus:e.target.value}))}>
                                    <FormControlLabel value="A" control={<Radio />} label="A"/>
                                    <FormControlLabel value="B" control={<Radio />} label="B"/>
                                    <FormControlLabel value="C" control={<Radio />} label="C"/>
                                </RadioGroup>
                            </td>
                            <td>
                                <RadioGroup value={caulking.petal_shape_minus?caulking.petal_shape_minus:""} onChange={(e)=>setCaulking((p:any)=>({...p,petal_shape_minus:e.target.value}))}>
                                    <FormControlLabel value="A" control={<Radio />} label="A"/>
                                    <FormControlLabel value="B" control={<Radio />} label="B"/>
                                    <FormControlLabel value="C" control={<Radio />} label="C"/>
                                </RadioGroup>
                            </td>
                        </tr>
                        <tr>
                            <th>
                                加締接触抵抗
                            </th>
                            <td><TextField type="number" value={caulking.contact_resistance_plus} onChange={(e)=>setCaulking((p:any)=>({...p,contact_resistance_plus:parseFloat(e.target.value)}))}/></td>
                            <td><TextField type="number" value={caulking.contact_resistance_minus} onChange={(e)=>setCaulking((p:any)=>({...p,contact_resistance_minus:parseFloat(e.target.value)}))}/></td>
                        </tr>
                        <tr>
                            <th>
                                加締点数
                            </th>
                            <td>{W.Data.WorkData.swage}<Checkbox checked={caulking.swage_plus?true:false} onChange={(e)=>{e.target.checked?setCaulking((p:any)=>({...p,swage_plus:parseFloat(W.Data.WorkData.swage)})):setCaulking((p:any)=>({...p,swage_plus:null}))}}/></td>
                            <td>{W.Data.WorkData.swage}<Checkbox checked={caulking.swage_minus?true:false} onChange={(e)=>{e.target.checked?setCaulking((p:any)=>({...p,swage_minus:parseFloat(W.Data.WorkData.swage)})):setCaulking((p:any)=>({...p,swage_plus:null}))}}/></td>
                        </tr>
                    </tbody>
                </table>
                <Button onClick={()=>TemporarilySubmit(1)} color="success" variant="contained">登録</Button>
            </Dialog>
        </Accordion>
    );
}