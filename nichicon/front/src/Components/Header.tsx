import React, { useState,useContext, useEffect }  from 'react';
import { useNavigate } from "react-router-dom";

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';


import '../style.css';
//import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';

import List from '@mui/material/List';
//import Divider from '@mui/material/Divider';
//import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
//import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Drawer from '@mui/material/Drawer';

import '../style.css';

//アイコン
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CloseIcon from '@mui/icons-material/Close';

import {PageMove,HeaderProductApproval,VerificationList,ApprovalList,AllAuthorityList} from '../Data/Data'
import {AuthUserContext,AuthOperationContext} from '../Data/SharedVariable';

export const Header = (HA:any) => {
  const [state, setState] = React.useState(false);
  const navigate = useNavigate();
  const UserData = useContext(AuthUserContext);
  const [open, setOpen] = useState(false);
  const [user,setUser] = useState("");
  const [password,setPassword] = useState("");
  const [Error,setError] = useState(false);
  const login = useContext(AuthOperationContext).login;
  const logout = useContext(AuthOperationContext).logout;
  const handleLogin = () => {
      login(user,password);
      console.log("tesut",UserData);
      setError(true);
  }

  const handleOPCL = () => {
    if(state){
      setState(false);
    }
    else{
      setState(true);
    }
  };

  const handlePage = (data:any) => {
    navigate(data.url);
  }

  const handleClose = () => {
    setPassword("");
    setUser("");
    setError(false);
    setOpen(false);
  }

  useEffect(()=>{
    if(UserData){
      console.log(UserData);
      setPassword("");
      setUser("");
      setError(false);
      setOpen(false);

    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[UserData])

  return (
    <Box>
    <AppBar component="nav">
      <Toolbar>
        <Box>
          <IconButton color="inherit" onClick={handleOPCL}>
            <MenuIcon />
          </IconButton>
          <Drawer anchor='left' open={state} onClick={handleOPCL}>
            <List>
              {PageMove.map((val:any) => {
                if(HeaderProductApproval.includes(val.name)){
                  if(UserData && (((VerificationList.includes(UserData.post) || ApprovalList.includes(UserData.post)) && UserData.affiliations === '設計課') || AllAuthorityList.includes(UserData.post))){
                    return(
                      <ListItemButton onClick={()=>handlePage(val)} key={val.name}>
                        <ListItemText primary={val.name}/>
                      </ListItemButton>
                    )
                  }
                  else{
                    return ""
                  }
                }
                else{
                  return(
                    <ListItemButton onClick={()=>handlePage(val)} key={val.name}>
                      <ListItemText primary={val.name}/>
                    </ListItemButton>
                  )
                }
                })}
            </List>
          </Drawer>
        </Box>
        <Typography component="div">
          Nichicon
        </Typography>
        {HA.Label?
        <Typography sx={{ ml: 2, flex: 1 }} component="div">
          {HA.Label}
        </Typography>:<></>}
        <div className='info'>
          {HA.Text?HA.Text:""}
        </div>
          <Button onClick={()=>setOpen(true)} style={{backgroundColor:"white"}}>
            <AccountCircleIcon/>
            {UserData?UserData.name:"ログイン"}
          </Button>
        {HA.Button1?HA.Button1:""}
        {HA.Button2?HA.Button2:""}
        {HA.Button3?HA.Button3:""}
        {HA.Button4?HA.Button4:""}
      </Toolbar>
    </AppBar>
      <Toolbar>
        <Box>
          <IconButton color="inherit" onClick={handleOPCL}>
            <MenuIcon />
          </IconButton>
          <Drawer anchor='left' open={state} onClick={handleOPCL}>
            <List>
              {PageMove.map((val:any) => {
                if(HeaderProductApproval.includes(val.name)){
                  if(UserData && (((VerificationList.includes(UserData.post) || ApprovalList.includes(UserData.post)) && UserData.affiliations === '設計課') || AllAuthorityList.includes(UserData.post))){
                    return(
                      <ListItemButton onClick={()=>handlePage(val)} key={val.name}>
                        <ListItemText primary={val.name}/>
                      </ListItemButton>
                    )
                  }
                  else{
                    return ""
                  }
                }
                else{
                  return(
                    <ListItemButton onClick={()=>handlePage(val)} key={val.name}>
                      <ListItemText primary={val.name}/>
                    </ListItemButton>
                  )
                }
                })}
            </List>
          </Drawer>
        </Box>
        <Typography component="div">
          Nichicon
        </Typography>
        {HA.Label?
        <Typography sx={{ ml: 2, flex: 1 }} component="div">
          {HA.Label}
        </Typography>:<></>}
        <div className='info'>
          {HA.Text?HA.Text:""}
        </div>
          <Button onClick={()=>{navigate('/Login')}} style={{backgroundColor:"white"}}>
            <AccountCircleIcon/>
            {UserData?UserData.name:"ログイン"}
          </Button>
        {HA.Button1?HA.Button1:""}
        {HA.Button2?HA.Button2:""}
        {HA.Button3?HA.Button3:""}
        {HA.Button4?HA.Button4:""}
      </Toolbar>
      
      <Dialog open={open} onClose={()=>setOpen(false)} fullScreen>
        <div>
          <IconButton style={{backgroundColor:"black",color:"white"}} onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </div>
        <form>
          <div className='login'>
              <p>ログイン画面</p>
              <TextField required label="ユーザID" onChange={e=>{setUser(e.target.value)}} error={Error}/><br/>
              <TextField required label="パスワード" type="password" onChange={e=>{setPassword(e.target.value)}} error={Error}/><br/>
              {Error?<h4 className='Error'>※ユーザ名もしくはパスワードが間違っています</h4>:""}
              <section className="two">
                <Button onClick={handleLogin} variant="contained">ログイン</Button>
                <Button onClick={()=>{logout();handleClose();}} variant="contained" color="error">ログアウト</Button>
              </section>
          </div>
        </form>
      </Dialog>
    </Box>
  )
}