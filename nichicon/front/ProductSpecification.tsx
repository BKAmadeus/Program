//material-uiコンポーネント
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Switch from '@mui/material/Switch';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';

import { Header } from "./Menu/Header";

//CSS関係
import styled from "styled-components";
import './ProductSpecification.css';

//アイコン
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
//reactのフォーム入力一斉送信用
import { SubmitHandler, useForm } from 'react-hook-form';
import * as func from "./Func/func";
import { Reset,DataSetCalculation,DataSet } from './ProductSpecification/ProductSelect';
import { MultipleSelectChip } from './Components/MultiSelect';
import { InputForm } from './Components/inputForm';
import { CreatePicture } from './ProductSpecification/CreatePicter';
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ports,col,orientation,colorList,Tube_List,Tightening_Winding_List,re,Weight_BZI, init_BZI,SeriesList,VerificationList,ApprovalList,AllAuthorityList } from "./Data/Data"
import type { FormProps } from "./Data/Data"
import { AuthUserContext } from './Data/SharedVariable';

var scrollsize = 17
//var As:any
const Specification = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr; /* 幅3等分 */
  grid-template-rows: 850px 1fr; /* 100pxの2行 */
  grid-gap: 10px; /* 隙間10px */
  margin-bottom: 20px;
  .box1 {
      grid-column: 1 / 3; /* 列開始位置2(の始端)/終了位置4(の始端) */
      grid-row: 1; /* 行開始位置1(の始端) */
      .box1-2{
        display: grid;
        grid-template-columns: 1fr 1fr;
      }
      border: solid 3px #555555;
  }
  .list {
      grid-column: 3/4; /* 列開始位置2(の始端)/終了位置4(の始端) */
      grid-row: 1; /* 行開始位置1(の始端) */
      border: solid 3px #555555;
  }
  .list2 {
      grid-column: 4/5; /* 列開始位置2(の始端)/終了位置4(の始端) */
      grid-row: 1; /* 行開始位置1(の始端) */
      border: solid 3px #555555;
  }
  .list3 {
      grid-column: 5/6; /* 列開始位置2(の始端)/終了位置4(の始端) */
      grid-row: 1; /* 行開始位置1(の始端) */
      border: solid 3px #555555;
  }
  .box2 {
      grid-column: 6/10; /* 列開始位置2(の始端)/終了位置4(の始端) */
      grid-row: 1; /* 行開始位置1(の始端) */
      border: solid 3px #555555;
      .parts{
        display: grid;
        grid-template-columns: 1fr 1fr 1fr 1fr 1fr; /* 幅5等分 */
      }
  }
  .box3 {
    grid-row: 2;
    grid-column: 1/10;
    border: solid 3px #555555;
    }
  }
  .box4 {
    grid-column: 1/10;
    grid-row: 3; /* 行開始位置1(の始端)/終了位置3(の始端) */
    border: solid 3px #555555;
  }
`;

const Th = styled.th<{ Flg: boolean }>`
  background-color: ${props => props.Flg ? "red" : "silver"};
  color: ${props => props.Flg ? "white" : "black"};
`;
const TdDiv = styled.div<{attension?:string}>`
  display: grid;
  grid-template-columns: 1fr;
  text-align: center;
  background-color: ${props => props.attension?"yellow":""};
`;

const Title = styled.h1`
  vertical-align: middle;
  text-align:center;
`

const ProductSpecification = () => {
  const [scroll,setScroll] = useState(0);
  const [state,setState] = useState(0);
  const [tables,setTables] = useState<any>();
  const [DataList,setDataList] = useState([]);
  const [Schedule,setSchedule] = useState([]);
  const { register, watch, handleSubmit, reset, resetField, setValue } = useForm<FormProps>();
  const navigate = useNavigate();
  const watchSelect = watch("Select");
  const watchPicSelect = watch("PictureSelect");
  const Special = watch(`special`);
  const UserData = useContext(AuthUserContext);

  const Submit: SubmitHandler<FormProps> = data => {
    console.log("submit:",data);
    func.postData({flg:8,data:data,UserData:UserData,state:state});
    navigate('/');
  };

  const handleForward = () =>{
    if(scroll+1 < DataList.length/scrollsize){
      setScroll(scroll+1)
    }
  }

  const handleBack = () =>{
    if(scroll > 0){
      setScroll(scroll-1)
    }
  }

  const handleState = (event: any) => {
    Reset(setValue,reset,resetField,watch);
    setState(parseInt(event.target.value));
  }
  
  const handleSearchClick = (data:any) => {
    if(data !== null){
      var post = {flg:5,Product:data,tables:tables};
      Reset(setValue,reset,resetField,watch);
      func.postData(post).then((Data:any) => {
        console.log("データ",Data);
        setSchedule(Data.schedule);
        DataSet(Data,data,setValue);
      })
    }
  }
  
  const handlePartsChange = (data:any,SET:any) => {
    if(data !== null){
      setValue(SET,data.code);
      var post = {flg:7,ChackData:watch(),tables:tables};
      func.postData(post)
      .then((data:any) => {
          console.log("部材変更確認",data.data);
          DataSetCalculation(data.data,setValue);
      });
    }
  }

  const handleCheckClick: SubmitHandler<FormProps> = data => {
    if(data !== null){
      const Chack = {flg:6,ChackData:data,tables:tables,state:state};
      func.postData(Chack)
      .then((Data:any) => {
          console.log("チェック確認",Data);
          setValue(`Sabmit`,Data.data.chack);
          if(Data.data.product && Data.data.assembly && Data.data.parts){
              DataSetCalculation(Data.data,setValue);
          };
      });
    }
  }
  
  function toBase64Url(url:any, callback:any){
    var xhr = new XMLHttpRequest();
    xhr.onload = function() {
      var reader = new FileReader();
      reader.onloadend = function() {
        if(reader.result !== null && typeof(reader.result) === 'string'){
          const result = reader.result.match(/.*base64,(.*)/);
          if(result !== null){
            callback(result[1]);
          }
        }
      }
      reader.readAsDataURL(xhr.response);
    };
    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.send();
  }

  const handleNewPic = (data:any) => {
    const imageUrl = URL.createObjectURL(data.target.files[0]);
    toBase64Url(imageUrl, function(base64Url:any){
      setValue(`SetPic`,base64Url);
      handleColorChange();
    });
  }

  const handleColorChange = () => {
    const Data = {flg:9,Pic:watch(`SetPic`),color:watch(`Element.22.color`),text_color:watch(`Element.22.text_color`)};
    func.postData(Data)
    .then((data:any) => {
      setValue(`ViewPic`,data.data);
      setValue(`widthPic`,data.maxwidth);
    });
  }

  useEffect(() => {
    if(tables){
      setScroll(0);
      var List_data = tables.product.table.filter((val:any)=>{
        return (
        (!watch(`Search_SearchNo`) || parseFloat(watch(`Search_SearchNo`)) === parseFloat(val.search_number))
        && (!watch(`Search_ProductNumber`) || val.code.includes(watch(`Search_ProductNumber`)))
        && (!watch(`Search_Dessign`) || val.dessign.includes(watch(`Search_Dessign`)))
        && ((state === 0) || (state >= 3) || parseInt(val.available) === state)
        )
      });
      if(List_data.length === 1){
        handleSearchClick(List_data[0]);
      }
      setDataList(List_data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[watch(`Search_button`),state])

  useEffect(() => {
    if(tables){
      setScroll(0);
      setDataList(tables.product.table.filter((val:any)=>{
        return ((!watch(`Search_RatedVoltage`) || parseFloat(watch(`Search_RatedVoltage`)) === parseFloat(val.voltage))
        && (!watch(`Search_Capacitance`) || parseFloat(watch(`Search_Capacitance`)) === parseFloat(val.capacitance))
        && (!watch(`Search_Diameter`) || parseFloat(watch(`Search_Diameter`)) === parseFloat(val.diameter))
        && (!watch(`Search_LSize`) || parseFloat(watch(`Search_LSize`)) === parseFloat(val.l_dimension))
        && (!watch(`Search_Series`) || watch(`Search_Series`) === val.code.substr(0,3))
        && ((state === 0) || (state >= 3) || parseInt(val.available) === state)
        )
    }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[watch(`Search_button2`)])

  useEffect(()=>{
    if(watchSelect){
      ports.parts.map((value:any,index:number)=> {
        if(watchSelect.includes(value.label)){
          setValue(`Element.${index}.table`,value.code);
          setValue(`Element.${index}.name`,value.label);
        }
        else{
          resetField(`Element.${index}`);
        }
        return ""
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[watchSelect])

  useEffect(()=>{
    if(watch(`Dessign`)){
      var ReDessign = watch(`Dessign`).match(/([0-9A-Z]+)-?(.*)/)
      if(ReDessign && ReDessign[1]){
        setValue(`DessignOld`,ReDessign[1]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[watch(`Dessign`)])

  useEffect(() => {
    if(watchPicSelect){
      var Count:number = 0;
      for(var row2 of col){
        var flg = 0;
        for(var row of watchPicSelect){
          if(row === row2.label){
            setValue(`Picture.${Count}.name`, row2.label);
            flg = 1;
          }
        }
        if(flg === 0){
          resetField(`Picture.${Count}`);
        }
        Count = Count + 1;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[watchPicSelect]);

  useEffect(() => {
    if(Special){
      setValue(`Special`,Special);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[Special]);

  useEffect(() => {
    func.postData(ports)
    .then((data:any) => {
      setDataList(data.product.table);
      setTables(data);
    });
    setValue(`Sabmit`,true);
    setValue(`Select`,init_BZI);
    setValue(`Element.22.color`,[0,0,0]);
    setValue(`Element.22.text_color`,[200,200,200]);
    setValue(`Element.25.color`,[0,0,0]);
    setValue(`Element.25.text_color`,[200,200,200]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <Header Label={"仕様書作成画面"} 
        Button1={
          <Button autoFocus sx={{ width: 120 }} color="secondary" variant="contained" onClick={() => Reset(setValue,reset,resetField,watch)}>
           reset
          </Button>
        }
        Button2={
          <Button sx={{ width: 120 }} color="success" variant="contained" onClick={handleSubmit(Submit)} disabled={watch(`Sabmit`)}>
            終了
          </Button>
        }
      />
      <Specification>
        <div className="box1">
          <InputForm Label={"検索:品番"} SET={"Search_ProductNumber"} Type={"text"} End={""} register={register}/>
          <InputForm Label={"検索:手配No"} SET={"Search_SearchNo"} Type={"number"} End={""} register={register}/>
          <InputForm Label={"検索:設番"} SET={"Search_Dessign"} Type={"text"} End={""} register={register}/>
          <Button variant="contained" size="large" onClick={(_)=>{setValue(`Search_button`,!watch(`Search_button`))}}>検索</Button>
          <div className='box1-2'>
            <InputForm Label={"検索:静電容量"} SET={"Search_Capacitance"} Type={"number"} End={"μF"} register={register}/>
            <InputForm Label={"検索:定格電圧"} SET={"Search_RatedVoltage"} Type={"number"} End={"V"} register={register}/>
            <InputForm Label={"検索:φ径"} SET={"Search_Diameter"} Type={"number"} End={"mm"} register={register}/>
            <InputForm Label={"検索:L寸"} SET={"Search_LSize"} Type={"number"} End={"mm"} register={register}/>
          </div>
          <section>
            <label>検索:シリーズ</label>
            <Autocomplete options={SeriesList} onChange={(_, data) => data?setValue(`Search_Series`,data):setValue(`Search_Series`,"")} renderInput={(params) => <TextField {...params} className='df'/>}/>
          </section>
          <div className='box1-2'>
            <Button variant="contained" size="large" onClick={(_)=>{setValue(`Search_button2`,!watch(`Search_button2`))}}>検索</Button>
            {UserData && UserData.product_authority?<Button variant="contained" size="large" color="error" onClick={handleSubmit(handleCheckClick)}>データチェック</Button>:""}
          </div>
        </div>
        <div className='list'>
          <h2>製品リスト</h2>
          <IconButton onClick={handleBack}>
            <ArrowBackIosIcon/>
          </IconButton>
          <IconButton onClick={handleForward}>
            <ArrowForwardIosIcon/>
          </IconButton>
          {scroll}
          <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper', position: 'relative', overflow: 'auto', maxHeight: 750, '& ul': { padding: 0 } }} subheader={<li />}>
            {DataList?DataList.map((val:any,index:number) => {
              if( scroll*scrollsize <= index && index < scroll*scrollsize + scrollsize){
                return(
                  <li key={index}>
                    <ul>
                      <ListItem disablePadding className={val.available === "0"? (watch(`Dessign`) === val.dessign?"chacklist":"attention"):(watch(`Dessign`) === val.dessign?"chacklist":"")}>
                        <ListItemButton onClick={(_)=>{handleSearchClick(val)}}>{val.code}</ListItemButton>
                      </ListItem>
                    </ul>
                  </li>
                )
              }
              return ""
            }):<></>}
          </List>
        </div>
        <div className='list2'>
            <h2>設番リスト</h2>
            <List sx={{width: '100%',maxWidth: 360,bgcolor: 'background.paper',position: 'relative',overflow: 'auto',maxHeight: 680,'& ul': { padding: 0 },}} subheader={<li />}>
              {watch(`Dessign`) && watch(`DessignOld`) && tables?tables.product.table.map((val:any,index:number) => {
                if(val.dessign.indexOf(watch(`DessignOld`)) !== -1){
                  return(
                    <li key={index}>
                      <ul>
                        <ListItem disablePadding className={val.available ===  "0"?(watch(`Dessign`) === val.dessign?"chacklist":"attention"):(watch(`Dessign`) === val.dessign?"chacklist":"")}>
                          <ListItemButton onClick={(_)=>{handleSearchClick(val)}}>{val.dessign}</ListItemButton>
                        </ListItem>
                      </ul>
                    </li>
                  )
                }
                return ""
              }):<></>}
            </List>
        </div>
        <div className='list3'>
            <h2>製作作業票リスト</h2>
            <List sx={{width: '100%',maxWidth: 360,bgcolor: 'background.paper',position: 'relative',overflow: 'auto',maxHeight: 680,'& ul': { padding: 0 },}} subheader={<li />}>
              {Schedule?Schedule.map((val:any,index:number) => {
                  return(
                    <li key={index}>
                      <ul>
                        <ListItem disablePadding>
                          <ListItemButton>{val.deadline.replace(re,"$1$2$3-")+val.lot}</ListItemButton>
                        </ListItem>
                      </ul>
                    </li>
                  )
                }  
              ):<></>}
            </List>
        </div>
        <div className='box2'>
          <RadioGroup onChange={handleState}>
            <FormControlLabel value={0} control={<Radio />} label="閲覧"/>
            {UserData && ((VerificationList.includes(UserData.post) && UserData.affiliations === '設計課') || AllAuthorityList.includes(UserData.post))?<FormControlLabel value={2} control={<Radio />} label="照査"/>:<></>}
            {UserData && ((ApprovalList.includes(UserData.post) && UserData.affiliations === '設計課') || AllAuthorityList.includes(UserData.post))?<FormControlLabel value={1} control={<Radio />} label="承認"/>:<></>}
            {UserData && UserData.product_authority?<FormControlLabel value={3} control={<Radio />} label="作成"/>:<></>}
            {UserData && UserData.product_authority?<FormControlLabel value={4} control={<Radio />} label="修正"/>:<></>}
          </RadioGroup>
        </div>
        <div className='box3'>
          <Title>製品仕様書</Title>
          <table border={1} key={"table"} className='table'>
            <tbody key={"body"}>
                    <tr key={"加締・巻取項目"}>
                        <th rowSpan={(watch(`Element`)?watch(`Element`).filter((val:any)=> val && Tightening_Winding_List.includes(val.name)).length:0)+3} className="vertical_write">
                            加締・巻取
                        </th>
                        <th>
                            含浸率
                        </th>
                        <th>
                            狙い値
                        </th>
                        <th>
                           裁断係数
                        </th>
                        <th>
                            巻芯径
                        </th>
                        <th>
                            総厚み補正係数
                        </th>
                        <th>
                            総厚み Σt
                        </th>
                        <th>
                            素子径
                        </th>
                        <th>
                            巻取指導票
                        </th>
                        <th colSpan={2}>
                            仕様区分
                        </th>
                    </tr>
                    <tr key={"加締・巻取データ"}>
                        <td>
                          {state<=2?<TdDiv>{func.Round(watch(`ContentPercentage`))}</TdDiv>:<TextField {...register(`ContentPercentage`)}/>}%
                        </td>
                        <td>
                          {state<=2?<TdDiv>{func.Round(watch(`TargetValue`))}</TdDiv>:<TextField {...register(`TargetValue`)}/>}%
                        </td>
                        <td>
                          {state<=2?<TdDiv>{func.Round(watch(`CutoffFactor`),2)}</TdDiv>:<TextField {...register(`CutoffFactor`)}/>}
                        </td>
                        <td>
                          {state<=2?<TdDiv>{func.Round(watch(`CoreDiameter`),3)}</TdDiv>:<TextField {...register(`CoreDiameter`)}/>}
                        </td>
                        <td>
                          {state<=2?<TdDiv>{func.Round(watch(`TotalThicknessCorrectionFactor`),3)}</TdDiv>:<TextField {...register(`TotalThicknessCorrectionFactor`)}/>}
                        </td>
                        <td>
                          {state<=2?<TdDiv>{func.Round(watch(`TotalThickness`),3)}</TdDiv>:<TextField {...register(`TotalThickness`)}/>}
                        </td>
                        <td>
                          {state<=2?<TdDiv>{func.Round(watch(`DeviceDiameter`),3)}</TdDiv>:<TextField {...register(`DeviceDiameter`)}/>}
                        </td>
                        <td>
                          {state<=2?<TdDiv>{watch(`WindingGuid`)}</TdDiv>:<TextField {...register(`WindingGuid`)}/>}
                        </td>
                        <td colSpan={2}>
                          {state<=2?<TdDiv>{watch(`Classification`)}</TdDiv>:<TextField {...register(`Classification`)}/>}
                        </td>
                    </tr>
                    <tr key={"部材(加締・巻取)項目"}>
                      <th rowSpan={(watch(`Element`)?watch(`Element`).filter((val:any)=> val && Tightening_Winding_List.includes(val.name)).length:0)+1}>
                        入っていないリスト
                        <List sx={{width: '100%',maxWidth: 360,bgcolor: 'background.paper',position: 'relative',overflow: 'auto',maxHeight: 500,'& ul': { padding: 0 }, }} subheader={<li />}>
                          {ports.parts?ports.parts.map((val:any,index:number) => {
                            if(!watchSelect?.includes(val.label) && Tightening_Winding_List.includes(val.label)){
                              return(
                                <li key={index}>
                                  <ul>
                                    <ListItem disablePadding>
                                      <ListItemButton disabled={state <=2} onClick={()=>{setValue(`Select`,watchSelect?[...watchSelect,val.label]:[val.label])}}>{val.label}</ListItemButton>
                                    </ListItem>
                                  </ul>
                                </li>
                              )
                            }
                            return ""
                          }):<></>}
                        </List>
                        入っている部材リスト
                        <List sx={{width: '100%',maxWidth: 360,bgcolor: 'background.paper',position: 'relative',overflow: 'auto',maxHeight: 500,'& ul': { padding: 0 }, }} subheader={<li />}>
                          {ports.parts?ports.parts.map((val:any,index:number) => {
                            if(watchSelect?.includes(val.label) && Tightening_Winding_List.includes(val.label)){
                              return(
                                <li key={index+"test"}>
                                  <ul>
                                    <ListItem disablePadding>
                                      <ListItemButton disabled={init_BZI.includes(val.label) || state <=2} onClick={()=>{setValue(`Select`,watchSelect.filter((item:any)=> item !== val.label))}}>{val.label}</ListItemButton>
                                    </ListItem>
                                  </ul>
                                </li>
                              )
                            }
                            return ""
                          }):<></>}
                        </List>
                      </th>
                      <Th Flg={watch(`PartsError`) !== undefined}>
                        部材材料
                      </Th>
                      <th>
                        部材コード
                      </th>
                      <th>
                        数量
                      </th>
                      <th>
                        幅 mm
                      </th>
                      <th>
                        厚み μm
                      </th>
                      <th>
                        長さ mm
                      </th>
                      <th>
                        重量 g
                      </th>
                      <th>
                        面積 cm²
                      </th>
                      <th>
                        箔容量 F/cm²
                      </th>
                      <th>
                        コスト 円
                      </th>
                    </tr>
                    {watch(`Element`)?watch(`Element`).map((val:any,index:number)=>{
                      if(val && Tightening_Winding_List.includes(val.name)){
                        return(
                          <tr key={index}>
                              <Th Flg={watch(`Element.${index}.error`) !== undefined}>
                                {watch(`Element.${index}.name`)?watch(`Element.${index}.name`):<></>}
                              </Th>
                              <td>
                                {watch(`Element.${index}.code`)?watch(`Element.${index}.code`):""}
                                {tables && tables[val.table] && tables[val.table].table && state!==0?
                                <Autocomplete
                                  options={tables[val.table].table}
                                  getOptionLabel={(option: any) => option.code}
                                  onChange={(_, data) => handlePartsChange(data,`Element.${index}.code`)}
                                  renderInput={(params) => ( <TextField {...params} variant="filled"/>)}
                                />:<></>}
                              </td>
                              <td>
                                {state<=2?<TdDiv>{func.Round(watch(`Element.${index}.quantity`),2)}</TdDiv>:<TextField {...register(`Element.${index}.quantity`)}/>}
                              </td>
                              <td>
                                {state<=2?<TdDiv>{func.Round(watch(`Element.${index}.range`),2)}</TdDiv>:<TextField {...register(`Element.${index}.range`)}/>}
                              </td>
                              <td>
                                <TdDiv>{func.Round(watch(`Element.${index}.thickness`),2)}</TdDiv>
                              </td>
                              <td>
                                <TdDiv>{func.Round(watch(`Element.${index}.length`),2)}</TdDiv>
                              </td>
                              <td>
                                <TdDiv>{func.Round(watch(`Element.${index}.weight`),3)}</TdDiv>
                              </td>
                              <td>
                                <TdDiv>{func.Round(watch(`Element.${index}.area`),2)}</TdDiv>
                              </td>
                              <td>
                                <TdDiv  attension={watch(`Element.${index}.capacitance_attention`)}>{func.Round(watch(`Element.${index}.capacitance`),4)}</TdDiv>
                              </td>
                              <td>
                                <TdDiv attension={watch(`Element.${index}.cost_attention`)}>{watch(`Element.${index}.cost`)?func.Round(watch(`Element.${index}.cost`),1):watch(`Element.${index}.cost_attention`)}</TdDiv>
                              </td>
                          </tr>
                        )
                      }
                      return ""
                    }):<></>}
                    <tr key={"部材(含浸・組立・仕上)項目2"}>
                        <th rowSpan={
                          (watch(`Element`)?watch(`Element`).filter((val:any)=> val && Tube_List.includes(val.name)).length:0)
                          + (watch(`Element`)?watch(`Element`).filter((val:any)=> val && val.name && !Tightening_Winding_List.includes(val.name) && !Tube_List.includes(val.name)).length:0)
                          + 4} className="vertical_write">
                            含浸・組立・仕上
                        </th>
                        <th rowSpan={(watch(`Element`)?watch(`Element`).filter((val:any)=> val && val.name && !Tightening_Winding_List.includes(val.name) && !Tube_List.includes(val.name)).length:0)+1}>
                        入っていないリスト
                        <List sx={{width: '100%',maxWidth: 360,bgcolor: 'background.paper',position: 'relative',overflow: 'auto',maxHeight: 500,'& ul': { padding: 0 }, }} subheader={<li />}>
                          {ports.parts?ports.parts.map((val:any,index:number) => {
                            if(!watchSelect?.includes(val.label) && !Tightening_Winding_List.includes(val.label) && !Tube_List.includes(val.label)){
                              return(
                                <li key={index}>
                                  <ul>
                                    <ListItem disablePadding>
                                      <ListItemButton disabled={state <=2} onClick={()=>{setValue(`Select`,watchSelect?[...watchSelect,val.label]:[val.label])}}>{val.label}</ListItemButton>
                                    </ListItem>
                                  </ul>
                                </li>
                              )
                            }
                            return ""
                          }):<></>}
                        </List>
                        入っている部材リスト
                        <List sx={{width: '100%',maxWidth: 360,bgcolor: 'background.paper',position: 'relative',overflow: 'auto',maxHeight: 500,'& ul': { padding: 0 }, }} subheader={<li />}>
                          {ports.parts?ports.parts.map((val:any,index:number) => {
                            if(watchSelect?.includes(val.label) && !Tightening_Winding_List.includes(val.label) && !Tube_List.includes(val.label)){
                              return(
                                <li key={index+"test"}>
                                  <ul>
                                    <ListItem disablePadding>
                                      <ListItemButton disabled={init_BZI.includes(val.label) || state<=2} onClick={()=>{setValue(`Select`,watchSelect.filter((item:any)=> item !== val.label))}}>{val.label}</ListItemButton>
                                    </ListItem>
                                  </ul>
                                </li>
                              )
                            }
                            return ""
                          }):<></>}
                        </List>
                        </th>
                        <Th Flg={watch(`PartsError`) !== undefined}>
                            部材材料
                        </Th>
                        <th>
                            部材コード
                        </th>
                        <th>
                            数量
                        </th>
                        <th colSpan={6}></th>
                        <th>
                            コスト
                        </th>
                    </tr>
                    {watch(`Element`)?watch(`Element`).map((val:any,index:number)=>{
                      if(val && val.name && !Tightening_Winding_List.includes(val.name) && !Tube_List.includes(val.name)){
                        return(
                            <tr key={val.name}>
                              <Th Flg={watch(`Element.${index}.error`) !== undefined}>
                                {watch(`Element.${index}.name`)?watch(`Element.${index}.name`):<></>}
                              </Th>
                              <td>
                                {watch(`Element.${index}.code`)?watch(`Element.${index}.code`):""}
                                {tables && tables[val.table] && tables[val.table].table && state!==0?
                                <Autocomplete
                                  options={tables[val.table].table}
                                  getOptionLabel={(option: any) => option.code}
                                  onChange={(_, data) => handlePartsChange(data,`Element.${index}.code`)}
                                  renderInput={(params) => ( <TextField {...params} variant="filled"/>)}
                                />:<></>}
                              </td>
                              {!Weight_BZI.includes(val.name)?
                              <td>
                                個数{state<=2?<TdDiv>{func.Round(watch(`Element.${index}.quantity`),1)}</TdDiv>:<TextField {...register(`Element.${index}.quantity`)}/>} 個
                              </td>:
                              <td>
                                重量<TdDiv>{func.Round(watch(`Element.${index}.weight`),2)}</TdDiv> g
                              </td>}
                              {val.name === '電解液'?
                              <td colSpan={6}>含浸コメント<br/>{state<=2?<TdDiv>{watch(`ImpregnationText`)}</TdDiv>:<TextField {...register(`ImpregnationText`)}/>}</td>:
                              <td colSpan={6}></td>}
                              <td>
                              <TdDiv attension={watch(`Element.${index}.cost_attention`)}>{watch(`Element.${index}.cost`)?func.Round(watch(`Element.${index}.cost`),1):watch(`Element.${index}.cost_attention`)}</TdDiv>
                              </td>
                            </tr>
                        )
                      }
                      return ""
                    }):<></>}
                    <tr key={"部材(含浸・組立・仕上)項目"}>
                      <th rowSpan={(watch(`Element`)?watch(`Element`).filter((val:any)=> val && Tube_List.includes(val.name)).length:0)+1}>
                        入っていないリスト
                        <List sx={{width: '100%',maxWidth: 360,bgcolor: 'background.paper',position: 'relative',overflow: 'auto',maxHeight: 500,'& ul': { padding: 0 },}} subheader={<li />}>
                          {ports.parts?ports.parts.map((val:any,index:number) => {
                            if(!watchSelect?.includes(val.label) && Tube_List.includes(val.label)){
                              return(
                                <li key={index}>
                                  <ul>
                                    <ListItem disablePadding>
                                      <ListItemButton disabled={state <=2} onClick={()=>{setValue(`Select`,watchSelect?[...watchSelect,val.label]:[val.label])}}>{val.label}</ListItemButton>
                                    </ListItem>
                                  </ul>
                                </li>
                              )
                            }
                            return ""
                          }):<></>}
                        </List>
                        入っている部材リスト
                        <List
                          sx={{
                            width: '100%',
                            maxWidth: 360,
                            bgcolor: 'background.paper',
                            position: 'relative',
                            overflow: 'auto',
                            maxHeight: 500,
                            '& ul': { padding: 0 },
                          }}
                          subheader={<li />}
                        >
                          {ports.parts?ports.parts.map((val:any,index:number) => {
                            if(watchSelect?.includes(val.label) && Tube_List.includes(val.label)){
                              return(
                                <li key={index+"test"}>
                                  <ul>
                                    <ListItem disablePadding>
                                      <ListItemButton disabled={init_BZI.includes(val.label) || state<=2} onClick={()=>{setValue(`Select`,watchSelect.filter((item:any)=> item !== val.label))}}>{val.label}</ListItemButton>
                                    </ListItem>
                                  </ul>
                                </li>
                              )
                            }
                            return ""
                          }):<></>}
                        </List>
                      </th>
                      <Th Flg={watch(`PartsError`) !== undefined}>
                          部材材料
                      </Th>
                      <th>
                          部材コード
                      </th>
                      <th>
                          数量
                      </th>
                      <th>
                          折径
                      </th>
                      <th>
                          厚み
                      </th>
                      <th>
                          長さ
                      </th>
                      <th>
                          色
                      </th>
                      <th>
                          文字色
                      </th>
                      <th></th>
                      <th>
                          コスト
                      </th>
                    </tr>
                    {watch(`Element`)?watch(`Element`).map((val:any,index:any)=>{
                      if(val && Tube_List.includes(val.name)){
                        return(
                          <tr key={val.name}>
                            <Th Flg={watch(`Element.${index}.error`) !== undefined}>
                              {watch(`Element.${index}.name`)?watch(`Element.${index}.name`):<></>}
                            </Th>
                            <td>
                              {watch(`Element.${index}.code`)?watch(`Element.${index}.code`):""}
                              {tables && tables[val.table] && tables[val.table].table && state!==0?
                              <Autocomplete
                                options={tables[val.table].table}
                                getOptionLabel={(option: any) => option.code}
                                onChange={(_, data) => handlePartsChange(data,`Element.${index}.code`)}
                                renderInput={(params) => ( <TextField {...params} variant="filled"/>)}
                              />:<></>}
                            </td>
                            <td>
                              {state<=2?<TdDiv>{func.Round(watch(`Element.${index}.quantity`),2)}</TdDiv>:<TextField {...register(`Element.${index}.quantity`)}/>}
                            </td>
                            <td>
                              <TdDiv>{func.Round(watch(`Element.${index}.FoldDiameter`),2)}</TdDiv>
                            </td>
                            <td>
                              <TdDiv>{func.Round(watch(`Element.${index}.thickness`),3)}</TdDiv>
                            </td>
                            <td>
                              <TdDiv>{func.Round(watch(`Element.${index}.length`),4)}</TdDiv> mm
                            </td>
                            <td>
                              <TdDiv>
                                {colorList.map((val:any)=>{
                                  if(val.value[0] === watch(`Element.${index}.color.0`) && val.value[1] === watch(`Element.${index}.color.1`) && val.value[2] === watch(`Element.${index}.color.2`)){
                                    return val.label
                                  }
                                  return ""
                                })}
                              </TdDiv>
                            </td>
                            <td>
                              <TdDiv>
                                {colorList.map((val:any)=>{
                                  if(val.value[0] === watch(`Element.${index}.text_color.0`) && val.value[1] === watch(`Element.${index}.text_color.1`) && val.value[2] === watch(`Element.${index}.text_color.2`)){
                                    return val.label
                                  }
                                  return ""
                                })}
                              </TdDiv>
                            </td>
                            <td></td>
                            <td>
                            <TdDiv attension={watch(`Element.${index}.cost_attention`)}>{watch(`Element.${index}.cost`)?func.Round(watch(`Element.${index}.cost`),1):watch(`Element.${index}.cost_attention`)}</TdDiv>
                            </td>
                          </tr>
                        )
                      }
                      return ""
                    }):<></>}
                    <tr key={"チューブ画像と表示する文字、数字,仕上、封入指導票項目"}>
                        <Th Flg={watch(`PicError`) !== undefined} colSpan={8}>
                            チューブ表示
                        </Th>
                        <th>
                            封入指導票
                        </th>
                        <th>
                            仕上指導票
                        </th>
                    </tr>
                    <tr key={"チューブ画像と表示する文字、数字,仕上、封入指導票データ"}>
                        <td colSpan={8}>
                          <div>
                            <CreatePicture watchPicSelect={watchPicSelect} SetValue={setValue} watch={watch} resetField={resetField} register={register} flg={state}/>
                            {state<=2?
                            <></>
                            :
                            <>
                              <div className='quintet'>
                                <div className='flexbox'>
                                  <Button variant="contained" color="warning" component="label">
                                    Upload
                                    <input hidden accept="image/*" type="file" onChange={handleNewPic}/>
                                  </Button>
                                </div>
                              </div>
                              <MultipleSelectChip Label={"表示画面に入れる要素"} Default={watchPicSelect} Data={col.map((value:any)=> value.label)} SetValue={setValue} SET={`PictureSelect`}/>
                              <Switch {...register(`PicSave`)}/>
                              <Autocomplete options={orientation} sx={{ width: 200 }} onChange={(_, data) => data? setValue(`Transform`,data.value):""} renderInput={(params) => <TextField {...params} label="回転角度" />}/>
                              <Autocomplete options={colorList} sx={{ width: 200 }} onChange={(_, data) => {if(data){setValue(`Element.22.color`,data.value);} handleColorChange()}} renderInput={(params) => <TextField {...params} label="チーュブの色" />}/>
                              <Autocomplete options={colorList} sx={{ width: 200 }} onChange={(_, data) => {if(data){setValue(`Element.22.text_color`,data.value);} handleColorChange()}} renderInput={(params) => <TextField {...params} label="文字や線の色" />}/>
                            </>}
                          </div>
                        </td>
                        <td>
                          {state<=2?<TdDiv>{watch(`InclusionGuid`)}</TdDiv>:<TextField {...register(`InclusionGuid`)}/>}
                        </td>
                        <td>
                          {state<=2?<TdDiv>{watch(`FinishGuid`)}</TdDiv>:<TextField {...register(`FinishGuid`)}/>}
                        </td>
                    </tr>
                    <tr key={"エージング情報と加工情報"}>
                        <th className="vertical_write" rowSpan={2}>
                            エージング
                        </th>
                        <th>
                            印加電圧
                        </th>
                        <th>
                            エージング時間
                        </th>
                        <th>
                            温度
                        </th>
                        <th colSpan={7}>
                          エージングコメント
                        </th>
                    </tr>
                    <tr key={"エージング情報と加工情報データ"}>
                        <td>
                          {state<=2?<TdDiv>{watch(`AppliedVoltage`)}</TdDiv>:<TextField {...register(`AppliedVoltage`)}/>} V
                        </td>
                        <td>
                          {state<=2?<TdDiv>{watch(`AppliedVoltage`)}</TdDiv>:<TextField {...register(`AppliedVoltage`)}/>} 時間
                        </td>
                        <td>
                          {state<=2?<TdDiv>{watch(`Temperature`)}</TdDiv>:<TextField {...register(`Temperature`)}/>} ℃
                        </td>
                        <td colSpan={7}>
                          {state<=2?<TdDiv>{watch(`AgingText`)}</TdDiv>:<TextField {...register(`AgingText`)}/>}
                        </td>
                    </tr>
                    <tr key={"加工情報"}>
                      <th className="vertical_write" rowSpan={2}>
                            二次加工
                      </th>
                      <th colSpan={4}>
                          加工方法
                      </th>
                      <th colSpan={3}>
                          二次加工コード
                      </th>
                      <th colSpan={3}>
                          二次加工指導票No.
                      </th>
                    </tr>
                    <tr key={"加工情報データ"}>
                    <td colSpan={4}>
                      {state<=2?<TdDiv>{watch(`MachiningMethod`)}</TdDiv>:<TextField {...register(`MachiningMethod`)}/>}
                    </td>
                    <td colSpan={3}>
                      {state<=2?<TdDiv>{watch(`MachiningCode`)}</TdDiv>:<TextField {...register(`MachiningCode`)}/>}
                    </td>
                    <td colSpan={3}>
                      {state<=2?<TdDiv>{watch(`MachiningGuidance`)}</TdDiv>:<TextField {...register(`MachiningGuidance`)}/>}
                    </td>
                    </tr>
                    <tr key={"製品スペック"}>
                        <th className="vertical_write" rowSpan={5}>
                            規格・品番
                        </th>
                        <th>
                            静電容量
                        </th>
                        <th  colSpan={2}>
                            定格電圧
                        </th>
                        <th>
                            シリーズ名
                        </th>
                        <th colSpan={3}>
                            容量許容差 %
                        </th>
                        <th>
                            内部抵抗 mΩ (ESR)
                        </th>
                        <th>
                            内部抵抗 mΩ (DCR)
                        </th>
                        <th>
                            漏れ電流 mA
                        </th>
                    </tr>
                    <tr key={"製品スペックデータ"}>
                        <td rowSpan={2}>
                            {watch(`CapacitorType`) === '電気二重層コンデンサ'? watch(`Capacitance`)/(10**6) +" F": watch(`Capacitance`) +" μF"}
                        </td>
                        <td rowSpan={2} colSpan={2}>
                          {state<=2?<TdDiv>{watch(`RatedVoltage`)}</TdDiv>:<TextField {...register(`RatedVoltage`)}/>} V
                        </td>
                        <td rowSpan={2}>
                          {state<=2?<TdDiv>{watch(`Series`)}</TdDiv>:<TextField {...register(`Series`)}/>}
                        </td>
                        <td colSpan={3}>
                          {state<=2?<TdDiv>{watch(`CapacityTolerance.minus`)+"% ~ "+watch(`CapacityTolerance.plus`)+"%"}</TdDiv>:
                          <>
                            <TextField {...register(`CapacityTolerance.minus`)}/>%~
                            <TextField {...register(`CapacityTolerance.plus`)}/>%
                          </>}
                        </td>
                        <td>
                          {state<=2?<TdDiv>{watch(`ESR`)}</TdDiv>:<TextField {...register(`ESR`)}/>}
                        </td>
                        <td>
                          {state<=2?<TdDiv>{watch(`DCR`)}</TdDiv>:<TextField {...register(`DCR`)}/>}
                        </td>
                        <td>
                          {state<=2?<TdDiv>{watch(`LeakageCurrent`)}</TdDiv>:<TextField {...register(`LeakageCurrent`)}/>}
                        </td>
                    </tr>
                    <tr key={"製品スペックデータ2"}>
                        <td colSpan={3}>
                          {state<=2?<TdDiv>{watch(`CapacityToleranceCo.minus`)+"% ~ "+watch(`CapacityToleranceCo.plus`)+"%"}</TdDiv>:
                          <>
                            <TextField {...register(`CapacityToleranceCo.minus`)}/>%~
                            <TextField {...register(`CapacityToleranceCo.plus`)}/>%
                          </>}
                        </td>
                        <td>
                          {state<=2?<TdDiv>{watch(`ESRCo`)}</TdDiv>:<TextField {...register(`ESRCo`)}/>}
                        </td>
                        <td>
                          {state<=2?<TdDiv>{watch(`DCRCo`)}</TdDiv>:<TextField {...register(`DCRCo`)}/>}
                        </td>
                        <td>
                          {state<=2?<TdDiv>{watch(`LeakageCurrentCo`)}</TdDiv>:<TextField {...register(`LeakageCurrentCo`)}/>}
                        </td>
                    </tr>
                    <tr key={"備考、付属情報"}>
                        <th>
                            備考1
                        </th>
                        <th>
                            備考2
                        </th>
                        <Th Flg={watch(`SizeError`) !== undefined}>
                            公称 φ径
                        </Th>
                        <th>
                            公称 L寸
                        </th>
                        <th colSpan={2}>
                            納入先
                        </th>
                        <th>
                            組立形式
                        </th>
                        <Th Flg={watch(`ProductError`) !== undefined}>
                            品番
                        </Th>
                        <Th Flg={watch(`DessignError`) !== undefined}>
                            設番
                        </Th>
                        <Th Flg={watch(`SearchNumberError`) !== undefined}>
                            手配No
                        </Th>
                    </tr>
                    <tr key={"備考、付属情報データ"}>
                        <td>
                          {state<=2?<TdDiv>{watch(`Remarks`)}</TdDiv>:<TextField {...register(`Remarks`)}/>}
                        </td>
                        <td>
                          {state<=2?<TdDiv>{watch(`Remarks2`)}</TdDiv>:<TextField {...register(`Remarks2`)}/>}
                        </td>
                        <td>
                          {state<=2?<TdDiv>{watch(`Diameter`)}</TdDiv>:<TextField {...register(`Diameter`)}/>}
                        </td>
                        <td>
                          {state<=2?<TdDiv>{watch(`LSize`)}</TdDiv>:<TextField {...register(`LSize`)}/>}
                        </td>
                        <td colSpan={2}>
                          {state<=2?<TdDiv>{watch(`Destination`)}</TdDiv>:<TextField {...register(`Destination`)}/>}
                        </td>
                        <td>
                          {state<=2?<TdDiv>{watch(`AssembledForm`)}</TdDiv>:<TextField {...register(`AssembledForm`)}/>}
                        </td>
                        <td>
                          {state<=2?<TdDiv>{watch(`ProductNumber`)}</TdDiv>:<TextField {...register(`ProductNumber`)}/>}
                        </td>
                        <td>
                          {state<=2?<TdDiv>{watch(`Dessign`)}</TdDiv>:<TextField {...register(`Dessign`)}/>}
                        </td>
                        <td>
                          {state<=2?<TdDiv>{watch(`Search`)}</TdDiv>:<TextField {...register(`Search`)}/>}
                        </td>
                    </tr>
            </tbody>
          </table>
        </div>
      </Specification>
      {UserData && UserData.product_authority?<Button variant="contained" size="large" color="error" onClick={handleSubmit(handleCheckClick)}>データチェック</Button>:""}
      <Button sx={{ width: 120 }} color="success" variant="contained" onClick={handleSubmit(Submit)} disabled={watch(`Sabmit`)}>終了</Button>
    </div>
    );
};

export default ProductSpecification;