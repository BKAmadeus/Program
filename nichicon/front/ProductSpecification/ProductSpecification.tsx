//material-uiコンポーネント
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import Checkbox from '@mui/material/Checkbox';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';

//CSS関係
import styled from "styled-components";
import '../style.css';
//PDF関係
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
//アイコン
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import SavingsIcon from '@mui/icons-material/Savings';
//reactのフォーム入力一斉送信用
import { SubmitHandler, useForm } from 'react-hook-form';
import * as func from "../Components/func";
import { Reset,DataSetCalculation,DataSetConstant,DataSet } from '../Components/ProductSelect';
import { InputForm } from '../Components/inputForm';
import { CreatePicture } from '../Components/CreatePicter';
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ports,col,colorList,re,re2,Weight_BZI, init_BZI,SeriesList,ClassificationList } from "../Data/Data"
import {WindingList,TubeList,AgingList} from "../Data/Data";
import type { FormProps } from "../Data/Data"
import { AuthUserContext } from '../Data/SharedVariable';
import { Header } from "../Components/Header";

var scrollsize = 23;
//var As:any
const Specification = styled.div`
  display: grid;
  grid-template-columns: 750px 350px 350px 350px; /* 幅5等分 */
  grid-template-rows: 1120px 1fr; /* 100pxの2行 */
  grid-gap: 10px; /* 隙間10px */
  margin-bottom: 20px;
  .box1 {
      grid-column: 1; /* 列開始位置2(の始端)/終了位置4(の始端) */
      grid-row: 1; /* 行開始位置1(の始端) */
      .box1-1{
        display:grid;
      }
      .box1-2{
        display: grid;
        grid-template-columns: 1fr 1fr;
      }
      .series{
        width:99%;
        border: solid 2px #555555;
      }
      border: solid 3px #555555;
  }
  .list {
      grid-column: 2; /* 列開始位置2(の始端)/終了位置4(の始端) */
      grid-row: 1; /* 行開始位置1(の始端) */
      border: solid 3px #555555;
  }
  .list2 {
      grid-column: 3; /* 列開始位置2(の始端)/終了位置4(の始端) */
      grid-row: 1; /* 行開始位置1(の始端) */
      border: solid 3px #555555;
  }
  .list3 {
      grid-column: 4; /* 列開始位置2(の始端)/終了位置4(の始端) */
      grid-row: 1; /* 行開始位置1(の始端) */
      border: solid 3px #555555;
  }
  }
  .box3 {
    grid-row: 2;
    grid-column: 1/5;
    .approver{
      position: absolute;
      display:grid;
      left: 400px;
      grid-template-columns: 220px 220px 220px;
    }
    }
  }
  .box4 {
    grid-column: 1;
    grid-row: 3; /* 行開始位置1(の始端)/終了位置3(の始端) */
    border: solid 3px #555555;
  }
`;

const Th = styled.th<{ Flg: boolean }>`
  background-color: ${props => props.Flg ? "red" : "silver"};
  color: ${props => props.Flg ? "white" : "black"};
`;
const Th2 = styled.th<{ Flg: boolean }>`
  background-color: ${props => props.Flg ? "yellow" : "silver"};
  color: black;
`;
const TD = styled.td`
  background-color:lightblue;
`
const TD2 = styled.td`
  background-color:lightgreen;
`
const TD3 = styled.td<{ Flg: boolean }>`
  background-color:${props =>props.Flg?"lightgreen":"lightblue"};
`
const Cell = styled.td`
  background-image: linear-gradient(to right top, transparent calc(50% - 0.5px), #999 50%, #999 calc(50% + 0.5px), transparent calc(50% + 1px));
`
const Title = styled.h1`
  margin : 60px;
  vertical-align: middle;
  text-align:top;
  height: 100px;
  font-size:60px;
`
export const ProductSpecification = () => {
  const [scroll,setScroll] = useState(0);
  const [state,setState] = useState(0);
  const [tables,setTables] = useState<any>();
  const [DataList,setDataList] = useState([]);
  const [Incomplete,setIncomplete] = useState(0);
  const [Schedule,setSchedule] = useState([]);
  const [Pict,setPict] = useState<any>();
  const [rerender,Rerender] = useState<boolean>(false);
  const [submit,setSubmit] = useState<boolean>(true);
  const { register, watch, handleSubmit, reset, resetField, setValue } = useForm<FormProps>();
  const navigate = useNavigate();
  const watchSelect = watch("Select");
  const watchPicSelect = watch("PictureSelect");
  const UserName = watch(`approval`);
  const UserData = useContext(AuthUserContext);

  const Submit: SubmitHandler<FormProps> = data => {
    console.log("submit:",data);
    func.postData({flg:8,data:data,UserData:UserData,state:state});
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

  const handleState = (event: any) => {
    if(4 === parseInt(event.target.value)){
      Reset(setValue,reset,resetField,watch);
    }
    setState(parseInt(event.target.value));
  }

  const ProductNumberCheck = () => {
    if(watch(`Product.code`)){
      func.postData({flg:"ProductNumberCheck",code:watch(`Product.code`)})
      .then((data:any) => {
        console.log(data);
        DataSetCalculation(data,setValue);
      })
    }
  }

  const pdhDownloadHandler = () => {
    // PDFファイルに変換したいコンポーネントのidを検索してDOM要素を取得する
    const target = document.getElementById('pdf-id');
    if (target === null) return;

    html2canvas(target).then((canvas) => {
      const imgData = canvas.toDataURL('image/jpeg');
      var divWidth = canvas.width;
      var divHeight = canvas.height;
      var ratio1 = divHeight / divWidth;
      var ratio2 = divWidth / divHeight;
      //saveAsImage(imgData);
      let pdf = new jsPDF();
      var pdf_width = pdf.internal.pageSize.getWidth();
      var pdf_height = pdf.internal.pageSize.getHeight();
      if(pdf_width/divWidth < pdf_height/divHeight){
        var height = pdf_width * ratio1;
        var width = pdf_width;
      }
      else{
        height = pdf_height;
        width = pdf_height * ratio2;
      }
      pdf.addImage(imgData, 'JPEG', 0, 0, width,height);
      pdf.save(`test.pdf`);
    });
  };

  const handleAssembly = (data:any) => {
    func.postData({flg:"assembly",data:data,tables:tables})
    .then((Data:any)=>{
      console.log("Data",Data);
      DataSetCalculation(Data,setValue);
      DataSetConstant(data,setValue);
    })
  }
  
  const handleSearchClick = (data:any) => {
    if(data){
      var post = {flg:5,Product:data,tables:tables,state:state};
      Reset(setValue,reset,resetField,watch);
      setValue(`CheckCode`,data.code);
      setValue(`CheckDessign`,data.dessign);
      Rerender(!rerender);
      func.postData(post).then((Data:any) => {
        console.log("データ",{data:data,Data:Data});
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
          setSubmit(Data.data.check);
          DataSetCalculation(Data.data,setValue);
      });
    }
  }

  const handleAnomaly = (name:string,element:string,value:any) =>{
    var flg = true;
    if(watch(`Anomaly`)){
      watch(`Anomaly`).map((val:any,index:number)=>{
        if(val.name === name && val.element === element){
          setValue(`Anomaly.${index}.name`,name);
          setValue(`Anomaly.${index}.element`,element);
          setValue(`Anomaly.${index}.value`,value);
          flg = false;
        }
        return ""
      });
      if(flg){
        var length = watch(`Anomaly`).length;
        setValue(`Anomaly.${length}.name`,name);
        setValue(`Anomaly.${length}.element`,element);
        setValue(`Anomaly.${length}.value`,value);
      }
    }
    else{
      setValue(`Anomaly.0.name`,name);
      setValue(`Anomaly.0.element`,element);
      setValue(`Anomaly.0.value`,value);
    }
  }

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
    if(watch(`dessign`)){
      var ReDessign = watch(`dessign`).match(/([0-9A-Z]+)-?(.*)/)
      if(ReDessign && ReDessign[1]){
        setValue(`DessignOld`,ReDessign[1]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[watch(`dessign`)])

  useEffect(() => {
    if(watchPicSelect){
      var Count:number = 0;
      for(var row2 of col){
        var flg = 0;
        for(var row of watchPicSelect){
          if(row === row2.label){
            setValue(`Picture.display.${Count}.name`, row2.label);
            flg = 1;
          }
        }
        if(flg === 0){
          resetField(`Picture.display.${Count}`);
        }
        Count = Count + 1;
      }
      setPict(CreatePicture(watchPicSelect,watch,resetField,register,state));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[watchPicSelect,rerender]);

  useEffect(()=> {
    if(!UserData){
      setState(0);
      Reset(setValue,reset,resetField,watch);
      Rerender(!rerender);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[UserData])

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

  useEffect(() => {
    func.postData(ports)
    .then((data:any) => {
      setDataList(data.product.table);
      setTables(data);
      console.log(data);
    });
    setValue(`Select`,init_BZI);
    setValue(`Picture.color`,[0,0,0]);
    setValue(`Picture.text_color`,[200,200,200]);
    setValue(`Picture.Soko_color`,[0,0,0]);
    setValue(`Picture.Soko_text_color`,[200,200,200]);
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
          <Button variant="contained" disabled={!(UserData && UserData.product_authority)} color="error" onClick={handleSubmit(handleCheckClick)}>データチェック</Button>
        }
        Button3={state===0?
          <IconButton onClick={pdhDownloadHandler}>
            <SavingsIcon/>
          </IconButton>
        :""}
        Text={watch(`Product.code`) && watch(`dessign`)?"品番="+watch(`Product.code`)+",設番="+watch(`dessign`):undefined}
      />
      
      <Dialog open={!submit} onClose={()=>setSubmit(true)}>
        <DialogTitle>品番{watch(`Product.code`)}を登録しますか？</DialogTitle>
        <p>製品仕様書全体用のコメントがある場合ここに書き込んでください。</p>
        <TextField multiline {...register(`autor_comment`)} className='df2' rows={2}/>
        <div className='two'>
          <Button sx={{ width: 250 }} color="success" variant="contained" onClick={handleSubmit(Submit)}>
            登録
          </Button>
          <Button sx={{ width: 250 }} color="error" variant="contained" onClick={()=>setSubmit(true)}>
            キャンセル
          </Button>
        </div>
      </Dialog>
      <Specification>
        <div className="box1">
          <div>
            <FormLabel>データ操作</FormLabel>
            <RadioGroup row onChange={handleState} defaultValue={0}>
              <FormControlLabel value={0} control={<Radio />} label="閲覧" sx={{ '& .MuiSvgIcon-root': { fontSize: 40 } }}/>
              {UserData && UserData.product_authority?<FormControlLabel value={3} control={<Radio />} label="作成" sx={{ '& .MuiSvgIcon-root': { fontSize: 40 } }}/>:<></>}
              {UserData && UserData.product_authority?<FormControlLabel value={4} control={<Radio />} label="改訂" sx={{ '& .MuiSvgIcon-root': { fontSize: 40 } }}/>:<></>}
            </RadioGroup>
            <FormLabel>リスト表示選択</FormLabel>
            <RadioGroup row onChange={(e)=>{setIncomplete(parseInt(e.target.value))}} defaultValue={0}>
              <FormControlLabel value={0} control={<Radio />} label="使用可能のみ" sx={{ '& .MuiSvgIcon-root': { fontSize: 40 } }}/>
              <FormControlLabel value={1} control={<Radio />} label="未承認" sx={{ '& .MuiSvgIcon-root': { fontSize: 40 } }}/>
              <FormControlLabel value={2} control={<Radio />} label="本人作成棄却物" sx={{ '& .MuiSvgIcon-root': { fontSize: 40 } }}/>
            </RadioGroup>
            <Button autoFocus sx={{ width: 120 }} color="secondary" variant="contained" onClick={() => Reset(setValue,reset,resetField,watch)}>
            reset
            </Button>
          </div>
          <div className='box1-1'>
            <InputForm Label={"品番"} SET={"Product.code"} Type={"text"} End={""} setValue={setValue} alf={true} watch={watch} Button={<Button variant="contained" onClick={ProductNumberCheck}>品番チェック</Button>}/>
            <InputForm Label={"手配No"} SET={"search_number"} Type={"number"} End={""} setValue={setValue} watch={watch}/>
            <InputForm Label={"設番"} SET={"dessign"} Type={"text"} End={""} setValue={setValue} alf={true} watch={watch}/>
          </div>
          <section className="series">
            <label className={watch(`Assembly.code`)?'p_string':''}>組立形式:{watch(`Assembly.code`)}</label>
            {tables?
            <Autocomplete 
              options={tables.assembly.table.filter((val:any)=>parseInt(val.available) === 0)}
              getOptionLabel={(option: any) => option.code}
              onChange={(_, data) => handleAssembly(data)} 
              renderInput={(params) => <TextField {...params} className='df'/>}
            />:<></>}
            <label className={watch(`Product.series`)?'p_string':''}>シリーズ:{watch(`Product.series`)}</label>
            <Autocomplete
             options={SeriesList}
             onChange={(_, data) => setValue(`Product.series`,data)}
             renderInput={(params) => <TextField {...params} className='df'/>}
             disabled={!(!watch(`Product.code`))}
            />
          </section>
          <div className='box1-2'>
            <InputForm Label={"静電容量"} SET={"Product.capacitance"} Type={"number"} End={"μF"} setValue={setValue} watch={watch} disabled={1 <= state && state <= 2}/>
            <InputForm Label={"定格電圧"} SET={"Product.voltage"} Type={"number"} End={"V"} setValue={setValue} disabled={!(!(watch(`Product.code`)))} watch={watch}/>
            <InputForm Label={"φ径"} SET={"Assembly.diameter"} Type={"number"} End={"mm"} setValue={setValue} watch={watch} disabled={!(!(watch(`Assembly.code`)))}/>
            <InputForm Label={"L寸"} SET={"Assembly.l_dimension"} Type={"number"} End={"mm"} setValue={setValue} watch={watch} disabled={!(!(watch(`Assembly.code`)))}/>
          </div>
        </div>
        <div className='list'>
          <div className='yoko'>
            <h2>製品リスト</h2>
          </div>
          <h2 className='checklist'>{watch(`CheckCode`)}</h2>
          <IconButton onClick={handleBack}>
            <ArrowBackIosIcon/>
          </IconButton>
          <IconButton onClick={handleForward}>
            <ArrowForwardIosIcon/>
          </IconButton>
          {scroll}
          <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper', position: 'relative', overflow: 'auto', maxHeight: 1030, '& ul': { padding: 0 } }} subheader={<li />}>
            {DataList?DataList.filter((val:any)=>(
              (parseInt(val.available) === 0 && Incomplete === 0) || (parseInt(val.available) > 0 && Incomplete === 1) 
              || (parseInt(val.available) === -2 && Incomplete === 2 &&  UserData && UserData.code === val.approval[0].code))
              && (!watch(`Product.voltage`) || watch(`Product.voltage`) === parseFloat(val.voltage))
              && (!watch(`Product.capacitance`) || watch(`Product.capacitance`) === parseFloat(val.capacitance))
              && (!watch(`Assembly.diameter`) || watch(`Assembly.diameter`) === parseFloat(val.diameter))
              && (!watch(`Assembly.l_dimension`) || watch(`Assembly.l_dimension`) === parseFloat(val.l_dimension))
              && (!watch(`Product.series`) || watch(`Product.series`) === val.code.substr(0,3))
              && (!watch(`search_number`) || watch(`search_number`) === parseFloat(val.search_number))
              && (!watch(`Product.code`) || val.code.includes(watch(`Product.code`)))
              && (!watch(`dessign`) || val.dessign.includes(watch(`dessign`)))
            ).map((val:any,index:number) => {
              if( scroll*scrollsize <= index && index < scroll*scrollsize + scrollsize){
                return(
                  <li key={index}>
                    <ul>
                      <ListItem disablePadding className={watch(`CheckCode`) === val.code?"checklist":""}>
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
            <h2 className='checklist'>{watch(`CheckDessign`)}</h2>
            <List sx={{width: '100%',maxWidth: 360,bgcolor: 'background.paper',position: 'relative',overflow: 'auto',maxHeight: 800,'& ul': { padding: 0 },}} subheader={<li />}>
              {watch(`dessign`) && watch(`DessignOld`) && tables?tables.product.table.map((val:any,index:number) => {
                if(val.dessign.indexOf(watch(`DessignOld`)) !== -1){
                  return(
                    <li key={index}>
                      <ul>
                        <ListItem disablePadding className={val.available ===  "0"?(watch(`CheckDessign`) === val.dessign?"checklist":""):(watch(`dessign`) === val.dessign?"checklist":"")}>
                          <ListItemButton disabled={state !== 0} onClick={(_)=>{handleSearchClick(val)}}>{val.dessign}</ListItemButton>
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
            <List sx={{width: '100%',maxWidth: 360,bgcolor: 'background.paper',position: 'relative',overflow: 'auto',maxHeight: 800,'& ul': { padding: 0 },}} subheader={<li />}>
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
        <div className='box3' id="pdf-id">
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
          <Title>製品仕様書</Title>
          <table>
            <tbody key={"body"}>
              <tr key={"備考、付属情報"} className="row0">
                  <th className="row0" rowSpan={5}>
                      規格{<br/>}・品番
                  </th>
                  <Th Flg={watch(`Product.error`) !== undefined} className="row1">品番</Th>
                  <Th Flg={watch(`dessign_Error`) !== undefined} className="row1">設番</Th>
                  <Th Flg={watch(`search_number_Error`) !== undefined} className="row2">手配No</Th>
                  <Th className="row1" Flg={watch(`Assembly.error`) !== undefined}>組立形式</Th>
                  <th colSpan={3} className="row3">納入先</th>
                  <Th Flg={watch(`size_Error`) !== undefined || watch(`diameter_Error`) !== undefined} colSpan={2} className="row2">公称 φ径</Th>
                  <Th Flg={watch(`l_dimension_Error`) !== undefined} colSpan={2} className="row2">公称 L寸</Th>
              </tr>
              <tr key={"備考、付属情報データ"}>
                  <TD>{watch(`Product.code`)}</TD>
                  <TD>{watch(`dessign`)}</TD>
                  <TD3 Flg={watch(`classification`) !== '量産'}>{watch(`search_number`)}</TD3>
                  <TD>{watch(`Assembly.code`)}</TD>
                  {state===0?<TD colSpan={3}>{watch(`destination`)}</TD>
                  :<td colSpan={3}><TextField {...register(`destination`)} className='df'/></td>}
                  <TD colSpan={2}>{watch(`Assembly.diameter`)}</TD>
                  <TD colSpan={2}>{watch(`Assembly.l_dimension`)}</TD>
              </tr>
              <tr key={"製品スペック"}>
                <Th Flg={watch(`capacitance_Error`) !== undefined}>静電容量</Th>
                <th>定格電圧</th>
                <th>シリーズ名</th>
                <th colSpan={2}>容量許容差 %</th>
                <th colSpan={2}>内部抵抗 mΩ (ESR)</th>
                <th colSpan={2}>内部抵抗 mΩ (DCR)</th>
                <th colSpan={2}>漏れ電流 mA</th>
              </tr>
              <tr key={"製品スペックデータ"}>
                  <TD rowSpan={2}>{watch(`Product.breed`) === '電気二重層コンデンサ'?
                   watch(`Product.capacitance`)/(10**6) +" F"
                   : watch(`Product.capacitance`) +" μF"}</TD>
                  <TD rowSpan={2}>{watch(`Product.voltage`)} V</TD>
                  <TD rowSpan={2}>{watch(`Product.series`)}</TD>
                    {state===0 || !watch(`Product.tolerance_special`)?
                    <TD colSpan={2}>{watch(`Product.capacitance_tolerance_level_outside.minus`)+"% ~ "
                    +watch(`Product.capacitance_tolerance_level_outside.plus`)+"%"}</TD>:
                    <td>
                      <TextField {...register(`Product.capacitance_tolerance_level_outside.minus`)} className='df'/>%~
                      <TextField {...register(`Product.capacitance_tolerance_level_outside.plus`)} className='df'/>%
                    </td>}
                  {state===0?<TD2 colSpan={2}>{watch(`outside_esr`)}</TD2>:<td colSpan={2}><TextField {...register(`outside_esr`)} className='df2'/></td>}
                  {state===0?<TD2 colSpan={2}>{watch(`outside_dcr`)}</TD2>:<td colSpan={2}><TextField {...register(`outside_dcr`)} className='df2'/></td>}
                  {state===0?<TD colSpan={2}>{watch(`outside_leakage_current`)}</TD>:<td colSpan={2}><TextField {...register(`outside_leakage_current`)} className='df'/></td>}
              </tr>
              <tr key={"製品スペックデータ2"}>
                  {state===0?<TD colSpan={2}>{watch(`capacitance_tolerance_level_inside.minus`)+"% ~ "+watch(`capacitance_tolerance_level_inside.plus`)+"%"}</TD>:
                  <td colSpan={2}>
                    <TextField {...register(`capacitance_tolerance_level_inside.minus`)} className='df'/>%~
                    <TextField {...register(`capacitance_tolerance_level_inside.plus`)} className='df'/>%
                  </td>}
                    {state===0?<TD2 colSpan={2}>{watch(`inside_esr`)}</TD2>:<td colSpan={2}><TextField {...register(`inside_esr`)} className='df2'/></td>}
                    {state===0?<TD2 colSpan={2}>{watch(`inside_dcr`)}</TD2>:<td colSpan={2}><TextField {...register(`inside_dcr`)} className='df2'/></td>}
                    {state===0?<TD colSpan={2}>{watch(`inside_leakage_current`)}</TD>:<td colSpan={2}><TextField {...register(`inside_leakage_current`)} className='df'/></td>}
              </tr>
              <tr key={"加締・巻取項目"}>
                  <th rowSpan={(watch(`parts`)?watch(`parts`).filter((val:any)=> val && WindingList.all.includes(val.name)).length:0)+3}>
                      加締{<br/>}・巻取
                  </th>
                  <Th Flg={watch(`infiltration_rate_Error`) !== undefined}>
                      含浸率
                  </Th>
                  <Th Flg={watch(`target_value_Error`) !== undefined}>
                      狙い値
                  </Th>
                  <th>
                     裁断係数
                  </th>
                  <Th Flg={watch(`core_diameter_Error`) !== undefined}>
                      巻芯径
                  </Th>
                  <Th Flg={watch(`total_thickness_correction_factor_Error`) !== undefined}>
                      総厚み補正係数
                  </Th>
                  <th>
                      総厚み Σt
                  </th>
                  <th>
                      素子径
                  </th>
                  <th colSpan={2}>
                      巻取指導票
                  </th>
                  <Th Flg={watch(`classification_Error`) !== undefined}>
                      仕様区分 
                  </Th>
                  <Th Flg={watch(`gauge_number_Error`) !== undefined}>
                      ゲージNo
                  </Th>
              </tr>
              <tr key={"加締・巻TDデータ"}>
                {state===0?<TD>{func.Round(watch(`infiltration_rate`))}%</TD>:<td><TextField {...register(`infiltration_rate`)} type="number" className='df'/>%</td>}
                {state===0?<TD>{func.Round(watch(`target_value`))}</TD>:<td><TextField {...register(`target_value`)} type="number" className='df'/>%</td>}
                {state===0?<TD>{func.Round(watch(`CutoffFactor`),2)}</TD>:<td><TextField {...register(`CutoffFactor`)} type="number" className='df'/></td>}
                {state===0?<TD>{func.Round(watch(`core_diameter`),3)}</TD>:<td><TextField {...register(`core_diameter`)} type="number" className='df'/></td>}
                {state===0?<TD>{func.Round(watch(`total_thickness_correction_factor`),3)}</TD>:<td><TextField {...register(`total_thickness_correction_factor`)} type="number" className='df'/></td>}
                {state===0?<TD>{func.Round(watch(`TotalThickness`),3)}</TD>:<td><TextField {...register(`TotalThickness`)} type="number" className='df'/></td>}
                {state===0?<TD>{func.Round(watch(`device_diameter`),3)}</TD>:<td><TextField {...register(`device_diameter`)} type="number" className='df'/></td>}
                {state===0?<TD colSpan={2}>{watch(`winding_guid`)}</TD>:<td colSpan={2}><TextField {...register(`winding_guid`)} className='df'/></td>}
                {state===0?<TD>{watch(`classification`)}</TD>
                :<td>
                {watch(`classification`)}
                <Autocomplete
                  options={ClassificationList}
                  getOptionLabel={(option: any) => option}
                  onChange={(_, data) => data?setValue(`classification`,data):""}
                  renderInput={(params) => ( <TextField {...params} variant="filled" className='df'/>)}
                /></td>}
                {state===0?<TD3 Flg={watch(`classification`) === '見積'}>{watch(`gauge_number`)}</TD3>:<td><TextField {...register(`gauge_number`)} className={watch(`classification`) === '見積'?'df2':'df'}/></td>}
              </tr>
              <tr key={"部材(加締・巻取)項目"}>
                <th rowSpan={(watch(`parts`)?watch(`parts`).filter((val:any)=> val && WindingList.all.includes(val.name)).length:0)+1}>
                  OUTリスト
                  <List sx={{width: '100%',maxWidth: 360,bgcolor: 'background.paper',position: 'relative',overflow: 'auto',maxHeight: 500,'& ul': { padding: 0 }, }} subheader={<li />}>
                    {ports.parts?ports.parts.map((val:any,index:number) => {
                      if(!watchSelect?.includes(val.label) && WindingList.all.includes(val.label)){
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
                  IN部材リスト
                  <List sx={{width: '100%',maxWidth: 360,bgcolor: 'background.paper',position: 'relative',overflow: 'auto',maxHeight: 500,'& ul': { padding: 0 }, }} subheader={<li />}>
                    {ports.parts?ports.parts.map((val:any,index:number) => {
                      if(watchSelect?.includes(val.label) && WindingList.all.includes(val.label)){
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
                <Th Flg={watch(`parts_Error`) !== undefined}>部材材料</Th>
                <th>部材コード</th>
                <th>数量</th>
                <th>幅 mm</th>
                <th>厚み μm</th>
                <th>長さ mm</th>
                <th>重量 g</th>
                <th>面積 cm²</th>
                <Th2 Flg={watch(`Anomaly`)?watch(`Anomaly`).filter((val:any)=>val.element === 'min_capacitance').length !== 0:false}>
                  箔容量 F/cm²<Checkbox disabled={watch(`Anomaly`)?watch(`Anomaly`).filter((val:any)=>val.element === 'min_capacitance').length !== 0:false} onChange={(e)=>{setValue(`FoilCapacitanceSpecial`,e.target.checked)}}/>
                </Th2>
                <th>コスト 円</th>
              </tr>
              {watch(`parts`)?watch(`parts`).map((val:any,index:number)=>{
                if(val && WindingList.all.includes(val.name)){
                  return(
                    <tr key={index}>
                        <Th Flg={watch(`parts.${index}.error`) !== undefined}>{watch(`parts.${index}.name`)}</Th>
                        {tables && tables[val.table_name] && tables[val.table_name].table && state>=3?
                        <td>{watch(`parts.${index}.code`)}<Autocomplete
                          options={tables[val.table_name].table}
                          getOptionLabel={(option: any) => option.code}
                          onChange={(_, data) => handlePartsChange(data,`parts.${index}.code`)}
                          renderInput={(params) => ( <TextField {...params} variant="filled" className='df'/>)}
                        /></td>
                        :<TD>{watch(`parts.${index}.code`)}</TD>}
                        {state===0?<TD>{func.Round(watch(`parts.${index}.quantity`),2)}</TD>
                        :<td><TextField {...register(`parts.${index}.quantity`)} type="number" className='df'/></td>}
                        {!WindingList.range.includes(val.name)?<Cell></Cell>
                        :state===0 ?<TD>{func.Round(watch(`parts.${index}.range`),2)}</TD>:<td><TextField {...register(`parts.${index}.range`)} type="number" className='df'/></td>}
                        {!WindingList.thickness.includes(val.name)?<Cell></Cell>
                        :<TD>{func.Round(watch(`parts.${index}.thickness`),2)}</TD>}
                        {!WindingList.length.includes(val.name)?<Cell></Cell>
                        :<TD>{func.Round(watch(`parts.${index}.length`),2)}</TD>}
                        {!WindingList.weight.includes(val.name)?<Cell></Cell>
                        :<TD>{func.Round(watch(`parts.${index}.weight`),3)}</TD>}
                        {!WindingList.area.includes(val.name)?<Cell></Cell>
                        :<TD>{func.Round(watch(`parts.${index}.area`),2)}</TD>}
                        
                        {!WindingList.capacitance.includes(val.name)?<Cell></Cell>
                        :watch(`FoilCapacitanceSpecial`) && state !== 0?<td>
                        <TextField value={watch(`parts.${index}.capacitance`)} onChange={(e)=>{handleAnomaly(val.name,'min_capacitance',parseFloat(e.target.value));setValue(`parts.${index}.capacitance`,parseFloat(e.target.value))}} type="number" className='df'/></td>
                        :<TD>{watch(`parts.${index}.capacitance`)}</TD>}
                        
                        {!WindingList.cost.includes(val.name)?<Cell></Cell>
                        :<TD2>{func.Round(watch(`parts.${index}.cost`),2)}</TD2>}
                    </tr>
                  )
                }
                return ""
              }):<></>}
              <tr key={"部材(含浸・組立・仕上)項目"}>
                  <th rowSpan={
                    (watch(`parts`)?watch(`parts`).filter((val:any)=> val && val.name && !WindingList.all.includes(val.name) && !AgingList.includes(val.name)).length:0)
                    + 4} className="row0">
                      含浸{<br/>}・組立{<br/>}・仕上
                  </th>
                  <th rowSpan={(watch(`parts`)?watch(`parts`).filter((val:any)=> val && val.name && !WindingList.all.includes(val.name) && !TubeList.all.includes(val.name) && !AgingList.includes(val.name)).length:0)+1}>
                  OUTリスト
                  <List sx={{width: '100%',maxWidth: 360,bgcolor: 'background.paper',position: 'relative',overflow: 'auto',maxHeight: 500,'& ul': { padding: 0 }, }} subheader={<li />}>
                    {ports.parts?ports.parts.map((val:any,index:number) => {
                      if(!watchSelect?.includes(val.label) && !WindingList.all.includes(val.label) && !TubeList.all.includes(val.label) && !AgingList.includes(val.label)){
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
                  IN部材リスト
                  <List sx={{width: '100%',maxWidth: 360,bgcolor: 'background.paper',position: 'relative',overflow: 'auto',maxHeight: 500,'& ul': { padding: 0 }, }} subheader={<li />}>
                    {ports.parts?ports.parts.map((val:any,index:number) => {
                      if(watchSelect?.includes(val.label) && !WindingList.all.includes(val.label) && !TubeList.all.includes(val.label) && !AgingList.includes(val.label)){
                        return(
                          <li key={index+"test"}>
                            <ul>
                              <ListItem disablePadding>
                                <ListItemButton disabled={init_BZI.includes(val.label) || state===0} onClick={()=>{setValue(`Select`,watchSelect.filter((item:any)=> item !== val.label))}}>{val.label}</ListItemButton>
                              </ListItem>
                            </ul>
                          </li>
                        )
                      }
                      return ""
                    }):<></>}
                  </List>
                  </th>
                  <Th Flg={watch(`parts_Error`) !== undefined}>部材材料</Th>
                  <th>部材コード</th>
                  <th>数量</th>
                  <th colSpan={6}>コメント</th>
                  <th>コスト</th>
              </tr>
              {watch(`parts`)?watch(`parts`).map((val:any,index:number)=>{
                if(val && val.name && !WindingList.all.includes(val.name) && !TubeList.all.includes(val.name) && !AgingList.includes(val.name)){
                  return(
                      <tr key={val.name}>
                        <Th Flg={watch(`parts.${index}.error`) !== undefined}>
                          {watch(`parts.${index}.name`)?watch(`parts.${index}.name`):<></>}
                        </Th>
                        {tables && tables[val.table_name] && tables[val.table_name].table && state>=3?<td>{watch(`parts.${index}.code`)}
                              <Autocomplete
                                options={tables[val.table_name].table}
                                getOptionLabel={(option: any) => option.code}
                                onChange={(_, data) => handlePartsChange(data,`parts.${index}.code`)}
                                renderInput={(params) => ( <TextField {...params} variant="filled" className='df'/>)}
                              /></td>
                        :<TD>{watch(`parts.${index}.code`)}</TD>}
                        
                        {!Weight_BZI.includes(val.name)?
                        state===0?<TD>個数{func.Round(watch(`parts.${index}.quantity`),1)}個</TD>:
                        <td>個数<TextField {...register(`parts.${index}.quantity`)} type="number" className='df'/>個</td>
                        :state===0?<TD>重量{func.Round(watch(`parts.${index}.weight`),1)}g</TD>:
                        <td>個数<TextField {...register(`parts.${index}.weight`)} type="number" className='df'/>g</td>}
                        
                        {val.name === '電解液'?state===0?
                        <TD2 colSpan={6}>{watch(`impregnation_comment`)}</TD2>:<td colSpan={6}><TextField multiline {...register(`impregnation_comment`)} className='df2'/></td>:
                        <Cell colSpan={6}></Cell>}
                        <TD2>{func.Round(watch(`parts.${index}.cost`),1)}</TD2>
                      </tr>
                  )
                }
                return ""
              }):<></>}
              <tr key={"部材(チューブ類)項目"}>
                <th rowSpan={(watch(`parts`)?watch(`parts`).filter((val:any)=> val && TubeList.all.includes(val.name)).length:0)+1}>
                  OUTリスト
                  <List sx={{width: '100%',maxWidth: 360,bgcolor: 'background.paper',position: 'relative',overflow: 'auto',maxHeight: 500,'& ul': { padding: 0 },}} subheader={<li />}>
                    {ports.parts?ports.parts.map((val:any,index:number) => {
                      if(!watchSelect?.includes(val.label) && TubeList.all.includes(val.label)){
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
                  IN部材リスト
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
                      if(watchSelect?.includes(val.label) && TubeList.all.includes(val.label)){
                        return(
                          <li key={index+"test"}>
                            <ul>
                              <ListItem disablePadding>
                                <ListItemButton disabled={init_BZI.includes(val.label) || state===0} onClick={()=>{setValue(`Select`,watchSelect.filter((item:any)=> item !== val.label))}}>{val.label}</ListItemButton>
                              </ListItem>
                            </ul>
                          </li>
                        )
                      }
                      return ""
                    }):<></>}
                  </List>
                </th>
                <Th Flg={watch(`parts_Error`) !== undefined}>部材材料</Th>
                <th>部材コード</th>
                <th>数量</th>
                <th>折径 mm</th>
                <th>厚み μm</th>
                <th>長さ mm</th>
                <th>色</th>
                <th>文字色</th>
                <th>材質</th>
                <th>コスト</th>
              </tr>
              {watch(`parts`)?watch(`parts`).map((val:any,index:number)=>{
                if(val && TubeList.all.includes(val.name)){
                  return(
                    <tr key={val.name}>
                      <Th Flg={watch(`parts.${index}.error`) !== undefined}>
                        {watch(`parts.${index}.name`)?watch(`parts.${index}.name`):<></>}
                      </Th>
                      
                        {tables && tables[val.table_name] && tables[val.table_name].table && state>=3?<td>
                        {watch(`parts.${index}.code`)}
                        <Autocomplete
                          options={tables[val.table_name].table}
                          getOptionLabel={(option: any) => option.code}
                          onChange={(_, data) => handlePartsChange(data,`parts.${index}.code`)}
                          renderInput={(params) => ( <TextField {...params} variant="filled" className={watch(`classification`) !== '見積'?'df':'df2'}/>)}
                        /></td>:<TD3 Flg={watch(`classification`) === '見積'}>{watch(`parts.${index}.code`)}</TD3>}
                        
                      {state===0?<TD3 Flg={watch(`classification`) === '見積'}>{func.Round(watch(`parts.${index}.quantity`),2)}</TD3>
                      :<td><TextField type="number" {...register(`parts.${index}.quantity`)} className={watch(`classification`) !== '見積'?'df':'df2'}/></td>}

                      {TubeList.fold_diameter.includes(val.name)?<TD>{func.Round(watch(`parts.${index}.fold_diameter`),2)}</TD>
                      :<Cell></Cell>}
                      
                      {TubeList.thickness.includes(val.name)?<TD>{func.Round(watch(`parts.${index}.thickness`),3)}</TD>
                      :<Cell></Cell>}
                      {TubeList.length.includes(val.name)?<TD>{func.Round(watch(`parts.${index}.length`),4)}</TD>
                      :<Cell></Cell>}
                      {TubeList.color.includes(val.name)?
                      <TD>
                          {colorList.map((val:any)=>{
                            if(val.value[0] === watch(`Picture.color.0`) && val.value[1] === watch(`Picture.color.1`) && val.value[2] === watch(`Picture.color.2`)){
                              return val.label
                            }
                            return ""
                          })}
                      </TD>:<Cell></Cell>}
                      {TubeList.text_color.includes(val.name)?
                      <TD>
                          {colorList.map((val:any)=>{
                            if(val.value[0] === watch(`Picture.text_color.0`) && val.value[1] === watch(`Picture.text_color.1`) && val.value[2] === watch(`Picture.text_color.2`)){
                              return val.label
                            }
                            return ""
                          })}
                      </TD>:<Cell></Cell>}
                      {TubeList.material_properties.includes(val.name)?<TD>{val.material_properties}</TD>:<Cell></Cell>}
                      
                      
                      <TD2>{func.Round(watch(`parts.${index}.cost`),1)}</TD2>
                    </tr>
                  )
                }
                return ""
              }):<></>}
              <tr key={"チューブ画像と表示する文字、数字,仕上、封入指導票項目"}>
                  <Th Flg={watch(`pic_Error`) !== undefined} colSpan={7}>
                      チューブ表示
                  </Th>
                  <th colSpan={2}>
                      封入指導票
                  </th>
                  <th colSpan={2}>
                      仕上指導票
                  </th>
              </tr>
              <tr key={"チューブ画像と表示する文字、数字,仕上、封入指導票データ"}>
                  <td colSpan={7}>
                    <div>
                      {Pict}
                    </div>
                  </td>
                  {state===0?<TD colSpan={2}>{watch(`inclusion_guid`)}</TD>:<td colSpan={2}><TextField multiline {...register(`inclusion_guid`)} className='df'/></td>}
                  {state===0?<TD colSpan={2}>{watch(`finish_guid`)}</TD>:<td colSpan={2}><TextField multiline {...register(`finish_guid`)} className='df'/></td>}
              </tr>
              <tr key={"エージング情報と加工情報"}>
                  <th rowSpan={(watch(`parts`)?watch(`parts`).filter((val:any)=> val && AgingList.includes(val.name)).length:0)+3}>エlジング{/*縦書きだとエージングに見えるように*/}</th>
                  <Th Flg={watch(`aging_voltage_Error`) !== undefined}>印加電圧 V</Th>
                  <Th Flg={watch(`aging_time_Error`) !== undefined}>エージング時間 hour</Th>
                  <Th Flg={watch(`aging_temperature_Error`) !== undefined}>温度 ℃</Th>
                  <th colSpan={8}>エージングコメント</th>
              </tr>
              <tr key={"エージング情報と加工情報データ"}>
                  {state===0?<TD>{watch(`aging_voltage`)}</TD>:<td><TextField {...register(`aging_voltage`)} className='df'/></td>}
                  {state===0?<TD>{watch(`aging_time`)}</TD>:<td><TextField {...register(`aging_time`)} className='df'/></td>}
                  {state===0?<TD>{watch(`aging_temperature`)}</TD>:<td><TextField {...register(`aging_temperature`)} className='df'/></td>}
                  {state===0?<TD2 colSpan={8}>{watch(`aging_comment`)}</TD2>:<td colSpan={8}><TextField {...register(`aging_comment`)} className='df2'/></td>}
              </tr>
              <tr key={"エージング部材(梱包箱)"}>
              <th rowSpan={(watch(`parts`)?watch(`parts`).filter((val:any)=> val && AgingList.includes(val.name)).length:0)+1}>
                  OUTリスト
                  <List sx={{width: '100%',maxWidth: 360,bgcolor: 'background.paper',position: 'relative',overflow: 'auto',maxHeight: 500,'& ul': { padding: 0 },}} subheader={<li />}>
                    {ports.parts?ports.parts.map((val:any,index:number) => {
                      if(!watchSelect?.includes(val.label) && AgingList.includes(val.label)){
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
                  IN部材リスト
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
                      if(watchSelect?.includes(val.label) && AgingList.includes(val.label)){
                        return(
                          <li key={index+"test"}>
                            <ul>
                              <ListItem disablePadding>
                                <ListItemButton disabled={init_BZI.includes(val.label) || state===0} onClick={()=>{setValue(`Select`,watchSelect.filter((item:any)=> item !== val.label))}}>{val.label}</ListItemButton>
                              </ListItem>
                            </ul>
                          </li>
                        )
                      }
                      return ""
                    }):<></>}
                  </List>
                </th>
                <Th Flg={watch(`parts_Error`) !== undefined}>部材材料</Th>
                <th>部材コード</th>
                <th>梱包数</th>
                <th colSpan={6}></th>
                <th>コスト</th>
              </tr>
              {watch(`parts`)?watch(`parts`).map((val:any,index:number)=>{
                if(val && AgingList.includes(val.name)){
                  return (
                    <tr key={index}>
                      <th>{val.name}</th>
                      {tables && tables[val.table_name] && tables[val.table_name].table && state>=3?<td>
                        {watch(`parts.${index}.code`)}
                        <Autocomplete
                          options={tables[val.table_name].table}
                          getOptionLabel={(option: any) => option.code}
                          onChange={(_, data) => handlePartsChange(data,`parts.${index}.code`)}
                          renderInput={(params) => ( <TextField {...params} variant="filled" className={watch(`classification`) !== '見積'?'df':'df2'}/>)}
                        /></td>:<TD3 Flg={watch(`classification`) === '見積'}>{watch(`parts.${index}.code`)}</TD3>}
                        
                        {state===0?<TD3 Flg={watch(`classification`) === '見積'}>{func.Round(watch(`parts.${index}.quantity`),2)}</TD3>
                        :<td><TextField type="number" {...register(`parts.${index}.quantity`)} className={watch(`classification`) !== '見積'?'df':'df2'}/></td>}
                        <Cell colSpan={6}></Cell>
                        <TD2>{func.Round(watch(`parts.${index}.cost`),1)}</TD2>
                    </tr>
                  )
                }
                return ""
              }):<></>}
              <tr key={"加工情報"}>
                <th rowSpan={2}>二次加工</th>
                <th colSpan={4}>加工方法</th>
                <th colSpan={3}>二次加工コード</th>
                <th colSpan={4}>二次加工指導票No.</th>
              </tr>
              <tr key={"加工情報データ"}>
                {state===0?<TD2 colSpan={4}>{watch(`MachiningMethod`)}</TD2>:<td colSpan={4}><TextField {...register(`MachiningMethod`)} className='df2'/></td>}
                {state===0?<TD2 colSpan={3}>{watch(`MachiningCode`)}</TD2>:<td colSpan={3}><TextField {...register(`MachiningCode`)} className='df2'/></td>}
                {state===0?<TD2 colSpan={4}>{watch(`machining_guid`)}</TD2>:<td colSpan={4}><TextField {...register(`machining_guid`)} className='df2'/></td>}
              </tr>
            </tbody>
          </table>
        </div>
      </Specification>
    </div>
    );
};