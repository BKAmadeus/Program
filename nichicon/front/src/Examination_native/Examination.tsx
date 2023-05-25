import { Header } from "../Components/Header";

//CSS関係
import "../style.css";
import styled from "styled-components";
//muterial ui
import Button from '@mui/material/Button';
import Autocomplete from '@mui/material/Autocomplete';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
//icons
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import SendIcon from '@mui/icons-material/Send';

import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from 'react-hook-form';
import {BarcodeScanner} from '../Components/QrReader';
import {WebcamCanvas} from '../Components/QrReader_test';
import {postData,Hollow} from "../Components/func";

//時間操作
import { format, subDays } from "date-fns";

const list = ["4ライン側コロコン","事務所側コロコン","2ライン","4ライン","5ライン","6ライン","7ライン","8ライン","10ライン","13ライン","16ライン","17ライン","18ライン","19ライン","31ライン","33ライン","34ライン","35ライン"];
const Native = styled.div<{ state: number }>`
  display: grid;
  grid-template-columns: 1fr; /* 100pxの2行 */
  grid-gap: 10px; /* 隙間10px */
  grid-template-rows: 1fr
`;

var _d = new Date();
var d = new Date(_d.getFullYear(),_d.getMonth(),_d.getDate(),0,0,0);

export const Examination = () => {
    const [state,setState] = useState<number>(0);
    const [radio,setRadio] = useState<string>("");
    const { register, watch, reset, handleSubmit, setValue } = useForm<any>();
    const [Data,setData] = useState<any>();
    const [start,setStart] = useState(subDays(d,1));
    const [end,setEnd] = useState(new Date());
    const [row,setRow] = useState<any>();
    const [check,setCheck] = useState<boolean[]>([true,true,true]);
    const [qr,setQR] = useState<any>();
    const [submit,setSubmit] = useState<boolean>(false);
    const [open, setOpen] = useState(false);

    const Submit: SubmitHandler<any> = data => {
        if(state === 1){
            data.type = radio;
            postData({flg:"ExaminationSet",data:data}).then((flg)=>{
                if(flg){
                    reset();
                    setState(0);
                    setQR(undefined);
                    setSubmit(!submit);
                }
            })
        }
        else if(state === 4){
            postData({flg:"ExaminationChange",data:data,val:row,now:format(Date.now(),'yyyy-MM-dd HH:mm:ss')}).then((flg)=>{
                if(flg){
                    reset();
                    setState(0);
                    setQR(undefined);
                    setSubmit(!submit);
                }
            })
        }
    };

    const handleDataSet = (data:any) => {
        console.log("dataCheck",data,Object.keys(data));
        setRow(data);
        setValue(`state`,data.state);
        setState(3);
    }

    const handleReturn = (ST:number=0) => {
        reset();
        setQR(undefined);
        setState(ST);
    }

    useEffect(()=>{
        console.log(qr);
        if(qr && !isNaN(qr)){
            setValue(`search_number`,parseInt(qr.substr(0,5)));
            setValue(`lot_number`,qr.substr(5));
            setOpen(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[qr])

    useEffect(()=>{
        postData({flg:"ExaminationInit",start:start,end:end}).then((data:any) => {
            setData(data);
        })
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[submit])
    
    return (
        <>
        <Header Label={"検査"}/>
        <Native state={state}>
            {state === 0?<>
                <p style={{textAlign:"center",fontSize:40}}>検査依頼アプリ</p>
                <Button onClick={()=>setState(1)} variant="outlined" style={{color:"blue",backgroundColor:"lightblue",fontSize:40}}>検査依頼</Button>
                <Button onClick={()=>setState(2)} variant="outlined" style={{color:"red",backgroundColor:"yellow",fontSize:40}}>検査状態</Button>
            </>:state === 1?<>
                <p style={{textAlign:"center",fontSize:40}}>検査依頼</p>
                <form className="one">
                    <section className="two">
                        <Button onClick={()=>setRadio("出荷検査")} variant="outlined" style={{color:radio==="出荷検査"?"blue":"white",backgroundColor:"lightblue",fontSize:25}}>出荷検査</Button>
                        <Button onClick={()=>setRadio("工程検査")} variant="outlined" style={{color:radio==="工程検査"?"blue":"white",backgroundColor:"lightblue",fontSize:25}}>工程検査</Button>
                    </section>
                    <section style={{display:"grid",gridTemplateColumns:"1fr 90px"}}>
                        <div className="one">
                            <section>
                                <label>手配No</label>
                                <TextField type="number" value={watch(`search_number`)?watch(`search_number`):""} {...register(`search_number`)} style={{width:"100%",backgroundColor:"lightgray"}}/>
                            </section>
                            <section>
                                <label>ロットNo</label>
                                <TextField type="text" value={watch(`lot_number`)?watch(`lot_number`):""} {...register(`lot_number`)} style={{width:"100%",backgroundColor:"lightgray"}}/>
                            </section>
                        </div>
                        <IconButton onClick={()=>setOpen(true)}>
                            <PhotoCameraIcon style={{width:90,height:90,color:"black"}}/>
                        </IconButton>
                        <Dialog open={open} onClose={()=>setOpen(false)} fullScreen>
                            <p>{qr}</p>
                            {/*<BarcodeScanner setResult={setQR}/>*/}
                            <WebcamCanvas setResult={setQR}/>
                        </Dialog>
                    </section>
                    <section>
                        <label>場所</label>
                        <Autocomplete
                            options={list}
                            getOptionLabel={(option: any) => option}
                            onChange={(_, data) => data?setValue(`place`,data):""}
                            renderInput={(params) => ( <TextField {...params} variant="filled" style={{width:"100%",color:"white",backgroundColor:"lightgreen"}}/>)}
                        />
                    </section>
                    <Button onClick={handleSubmit(Submit)} style={{color:"black",backgroundColor:"yellow",marginTop:30,width:"100%",opacity:!(Hollow(radio) && Hollow(watch(`search_number`)) && Hollow(watch(`lot_number`)) && Hollow(watch(`place`)))?0.4:1}} disabled={!(Hollow(radio) && Hollow(watch(`search_number`)) && Hollow(watch(`lot_number`)) && Hollow(watch(`place`)))}>
                        送信<SendIcon />
                    </Button>
                    <Button style={{color:"blue",backgroundColor:"lightblue",marginTop:30,width:"100%"}} onClick={()=>handleReturn()}>
                        戻る
                    </Button>
                </form>
            </>:state === 2?<>
                <p style={{textAlign:"center",fontSize:40}}>依頼リスト</p>
                <form className="one">
                        <TextField style={{marginBottom:30}} label={"開始時間"} type="datetime-local" value={format(start,"yyyy-MM-dd'T'HH:mm")} onChange={(e)=>e.target.value?setStart(new Date(e.target.value)):""}/>
                        <TextField style={{marginBottom:30}} label={"終了時間"} type="datetime-local" value={format(end,"yyyy-MM-dd'T'HH:mm")} onChange={(e)=>e.target.value?setEnd(new Date(e.target.value)):""}/>
                        <Button style={{marginBottom:30}} onClick={()=>setSubmit(!submit)} variant="contained">日付反映</Button>
                    <div className="three" style={{marginBottom:30}}>
                        <Button onClick={()=>setCheck((pre)=>pre.map((v,i)=>i===0?!v:v))} variant="outlined" style={{color:check[0]?"blue":"white",backgroundColor:"lightblue"}}>未着手</Button>
                        <Button onClick={()=>setCheck((pre)=>pre.map((v,i)=>i===1?!v:v))} variant="outlined" style={{color:check[1]?"blue":"white",backgroundColor:"lightblue"}}>検査中</Button>
                        <Button onClick={()=>setCheck((pre)=>pre.map((v,i)=>i===2?!v:v))} variant="outlined" style={{color:check[2]?"blue":"white",backgroundColor:"lightblue"}}>検査済</Button>
                    </div>
                    <div className="four" style={{border:"1px solid black",backgroundColor:"lightgray"}}>
                        <p style={{textAlign:"center",fontWeight:"bold",width:"100%",borderRight:"1px solid black"}}>手配No.</p>
                        <p style={{textAlign:"center",fontWeight:"bold",width:"100%",borderRight:"1px solid black"}}>ロットNo.</p>
                        <p style={{textAlign:"center",fontWeight:"bold",width:"100%",borderRight:"1px solid black"}}>状態</p>
                        <p style={{textAlign:"center",fontWeight:"bold",width:"100%"}}>終了日</p>
                    </div>
                    <List sx={{width: '100%',bgcolor: 'background.paper',position: 'relative',overflow: 'auto','& ul': { padding: 0 },}} subheader={<li />}>
                        {Data?.filter((val:any)=>(val.state===0 && check[0]) || (val.state===1 && check[1]) || (val.state===2 && check[2]))
                        .map((val:any,index:number) => (
                        <li key={index} style={{width:"100%"}}>
                            <ul style={{width:"100%"}}>
                                <ListItem disablePadding style={{color:val.state===1?"blue":val.state===2?"white":"black",backgroundColor:val.state===1?"yellow":val.state===2?"green":"white",width:"100%"}}>
                                    <ListItemButton onClick={()=>handleDataSet(val)} className="four" style={{border:"1px solid black"}}>
                                        <p style={{textAlign:"center",width:"100%",borderRight:"1px solid black"}}>{val.search_number}</p>
                                        <p style={{textAlign:"center",width:"100%",borderRight:"1px solid black"}}>{val.lot_number}</p>
                                        <p style={{textAlign:"center",width:"100%",borderRight:"1px solid black"}}>{val.state===0?"未着手":val.state===1?"検査中":val.state===2?"検査済み":"エラー"}</p>
                                        <p style={{textAlign:"center",width:"100%"}}>{val.finish?format(new Date(val.finish),'MM月dd日 HH:mm'):""}</p>
                                    </ListItemButton>
                                </ListItem>
                            </ul>
                        </li>
                        ))}
                    </List>
                    <Button style={{color:"blue",backgroundColor:"lightblue",width:"100%"}} onClick={()=>handleReturn()}>
                        戻る
                    </Button>
                </form>
            </>:state === 3?<>
            <p style={{textAlign:"center",fontSize:40}}>検査状態</p>
            <form className="one">
                <section style={{width:"100%"}}>
                    <label>手配No:</label>
                    <p style={{width:"100%",fontSize:25,textAlign:"center",border:"1px solid black"}}>{row.search_number}</p>
                </section>
                <section style={{width:"100%"}}>
                    <label>ロットNo:</label>
                    <p style={{width:"100%",fontSize:25,textAlign:"center",border:"1px solid black"}}>{row.lot_number}</p>
                </section>
                <section style={{width:"100%"}}>
                    <label>場所:</label>
                    <p style={{width:"100%",fontSize:25,textAlign:"center",border:"1px solid black"}}>{row.place}</p>
                </section>
                <section style={{width:"100%"}}>
                    <label>検査種類:</label>
                    <p style={{width:"100%",fontSize:25,textAlign:"center",border:"1px solid black"}}>{row.type}</p>
                </section>
                <section style={{width:"100%"}}>
                    <label>終了日:</label>
                    <p style={{width:"100%",fontSize:25,textAlign:"center",border:"1px solid black"}}>{row.finish?format(new Date(row.finish),'yyyy年MM月dd日 HH:mm'):"終了していない"}</p>
                </section>
                <section className="three" style={{marginTop:30,marginBottom:30}}>
                        <Button onClick={()=>setValue(`state`,0)} variant="outlined" style={{color:watch(`state`)===0?"blue":"white",backgroundColor:"lightblue",fontSize:20}} disabled={row.state === 2}>検査前</Button>
                        <Button onClick={()=>setValue(`state`,1)} variant="outlined" style={{color:watch(`state`)===1?"red":"white",backgroundColor:watch(`state`)===1?"yellow":"lightblue",fontSize:20}}>検査中</Button>
                        <Button onClick={()=>setValue(`state`,2)} variant="outlined" style={{color:watch(`state`)===2?"white":"white",backgroundColor:watch(`state`)===2?"green":"lightblue",fontSize:20}} disabled={row.state === 0}>検査済</Button>
                </section>
                <section className="two">
                <Button style={{color:"blue",backgroundColor:"lightblue"}} onClick={()=>handleReturn(2)}>
                    戻る
                </Button>
                <Button style={{color:"red",backgroundColor:"yellow",opacity:row.state === watch(`state`)?0.4:1}} onClick={handleSubmit(Submit)} disabled={row.state === watch(`state`)}>
                    確定
                </Button>
                </section>
            </form>
            </>:
            <></>}
        </Native>
        </>
    )
}