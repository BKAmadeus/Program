import React, { useContext } from 'react';


import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import Paper from '@mui/material/Paper';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';

import * as func from "./func";
import { AuthUserContext } from '../Data/SharedVariable';

//アイコン
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import ModeEditIcon from '@mui/icons-material/ModeEdit';

export function TableUpdate(TC:any) {
    const [open, setOpen] = React.useState(false);
    const [flg, setFlg] = React.useState(false);
    const [effect, reEffect] = React.useState(false);
    const UserData = useContext(AuthUserContext);
    const handleClickOpen = () => {
        setOpen(true);
    };
    const handleClose = () => {
        TC.setValue(`reEffect`,!TC.watch(`reEffect`));
        setOpen(false);
    };
    const handleSubmit = () => {
        TC.setValue(`reEffect`,!TC.watch(`reEffect`));
        func.postData({flg:"TableUpdate",data:TC.data.table[TC.index],table_name:TC.TableName,struct:TC.data.struct,association:TC.data.association,UserData:UserData})
        .then((data:any)=>{
            if(data === 'error'){
                setFlg(true);
            }
            else{
                console.log("アップデート内容",data);
            }
        });
    };
    const handleAddStruct = (key:string) =>{
        var ans = {};
        for(var row of TC.data.struct[key]){
            ans[row] = null;
        }
        if(TC.data.table[TC.index][key] === null){
            TC.data.table[TC.index][key] = [];
            TC.data.table[TC.index][key].push(ans);
        }
        else{
            TC.data.table[TC.index][key].push(ans);
        }
        reEffect(!effect);
    }
    const handleRemoveStruct = (key:string,index:number) =>{
        console.log(TC.data.table[TC.index][key],index);
        TC.data.table[TC.index][key].splice(index,1);
        reEffect(!effect);
    }
    
    return (
        <div key={TC.index}>
        <IconButton onClick={handleClickOpen}>
            <ModeEditIcon/>
        </IconButton>
        <Dialog fullScreen open={open} onClose={handleClose}>
            
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
                    Update
                    </Typography>
                    <Button autoFocus color="inherit" onClick={handleSubmit}>
                    save
                    </Button>
                </Toolbar>
            </AppBar>
            <DialogTitle>単一データ</DialogTitle>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            {Object.keys(TC.data.table[TC.index]).map((key:any,index:number)=>{
                                if(key in TC.data.association){
                                    return (
                                        <React.Fragment>
                                            {TC.data.association[key].map((key2:any,index2:number)=>{
                                                return (
                                                    <TableCell key={key+index2}>
                                                        {key+"."+key2}
                                                    </TableCell>
                                                )
                                            })}
                                        </React.Fragment>
                                    )
                                }
                                else if(!(key in TC.data.struct)){
                                    return(
                                        <TableCell key={index}>
                                            {key}
                                        </TableCell>
                                    )
                                }
                                return ""
                            })}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            {Object.keys(TC.data.table[TC.index]).map((key:any,index:number)=>{
                                if(key in TC.data.association){
                                    return (
                                        <React.Fragment>
                                            {Object.keys(TC.data.table[TC.index][key]).map((key2:any,index2:number)=>{
                                                return (
                                                    <TableCell key={key+index2}>
                                                        {TC.data.table[TC.index][key][key2]}
                                                    </TableCell>
                                                )
                                            })}
                                        </React.Fragment>
                                    )
                                }
                                else if(!(key in TC.data.struct)){
                                    return(
                                        <TableCell key={index}>
                                            {['id','code'].includes(key)?TC.data.table[TC.index][key]:<TextField defaultValue={TC.data.table[TC.index][key]} onChange={(e)=>{TC.data.table[TC.index][key] = e.target.value}}/>}
                                        </TableCell>
                                    )
                                }
                                return ""
                            })}
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
            <DialogTitle>配列データ</DialogTitle>
                {Object.keys(TC.data.table[TC.index]).map((key:any,index)=>{
                    if(key in TC.data.struct){
                            return (
                                <TableContainer component={Paper} key={"struct"+index}>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>{key}</TableCell>
                                                <TableCell>
                                                    <IconButton onClick={()=>handleAddStruct(key)}><AddCircleOutlineIcon/>追加</IconButton>
                                                </TableCell>
                                                {Object.keys(TC.data.struct[key]).map((key2:any)=>{
                                                    return(
                                                        <TableCell key={key2}>
                                                            {TC.data.struct[key][key2]}
                                                        </TableCell>
                                                    )
                                                })}
                                            </TableRow>
                                        </TableHead>
                                        {TC.data.table[TC.index][key]?
                                        <TableBody>
                                            {TC.data.table[TC.index][key].map((val:any,index2:number)=>(
                                                <TableRow key={index2}>
                                                    <TableCell></TableCell>
                                                    <TableCell key="delete">
                                                        <IconButton onClick={()=>handleRemoveStruct(key,index2)}><RemoveCircleOutlineIcon/>削除</IconButton>
                                                    </TableCell>
                                                    {Object.keys(TC.data.struct[key]).map((key2:any,index3:number)=>(
                                                            <TableCell key={index3}>
                                                                <TextField defaultValue={val[key2]} onChange={(e)=>{TC.data.table[TC.index][key][index2][key2] = e.target.value}}/>
                                                            </TableCell>
                                                    ))}
                                                </TableRow>
                                            ))}
                                        </TableBody>:""}
                                    </Table>
                                </TableContainer>
                            )
                    }
                    return ""
                })}
            {flg?<DialogTitle>入力値エラー<br/>数値に文字を入れている<br/>文字列内に'や",\等の使用禁止文字を使っている</DialogTitle>:<></>}
        </Dialog>
        </div>
    )
}