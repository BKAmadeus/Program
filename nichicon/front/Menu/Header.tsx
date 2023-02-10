import React, { useContext }  from 'react';
import { useNavigate } from "react-router-dom";

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';

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
import {PageMove} from '../Data/Data'
import {AuthUserContext} from '../Data/SharedVariable';

export const Header = (HA:any) => {
  const [state, setState] = React.useState(false);
  const navigate = useNavigate();
  const UserData = useContext(AuthUserContext);
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

  const handleUser = () => {
    //ログイン済み
    if(UserData){
      navigate('/Mypage')
    }//ログイン前
    else{
      navigate('/Login');
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Box>
            <IconButton color="inherit" onClick={handleOPCL}>
              <MenuIcon />
            </IconButton>
            <Drawer anchor='left' open={state} onClick={handleOPCL}>
              <List>
                {PageMove.map((val:any) => {
                  return(
                <ListItemButton onClick={()=>handlePage(val)} key={val.name}>
                  <ListItemText primary={val.name}/>
                </ListItemButton>
                )})}
              </List>
            </Drawer>
          </Box>
          <Typography variant="h4" component="div">
            Nichicon
          </Typography>
          {HA.Label?
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
            {HA.Label}
          </Typography>:<></>}
          <div className="loginButton">
            <IconButton autoFocus onClick={handleUser}>
              <AccountCircleIcon/>
              {UserData?UserData.name+"マイページ":"ログイン"}
            </IconButton>
          </div>
          {HA.Button1?HA.Button1:""}
          {HA.Button2?HA.Button2:""}
        </Toolbar>
      </AppBar>
    </Box>
  )
}