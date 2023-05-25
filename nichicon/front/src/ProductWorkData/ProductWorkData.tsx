//import {Calendar} from './Components/Calendar'
//import Button from '@mui/material/Button';
import { postData } from "../Components/func";
import React from "react";
import { SubmitHandler, useForm } from 'react-hook-form';
import {Sheet} from './component/WorkSheet';
import { ports } from "../Data/Data";
import type { FormProps } from "../Data/Data";
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import Dialog from '@mui/material/Dialog';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';

//時間処理
import { format } from "date-fns";
//icons
import CloseIcon from '@mui/icons-material/Close';

import styled from "styled-components";
import { Reset,DataSetCalculation,DataSetConstant } from '../Components/ProductSelect';
import { Header } from "../Components/Header";
import '../style.css';
//import { Schedule } from "../ProductSchedule/ProductSchedule";

const steps = ["基本情報","巻取","ゴム通し","含浸・乾燥","組立","仕上","エージング","特性選別","2次加工","外観検査","出荷検査"];

const Progress = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr; /* 100pxの2行 */
    background-color: lightgray;
    border: solid 3px black;
`

export const ProductWorkData = () => {
    const [Work,setWork] = React.useState<any>();
    const [New,setNew] = React.useState<any>();
    const [tables,setTables] = React.useState<any>();
    const [Open,setOpen] = React.useState<boolean>(false);
    const [Data,setData] = React.useState<any>();
    const { watch, handleSubmit, reset, resetField, setValue } = useForm<FormProps>();

    const Submit: SubmitHandler<FormProps> = data => {
        if(New && New.deadline && New.dessign && New.quantity && New.destination){
            postData({flg:"NewProductionSchedule",data:data,tables:tables,state:1,step:4,new:New})
            .then((data:any) => {
                if(!data.check){
                    setNew({submit:true});
                }
                else{
                    setNew((prev:any)=>({...prev,error:"チェックを通過しなかったので製品仕様書を見直して改訂してください。"}));
                }
            })
            //postData({flg:8,data:data,UserData:UserData,state:state});
        }
        else{
            setNew((prev:any)=>({...prev,error:'入力項目が足りていない'}))
        }
    };


    const handleSearchClick = (data:any) => {
        if(data){
          setNew((prev:any)=>({...prev,dessign:data.dessign}));
          var post = {flg:5,Product:data,tables:tables};
          Reset(setValue,reset,resetField,watch);
          setValue(`CheckCode`,data.code);
          setValue(`CheckDessign`,data.dessign);
          postData(post).then((Data:any) => {
            console.log("データ",{data:data,Data:Data});
            DataSetConstant(data,setValue);
            DataSetCalculation(Data,setValue,watch);
          })
        }
      }

    React.useEffect(()=>{
        var test = ports;
        test.select.push({value:'production_schedule', label:'生産スケジュール'});
        postData(test)
        .then((data:any) => {
            console.log("tables",data);
            setTables(data);
            if(data["production_schedule"].table.length !== 0){
                var proCul = Object.keys(data["production_schedule"].table[0]);
                setWork(data["production_schedule"].table.map((val:any)=>{
                    var col = data["product"].table.filter((val2:any)=>val2.dessign === val.dessign);
                    for(var row of Object.keys(col[0])){
                        if(proCul.includes(row)){
                            val["pr_"+row] = col[0][row];
                        }
                        else{
                            val[row] = col[0][row];
                        }
                    };
                    return val;
                }));

            }
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[])
    const handleClickOpen = (val:any) => {
        setData(val);
        setOpen(true);
    }
    const handleClose = () => {
        setOpen(false);
    };
    console.log("確認よう",Work);

  return (
    <div>
      <Header Label={"製作作業票作成画面"}/>
      {tables && tables.product?
        <div style={{border:"solid 1px #555555"}}>
            <div className="four" key={"新規製作作業票追加"}>
                <section>
                    <label className={New && New.deadline?"checklist":""}>締切日:{New && New.deadline?New.deadline:""}</label>
                    <TextField type="datetime-local" value={New && New.deadline?New.deadline:""} onChange={(e)=>setNew((prev:any)=>({...prev,deadline:e.target.value}))} className="df"/>
                </section>
                <section>
                    <label className={New && New.dessign?"checklist":""}>仕様書選択:{New && New.dessign?New.dessign:""}</label>
                    <Autocomplete
                        options={tables.product.table.filter((val:any)=>parseInt(val.available) === 0 && val.classification !== '見積')}
                        getOptionLabel={(option: any) => option.code+":"+option.dessign}
                        onChange={(_, data) => handleSearchClick(data)}
                        renderInput={(params) => ( <TextField {...params} variant="filled" className='df'/>)}
                    />
                </section>
                <section>
                    <label className={New && New.quantity?"checklist":""}>数量:{New && New.quantity?New.quantity:""}</label>
                    <TextField type="number" value={New && New.quantity?New.quantity:""} onChange={(e)=>setNew((prev:any)=>({...prev,quantity:parseFloat(e.target.value)}))} className="df"/>
                </section>
                <section>
                    <label className={New && New.destination?"checklist":""}>向け先:{New && New.destination?New.destination:""}</label>
                    <TextField type="text" value={New && New.destination? New.destination:""} onChange={(e)=>setNew((prev:any)=>({...prev,destination:e.target.value}))} className="df"/>
                </section>
            </div>
            {New && New.error?<p className="Error">※{New.error}</p>:""}
            <div className="two">
                <Button color="error" variant="contained" onClick={()=>setNew(null)}>reset</Button>
                <Button color="success" variant="contained" onClick={handleSubmit(Submit)}>submit</Button>
            </div>
        </div>:<></>
      }
        {Work?
        <List sx={{ width: '100%', bgcolor: 'background.paper', position: 'relative', overflow: 'auto', '& ul': { padding: 0 } }} subheader={<li />}>
          {Work.map((val:any,index:number) => (
            <li key={index}>
              <ul className='two'>
                <ListItem disablePadding>
                  <ListItemButton onClick={(_)=>{handleClickOpen(val)}}>{"手配No.:"+val.search_number+"ロットNo.:"+format(new Date(val.deadline),"yyMMdd-")+val.lot+"品番:"+val.code+"設番:"+val.dessign}</ListItemButton>
                </ListItem>
                <Progress>
                    {steps.map((name,i)=>{
                        return (
                            <div key={i}
                             style={{borderRight:"solid 1px black",
                             backgroundColor:val.schedule && val.schedule.length>i?
                             val.schedule[i].start_time && val.schedule[i].end_time?"lightgreen":"yellow"
                             :"lightgray"}}>
                                {name}
                            </div>
                        )
                        
                    })}
                </Progress>
              </ul>
            </li>
            ))}
        </List>
        :<></>}
        <Dialog fullScreen open={Open} onClose={handleClose}>
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
            <Sheet table={Work} setValue={setValue} val={Data} tables={tables}/>
        </Dialog>
    </div>
  );
}
/*

*/