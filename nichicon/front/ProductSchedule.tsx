//import {Calendar} from './Components/Calendar'
import Button from '@mui/material/Button';
import * as func from "./Func/func";
//import {Schedule_data} from "./Data/Data";
import {DateTime} from './Components/DateTime'
import React from "react";
import {GanttChart} from "./Components/GanttChart"

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import { Header } from "./Menu/Header";
import {Dnd} from './ProductSchedule/Dnd'
//import { DragDropContext, Draggable } from "react-beautiful-dnd";

//import Checkbox from '@mui/material/Checkbox';
//import Box from '@mui/material/Box';
//import Stack from '@mui/material/Stack';
//import Accordion from '@mui/material/Accordion';
//import AccordionSummary from '@mui/material/AccordionSummary';
//import IconButton from '@mui/material/IconButton';
//import TextField from '@mui/material/TextField';
//import Button from '@mui/material/Button';

export const Schedule = (SC:any) => {

  
  //const [Schedule,setSchedule] = React.useState(Schedule_data);
  const [Dates,setDates] = React.useState({start:new Date(),end:new Date()});
  const [UnclassifiedData,setUnclassifiedData] = React.useState([]);

  const Unclassified = (NotData:any,OriginalData:any) =>{
    
    var Unclass = OriginalData.filter((val:any)=>{
      return !(!Object.keys(val.schedule.filter((val2:any)=> !val2.equipment)).length);
    });
    
    if(Unclass.length !== 0){
      NotData.push(Unclass)
    }
    setUnclassifiedData(NotData)
  }

  const handleTest = () =>{
    var test = {value:'production_schedule',flg:'schedule_initData'}
    func.postData(test)
    .then((data:any) => {
      console.log("schedule",data);
      Unclassified(data.schedule.NotStart,data.schedule.started);
    })
  }

  return (
    <div>
      <Header Label={"生産計画"}/>
      <Button onClick={handleTest}>確認</Button>
    
      <DateTime start={Dates.start} end={Dates.end} setDate={setDates}/>
      <GanttChart/>
      <section>
      <Dnd />
      </section>
      {UnclassifiedData.length !== 0? 
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow key={"head"}>
              {Object.keys(UnclassifiedData[0]).map((val:any,index:any)=>{
                return <TableCell key={index}>{val}</TableCell>
              })}
            </TableRow>
          </TableHead>
          <TableBody>
          {UnclassifiedData.map((val:any,index:any)=>{
            return (
              <TableRow key={index}>
                {Object.keys(val).map((val2:any)=>{
                  return (
                    <TableCell key={val2} style={{minWidth: `${Math.floor(100/3)}vw`}}>
                      {val[val2]}
                    </TableCell>
                  )})}
              </TableRow>              
              )}
          )}
          </TableBody>
        </Table>
      </TableContainer>
      :<></>}
    </div>
  );
}