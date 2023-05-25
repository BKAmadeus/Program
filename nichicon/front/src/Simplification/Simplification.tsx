import { useForm,SubmitHandler } from 'react-hook-form';
import { useNavigate } from "react-router-dom";

import { useEffect, useState,useContext } from "react";
import styled from "styled-components";
import '../style.css'

import * as func from "../Components/func";
import type { FormProps } from "../Data/Data";
import { ports,AssemblyNotCode,WindingMachine,AllAuthorityList,Weight_BZI,Assembly_init_BZI } from "../Data/Data"
import { AssemblyFixation } from "../Data/Data";
import { Header } from "../Components/Header";
import { Reset,DataSetCalculation,DataSetConstant } from '../Components/ProductSelect';
import { AuthUserContext } from '../Data/SharedVariable';
//時間処理
import { format } from "date-fns";

//material-ui
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
//icons
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

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
        left:850px;
        grid-template-columns: 220px 220px 220px;
      }
  }
`;
const Title = styled.h1`
  margin : 60px;
  vertical-align: middle;
  text-align:top;
  height: 100px;
  font-size:60px;
`

const TD = styled.td`
  background-color:lightblue;
`
const TD2 = styled.td`
  background-color:lightgreen;
`
const Cell = styled.td`
  background-image: linear-gradient(to right top, transparent calc(50% - 0.5px), #999 50%, #999 calc(50% + 0.5px), transparent calc(50% + 1px));
`
const Th = styled.th<{ Flg: boolean }>`
  background-color: ${props => props.Flg ? "red" : "silver"};
  color: ${props => props.Flg ? "white" : "black"};
`;

export function Simplification() {
  const { register, watch, setValue, reset, resetField,handleSubmit } = useForm<FormProps>();
  const [scroll,setScroll] = useState(0);
  const watchSelect = watch(`Select`);
  const [tables,setTables] = useState<any>();
  const [state,setState] = useState<number>(0);
  const [DataList,setDataList] = useState([]);
  const [Incomplete,setIncomplete] = useState(0);
  const [special,setSpecial] = useState<boolean>(false);
  const [rerender,Rerender] = useState<boolean>(false);
  const [submit,setSubmit] = useState<boolean>(true);
  const UserData = useContext(AuthUserContext);
  const UserName = watch(`approval`);
  const Parts = watch(`parts`);
  const navigate = useNavigate();

  const handleSearch = (data:any) => {
    if(data){
      func.postData({flg:"assembly",data:data,tables:tables})
      .then((Data:any)=>{
        Reset(setValue,reset,resetField,watch,true);
        setValue(`CheckCode`,data.code);
        Rerender(!rerender);
        console.log("Data",Data);
        DataSetCalculation(Data,setValue,watch,true,true,true);
        DataSetConstant(data,setValue);
      })
    }
  };

  const Submit: SubmitHandler<FormProps> = data => {
    console.log("submit:",data);
    func.postData({flg:"AssemblySubmit",data:data,UserData:UserData,state:state,special:special});
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

  const handleCheckCode: SubmitHandler<FormProps> = data =>{
    if(data && data.Assembly && data.Assembly.code){
      const Chack = {flg:"FoilStandard",data:data,tables:tables};
      func.postData(Chack)
      .then((Data:any) => {
          DataSetCalculation(Data,setValue,watch,true,true,true);
      });
    }
  }

  const handleCheckClick: SubmitHandler<FormProps> = data => {
    if(data !== null){
      const Chack = {flg:"AssemblyCheck",data:data,tables:tables,state:state};
      func.postData(Chack)
      .then((Data:any) => {
          console.log("チェック確認",Data);
          setSubmit(Data.check);
          DataSetCalculation(Data,setValue,watch,true,true,true);
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
    if(!special && Parts){
      Parts.map((val:any,index:number)=>{
        if(Object.keys(AssemblyFixation).includes(val.name)){
          setValue(`parts.${index}.range`,undefined);
        }
        return ""
      })
      setValue(`core_diameter`,undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[special])

  useEffect(()=>{
    setValue(`Select`,Assembly_init_BZI);
    func.postData(ports)
    .then((data:any) => {
      console.log("初期データ",data);
      setTables(data);
      setDataList(data.assembly.table);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[])

  const handleState = (event: any) => {
    if([1,2,5].includes(parseInt(event.target.value))){
      Reset(setValue,reset,resetField,watch,true);
    }
    setSubmit(true);
    setState(parseInt(event.target.value));
  }

  return (
  <>
    <Header Label={"組立形式登録画面"}
    Button1={
      <Button autoFocus sx={{ width: 120 }} color="secondary" variant="contained" onClick={() => Reset(setValue,reset,resetField,watch,true)}>
      reset
     </Button>
    }
    Button2={
      <Button variant="contained" disabled={!(UserData && UserData.product_authority)} color="error" onClick={handleSubmit(handleCheckClick)}>データチェック</Button>
    }
    />
    <Dialog open={!submit} onClose={()=>setSubmit(true)}>
      <DialogTitle>
      {state === 3?<p>組立形式{watch(`Assembly.code`)}を修正しますか？</p>
      :state === 4?<p>組立形式{watch(`Assembly.code`)}を登録しますか？</p>
      :state === 5?<p>標準箔変更すると多数のデータが変更されます。<br/>よろしいですか？</p>
      :<p>データチェック問題なし</p>}
      </DialogTitle>
      {state === 3 || state === 4?<>
        <p>組立形式全体用のコメントがある場合ここに書き込んでください。</p>
        <TextField multiline {...register(`autor_comment`)} className='df2' rows={2}/>
      </>:""}
      {state !== 0?
      <div className='two'>
        <Button sx={{ width: 250 }} color="success" variant="contained" onClick={handleSubmit(Submit)}>
          YES
        </Button>
        <Button sx={{ width: 250 }} color="error" variant="contained" onClick={()=>setSubmit(true)}>
          NO
        </Button>
      </div>:<></>}
    </Dialog>
    <Assembly>
      <div className='select'>
        <FormLabel>データ操作</FormLabel>
        <RadioGroup onChange={handleState} defaultValue={0}>
          <FormControlLabel value={0} control={<Radio />} label="閲覧" sx={{ '& .MuiSvgIcon-root': { fontSize: 40 } }}/>
          {UserData && UserData.product_authority?<FormControlLabel value={3} control={<Radio />} label="修正" sx={{ '& .MuiSvgIcon-root': { fontSize: 40 } }}/>:<></>}
          {UserData && UserData.product_authority?<FormControlLabel value={4} control={<Radio />} label="作成" sx={{ '& .MuiSvgIcon-root': { fontSize: 40 } }}/>:<></>}
          {UserData && (AllAuthorityList.includes(UserData.post))?<FormControlLabel value={5} control={<Radio />} label="標準箔幅変更" sx={{ '& .MuiSvgIcon-root': { fontSize: 40 } }}/>:<></>}
        </RadioGroup>
        <FormLabel>リスト表示選択</FormLabel>
        <RadioGroup onChange={(e)=>{setIncomplete(parseInt(e.target.value))}} defaultValue={0}>
          <FormControlLabel value={0} control={<Radio />} label="使用可能のみ" sx={{ '& .MuiSvgIcon-root': { fontSize: 40 } }}/>
          <FormControlLabel value={1} control={<Radio />} label="未承認" sx={{ '& .MuiSvgIcon-root': { fontSize: 40 } }}/>
          <FormControlLabel value={2} control={<Radio />} label="本人作成棄却物" sx={{ '& .MuiSvgIcon-root': { fontSize: 40 } }}/>
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
          {/*余りに多くなるので速度重視に変更*/}
          {DataList?(Incomplete === 0?DataList.filter((val:any)=>parseInt(val.available) === 0 && (!watch(`Assembly.code`) || val.code.indexOf(watch(`Assembly.code`)) !== -1))
          :Incomplete === 1?DataList.filter((val:any)=>parseInt(val.available) > 0 && (!watch(`Assembly.code`) || val.code.indexOf(watch(`Assembly.code`)) !== -1))
          :DataList.filter((val:any)=>parseInt(val.available) === -2 && UserData && UserData.code === val.approval[0].code && (!watch(`Assembly.code`) || val.code.indexOf(watch(`Assembly.code`)) !== -1))
          ).map((val:any,index:number) => {
            if(scroll*scrollsize <= index && index < scroll*scrollsize + scrollsize){
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
                    {watch(`approval.${index}.days`)?format(new Date(watch(`approval.${index}.days`)),"$1年$2月$3日"):""}
                  </span>
                )
              }
              return <span className='HankoCircle' key={index}></span>
            })}
        </div>
        <Title>組立形式</Title>
        <div>
          <table border={1} key={"table"}>
            <tbody key={"body"}>
              <tr key={"組立形式条件"}>
                <Th Flg={watch(`Assembly.error`) !== undefined}>組立形式</Th>
                <td colSpan={2}>
                  <TextField value={watch(`Assembly.code`)?watch(`Assembly.code`):""} onChange={(e)=>setValue(`Assembly.code`,e.target.value.toUpperCase())} className='df'/>
                </td>
                <td>
                <Button variant="contained" color="error" onClick={handleSubmit(handleCheckCode)} disabled={state<=3}>
                  標準箔幅呼び出し
                </Button>
                </td>
              </tr>
              <tr key={"組立形式入力要素"}>
                <Th Flg={watch(`diameter_Error`) !== undefined}>φ径</Th>
                <Th Flg={watch(`l_dimension_Error`) !== undefined}>L寸</Th>
                <Th Flg={watch(`core_diameter_Error`) !== undefined}>巻芯径<Checkbox checked={special} onClick={()=>{setSpecial(!special)}}/></Th>
                <Th Flg={watch(`inclusion_guid_Error`) !== undefined}>封入指導票No.</Th>
                <Th Flg={watch(`finish_guid_Error`) !== undefined}>仕上指導票No.</Th>
                <Th Flg={watch(`gauge_number_Error`) !== undefined}>ゲージNo.</Th>
                <th>巻取機種類</th>
              </tr>
              <tr key={"組立形式入力要素入力"}>
                {state > 3?<td><TextField {...register(`Assembly.diameter`)} type="number" className='df'/></td>:<TD>{watch(`Assembly.diameter`)}</TD>}
                {state > 3?<td><TextField {...register(`Assembly.l_dimension`)} type="number" className='df'/></td>:<TD>{watch(`Assembly.l_dimension`)}</TD>}
                {state === 0?<TD>{watch(`core_diameter`)}</TD>
                :!special?<td>{watch(`core_diameter`)}
                <Autocomplete
                  options={AssemblyFixation.core_diameter}
                  getOptionLabel={(option: any) => String(option)}
                  onChange={(_, data) => data?setValue(`core_diameter`,data):""}
                  renderInput={(params) => (<TextField {...params} variant="filled" className='df'/>)}
                /></td>
                :<td><TextField {...register(`core_diameter`)} type="number" className='df'/></td>}
                {state >= 3 && state !== 5?<td><TextField {...register(`inclusion_guid`)} className='df'/></td>:<TD>{watch(`inclusion_guid`)}</TD>}
                {state >= 3 && state !== 5?<td><TextField {...register(`finish_guid`)} className='df'/></td>:<TD>{watch(`finish_guid`)}</TD>}
                {state >= 3 && state !== 5?<td><TextField {...register(`gauge_number`)} type="number" className='df'/></td>:<TD>{watch(`gauge_number`)}</TD>}
                {WindingMachine && state >= 3 && state !== 5?
                <td>
                  {watch(`winding_machine`)}
                  <Autocomplete
                    options={WindingMachine}
                    getOptionLabel={(option: any) => option.label}
                    onChange={(_, data) => data?setValue(`winding_machine`,data.value):""}
                    renderInput={(params) => <TextField {...params} className='df2'/>}
                  />
                </td>:<TD2>{watch(`winding_machine`)}</TD2>}
              </tr>
              <tr key={"部材情報"}>
                <th rowSpan={(watch(`parts`)?watch(`parts`).filter((val:any)=> val && val.name).length:0)+1}>
                  OUTリスト
                  <List sx={{width: '100%',maxWidth: 360,bgcolor: 'background.paper',position: 'relative',overflow: 'auto',maxHeight: 500,'& ul': { padding: 0 }, }} subheader={<li />}>
                    {ports.parts?ports.parts.map((val:any,index:number) => {
                      if(!watchSelect?.includes(val.label)){
                        return(
                          <li key={index}>
                            <ul>
                              <ListItem disablePadding>
                                <ListItemButton disabled={state<=2} onClick={()=>{setValue(`Select`,watchSelect?[...watchSelect,val.label]:[val.label])}}>{val.label}</ListItemButton>
                              </ListItem>
                            </ul>
                          </li>
                        )
                      }
                      return ""
                    }):<></>}
                  </List>
                  IN部材リスト
                  <List sx={{width: '100%',maxWidth: 360,bgcolor: 'background.paper',position: 'relative',overflow: 'auto',maxHeight: 500,'& ul': { padding: 0 }, }} subheader={<li />}>
                    {ports.parts?ports.parts.map((val:any,index:number) => {
                      if(watchSelect?.includes(val.label)){
                        return(
                          <li key={index+"test"}>
                            <ul>
                              <ListItem disablePadding>
                                <ListItemButton disabled={Assembly_init_BZI.includes(val.label) || state <=2} onClick={()=>{setValue(`Select`,watchSelect.filter((item:any)=> item !== val.label))}}>{val.label}</ListItemButton>
                              </ListItem>
                            </ul>
                          </li>
                        )
                      }
                      return ""
                    }):<></>}
                  </List>
                </th>
                <th>部材名</th>
                <th>部材コード</th>
                <th>数量</th>
                <th>幅<Checkbox checked={special} onClick={()=>{setSpecial(!special)}}/></th>
                <th>長さ</th>
              </tr>
              {watch(`parts`)?watch(`parts`).map((val:any,index:number)=>{
                if(val && val.name){
                  return (
                    <tr key={index}>
                      <Th Flg={watch(`parts.${index}.error`) !== undefined}>
                        {watch(`parts.${index}.name`)?watch(`parts.${index}.name`):""}
                      </Th>
                      
                      {!AssemblyNotCode.includes(val.name)?
                      tables && val.table_name && tables[val.table_name] && tables[val.table_name].table && (state>=3 && state !== 5)?
                        <td>
                        {val.code}
                        <Autocomplete
                          options={tables[val.table_name].table}
                          getOptionLabel={(option: any) => option.code}
                          onChange={(_, data) => setValue(`parts.${index}.code`,data.code)}
                          renderInput={(params) => ( <TextField {...params} variant="filled" className='df'/>)}
                        /></td>
                      :<TD>{val.code}</TD>
                      :<Cell></Cell>}
                      
                      {!AssemblyNotCode.includes(val.name) && !Weight_BZI.includes(val.name)?state <= 2 || state === 5?<TD>{watch(`parts.${index}.quantity`)}</TD>
                      :<td><TextField {...register(`parts.${index}.quantity`)} type={"number"} className='df'/></td>
                      :<Cell></Cell>}

                      {AssemblyNotCode.includes(val.name) && val.name !== '外チューブ'?state === 0?<TD>{val.range}</TD>
                      :(state === 5 && !['+タブ','-タブ'].includes(val.name)) || state !== 5?
                      Object.keys(AssemblyFixation).includes(val.name) && !special?<td>{watch(`parts.${index}.range`)}
                      <Autocomplete 
                        options={AssemblyFixation[val.name]}
                        getOptionLabel={(option: any) => String(option)}
                        onChange={(_, data) => data?setValue(`parts.${index}.range`,data):""}
                        renderInput={(params) => (<TextField {...params} variant="filled" className='df'/>)}
                      /></td>
                      :<td><TextField {...register(`parts.${index}.range`)} type="number" className='df'/></td>
                      :<TD>{val.range}</TD>
                      :<Cell></Cell>}
                      
                      {val.name === '外チューブ'?state >= 3 && state !== 5?<td><TextField {...register(`parts.${index}.length`)} type={"number"} className='df'/></td>
                      :<TD>{watch(`parts.${index}.length`)}</TD>
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
    </Assembly>
  </>
  )
}


/*
{['+タブ','-タブ'].includes(val.name)?state >= 3 && state !== 5?<td><TextField {...register(`parts.${index}.thickness`)} type={"number"} className='df'/></td>
:<TD>{watch(`parts.${index}.thickness`)}</TD>
:<Cell></Cell>}
{val.name === '外チューブ'?state >= 3 && state !== 5?<td><TextField {...register(`parts.${index}.fold_diameter`)} type={"number"} className='df'/></td>
:<TD>{watch(`parts.${index}.fold_diameter`)}</TD>
:<Cell></Cell>}

*/