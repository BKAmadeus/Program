//import {Calendar} from './Components/Calendar'
//import Button from '@mui/material/Button';
import * as func from "./Func/func";
import React from "react";
import { useForm } from 'react-hook-form';
import {FullScreenDialog} from './ProductWorkData/WorkSheet'
import { MultipleSelectChip } from './Components/MultiSelect';
import { ports,re } from "./Data/Data"

import { Header } from "./Menu/Header";
type WorkType ={
    Select?:string[]|null;
}

var tables:any;

export const ProductWorkData = () => {
    const [Work,setWork] = React.useState<any>();
    const [Open,setOpen] = React.useState<boolean>(false);
    const { watch, setValue } = useForm<WorkType>();
    const watchSelect = watch("Select");

    React.useEffect(()=>{
        func.postData({flg:'WorkDataInit'})
        .then((data:any) => {
            console.log("WorkData",data);
            setWork(data);
        })
        func.postData(ports)
        .then((data:any) => {
            tables = data;
        })
    },[])
  return (
    <div>
        
      <Header Label={"製作作業票作成画面"}/>
        {Work?
            <MultipleSelectChip 
                Label={"必要部材選択"}
                Default={watchSelect}
                Data={Work.map((value:any)=> "手配No.:"+value.search_number+"ロットNo.:"+value.deadline.replace(re,"$1$2$3-")+value.lot+"品番:"+value.code+"設番:"+value.dessign)}
                SetValue={setValue} 
                SET={`Select`}
            />:<></>}
            {watchSelect?
                watchSelect.map((val:string)=>{
                    return <FullScreenDialog key={val} table={Work} open={Open} setOpen={setOpen} setValue={setValue} val={val} tables={tables}/>
            })
        :<></>}
    </div>
  );
}
/*
    */