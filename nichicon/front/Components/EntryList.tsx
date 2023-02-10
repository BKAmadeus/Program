//import * as React from 'react';
import { useNavigate } from "react-router-dom";
import Button from '@mui/material/Button';

type Props = {
    TableName: string
    Process: any
  };

  
export function EntryList(props:Props) {
  //var id = Math.max(...props.Tables[props.TableName].map((o:any)=>o.id)) + 1;
  const navigate = useNavigate();
  const handleClick = () => {
    navigate('/CreateProduct');
  }
  if(props.TableName === 'product' && props.Process === '3'){
    return (
      <>
      <Button sx={{ width: 400 }} variant="contained" onClick={handleClick}>新規製品作成:製品仕様書作成</Button>
    </>
    )
  }
  else if (props.Process === '3'){
    return (
      <Button sx={{ width: 140 }} variant="contained">新規データ追加</Button>
    )
  } 
  else {
    return (
      <></>
    )
  }
};