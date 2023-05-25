import { Header } from "../Components/Header";
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import { postData, Round, Hollow } from "../Components/func";
import { DataSetFor } from "../Components/ProductSelect";
import React from "react";
import sample from "./sample2.mp3";
import "../style.css";
import { SubmitHandler, useForm } from 'react-hook-form';
//Icons
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
//import QrReader from 'react-qr-reader';

//時間操作
import { format } from "date-fns";

const count = 4;
const refuge_value = 10; //退避時間10分
const equipments = [...Array(10)].map((_, index) => String(index));
var Columns = ["equipment","lot_number","search","l_dimension","voltage","start","after"];
let ad = new Audio(sample);
ad.loop = true;
type Curl = {
    equipment?: string,
    start: number,
    flg: boolean,
    l_dimension?: string,
    voltage?: number,
    search?: number,
    lot_number?: string,
    after?: boolean,
    case_check?: boolean,
    error?: number,
    measurement: any[],
    finish:boolean
}
//Clockコンポーネントを画面にレンダリングする
export const Curling = () => {
    const [time, updateTime] = React.useState(Date.now());
    const [Data, setData] = React.useState<any>();
    const [refuge, setRefuge] = React.useState(Date.now() - 1000*60*refuge_value);
    const [progress,setProgress] = React.useState(0);
    const [before,setBefore] = React.useState<any>();
    const [back, setBack] = React.useState<boolean>(false);
    const [sound, setSound] = React.useState<boolean>(false);
    const [submit,setSubmit] = React.useState<boolean>(false);

    const { watch, handleSubmit, reset, setValue, register,setFocus } = useForm<Curl>();
    const watchEquipment = watch(`equipment`);
    const watchStart = watch(`start`);

    const handleInit: SubmitHandler<Curl> = data => {
        postData({flg:'CurlingStart',data:data})
        .then((start:any)=>{
            console.log("リロード");
            setSubmit(!submit);
            setValue(`flg`,true);
            setValue(`start`,new Date(start).getTime());
        })
    }

    const handleData: SubmitHandler<Curl> = data => {
        postData({flg:'CurlingData',data:data})
        .then((_:any)=>{
            setSubmit(!submit);
            setValue(`flg`,true);
        })
    }

    const handleBack = () => {
        setRefuge(Date.now())
        setBack(true);
        if(sound){
            ad.play();
        }
    }

    React.useEffect(() => {
        const timeoutId = setTimeout(() => updateTime(Date.now()), 1000);
        if(watchStart){
            setProgress(time - new Date(watchStart).getTime());
            var diffhour = Round(progress / (60*60*1000), 3);//時間刻み
            diffhour = diffhour ? diffhour : 1;
            var length = before?before.length+1:1;
            var diffrefuge = Round((time - refuge) / (60*1000), 3); //分刻み
            diffrefuge = diffrefuge ? diffrefuge : 1;
            if ( diffhour / 2 > length && diffrefuge >= refuge_value && !back) {
                console.log("タイマーセット確認1",format(new Date(refuge),'yyyy年MM月dd日 HH:dd:mm_ss'),"\nタイマーセット確認2",format(new Date(),'yyyy年MM月dd日 HH:dd:mm_ss'));
                handleBack();
            }
        }
        return () => {
            clearTimeout(timeoutId)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [time])

    const handleSelect = (val:any) =>{
        if(val.flg){
            reset()
            setRefuge(Date.now() - 1000*60*refuge_value);
            DataSetFor(val,setValue,Columns);
            setValue(`flg`,true);
            setBefore(val.data);
        }
        else{
            var equ = val.equipment;
            reset()
            setRefuge(Date.now() - 1000*60*refuge_value);
            setValue(`flg`,false);
            setValue(`equipment`,equ);
        }
    }

    React.useEffect(() => {
        postData({ flg:1 ,select:[{value:'curling_data',label:'カーリングデータ'}]})
            .then((data: any) => {
                setData(equipments.map((val:any)=>{
                    var ans:any = {};
                    ans.equipment = val;
                    var row = data.curling_data.table.filter((item:any)=>item.equipment === val && item.finish === false);
                    if(row.length !== 0){
                        for (var key in row[0]){
                            ans[key] = row[0][key];
                        }
                        ans["flg"] = true;
                    }else{
                        ans["flg"] = false;
                    }
                    if(watch(`equipment`) === ans.equipment && ans.flg){
                        handleSelect(ans);
                    }
                    return ans
                }));
            })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [submit])
    

    return (
        <>
            <Header Label={"カーリング測定"}/>
            <div className="two">
                <section>
                    <label>現在時刻</label>
                    <p style={{ fontSize: 20 }}>{format(time,'yyyy年MM月dd日 HH:mm:ss')}</p>
                </section>
                <section>
                    <label>経過時間</label>
                    <p style={{ fontSize: 20 }}>{Round(progress/(60*60*1000))}時間{Round(progress%(60*60*1000)/(60*1000))}分</p>
                </section>
            </div>
            <div className="yoko">
                <section>
                    <label>アラーム音</label>
                    <Checkbox checked={sound} onClick={()=>setSound(!sound)}/>
                </section>
                <Button variant="contained" onClick={()=>setSubmit(!submit)}>データ更新</Button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"200px 1fr"}}>
              <List sx={{width: '100%',maxWidth: 200,bgcolor: 'background.paper',position: 'relative',overflow: 'auto',maxHeight: 500,'& ul': { padding: 0 },}} subheader={<li />}>
                {Data?.map((val:any,index:number) =>   (
                <li key={index}>
                  <ul>
                    <ListItem disablePadding className={watchEquipment ===  val.equipment?"checklist":""}>
                      <ListItemButton onClick={()=>{handleSelect(val)}}>カーリング機:{val.equipment}{val.flg?<BuildCircleIcon />:""}</ListItemButton>
                    </ListItem>
                   </ul>
                </li>
                ))}
              </List>
                {watchEquipment ?
                <div className="yoko">
                    <p>
                        カーリング機:{watchEquipment}<br />
                        ロットNo.:{watch(`lot_number`) ? watch(`lot_number`) : "未設定"}<br />
                        手配No.:{watch(`search`) ? watch(`search`) : "未設定"}<br />
                        L寸法:{watch(`l_dimension`) ? watch(`l_dimension`) : "未設定"}<br />
                        定格電圧:{watch(`voltage`) ? watch(`voltage`) : "未設定"}<br />
                        後ビーディング:{watch(`after`) === true ? "あり" : watch(`after`) === false ? "無し" : "未設定"}<br />
                        {watchStart?"開始時間:"+format(new Date(watchStart),'yyyy年MM月dd日 HH:mm'):""}
                    </p>
                        {!watch(`flg`)?
                        <form>
                            <table>
                                <tbody>
                                    <tr>
                                        <th>手配No.</th>
                                        <td><TextField type="number" {...register(`search`)} autoFocus onKeyDown={(e)=>e.code === 'Enter'?setFocus(`lot_number`):""}/></td>
                                    </tr>
                                    <tr>
                                        <th>ロットNo.</th>
                                        <td><TextField {...register(`lot_number`)} onKeyDown={(e)=>e.code === 'Enter'?setFocus(`l_dimension`):""}/></td>
                                    </tr>
                                    <tr>
                                        <th>L寸法</th>
                                        <td><TextField type="number" {...register(`l_dimension`)} onKeyDown={(e)=>e.code === 'Enter'?setFocus(`voltage`):""}/></td>
                                    </tr>
                                    <tr>
                                        <th>定格電圧</th>
                                        <td><TextField type="number" {...register(`voltage`)} /></td>
                                    </tr>
                                    <tr>
                                        <th>後ビーディング</th>
                                        <td><Checkbox {...register(`after`)} /></td>
                                    </tr>
                                </tbody>
                            </table>
                            <div>
                                <Button variant="contained" onClick={handleSubmit(handleInit)} disabled={!(Hollow(watch(`lot_number`)) && Hollow(watch(`voltage`)) && Hollow(`l_dimension`) && Hollow(`search`))}>登録</Button>
                            </div>
                        </form>
                        :
                        <form>
                            <div className="yoko">
                                <div>
                                    <label>最終測定</label>
                                    <Checkbox {...register(`finish`)}/>
                                </div>
                                <Button variant="contained" onClick={handleSubmit(handleData)} disabled={!(watch(`measurement`) && watch(`measurement`).length === 4 && watch(`measurement`).every((val)=>Hollow(val)) && Hollow(watch(`case_check`)) && Hollow(watch(`error`)))}>登録</Button>
                            </div>
                            <table>
                                <tbody>
                                    <tr>
                                        <th>測定回数</th>
                                        <th>計測時間</th>
                                        {[...Array(count)].map((_, i: number) =><th key={i}>L寸法{i+1}回目測定</th>)}
                                        <th>落下品数</th>
                                        <th>ケース傷確認</th>
                                    </tr>
                                    <tr>
                                        <th>{before?before.length+1:1}回目測定</th>
                                        <td>{format(time,'MM月dd日 HH:mm')}</td>
                                        {[...Array(count)].map((_, index: number) => (
                                            <td key={index}>
                                                <TextField
                                                    {...register(`measurement.${index}`)}
                                                    onChange={(e)=>{
                                                        if(e.target.value.match(/[+-][0-9]{3}\.[0-9]{2}/)){
                                                            setValue(`measurement.${index}`,parseFloat(e.target.value));
                                                            if(count>index+1){
                                                                setFocus(`measurement.${index+1}`);
                                                            }
                                                            else{
                                                                setFocus(`error`);
                                                            }
                                                        }
                                                        else if(e.target.value.slice(-1) === '+' || e.target.value.slice(-1) === '-'){
                                                            setValue(`measurement.${index}`,e.target.value.slice(-1));
                                                        }
                                                        else if(+e.target.value){
                                                            setValue(`measurement.${index}`,e.target.value);
                                                        }
                                                        else if(e.target.value.match(/[^0-9.+-]/)){
                                                            setValue(`measurement.${index}`,"");
                                                        }
                                                    }}
                                                    autoFocus={index===0}
                                                />
                                            </td>
                                        ))}
                                        <td><TextField type="number" {...register(`error`)}/></td>
                                        <td><Checkbox checked={watch(`case_check`)?true:false} onChange={()=>setValue(`case_check`,!watch(`case_check`))}/></td>
                                    </tr>
                                    {before?before.map((val:any,index:number)=>{
                                        return (
                                             <tr key={index}>
                                                 <th>{before.length - index}回目</th>
                                                 <td>{format(new Date(val.time),'MM月dd日 HH:mm')}</td>
                                                 {[...Array(val.measurement.length)].map((_,i)=>(<td key={i}>{val.measurement[i]}</td>))}
                                                 <td>{val.error}</td>
                                             </tr>
                                        )
                                        })
                                    :""}
                                </tbody>
                            </table>
                        </form>
                        }
                </div>
                : <></>}
            </div>
            <Backdrop sx={{color:'#fff',zIndex:(theme) => theme.zIndex.drawer + 1 }} open={back} onClick={()=>{setBack(false);ad.pause();setFocus(`measurement.0`)}}>
                <CircularProgress />
                計測時間です。
                <p>{Round(progress/(60*60*1000)-(before?before.length*2:0))}時間{Round(progress%(60*60*1000)/(60*1000))}分経過</p>
            </Backdrop>
        </>
    )
}