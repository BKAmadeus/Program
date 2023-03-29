import { useForm,SubmitHandler } from 'react-hook-form';
import { useNavigate } from "react-router-dom";

import { useEffect, useState,useContext } from "react";
import styled from "styled-components";
import '../style.css'

import * as func from "../Components/func";
import type { FormProps } from "../Data/Data";
import { ports,AssemblyNotCode,AllAuthorityList,Weight_BZI,Assembly_init_BZI,re2 } from "../Data/Data"
import { VerificationList,ApprovalList,ApprovalList2 } from "../Data/Data";
import { Header } from "../Components/Header";
import { Reset,DataSetCalculation,DataSetConstant } from '../Components/ProductSelect';
import { AuthUserContext } from '../Data/SharedVariable';

//material-ui
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
//icons
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';

var scrollsize = 30
const Assembly = styled.div`
  display: grid;
  grid-template-columns: 200px 300px 1400px; // 幅3等分 
  grid-template-rows: 1fr; // 100pxの2行 
  grid-gap: 10px; // 隙間10px 
  margin-bottom: 20px;
  .select {
      grid-column: 1; // 列開始位置2(の始端)/終了位置4(の始端)
      grid-row: 1; // 行開始位置1(の始端)
      border: solid 3px #555555;
  }
  .list {
      grid-column: 2; // 列開始位置2(の始端)/終了位置4(の始端)
      grid-row: 1; // 行開始位置1(の始端) 
      border: solid 3px #555555;
  }
  .box {
      grid-column: 3; // 列開始位置2(の始端)/終了位置4(の始端)
      grid-row: 1; // 行開始位置1(の始端) 
      border: solid 3px #555555;
      display:grid;
      .approver{
        position: absolute;
        display:grid;
        left: 850px;
        grid-template-columns: 220px 220px 220px;
      }
  }
  .workflow {
    grid-row: 3;
    grid-column: 1/4;
  }
`;

const Title = styled.h1`
  margin : 60px;
  vertical-align: middle;
  text-align:top;
  height: 100px;
  font-size:60px;
`
const Cell = styled.td`
  background-image: linear-gradient(to right top, transparent calc(50% - 0.5px), #999 50%, #999 calc(50% + 0.5px), transparent calc(50% + 1px));
`
const TD = styled.td`
  background-color:lightblue;
`
const TD2 = styled.td`
  background-color:lightgreen;
`

const Th = styled.th<{ Flg: boolean }>`
  background-color: ${props => props.Flg ? "red" : "silver"};
  color: ${props => props.Flg ? "white" : "black"};
`;

export function SimplificationApproval() {
  const { register,watch, setValue, reset, resetField,handleSubmit } = useForm<FormProps>();
  const [scroll,setScroll] = useState(0);
  const watchSelect = watch(`Select`);
  const [tables,setTables] = useState<any>();
  const [state,setState] = useState<number>(2);
  const [DataList,setDataList] = useState([]);
  const [rerender,Rerender] = useState<boolean>(false);
  const [submit,setSubmit] = useState<boolean>(true);
  const UserData = useContext(AuthUserContext);
  const UserName = watch(`approval`);
  const navigate = useNavigate();

  const handleSearch = (data:any) => {
    func.postData({flg:"assembly",data:data,tables:tables})
    .then((Data:any)=>{
      Reset(setValue,reset,resetField,watch);
      Rerender(!rerender);
      setValue(`CheckCode`,data.code);
      DataSetCalculation(Data,setValue);
      DataSetConstant(data,setValue);
    })
  };

  const Submit: SubmitHandler<FormProps> = data => {
    console.log("submit:",data);
    func.postData({flg:"AssemblySubmit",data:data,UserData:UserData,state:state,permit:true});
    navigate('/');
  };

  const Submit2: SubmitHandler<FormProps> = data => {
    console.log("submit:",data);
    func.postData({flg:"AssemblySubmit",data:data,UserData:UserData,state:state,permit:false});
    navigate('/');
  };

  const handleForward = () =>{
    if(scroll+1 < DataList.filter((val:any)=>parseInt(val.available) >= 0).length/scrollsize){
      setScroll(scroll+1)
    }
  }

  const handleBack = () =>{
    if(scroll > 0){
      setScroll(scroll-1)
    }
  }

  const handleCheckClick: SubmitHandler<FormProps> = data => {
    if(data !== null){
      const Chack = {flg:"AssemblyCheck",data:data,tables:tables,state:state};
      func.postData(Chack)
      .then((Data:any) => {
          console.log("チェック確認",Data);
          setSubmit(Data.check);
          DataSetCalculation(Data,setValue);
      });
    }
  }

  useEffect(()=>{
    var codes:string[] = [];
    if(UserName){
      UserName.map((val:any)=>{
          if(val && val.code){
              codes.push(val.code);
          }
          return ""
      })
      if(codes.length !== 0){
        func.postData({flg:"UserCodes",codes:codes})
        .then((data:any) => {
          data.map((val:any)=>{
            UserName.map((val2:any,index:number)=>{
              if(val.code === val2.code){
                  setValue(`approval.${index}.name`,val.name);
                  setValue(`approval.${index}.post`,val.post);
                  setValue(`approval.${index}.affiliations`,val.affiliations);
              }
              return ""
            })
            return ""
          });
        });
    }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[UserName])

  useEffect(()=>{
    if(watchSelect){
      ports.parts.map((value:any,index:number)=> {
        if(watchSelect.includes(value.label)){
          setValue(`parts.${index}.table_name`,value.code);
          setValue(`parts.${index}.name`,value.label);
        }
        else{
          resetField(`parts.${index}`);
        }
        return ""
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[watchSelect])

  useEffect(()=>{
    setValue(`Select`,Assembly_init_BZI);
    func.postData(ports)
    .then((data:any) => {
      setTables(data);
      setDataList(data.assembly.table);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[])

  const handleState = (event: any) => {
    Reset(setValue,reset,resetField,watch);
    setState(parseFloat(event.target.value));
  }

  return (
  <>
    <Header Label={"組立形式承認"}
    Button1={
      <Button autoFocus sx={{ width: 120 }} color="secondary" variant="contained" onClick={() => Reset(setValue,reset,resetField,watch)}>
      reset
     </Button>
    }
    Button2={
      <Button variant="contained" disabled={!(UserData && UserData.product_authority)} color="error" onClick={handleSubmit(handleCheckClick)}>データチェック</Button>
    }
    />
    <Dialog open={!submit} onClose={()=>setSubmit(true)}>
      <DialogTitle>{state === 1?"承認":state ===2?"照査":"引き上げ承認"}しますか？</DialogTitle>
        <p>{state === 1?"承認":state ===2?"照査":"引き上げ承認"}時のコメントがある場合ここに書き込んでください。</p>
        <TextField multiline {...register(`autor_comment`)} className='df2' rows={2}/>
      <div className='two'>
        <Button sx={{ width: 250 }} color="success" variant="contained" onClick={handleSubmit(Submit)}>
          {state === 1?"承認":state ===2?"照査":"引き上げ承認"}
        </Button>
        <Button sx={{ width: 250 }} color="error" variant="contained" onClick={handleSubmit(Submit2)}>
          棄却
        </Button>
      </div>
    </Dialog>
    {UserData && (((VerificationList.includes(UserData.post) || ApprovalList.includes(UserData.post)) && UserData.affiliations === '設計課') || ApprovalList2.includes(UserData.post) || AllAuthorityList.includes(UserData.post))?
    <Assembly>
      <div className='select'>
        <FormLabel>データ操作</FormLabel>
          <RadioGroup onChange={handleState} defaultValue={2}>
              {UserData && ((VerificationList.includes(UserData.post) && UserData.affiliations === '設計課') || AllAuthorityList.includes(UserData.post))?<FormControlLabel value={2} control={<Radio />} label="照査" sx={{ '& .MuiSvgIcon-root': { fontSize: 40 } }}/>:<></>}
              {UserData && ((ApprovalList.includes(UserData.post) && UserData.affiliations === '設計課') || ApprovalList2.includes(UserData.post) || AllAuthorityList.includes(UserData.post))?<FormControlLabel value={1} control={<Radio />} label="承認" sx={{ '& .MuiSvgIcon-root': { fontSize: 40 } }}/>:<></>}
              {UserData && ((ApprovalList.includes(UserData.post) && UserData.affiliations === '設計課') || ApprovalList2.includes(UserData.post) || AllAuthorityList.includes(UserData.post))?<FormControlLabel value={1.5} control={<Radio />} label="引き上げ承認" sx={{ '& .MuiSvgIcon-root': { fontSize: 40 } }}/>:<></>}
          </RadioGroup>
      </div>
      <div className='list'>
        <h2>組立形式リスト</h2>
        <h2 className='checklist'>{watch(`CheckCode`)}</h2>
        <IconButton onClick={handleBack}>
          <ArrowBackIosIcon/>
        </IconButton>
        <IconButton onClick={handleForward}>
          <ArrowForwardIosIcon/>
        </IconButton>
        {scroll}
        <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper', position: 'relative', overflow: 'auto', '& ul': { padding: 0 } }} subheader={<li />}>
          {DataList?DataList.filter((val:any)=>parseInt(val.available) === Math.ceil(state)).map((val:any,index:number) => {
            if( scroll*scrollsize <= index && index < scroll*scrollsize + scrollsize){
              return(
                <li key={index}>
                  <ul>
                    <ListItem disablePadding className={watch(`CheckCode`) === val.code?"checklist":""}>
                      <ListItemButton onClick={(_)=>{handleSearch(val)}}>{val.code}</ListItemButton>
                    </ListItem>
                  </ul>
                </li>
              )
            }
            return ""
          }):<></>}
        </List>
      </div>
      <div className='box'>
        <div className='approver'>
            {[...Array(3)].map((_,index:number)=>{
              if(watch(`approval`) && watch(`approval.${index}`)){
                return(
                  <span className='HankoCircle' key={index}>
                    {watch(`approval.${index}`).action}<br/>
                    {watch(`approval.${index}`) && watch(`approval.${index}`).name?watch(`approval.${index}`).name:""}<br/>
                    {watch(`approval.${index}.days`)?watch(`approval.${index}.days`).replace(re2,"$1年$2月$3日"):""}
                  </span>
                )
              }
              return <span className='HankoCircle' key={index}></span>
            })}
        </div>
        <Title>組立形式</Title>
        <div>
          <table border={1} key={"table"} className='assembly_table'>
            <tbody key={"body"}>
              <tr key={"組立形式条件"}>
                <Th Flg={watch(`Assembly.error`) !== undefined}>組立形式</Th>
                <TD colSpan={2}>
                  {watch(`Assembly.code`)}
                </TD>
                <th>巻取機種類</th>
                <TD2>{watch(`winding_machine`)}</TD2>
              </tr>
              <tr key={"組立形式入力要素"}>
                <Th Flg={watch(`diameter_Error`) !== undefined}>φ径</Th>
                <Th Flg={watch(`l_dimension_Error`) !== undefined}>L寸</Th>
                <Th Flg={watch(`device_diameter_Error`) !== undefined}>素子長</Th>
                <Th Flg={watch(`core_diameter_Error`) !== undefined}>巻芯径</Th>
                <Th Flg={watch(`inclusion_guid_Error`) !== undefined}>封入指導票No.</Th>
                <Th Flg={watch(`finish_guid_Error`) !== undefined}>仕上指導票No.</Th>
                <Th Flg={watch(`gauge_number_Error`) !== undefined}>ゲージNo.</Th>
              </tr>
              <tr key={"組立形式入力要素入力"}>
                <TD>{watch(`Assembly.diameter`)}</TD>
                <TD>{watch(`Assembly.l_dimension`)}</TD>
                <TD>{watch(`device_diameter`)}</TD>
                <TD>{watch(`core_diameter`)}</TD>
                <TD>{watch(`inclusion_guid`)}</TD>
                <TD>{watch(`finish_guid`)}</TD>
                <TD>{watch(`gauge_number`)}</TD>
              </tr>
              <tr key={"部材情報"}>
                <th>部材名</th>
                <th>部材コード</th>
                <th>数量</th>
                <th>幅</th>
                <th>厚み</th>
                <th>折径</th>
                <th>長さ</th>
              </tr>
              {watch(`parts`)?watch(`parts`).map((val:any,index:number)=>{
                if(val && val.name){
                  return (
                    <tr key={index}>
                      <Th Flg={watch(`parts.${index}.error`) !== undefined}>
                        {watch(`parts.${index}.name`)?watch(`parts.${index}.name`):""}
                      </Th>
                      
                      {!AssemblyNotCode.includes(val.name)?<TD>{val.code}</TD>
                      :<Cell></Cell>}
                      
                      {!AssemblyNotCode.includes(val.name) && !Weight_BZI.includes(val.name)?<TD>{watch(`parts.${index}.quantity`)}</TD>
                      :<Cell></Cell>}

                      {AssemblyNotCode.includes(val.name) && val.name !== '外チューブ'?<TD>{watch(`parts.${index}.range`)}</TD>
                      :<Cell></Cell>}
                      
                      {['+タブ','-タブ'].includes(val.name)?<TD>{watch(`parts.${index}.thickness`)}</TD>
                      :<Cell></Cell>}
                      
                      {val.name === '外チューブ'?<TD>{watch(`parts.${index}.fold_diameter`)}</TD>
                      :<Cell></Cell>}
                      
                      {val.name === '外チューブ'?<TD>{watch(`parts.${index}.length`)}</TD>
                      :<Cell></Cell>}
                    </tr>
                  )
                }
                return ""
              }):<></>}
            </tbody>
          </table>
        </div>
      </div>
      <div className='workflow'>
      <table>
        <tbody>
          <tr key="name">
            <th>状態</th>
            <th>ユーザ情報</th>
            <th>コメント</th>
            <th>日時</th>
          </tr>
          {watch(`approval`)?watch(`approval`).map((val:any,index:number)=>{
            return (
              <tr key={index}>
                <td><TaskAltIcon/></td>
                <td>{val.name?val.name:""}<br/>{val.post?val.post:""}<br/>{val.affiliations?val.affiliations:""}</td>
                <td>{val.comment?val.comment:""}</td>
                <td>{val.days?val.days.replace(re2,"$1年$2月$3日 $4時$5分"):""}</td>
              </tr>
            )
          }):""}
          <tr key="now">
              <td>
               <IconButton onClick={handleSubmit(handleCheckClick)}>
                <RadioButtonUncheckedIcon/>
               </IconButton>
              </td>
              <td>{UserData.name?UserData.name:""}<br/>
                  {UserData.post?UserData.post:""}<br/>
                  {UserData.affiliations?UserData.affiliations:""}<br/>
              </td>
              <td>{watch(`autor_comment`)}</td>
              <td></td>
          </tr>
        </tbody>
      </table>
      </div>
    </Assembly>
    :<Title>権利者がログインしないと使えない</Title>}
  </>
  )
}