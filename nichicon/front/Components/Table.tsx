//import { DataGrid } from '@mui/x-data-grid';
import { Typography } from '@material-ui/core';
import { EntryList } from './EntryList';
import type {TableType} from '../Data/Data';
import {defaultValues} from '../Data/Data';
import { useForm } from 'react-hook-form';
import {FormDialog} from './SortDialog';
import {MakeExcel} from './makeExcel'

//アイコン
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
//import ModeIcon from '@mui/icons-material/Mode';
//import DeleteIcon from '@mui/icons-material/Delete';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Collapse from '@mui/material/Collapse';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Checkbox from '@mui/material/Checkbox';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

import React, { useEffect } from 'react';
import '../style.css';
type Props = {
    TableName: string
    Tables: any
    Process: any
    TablesState: any
    ChangeState: any
    TableColumns?: any[]
  };

export function DataTable(props:Props) {
  const { register, watch, setValue, resetField, reset } = useForm<TableType>({mode:'onChange',defaultValues});
  const page = watch(`page`);
  const data = watch(`data_quantity`);
  const refinement = watch(`refinement`);
  const sort_esc = watch(`sort.esc`);
  const sort_key = watch(`sort.key`);
  const TableIndex = watch(`table_index`);
  //絞り込みソート
  useEffect(()=>{
    var table_index = [...Array(props.Tables[props.TableName].table.length)].map((v,i)=>i)
      if(refinement){
        for(let row of refinement){
          if(row && row.key){
            table_index = table_index.filter((index:any)=>{
              return props.Tables[props.TableName].table[index][row.key].includes(row.value);
            });
          }
        }
      }
      if(!sort_esc && isNaN(props.Tables[props.TableName].table[0][sort_key])){
        table_index = table_index.slice().sort(function(a:any,b:any){
          if(props.Tables[props.TableName].table[a][sort_key] > props.Tables[props.TableName].table[b][sort_key]){
            return 1;
          }
          else{
            return -1;
          }
        });
      }
      else if(isNaN(props.Tables[props.TableName].table[0][sort_key])){
        table_index = table_index.slice().sort(function(a:any,b:any){
          if(props.Tables[props.TableName].table[a][sort_key] > props.Tables[props.TableName].table[b][sort_key]){
            return -1;
          }
          else{
            return 1;
          }
        });
      }
      else if(!sort_esc){
        table_index = table_index.slice().sort((a:any,b:any) => props.Tables[props.TableName].table[a][sort_key] - props.Tables[props.TableName].table[b][sort_key]);
      }
      else{
        table_index = table_index.slice().sort((a:any,b:any) => props.Tables[props.TableName].table[b][sort_key] - props.Tables[props.TableName].table[a][sort_key]);
      }
      setValue(`table_index`,table_index);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[sort_esc,sort_key,refinement])

  //初期値決め等
  useEffect(()=>{
      setValue(`check`,[...Array(props.Tables[props.TableName].table.length)].map(()=>false));
      setValue(`table_index`,[...Array(props.Tables[props.TableName].table.length)].map((_,i)=>i));
      // eslint-disable-next-line react-hooks/exhaustive-deps
  },[])
  
  const handleReset = () => {
      reset(defaultValues);
      if(TableIndex){
        setValue(`check`,[...Array(TableIndex.length)].map(()=>false));
      }
  }
  return (
    <div>
      <Accordion>
          <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
          >
          <Typography variant="h6">{props.TableName}のテーブル一覧</Typography>
          </AccordionSummary>
        {TableIndex?
        <>
        <Box sx={{ width: 1100 }}>
          <Stack spacing={2} sx={{ width: 1000 }} direction="row" alignItems="center">
            <Typography>ページ1~{Math.ceil(TableIndex.length / data)}</Typography>
            <TextField label={"データ数"} type="number" {...register(`data_quantity`)}/>
            <TextField label={"ページ"} type="number" {...register(`page`)}/>
            <Button onClick={handleReset} variant="contained">
              reset
            </Button>
            <MakeExcel
              table_name={props.TableName}
              table={props.Tables[props.TableName].table}
              struct={props.Tables[props.TableName].struct}
              max={props.Tables[props.TableName].max}
              table_index={TableIndex.filter((val:any)=>watch(`check.${val}`))}
            />
            <EntryList 
              TableName={props.TableName}
              Process={props.Process}
            />
          </Stack>
        </Box>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow key={"head"}>
                <TableCell key={"open"}/>
                <TableCell key={"checkbox"}>
                  <Checkbox checked={watch(`all_check`)} onChange={(e)=>{TableIndex.map((val:any)=>setValue(`check.${val}`,e.target.checked));setValue(`all_check`,e.target.checked)}}/>
                </TableCell>
              {Object.keys(props.Tables[props.TableName].table[0]).map((val:any,index:any)=>{
                if(!Object.keys(props.Tables[props.TableName].struct).includes(val)){
                  return (
                  <TableCell key={val}>
                    <div className='table_element'>
                    {val}
                    <IconButton onClick={()=>{setValue(`sort.key`,val);setValue(`sort.esc`,!sort_esc)}}>
                        {sort_key === val && sort_esc ? <ArrowUpwardIcon className={sort_key !== val? 'default':'red'} />:<ArrowDownwardIcon className={sort_key !== val? 'default':'red'}/>}
                    </IconButton>
                    <FormDialog
                    Reset={`refinement.${index}`} SET={`refinement.${index}.value`} SET2={`refinement.${index}.key`}
                    register={register} resetField={resetField} setValue={setValue} watch={watch} value={val}
                    />
                    </div>
                  </TableCell>)
                }
                return ""
              })}
              </TableRow>
            </TableHead>
            <TableBody>
                {TableIndex.map((index:any,Count:any)=> {
                  const val = props.Tables[props.TableName].table[index];
                  //ページの表示数調整のデータif
                  if(data >= 1 && page >= 1 && page <= Math.ceil(TableIndex.length / data)){
                    if(Count >= (page*data-data) && Count < (page*data)){
                      return(
                        <React.Fragment key={index}>
                          <TableRow key={"row"}>
                            <TableCell key={"open"}>
                              <IconButton
                                onClick={() => setValue(`open.${index}`,!watch(`open.${index}`))}
                              >
                                {watch(`open.${index}`) ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                              </IconButton>
                            </TableCell>
                            <TableCell key={"checkbox"}>
                              <Checkbox checked={watch(`check.${index}`)} {...register(`check.${index}`)}/>
                            </TableCell>
                            {Object.keys(val).map((item:any)=>{
                              if(!Object.keys(props.Tables[props.TableName].struct).includes(item)){
                                return <TableCell key={item}>{val[item]}</TableCell>
                              }
                              return ""
                            })}
                          </TableRow>
                          <TableRow key={"struct"}>
                            <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={Object.keys(props.Tables[props.TableName].table[0]).length-Object.keys(props.Tables[props.TableName].struct).length+1}>
                              <Collapse in={watch(`open.${index}`)} timeout="auto" unmountOnExit>
                                {Object.keys(props.Tables[props.TableName].struct).map((struct:any,index2:any)=>{
                                  if(val[struct]){
                                    return (
                                      <Accordion key={index2}>
                                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                          <Typography variant="h6">{struct}の要素一覧</Typography>
                                        </AccordionSummary>
                                        <Box>
                                          <Table>
                                            <TableHead>
                                              <TableRow>
                                                <TableCell key="id">ID</TableCell>
                                                {props.Tables[props.TableName].struct[struct].map((item:any,index3:any)=>{
                                                  return <TableCell key={index3}>{item}</TableCell>
                                                })}
                                              </TableRow>
                                            </TableHead>
                                            <TableBody>
                                              {val[struct].map((val3:any,index4:any)=>{
                                                return(
                                                  <TableRow key={index4}>
                                                    <TableCell key="id">{index4}</TableCell>
                                                    {props.Tables[props.TableName].struct[struct].map((item:any,index3:any)=>{
                                                      return <TableCell key={index3}>{val3[item]}</TableCell>
                                                    })}
                                                  </TableRow>
                                                )
                                              })}
                                            </TableBody>
                                          </Table>
                                        </Box>
                                      </Accordion>
                                    )
                                  }
                                  return ""
                                })}
                              </Collapse>
                            </TableCell>
                          </TableRow>
                        </React.Fragment>
                      )
                    }
                    return ""
                  }
                  else{
                    return ""
                  }
                })}
            </TableBody>
          </Table>
        </TableContainer>
        </>
        :<></>}
      </Accordion>
    </div>
  );
}

/*
        
    const handleDelete = (RowParam:any) => {
      var change = props.Tables;
      change[props.TableName] = props.Tables[props.TableName].filter((item:any) => item.id !== RowParam.id);
      props.TablesState(change);
      props.ChangeState({flg:4,name:props.TableName,row:RowParam});
    };
    
    const handleUpdate = (RowParam:any) => {
      console.log("Edit",RowParam);
      props.ChangeState({flg:2,name:props.TableName,row:RowParam})
    };
    const  Columns = (Table:any,Process:any) => {
      var ans:any = []
      var count = 0;
      for(var key in Table[0]){
        var row:any = []
        row['field'] = key;
        if(props.TableColumns !== undefined){
          row['headerName'] = props.TableColumns[count];
        }
        else {
          row['headerName'] = key;
        }
        row['minWidth'] = props.width * 6;
        if (Process === '2' && key !== 'id'){
            row['editable'] = true;
        }
        else{
          row['editable'] = false;
        }
        ans.push(row);
        count=count+1;
      }
      if (Process ==='2'){
        var update:any = {
          field: "update",
          headerName: "Update",
          width: 150,
          renderCell: (params:any) => {
            return (
              <>
                <ModeIcon 
                  className='updateBtn'
                  onClick={()=>{
                    handleUpdate(params.row);
                    console.log(params);
                  }}
                />
              </>
            );
          }
        }
        ans.push(update);
      }
      else if (Process ==='4'){
        var del:any = {
          field: "delete",
          headerName: "Delete",
          width: 150,
          renderCell: (params:any) => {
            return (
              <>
                <DeleteIcon 
                  className='deleteBtn'
                  onClick={()=>{
                    handleDelete(params.row);
                  }}
                />
              </>
            );
          }
        }
        ans.push(del);
      }
      return ans
    }
    var Column = Columns(props.Tables[props.TableName].table,props.Process);
*/