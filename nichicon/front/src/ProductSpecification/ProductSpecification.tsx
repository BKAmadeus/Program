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
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import StepButton from '@mui/material/StepButton';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialAction from '@mui/material/SpeedDialAction';
//時間処理
import { format } from "date-fns";
//CSS関係
import styled from "styled-components";
import '../style.css';
//PDF関係
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
//アイコン
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import SaveIcon from '@mui/icons-material/Save';
//import PrintIcon from '@mui/icons-material/Print';
import SavingsIcon from '@mui/icons-material/Savings';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
//reactのフォーム入力一斉送信用
import { SubmitHandler, useForm } from 'react-hook-form';
//import * as func from "../Components/func";
import {postData,Round,Hollow} from "../Components/func";
import { Reset,DataSetCalculation,DataSetConstant } from '../Components/ProductSelect';
import { InputForm } from '../Components/inputForm';
import { CreatePicture } from '../Components/CreatePicter';
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ports,col,colorList,Weight_BZI, init_BZI,SeriesList,DessignList,ClassificationList,TubeIndex } from "../Data/Data"
import {WindingList,TubeList,AgingList,CodeRangeSearch,AssemblyFixation,PaperIndexs,minusFoilIndexs} from "../Data/Data";
import type { FormProps } from "../Data/Data"
import { AuthUserContext } from '../Data/SharedVariable';
import { Header } from "../Components/Header";
import { Tolerance } from "../Components/Tolerance";
var steps = ["規格・品番","加締・巻取","含浸・組立・仕上","エージング","二次加工"];
var scrollsize = 32;
//var As:any
const Specification = styled.div<{ step: number }>`
  display: grid;
  grid-template-rows: 80px 1fr; /* 100pxの2行 */
  grid-gap: 10px; /* 隙間10px */
  margin-bottom: 20px;
  .step {
    grid-row: 1; /* 行開始位置1(の始端) */
  }
  .step1 {
      grid-row: 2; /* 行開始位置1(の始端) */
      display: grid;
      grid-template-columns: 350px 200px 1fr;
      border: solid 3px #555555;
  }
  .step2 {
      grid-row: 2; /* 行開始位置1(の始端) */
      display: grid;
      grid-template-columns: 200px 1fr;
      border: solid 3px #555555;
  }
  .step3 {
    grid-row: 2;
    display: grid;
    grid-template-columns: 200px 1fr;
    border: solid 3px #555555;
  }
  .step4 {
    grid-row: 2;
    display: grid;
    grid-template-columns: 200px 1fr;
    border: solid 3px #555555;
  }
  .step5 {
    grid-row: 2;
    border: solid 3px #555555;
  }
  .pdf {
    grid-row: 3;
    .approver{
      position: absolute;
      display:grid;
      left: 400px;
      grid-template-columns: 220px 220px 220px;
    }
    }
  }
`;
const Pdf = styled.div`
  display: grid;
  grid-template-rows:1fr;
  grid-template-columns:1fr;
  .approver{
    position: absolute;
    display:grid;
    left: 400px;
    grid-template-columns: 220px 220px 220px;
`

const Th = styled.th<{ Flg: boolean }>`
  background-color: ${props => props.Flg ? "red" : "silver"};
  color: ${props => props.Flg ? "white" : "black"};
`;
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
  const [step, setStep] = useState(0);
  const [scroll,setScroll] = useState<number>(0);
  const [pageSize,setpageSize] = useState<number>(0);
  const [state,setState] = useState(0);
  const [tables,setTables] = useState<any>();
  const [DataList,setDataList] = useState<any>();
  const [Incomplete,setIncomplete] = useState(0);
  const [Schedule,setSchedule] = useState<any>();
  const [Pict,setPict] = useState<any>();
  const [TubeCode,setTubeCode] = useState<boolean>(false);
  const [rerender,Rerender] = useState<boolean>(false);
  const [submit,setSubmit] = useState<boolean>(true);
  const [open,setOpen] = useState<boolean>(false);
  const [check,setCheck] = useState<boolean>(true);
  const [speed,SetSpeed] = useState<any>([]);
  const [test,SetTest] = useState(0);
  const { register, watch, handleSubmit, reset, resetField, setValue } = useForm<FormProps>();
  const navigate = useNavigate();
  const watchSelect = watch("Select");
  const watchPicSelect = watch("PictureSelect");
  const paperRange = watch(`parts.${PaperIndexs[0]}.range`);
  const UserName = watch(`approval`);
  const UserData = useContext(AuthUserContext);
  //var x:any[] = [];
  //x[0] = "";x[1] = null;x[2] = undefined;x[3] = NaN;x[4] = 0;x[5] = "5";x[6] = "a";x[7] = false;x[8] = true;
  //console.log("確認用1",Hollow(x[0]),Hollow(x[1]),Hollow(x[2]),Hollow(x[3]),Hollow(x[4]),Hollow(x[5]),Hollow(x[6]),Hollow(x[7]),Hollow(x[8]))
  //console.log("確認用2",Hollow2(x[0]),Hollow2(x[1]),Hollow2(x[2]),Hollow2(x[3]),Hollow2(x[4]),Hollow2(x[5]),Hollow2(x[6]),Hollow2(x[7]),Hollow2[x[8]])

  const Submit: SubmitHandler<FormProps> = data => {
    console.log("submit:",data);
    postData({flg:8,data:data,UserData:UserData,state:state});
    navigate('/');
  };

  const Reset2 = () =>{
    setCheck(true);
    setStep(0);
    setScroll(0);
    Reset(setValue,reset,resetField,watch);
  }

  const handleListSelect = (code:any) =>{
    var DATA = tables['display'].table.filter((val:any)=>val.code === code);
    if(DATA.length !== 0){
      var Data = DATA[0];
      setValue(`parts.${TubeIndex}.display_code`,code);
      postData({flg:"TubeList",data:Data,Tube:watch(`parts.${TubeIndex}`)})
      .then((data:any) => {
        console.log("チューブチェック確認用",data);
        DataSetCalculation(data,setValue,watch);
        DataSetConstant(Data,setValue);
        Rerender(!rerender);
      })
    }
  }

  const handleState = (event: any) => {
    if(4 === parseInt(event.target.value)){
      Reset2();
    }
    setState(parseInt(event.target.value));
  }

  const ProductNumberCheck = () => {
    if(watch(`Product.code`)){
      postData({flg:"ProductNumberCheck",code:watch()})
      .then((data:any) => {
        console.log("品番チェック",data);
        DataSetCalculation(data,setValue,watch,false);
      })
    }
  }

  const RangeChange = (value:number,index:number) => {
    if(PaperIndexs.includes(index)){
      for(var row of PaperIndexs){
        if(watchSelect?.includes(watch(`parts.${row}.name`))){
          setValue(`parts.${row}.code`,undefined);
          setValue(`parts.${row}.range`,value);
        }
      }
    }else if(minusFoilIndexs.includes(index)){
      for(row of minusFoilIndexs){
        if(watchSelect?.includes(watch(`parts.${row}.name`))){
          setValue(`parts.${row}.code`,undefined);
          setValue(`parts.${row}.range`,value);
        }
      }
    }else{
      setValue(`parts.${index}.code`,undefined);
      setValue(`parts.${index}.range`,value);
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
    postData({flg:"assembly",data:data,tables:tables})
    .then((Data:any)=>{
      console.log("Data",Data);
      DataSetConstant(data,setValue);
      DataSetCalculation(Data,setValue,watch);
    })
  }
  
  const handleSearchClick = (data:any) => {
    if(data){
      var post = {flg:5,Product:data,tables:tables};
      Reset2();
      setValue(`CheckCode`,data.code);
      setValue(`CheckDessign`,data.dessign);
      Rerender(!rerender);
      postData(post).then((Data:any) => {
        console.log("データ",{data:data,Data:Data});
        setCheck(true);
        setSchedule(Data.schedule);
        DataSetConstant(data,setValue);
        DataSetCalculation(Data,setValue,watch);
      })
    }
  }

  const handlePartsChange = (Data:any,data:any) => {
    Data.name = data.name;
    var test ={}
    test["parts"] = [Data];
    DataSetCalculation(test,setValue,watch,true,false);
    if(data.table_name === 'ge'){
      setTubeCode(false);

      //data.display_code?handleListSelect(data.display_code):"";
    }
  }

  const handleBack = () => {
    setCheck(true);
    setStep(step-1);
  }

  const handleNext = () => {
    if(step === 4){
      setSubmit(check);
    }
    else{
      setStep(step+1);
      setCheck(!check);
    }
  }

  const CalculationClick: SubmitHandler<FormProps> = data => {
    if(data !== null){
      const Chack = {flg:'Calculation',data:data,tables:tables,state:state,step:step};
      postData(Chack)
      .then((Data:any) => {
          console.log("データ計算確認",Data);
          setCheck(Data.check);
          DataSetCalculation(Data,setValue,watch);
      });
    }
  }

  useEffect(()=>{
    if(watchSelect){
      ports.parts.map((value:any,index:number)=> {
        if(watchSelect.includes(value.label)){
          setValue(`parts.${index}.table_name`,value.label.indexOf('極箔') !== -1 && watch(`Product.breed`) === '電気二重層コンデンサ'?value.code2:value.code);
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
      setPict(CreatePicture(watchPicSelect,watch,resetField));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[watchPicSelect,rerender]);

  useEffect(()=> {
    if(!UserData){
      setState(0);
      Reset2();
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
        postData({flg:"UserCodes",codes:codes})
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
    var list:any[] = [];
    if(open){
      list.push({icon:<VisibilityOffIcon style={{color:"black"}}/>,name:"戻る",onclick:()=>{setOpen(false)}})
      //pdf印刷↓
      //list.push({icon:<PrintIcon style={{color:"purple"}}/>,name:"pdf保存",onclick:pdhDownloadHandler})
      SetSpeed(list)
    }
    else{
      list.push({icon:<RemoveRedEyeIcon style={{color:"black"}}/>,name:"仕様書確認",onclick:()=>setOpen(true)})
      if(step!==0){
        list.push({icon:<UndoIcon style={{color:"blue"}}/>,name:"戻る",onclick:handleBack})
      }
      if(step===4 && !check){
        list.push({icon:<SaveIcon style={{color:"green"}}/>,name:"登録",onclick:handleNext})
      }
      if(step!==4 && !check){
        list.push({icon:<RedoIcon style={{color:"green"}}/>,name:"次へ",onclick:handleNext})
      }
      if(state!==0){
        list.push({icon:<CheckCircleIcon style={{color:"red"}}/>,name:"確定",onclick:handleSubmit(CalculationClick)})
      }
      if(!check){
        list.push({icon:<SettingsIcon style={{color:"blue"}}/>,name:"再設定",onclick:()=>setCheck(true)})
      }
      list.push({icon:<RestartAltIcon style={{color:"purple"}}/>,name:"リセット",onclick:Reset2})
      SetSpeed(list)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[open,check,step,state])

  useEffect(() => {
    postData(ports)
    .then((data:any) => {
      SetTest(1);
      setDataList(data.product.table);
      setTables(data);
      SetTest(2);
      console.log("必要部材関係テーブル",data);
      setpageSize(Math.floor(data.product.table.filter((val:any)=>parseInt(val.available) >= 0).length/scrollsize));
      SetTest(3);
    });
    setValue(`Select`,init_BZI);
    setValue(`wind_shift_range`,{plus:0.5,minus:-0.5});
    setValue(`wind_shift_range2`,{plus:0.4,minus:0});
    setValue(`parts.${TubeIndex}.color`,[0,0,0]);
    setValue(`parts.${TubeIndex}.text_color`,[200,200,200]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  return (
    <div>
      <Header Label={"仕様書作成画面"}
        Button1={
          <Button autoFocus sx={{ width: 120 }} color="secondary" variant="contained" onClick={Reset2}>
           reset
          </Button>
        }
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
      {test}
      <Specification step={step}>
        <div className="step">
          <Stepper activeStep={step} nonLinear={state===4}>
            {state === 4?
            steps.map((label,index)=>(
              <Step key={label} completed={index < step}>
                <StepButton onClick={()=>{setStep(index);setCheck(true);}}>
                  <h1>{label}</h1>
                </StepButton>
              </Step>
            )):
            steps.map((label, index) => (
              <Step key={label} completed={index < step}>
                <StepLabel>
                  <h1>{label}</h1>
                </StepLabel>
              </Step>
            ))
            }
          </Stepper>
        </div>
        {step === 0?
        <div className="step1">
          <div key={"製品リスト"} style={{border:"solid 1px #555555"}}>
            <div className='yoko'>
              <h2>製品リスト</h2>
            </div>
            <h2 className='checklist'>{watch(`CheckCode`)}</h2>
            <div className='yoko'>
              <IconButton onClick={()=>setScroll(0)}>
                <SkipPreviousIcon/>
              </IconButton>
              <IconButton onClick={()=>scroll-10 > 0?setScroll(scroll-10):setScroll(0)}>
                <KeyboardDoubleArrowLeftIcon/>
              </IconButton>
              <IconButton onClick={()=>scroll > 0?setScroll(scroll-1):""}>
                <ArrowBackIosIcon/>
              </IconButton>
              <IconButton onClick={()=>scroll+1 < pageSize?setScroll(scroll+1):""}>
                <ArrowForwardIosIcon/>
              </IconButton>
              <IconButton onClick={()=>scroll+10 < pageSize?setScroll(scroll+10):setScroll(pageSize)}>
                <KeyboardDoubleArrowRightIcon/>
              </IconButton>
              <IconButton onClick={()=>setScroll(pageSize)}>
                <SkipNextIcon/>
              </IconButton>
              <p style={{backgroundColor:"yellow",color:"black"}}>{scroll}</p>
            </div>
            {DataList?
            <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper', position: 'relative', overflow: 'auto', maxHeight: 1030, '& ul': { padding: 0 } }} subheader={<li />}>
              {DataList.filter((val:any)=>(
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
              })}
            </List>:<></>}
          </div>
          <div key={"操作系列"} style={{border:"solid 1px #555555"}}>
            <div>
              <FormLabel>データ操作</FormLabel>
              <RadioGroup row onChange={handleState} value={state}>
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
              <Button autoFocus sx={{ width: 120 }} color="secondary" variant="contained" onClick={Reset2}>
              reset
              </Button>
            </div>
            <section key={"設番リスト"}>
              <h2>設番リスト</h2>
              <h2 className='checklist'>{watch(`CheckDessign`)}</h2>
              {watch(`dessign`) && watch(`DessignOld`) && tables?
              <List sx={{width: '100%',maxWidth: 200,bgcolor: 'background.paper',position: 'relative',overflow: 'auto',maxHeight: 500,'& ul': { padding: 0 },}} subheader={<li />}>
                {tables.product.table.map((val:any,index:number) => {
                  if(val.dessign && val.dessign.indexOf(watch(`DessignOld`)) !== -1){
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
                })}
              </List>:<></>}

            </section>
            <section key={"製作作業票リスト"}>
              <h2>製作作業票リスト</h2>
              {Schedule?
              <List sx={{width: '100%',maxWidth: 200,bgcolor: 'background.paper',position: 'relative',overflow: 'auto',maxHeight: 300,'& ul': { padding: 0 },}} subheader={<li />}>
                {Schedule.map((val:any,index:number) => {
                    return(
                      <li key={index}>
                        <ul>
                          <ListItem disablePadding>
                            <ListItemButton>{format(new Date(val.deadline),'yyMMdd')+"-"+val.lot}</ListItemButton>
                          </ListItem>
                        </ul>
                      </li>
                    )
                  }
                )}
              </List>:<></>}
            </section>
          </div>
          <div key={"入力項目"} style={{border:"solid 1px #555555"}}>
            <div key={"仕様分類"} className='three'>
              <InputForm Label={"手配No"} SET={"search_number"} Type={"number"} End={""} setValue={setValue} watch={watch} error={watch(`search_number_Error`)} class={watch(`classification`) === '量産'?'df':'df3'} disabled={!check}/>
              {state ===3?
                <section>
                  <label className={watch(`dessign_`)?'p_string':''}>設番:{watch(`dessign_`)}</label>
                  <Autocomplete 
                    disabled={!check}
                    options={DessignList}
                    onChange={(_,data)=> {setValue(`dessign_`,data)}}
                    renderInput={(params) => <TextField {...params} className="df"/>}
                  />
                  <h4 className='Error'>{watch(`dessign_Error`)?watch(`dessign_Error`):""}</h4>
                </section>
              :<InputForm Label={"設番"} SET={"dessign"} Type={"text"} End={""} setValue={setValue} alf={true} watch={watch} class="df"  error={watch(`dessign_Error`)} disabled={!check}/>}
              <section>
                <label>仕様区分:{watch(`classification`)}</label>
                <Autocomplete
                  options={ClassificationList}
                  getOptionLabel={(option: any) => option}
                  onChange={(_, data) => data?setValue(`classification`,data):""}
                  renderInput={(params) => ( <TextField {...params} variant="filled" className='df'/>)}
                  disabled={state===0 || !check}
                />
                <h4 className='Error'>{watch(`classification_Error`)?watch(`classification_Error`):""}</h4>
              </section>

            </div>
            <div key={"未分類"} className='two'>
              <InputForm Label={"ゲージNo"} SET={"gauge_number"} setValue={setValue} watch={watch} Type={"number"} End={""} class={watch(`classification`) === '見積'?'df2':'df'} disabled={state===0 || !check} error={watch(`gauge_number_Error`)}/>
              <InputForm Label={"納入先"} setValue={setValue} watch={watch} SET={"destination"} Type={"text"} End={""} disabled={state===0 || !check} error={watch(`destination_Error`)}/>
            </div>
            <div key={"品番"} style={{border:"solid 1px #555555"}}>
              <InputForm Label={"品番"} SET={"Product.code"} Type={"text"} End={""} setValue={setValue} alf={true} watch={watch} Button={<Button variant="contained" onClick={ProductNumberCheck} disabled={!check}>品番チェック</Button>} error={watch(`Product.error`)} disabled={!check}/>
              <div className='three'>
                <section>
                  <label className={watch(`Product.series`)?'p_string':''}>シリーズ:{watch(`Product.series`)}</label>
                  <Autocomplete
                  options={SeriesList}
                  onChange={(_, data) => setValue(`Product.series`,data)}
                  renderInput={(params) => <TextField {...params} className='df'/>}
                  disabled={Hollow(watch(`Product.code`)) || !check}
                  />
                </section>
                <InputForm Label={"定格電圧"} SET={"Product.voltage"} Type={"number"} End={"V"} setValue={setValue} disabled={Hollow(watch(`Product.code`)) || !check} watch={watch}/>
                <InputForm Label={"静電容量"} SET={"Product.capacitance"} Type={"number"} End={watch(`Product.breed`) === '電気二重層コンデンサ'?"F":"μF"} digit={watch(`Product.breed`) === '電気二重層コンデンサ'?10**-6:1} setValue={setValue} watch={watch} disabled={Hollow(watch(`Product.code`) && !watch(`Product.capacitanceSpecial`)) || !check} error={watch(`capacitance_Error`)}
                  Button={<Checkbox checked={Hollow(watch(`Product.capacitanceSpecial`))} onClick={()=>setValue(`Product.capacitanceSpecial`,!Hollow(watch(`Product.capacitanceSpecial`)))} disabled={state === 0 || !check}/>}/>
              </div>
            </div>
            <div key={"組立形式"} style={{border:"solid 1px #555555"}}>
              <section>
                <label className={watch(`Assembly.code`)?'p_string':''}>組立形式:{watch(`Assembly.code`)}</label>
                {tables?
                <Autocomplete 
                  disabled={!check}
                  options={tables.assembly.table.filter((val:any)=>parseInt(val.available) === 0)}
                  getOptionLabel={(option: any) => option.code}
                  onChange={(_, data) => handleAssembly(data)} 
                  renderInput={(params) => <TextField {...params} className='df'/>}
                />:<></>}
              </section>
              <div className='two'>
                <InputForm Label={"φ径"} SET={"Assembly.diameter"} Type={"number"} End={"mm"} setValue={setValue} watch={watch} disabled={Hollow(watch(`Assembly.code`)) || !check}/>
                <InputForm Label={"L寸"} SET={"Assembly.l_dimension"} Type={"number"} End={"mm"} setValue={setValue} watch={watch} disabled={Hollow(watch(`Assembly.code`)) || !check}/>
              </div>
            </div>
            <div key={"社内・社外値"}>
              <div key={"社外"} style={{border:"solid 1px #555555"}}>
                <h2>社外</h2>
                <div className='five'>
                  <InputForm Label={"漏れ電流"} SET={"outside_leakage_current"} setValue={setValue} watch={watch} Type={"number"} End={"mA"}
                   disabled={!watch(`LeakCurrentCheck`) || state === 0 || !check} error={watch(`leakage_current_Error`)}
                   Button={<Checkbox checked={Hollow(watch(`LeakCurrentCheck`))}
                   onClick={()=>setValue(`LeakCurrentCheck`,!Hollow(watch(`LeakCurrentCheck`)))}
                   disabled={state === 0 || !check}/>}/>
                  <InputForm Label={"内部抵抗(ESR)"} SET={"outside_esr"} setValue={setValue} watch={watch} Type={"number"} End={"mΩ"} class='df2' disabled={state === 0 || !check}/>
                  <InputForm Label={"内部抵抗(DCR)"} SET={"outside_dcr"} setValue={setValue} watch={watch} Type={"number"} End={"mΩ"} class='df2' disabled={state === 0 || !check}/>
                  <InputForm Label={"容量許容差"} SET={"Product.capacitance_tolerance_level_outside.minus"} setValue={setValue} watch={watch} Type={"number"} End={"%"}
                   disabled={!Hollow(watch(`Product.tolerance_special`)) || state === 0 || !check}/>
                  <InputForm Label={"容量許容差"} SET={"Product.capacitance_tolerance_level_outside.plus"} setValue={setValue} watch={watch} Type={"number"} End={"%"}
                   disabled={!Hollow(watch(`Product.tolerance_special`)) || state === 0 || !check}/>
                </div>
              </div>
              <div key={"社内"} style={{border:"solid 1px #555555"}}>
                <h2>社内</h2>
                <div className='five'>
                  <InputForm Label={"漏れ電流"} SET={"inside_leakage_current"} setValue={setValue} watch={watch} Type={"number"} End={"mA"} disabled={!watch(`LeakCurrentCheck`) || state === 0 || !check}/>
                  <InputForm Label={"内部抵抗(ESR)"} SET={"inside_esr"} setValue={setValue} watch={watch} Type={"number"} End={"mΩ"} class='df2' disabled={state === 0 || !check}/>
                  <InputForm Label={"内部抵抗(DCR)"} SET={"inside_dcr"} setValue={setValue} watch={watch} Type={"number"} End={"mΩ"} class='df2' disabled={state === 0 || !check}/>
                  <InputForm Label={"容量許容差"} SET={"capacitance_tolerance_level_inside.minus"} setValue={setValue} watch={watch} Type={"number"} End={"%"} disabled={state === 0 || !check} error={watch(`capacitance_tolerance_level_inside_Error`)}/>
                  <InputForm Label={"容量許容差"} SET={"capacitance_tolerance_level_inside.plus"} setValue={setValue} watch={watch} Type={"number"} End={"%"} disabled={state === 0 || !check}/>
                </div>
              </div>
            </div>
            <div className='four'>
              <Button variant="contained" onClick={()=>handleBack()} disabled>back</Button>
              <Button variant="contained" onClick={handleSubmit(CalculationClick)} color='error' disabled={state===0}>確定</Button>
              <Button variant='contained' onClick={()=>setCheck(!check)} disabled={check}>再設定</Button>
              <Button variant="contained" onClick={()=>handleNext()} disabled={check} color="success">next</Button>
            </div>
          </div>
        </div>
        :step === 1?
        <div className='step2'>
          <div key={"部材リスト"}>
            <div style={{border:"solid 1px #555555"}}>
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
            </div>
            <div style={{border:"solid 1px #555555"}}>
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
            </div>
          </div>
          <div key={"入力項目"}>
            <div className='quintet'>
              <InputForm Label={"含浸率"} SET={`infiltration_rate`} Type="number" watch={watch} setValue={setValue} End={"%"} error={watch(`infiltration_rate_Error`)}
               Button={
               <Checkbox disabled={!check} checked={Hollow(watch(`InfiltrationRateCheck`))} onClick={()=>setValue(`InfiltrationRateCheck`,!Hollow(watch(`InfiltrationRateCheck`)))}/>
              } disabled={!watch(`InfiltrationRateCheck`) || !check}/>
              <InputForm Label={"狙い値"} SET={`target_value`} Type="number" watch={watch} setValue={setValue} End={"%"} disabled={!check}/>
              <section>
                <label className={watch(`core_diameter`)?'p_string':''}>巻芯径:{watch(`core_diameter`)}</label>
                <Autocomplete
                  options={AssemblyFixation.core_diameter}
                  getOptionLabel={(option: any) => String(option)}
                  onChange={(_, data) => data?setValue(`core_diameter`,data):""}
                  renderInput={(params) => (<TextField {...params} variant="filled" className='df'/>)}
                  disabled={!check}
                />
              </section>
              <InputForm Label={"総厚み補正係数"} SET={`total_thickness_correction_factor`} Type="number" watch={watch} setValue={setValue} End={""} disabled={!check}/>
              <InputForm Label={"素子長"} SET={`device_length`} Type="number" watch={watch} setValue={setValue} End={"mm"} error={watch(`device_length_Error`)} disabled={!check}
               Button={<Checkbox disabled={!check} checked={Hollow(watch(`wind_shift_check`))} onClick={()=>setValue(`wind_shift_check`,!Hollow(watch(`wind_shift_check`)))}/>}
              />
              <InputForm Label={"巻取指導票"} SET={`winding_guid`} Type="text" watch={watch} setValue={setValue} End={""} alf={true} disabled={!check}/>
              {watch(`Product.series`)?.indexOf('AK') !== -1?<InputForm Label={"先巻長さ"} SET={`pre_wind_length`} Type="number" watch={watch} setValue={setValue} End={"mm"} disabled={!check}/>:""}
              <>
              {watch(`device_length`) && paperRange && (paperRange !== watch(`device_length`))?
              <>
              <InputForm Label={"上マージン"} SET={`wind_shift_top`} Type='number' watch={watch} setValue={setValue} End={"mm"} disabled={!check}/>
              <InputForm Label={"下マージン"} SET={`wind_shift_under`} Type='number' watch={watch} setValue={setValue} End={"mm"} disabled={!check}/>
              <section>
                <label>巻きズラシ許容差±:±{watch(`wind_shift_range.plus`)}mm</label>
                <TextField type='number' value={Hollow(watch(`wind_shift_range.plus`))?watch(`wind_shift_range.plus`):""} disabled={!check}
                onChange={(e)=>{setValue(`wind_shift_range.plus`,parseFloat(e.target.value));setValue(`wind_shift_range.minus`,-1*parseFloat(e.target.value))}} className='df'/>
              </section>
              </>:watch(`wind_shift_check`)?
              <>
              <InputForm Label={"上マージン"} SET={`wind_shift_top`} Type='number' watch={watch} setValue={setValue} End={"mm"} disabled={!check}/>
              <InputForm Label={"下マージン"} SET={`wind_shift_under`} Type='number' watch={watch} setValue={setValue} End={"mm"} disabled={!check}/>
              <InputForm Label={"巻きズラシ許容差-"} SET={`wind_shift_range2.minus`} Type='number' watch={watch} setValue={setValue} End={"mm"} disabled={!check}/>
              <InputForm Label={"巻きズラシ許容差+"} SET={`wind_shift_range2.plus`} Type='number' watch={watch} setValue={setValue} End={"mm"} disabled={!check}/>
              </>:<></>}
              </>
            </div>
            <div className='two'>
              <div>
                {watch(`device_length`) && paperRange && paperRange !== watch(`device_length`)?
                <div className='shift'>
                  <img src="/巻きズラシ.png" alt="巻きズラシ"/>
                  <p style={{top:110,left:80}}>{Round(watch(`parts.0.range`))}</p>
                  <p style={{top:150,left:280}}>{Round(watch(`parts.1.range`))}</p>
                  <p style={{top:130,left:210}}>{Round(watch(`parts.${PaperIndexs[0]}.range`))}</p>
                  <p style={{top:0,left:80,fontSize:40}}>{watch(`wind_shift_top`)}</p>
                  <p style={{top:130,left:80,fontSize:40}}>{watch(`wind_shift_under`)}</p>
                  <div style={{top:175,left:80}}><Tolerance value={watch(`device_length`) - paperRange} max={watch(`wind_shift_range.plus`)} min={watch(`wind_shift_range.minus`)}/></div>
                </div>:watch(`wind_shift_check`) && paperRange && watch(`device_length`)?
                <div className='shift'>
                  <img src="/巻きズラシ面.png" alt="巻きズラシ面"/>
                  <p style={{top:75,left:70}}>{Round(watch(`parts.0.range`))}</p>
                  <p style={{top:95,left:285}}>{Round(watch(`parts.1.range`))}</p>
                  <p style={{top:85,left:210}}>{Round(watch(`parts.${PaperIndexs[0]}.range`))}</p>
                  <p style={{top:-30,left:70,fontSize:40}}>{watch(`wind_shift_top`)}</p>
                  <p style={{top:93,left:70,fontSize:40}}>{watch(`wind_shift_under`)}</p>
                  <p style={{top:80,left:355}}><Tolerance value={paperRange?watch(`device_length`) - paperRange:0} max={watch(`wind_shift_range2.plus`)} min={watch(`wind_shift_range2.minus`)}/></p>
                </div>
              :<></>}
              </div>
              <div>
                {watchSelect?.includes('保護箔')?<img src="/保護箔.png" alt='保護箔'/>:<></>}
              </div>
              
            </div>
            <table>
              <tbody>
                <tr key={"部材(加締・巻取)項目"}>
                  <Th Flg={watch(`parts_Error`) !== undefined}>部材材料<br/>{watch(`parts_Error`)?watch(`parts_Error`):""}</Th>
                  <th style={{width:"300px"}}>部材コード</th>
                  <th>数量</th>
                  <th>幅 mm</th>
                  <th>箔容量 F/cm²</th>
                  <th>厚み μm</th>
                  <th>長さ mm</th>
                  <th>重量 g</th>
                  <th>面積 cm²</th>
                  <th>コスト 円</th>
                </tr>
                {watch(`parts`)?watch(`parts`).map((val:any,index:number)=>{
                  if(val && WindingList.all.includes(val.name)){
                    return(
                      <tr key={index}>
                        <Th Flg={watch(`parts.${index}.error`) !== undefined}>{watch(`parts.${index}.name`)}<br/>{watch(`parts.${index}.error`)?watch(`parts.${index}.error`):""}</Th>
                        
                        {tables && tables[val.table_name] && tables[val.table_name].table?
                        <td>{watch(`parts.${index}.code`)}
                        <Autocomplete
                          options={CodeRangeSearch.includes(val.name)?tables[val.table_name].table.filter((item:any)=>!(val.range) || parseFloat(item.range) === parseFloat(val.range)):tables[val.table_name].table}
                          getOptionLabel={(option: any) => option.code}
                          onChange={(_, data) => handlePartsChange(data,watch(`parts.${index}`))}
                          renderInput={(params) => ( <TextField {...params} variant="filled" className='df'/>)}
                          disabled={!check}
                        /></td>
                        :<td></td>}
                        
                        <td>{watch(`parts.${index}.quantity`)}<TextField {...register(`parts.${index}.quantity`)} type="number" className='df' disabled={!check}/></td>

                        {!WindingList.range.includes(val.name)?<Cell></Cell>
                        :WindingList.range_input.includes(val.name)?val.name.indexOf('電解紙') !== -1 && val.name !== '電解紙'?<td>{val.range}</td>
                        :<td>{watch(`parts.${index}.range`)}<TextField value={Hollow(watch(`parts.${index}.range`))?watch(`parts.${index}.range`):""} onChange={(e)=>RangeChange(parseFloat(e.target.value),index)} type='number' className='df' disabled={!check}/></td>
                        :<td>{watch(`parts.${index}.range`)}</td>}
                        
                        {!WindingList.capacitance.includes(val.name)?<Cell></Cell>
                        :<td>
                        <Checkbox disabled={!check} checked={Hollow(watch(`parts.${index}.CapacitanceSpecial`))} onClick={()=>setValue(`parts.${index}.CapacitanceSpecial`,!Hollow(watch(`parts.${index}.CapacitanceSpecial`)))}/>
                        {watch(`parts.${index}.CapacitanceSpecial`)?<>{watch(`parts.${index}.capacitance`)}<TextField {...register(`parts.${index}.capacitance`)} type="number" className='df' disabled={!check}/></>:watch(`parts.${index}.capacitance`)}
                        </td>}
                        {!WindingList.thickness.includes(val.name)?<Cell></Cell>
                        :<td>{Round(watch(`parts.${index}.thickness`),2)}</td>}
                        {!WindingList.length.includes(val.name)?<Cell></Cell>
                        :<td>{Round(watch(`parts.${index}.length`),2)}</td>}
                        {!WindingList.weight.includes(val.name)?<Cell></Cell>
                        :<td>{Round(watch(`parts.${index}.weight`),3)}</td>}
                        {!WindingList.area.includes(val.name)?<Cell></Cell>
                        :<td>{Round(watch(`parts.${index}.area`),2)}</td>}
                        {!WindingList.cost.includes(val.name)?<Cell></Cell>
                        :<td>{Round(watch(`parts.${index}.cost`),2)}</td>}
                      </tr>
                    )
                  }
                  return ""
                }):<></>}
              </tbody>
            </table>
            <div className='four'>
              <Button variant="contained" onClick={()=>handleBack()}>back</Button>
              <Button variant="contained" onClick={handleSubmit(CalculationClick)} color='error' disabled={state===0}>確定</Button>
              <Button variant='contained' onClick={()=>setCheck(!check)} disabled={check}>再設定</Button>
              <Button variant="contained" onClick={()=>handleNext()} disabled={check} color="success">next</Button>
            </div>
          </div>
        </div>
        :step === 2?
        <div className='step3'>
          <div key={"部材リスト"}>
            <div key={"含浸・組立部材"} style={{border:"solid 1px #555555"}}>
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
            </div>
            <div key={"仕上部材"} style={{border:"solid 1px #555555"}}>
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
            </div>
            <div key={"外チューブリスト"} style={{border:"solid 1px #555555"}}>
              外チューブリスト
              <List sx={{width: '100%',maxWidth: 360,bgcolor: 'background.paper',position: 'relative',overflow: 'auto',maxHeight: 500,'& ul': { padding: 0 }, }} subheader={<li />}>
                {tables && tables["ge"] && tables["ge"].table?tables["ge"].table.filter((val:any)=>(
                //watch(`Product.capacitance`) === parseFloat(val.capacitance) &&
                //watch(`Product.voltage`) === parseFloat(val.voltage) &&
                //watch(`Product.series`) === val.series && 
                (!watch(`parts.${TubeIndex}.fold_diameter`) || (watch(`parts.${TubeIndex}.fold_diameter`) === parseFloat(val.fold_diameter))) &&
                (!watch(`parts.${TubeIndex}.thickness`) || (watch(`parts.${TubeIndex}.thickness`) === parseFloat(val.thickness))) &&
                (!watch(`parts.${TubeIndex}.length`) || watch(`Product.type`) !== 'sm' || (watch(`parts.${TubeIndex}.length`) === parseFloat(val.length))) &&
                (!watch(`parts.${TubeIndex}.material_properties`) || (watch(`parts.${TubeIndex}.material_properties`) === val.material_properties)) &&
                (!watch(`parts.${TubeIndex}.color`) || (val.color && val.color.length === 3 && (watch(`parts.${TubeIndex}.color.0`) === val.color[0] && watch(`parts.${TubeIndex}.color.1`) === val.color[1] && watch(`parts.${TubeIndex}.color.2`) === val.color[2]))) &&
                (!watch(`parts.${TubeIndex}.text_color`) || (val.text_color && val.text_color.length === 3 && (watch(`parts.${TubeIndex}.text_color.0`) === val.text_color[0] && watch(`parts.${TubeIndex}.text_color.1`) === val.text_color[1] && watch(`parts.${TubeIndex}.text_color.2`) === val.text_color[2]))) &&
                (!watch(`parts.${TubeIndex}.display_code`) || (watch(`parts.${TubeIndex}.display_code`) === val.display_code))
                )).map((val:any,index:number)=>{
                  if(index <= 100){
                    return(
                      <li key={index+"test"}>
                        <ul>
                          <ListItem disablePadding>
                            <ListItemButton onClick={()=>{handlePartsChange(val,watch(`parts.${TubeIndex}`))}}>{val.code}</ListItemButton>
                          </ListItem>
                        </ul>
                      </li>
                    )
                  }
                  return ""
                }):""}
              </List>
            </div>
          </div>
          <div key={"入力項目"}>
            <div className='two'>
              <InputForm Label={"封入指導票"} End={""} SET={`inclusion_guid`} Type="text" watch={watch} setValue={setValue} alf={true} disabled={!check}/>
              <InputForm Label={"仕上指導票"} End={""} SET={`finish_guid`} Type="text" watch={watch} setValue={setValue} alf={true} disabled={!check}/>
            </div>
            <table key={"部材テーブル"}>
              <tbody>
                <tr key={"部材(含浸・組立・仕上)項目"}>
                  <th rowSpan={
                    (watch(`parts`)?watch(`parts`).filter((val:any)=> val && val.name && !WindingList.all.includes(val.name) && !AgingList.includes(val.name)).length:0)
                    + 4} className="row0">
                      含浸{<br/>}・組立{<br/>}・仕上
                  </th>
                  <Th Flg={watch(`parts_Error`) !== undefined}>部材材料<br/>{watch(`parts_Error`)?watch(`parts_Error`):""}</Th>
                  <th>部材コード</th>
                  <th>数量</th>
                  <th colSpan={3}>コメント</th>
                </tr>
                {watch(`parts`)?watch(`parts`).map((val:any,index:number)=>{
                  if(val && val.name && !WindingList.all.includes(val.name) && !TubeList.all.includes(val.name) && !AgingList.includes(val.name)){
                    return(
                        <tr key={val.name}>
                          <Th Flg={watch(`parts.${index}.error`) !== undefined}>
                            {watch(`parts.${index}.name`)?watch(`parts.${index}.name`):<></>}<br/>{watch(`parts.${index}.error`)?watch(`parts.${index}.error`):""}
                          </Th>
                          {tables && tables[val.table_name] && tables[val.table_name].table?<td>{watch(`parts.${index}.code`)}
                                <Autocomplete
                                  options={tables[val.table_name].table}
                                  getOptionLabel={(option: any) => option.code}
                                  onChange={(_, data) => handlePartsChange(data,watch(`parts.${index}`))}
                                  renderInput={(params) => ( <TextField {...params} variant="filled" className='df'/>)}
                                  disabled={!check}
                                /></td>
                          :<td>{watch(`parts.${index}.code`)}</td>}
                          
                          {!Weight_BZI.includes(val.name)?
                          <td>個数<TextField {...register(`parts.${index}.quantity`)} type="number" className='df' disabled={!check}/>個</td>:
                          <td>重量{Round(watch(`parts.${index}.weight`),3)}g</td>}
                          
                          {val.name === '電解液'?state===0?
                          <td colSpan={3}>{watch(`impregnation_comment`)}</td>:<td colSpan={3}><TextField multiline {...register(`impregnation_comment`)} className='df2' disabled={!check}/></td>:
                          <Cell colSpan={3}></Cell>}
                        </tr>
                    )
                  }
                  return ""
                }):<></>}
                {watch(`parts`)?watch(`parts`).map((val:any,index:number)=>{
                  if(val && TubeList.all.includes(val.name)){
                    return(
                      <tr key={val.name}>
                        <Th Flg={watch(`parts.${index}.error`) !== undefined}>
                          {watch(`parts.${index}.name`)?watch(`parts.${index}.name`):<></>}<br/>{watch(`parts.${index}.error`)?watch(`parts.${index}.error`):""}
                        </Th>
                        <td>
                          {val.name ==='外チューブ'?<>{watch(`parts.${index}.code`)}</>:<>
                          {watch(`parts.${index}.code`)}
                          <Autocomplete
                            options={tables[val.table_name].table}
                            getOptionLabel={(option: any) => option.code}
                            onChange={(_, data) => handlePartsChange(data,watch(`parts.${index}`))}
                            renderInput={(params) => ( <TextField {...params} variant="filled" className='df'/>)}
                            disabled={!check}
                          /></>}
                        </td>
                        <td><TextField type="number" {...register(`parts.${index}.quantity`)} className={watch(`classification`) !== '見積'?'df':'df2'} disabled={!check}/></td>
                        <Cell></Cell>
                      </tr>
                    )
                  }
                  return ""
                }):<></>}
              </tbody>
            </table>
            <div style={{border:"solid 1px #555555"}}>
              {Pict}
            </div>
            <div style={{border:"solid 1px #555555"}}>
              <div className='two'>
                <div key={"チューブコード"}>
                  <InputForm Label="チューブコード" SET={`parts.${TubeIndex}.code`} Type={"text"} End={""} setValue={setValue} alf={true} watch={watch} class={watch(`classification`) !== '見積'?'df':'df2'} disabled={!check}
                    Button={<Button variant="contained" disabled={!check} onClick={()=>{
                      var DATA = tables.ge.table.filter((item:any)=>item.code === watch(`parts.${TubeIndex}.code`));
                      if(DATA.length !== 0){
                        setTubeCode(false);
                        handlePartsChange(DATA[0],watch(`parts.${TubeIndex}`))
                      }
                      else{
                        setTubeCode(true);
                      }
                    }}>チューブチェック</Button>}/>
                  {TubeCode?<h4 style={{color:'red'}}>
                    そのコードは存在しません
                  </h4>:<></>}
                </div>
                {watch(`classification`) === '見積'?
                <section>
                  <label>ディスプレイコード:{watch(`parts.${TubeIndex}.display_code`)}  <Button variant='contained' onClick={()=>handleListSelect(watch(`parts.${TubeIndex}.display_code`))}>反映</Button></label>
                  <Autocomplete 
                    options={tables["display"].table}
                    getOptionLabel={(option:any)=>option.code}
                    onChange={(_,data)=>data?handleListSelect(data.code):""}
                    renderInput={(params) => ( <TextField {...params} variant="filled" className='df2'/>)}
                    disabled={!check}
                  />
                </section>:<></>}
              </div>
              <div className='three'>
                <section><label>折径 mm</label><p>{watch(`parts.${TubeIndex}.fold_diameter`)}</p></section>
                <InputForm Label="厚み" SET={`parts.${TubeIndex}.thickness`} Type={"number"} End={"mm"} setValue={setValue} watch={watch} disabled={!check}/>
                <InputForm Label="長さ" SET={`parts.${TubeIndex}.length`} Type={"number"} End={"mm"} setValue={setValue} watch={watch} disabled={!check}/>
              <section>
                <label>材質:{watch(`parts.${TubeIndex}.material_properties`)}</label>
                <Autocomplete
                  options={tables.tube_fold_diameter.table.filter((val:any)=>parseFloat(val.diameter) === watch(`Assembly.diameter`) && val.type === watch(`Product.type`))}
                  getOptionLabel={(option: any) => option.material_properties}
                  onChange={(_, data) =>{
                    if(data){
                      setValue(`parts.${TubeIndex}.material_properties`,data.material_properties)
                      setValue(`parts.${TubeIndex}.fold_diameter`,data.fold_diameter)
                  }}}
                  renderInput={(params) => ( <TextField {...params} variant="filled" className='df'/>)}
                />
              </section>
              <section>
                <label>チューブ色:{colorList.filter((val:any)=>val.value[0] === watch(`parts.${TubeIndex}.color.0`) && val.value[1] === watch(`parts.${TubeIndex}.color.1`) && val.value[2] === watch(`parts.${TubeIndex}.color.2`)).map((val:any)=>val.label)}</label>
                <Autocomplete
                  options={colorList}
                  getOptionLabel={(option: any) => option.label}
                  onChange={(_, data) =>{
                    if(data){
                      setValue(`parts.${TubeIndex}.color.0`,data.value[0])
                      setValue(`parts.${TubeIndex}.color.1`,data.value[1])
                      setValue(`parts.${TubeIndex}.color.2`,data.value[2])
                  }}}
                  renderInput={(params) => ( <TextField {...params} variant="filled" className='df'/>)}
                />
              </section>
              <section>
                <label>チューブ文字色:{colorList.filter((val:any)=>val.value[0] === watch(`parts.${TubeIndex}.text_color.0`) && val.value[1] === watch(`parts.${TubeIndex}.text_color.1`) && val.value[2] === watch(`parts.${TubeIndex}.text_color.2`)).map((val:any)=>val.label)}</label>
                <Autocomplete
                  options={colorList}
                  getOptionLabel={(option: any) => option.label}
                  onChange={(_, data) =>{
                    if(data){
                      setValue(`parts.${TubeIndex}.text_color.0`,data.value[0])
                      setValue(`parts.${TubeIndex}.text_color.1`,data.value[1])
                      setValue(`parts.${TubeIndex}.text_color.2`,data.value[2])
                  }}}
                  renderInput={(params) => ( <TextField {...params} variant="filled" className='df'/>)}
                />
              </section>
              </div>
            </div>
            <div className='four'>
              <Button variant="contained" onClick={()=>handleBack()}>back</Button>
              <Button variant="contained" onClick={handleSubmit(CalculationClick)} color='error' disabled={state===0}>確定</Button>
              <Button variant='contained' onClick={()=>setCheck(!check)} disabled={check}>再設定</Button>
              <Button variant="contained" onClick={()=>handleNext()} disabled={check} color="success">next</Button>
            </div>
          </div>
        </div>
        :step === 3?
        <div className='step4'>
          <div key={"部材リスト"} style={{border:"solid 1px #555555"}}>
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
          </div>
          <div key={"入力項目"}>
            <div className='three'>
              <InputForm Label="エージング電圧" SET={`aging_voltage`} Type={"number"} End={""} setValue={setValue} watch={watch} disabled={!check}/>
              {watch(`Product.breed`) === '電気二重層コンデンサ'?<InputForm Label="エージング時間" SET={`aging_time`} Type={"number"} End={""} setValue={setValue} watch={watch} disabled={!check}/>
              :<InputForm Label="最終電流" SET={`aging_current`} Type={"number"} End={"mA"} setValue={setValue} watch={watch} disabled={!check}/>}
              
              <InputForm Label="エージング温度" SET={`aging_temperature`} Type={"number"} End={""} setValue={setValue} watch={watch} disabled={!check}/>
              <InputForm Label="エージングコメント" SET={`aging_comment`} Type={"text"} End={""} setValue={setValue} watch={watch} class='df2' disabled={!check}/>
            </div>
            <table>
              <tbody>
                <tr key={"エージング部材(梱包箱)"}>
                  <Th Flg={watch(`parts_Error`) !== undefined}>部材材料</Th>
                  <th>部材コード</th>
                  <th>梱包数</th>
                </tr>
                {watch(`parts`)?watch(`parts`).map((val:any,index:number)=>{
                  if(val && AgingList.includes(val.name)){
                    return (
                      <tr key={index}>
                        <th>{val.name}</th>
                        <td>
                          {watch(`parts.${index}.code`)}
                          <Autocomplete
                            options={tables[val.table_name].table.filter((val:any)=>parseInt(val.available) === 0)}
                            getOptionLabel={(option: any) => option.code}
                            onChange={(_, data) => handlePartsChange(data,watch(`parts.${index}`))}
                            renderInput={(params) => ( <TextField {...params} variant="filled" className={watch(`classification`) !== '見積'?'df':'df2'}/>)}
                            disabled={!check}
                          />
                        </td>
                        <td><TextField type="number" onChange={(e)=>{setValue(`parts.${index}.quantity`,parseFloat(e.target.value))}} className={watch(`classification`) !== '見積'?'df':'df2'} disabled={!check}/></td>
                      </tr>
                    )
                  }
                  return ""
                }):<></>}
              </tbody>
            </table>
            <div className='four'>
              <Button variant="contained" onClick={()=>handleBack()}>back</Button>
              <Button variant="contained" onClick={handleSubmit(CalculationClick)} color='error' disabled={state===0}>確定</Button>
              <Button variant='contained' onClick={()=>setCheck(!check)} disabled={check}>再設定</Button>
              <Button variant="contained" onClick={()=>handleNext()} disabled={check} color="success">next</Button>
            </div>
          </div>
        </div>
        :step === 4?
        <div className='step5'>
          <div>
            {watch(`Product.machining`)?
            <div className='one'>
              <InputForm End="" Label="二次加工指導票" SET={`Machining.guid`} Type="text" watch={watch} setValue={setValue} alf={true} class={"df2"} disabled={!check}/>
            </div>
            :<></>}
            <div className='four'>
              <Button variant="contained" onClick={()=>handleBack()}>back</Button>
              <Button variant="contained" onClick={handleSubmit(CalculationClick)} color='error' disabled={state===0}>確定</Button>
              <Button variant='contained' onClick={()=>setCheck(!check)} disabled={check}>再設定</Button>
              <Button variant="contained" onClick={()=>handleNext()} disabled={check} color="success">登録</Button>
            </div>
          </div>
        </div>
        :<></>}
      </Specification>
      <SpeedDial 
       ariaLabel='test' 
       style={{position: "fixed", bottom: 25,right: 25}}
       icon={<SpeedDialIcon />}
      >
        {speed?speed.map((action:any)=>(
          <SpeedDialAction
              key={action.name}
              icon={action.icon}
              tooltipTitle={action.name}
              tooltipOpen
              onClick={action.onclick}
            />
        )):<></>}
      </SpeedDial>
      <Dialog fullScreen open={open} onClose={()=>setOpen(false)}>
        <div id="pdf-id">
          <Pdf>
            <div className='approver'>
              {[...Array(3)].map((_,index:number)=>{
                if(watch(`approval`) && watch(`approval.${index}`)){
                  return(
                    <span className='HankoCircle' key={index}>
                      {watch(`approval.${index}`).action}<br/>
                      {watch(`approval.${index}`) && watch(`approval.${index}`).name?watch(`approval.${index}`).name:""}<br/>
                      {watch(`approval.${index}.days`)?format(new Date(watch(`approval.${index}.days`)),"yyyy年MM月dd日"):""}
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
                    <Th colSpan={2} className="row2" Flg={watch(`Assembly.error`) !== undefined}>組立形式</Th>
                    <th colSpan={3} className="row3">納入先</th>
                    <Th Flg={watch(`size_Error`) !== undefined || watch(`diameter_Error`) !== undefined} className="row2">公称 φ径</Th>
                    <Th Flg={watch(`l_dimension_Error`) !== undefined} className="row2">公称 L寸</Th>
                </tr>
                <tr key={"備考、付属情報データ"}>
                    <td>{watch(`Product.code`)}</td>
                    <td>{watch(`dessign`)}</td>
                    <td>{watch(`search_number`)}</td>
                    <td colSpan={2}>{watch(`Assembly.code`)}</td>
                    <td colSpan={3}>{watch(`destination`)}</td>
                    <td>{watch(`Assembly.diameter`) != null?watch(`Assembly.diameter`):""}</td>
                    <td>{watch(`Assembly.l_dimension`) != null?watch(`Assembly.l_dimension`):""}</td>
                </tr>
                <tr key={"製品スペック"}>
                  <Th Flg={watch(`capacitance_Error`) !== undefined}>静電容量</Th>
                  <th>定格電圧</th>
                  <th>シリーズ名</th>
                  <th colSpan={2}>社外/社内</th>
                  <th colSpan={2}>容量許容差 %</th>
                  <th>内部抵抗 mΩ (ESR)</th>
                  <th>内部抵抗 mΩ (DCR)</th>
                  <th>漏れ電流 {watch(`Product.breed`) === '電気二重層コンデンサ'?"mA":"μA"}</th>
                </tr>
                <tr key={"製品スペックデータ"}>
                  <td rowSpan={2}>{watch(`Product.capacitance`) != null?watch(`Product.breed`) === '電気二重層コンデンサ'?
                  watch(`Product.capacitance`)/(10**6) +" F"
                  : watch(`Product.capacitance`) +" μF":" μF"}</td>
                  <td rowSpan={2}>{watch(`Product.voltage`)} V</td>
                  <td rowSpan={2}>{watch(`Product.series`)}</td>
                  <th colSpan={2}>社外規格値</th>
                  <td colSpan={2}>{(watch(`Product.capacitance_tolerance_level_outside.minus`)!=null?watch(`Product.capacitance_tolerance_level_outside.minus`):"")+"% ~ "
                  +(watch(`Product.capacitance_tolerance_level_outside.plus`)!=null?watch(`Product.capacitance_tolerance_level_outside.plus`):"")+"%"}</td>
                  <td>{watch(`outside_esr`)}</td>
                  <td>{watch(`outside_dcr`)}</td>
                  <td>{watch(`outside_leakage_current`)}</td>
                </tr>
                <tr key={"製品スペックデータ2"}>
                  <th colSpan={2}>社内規格値</th>
                  <td colSpan={2}>{(watch(`capacitance_tolerance_level_inside.minus`)!=null?watch(`capacitance_tolerance_level_inside.minus`):"")+"% ~ "
                  +(watch(`capacitance_tolerance_level_inside.plus`)!=null?watch(`capacitance_tolerance_level_inside.plus`):"")+"%"}</td>
                  <td>{watch(`inside_esr`)}</td>
                  <td>{watch(`inside_dcr`)}</td>
                  <td>{watch(`inside_leakage_current`)}</td>
                </tr>
                <tr key={"加締・巻取決定値計算項目"}>
                    <th rowSpan={(watch(`parts`)?watch(`parts`).filter((val:any)=> val && WindingList.all.includes(val.name)).length:0)+5}>
                        加締{<br/>}・巻取
                    </th>
                    <Th Flg={watch(`infiltration_rate_Error`) !== undefined} colSpan={2}>
                        含浸率
                    </Th>
                    <Th Flg={watch(`target_value_Error`) !== undefined} colSpan={2}>
                        狙い値
                    </Th>
                    <Th Flg={watch(`core_diameter_Error`) !== undefined} colSpan={2}>
                        巻芯径
                    </Th>
                    <Th Flg={watch(`total_thickness_correction_factor_Error`) !== undefined} colSpan={2}>
                        総厚み補正係数
                    </Th>
                    <Th Flg={watch(`device_diameter_Error`) !== undefined} colSpan={2}>
                      素子長
                    </Th>
                </tr>
                <tr key={"加締・巻取決定値計算データ"}>
                  <td colSpan={2}>{Hollow(watch(`infiltration_rate`))?Round(watch(`infiltration_rate`)):""}%</td>
                  <td colSpan={2}>{Hollow(watch(`target_value`))?Round(watch(`target_value`)):""}</td>
                  <td colSpan={2}>{Hollow(watch(`core_diameter`))?Round(watch(`core_diameter`),3):""}</td>
                  <td colSpan={2}>{Hollow(watch(`total_thickness_correction_factor`))?Round(watch(`total_thickness_correction_factor`),3):""}</td>
                  <td colSpan={2}>{Hollow(watch(`device_length`))?Round(watch(`device_length`),3):""}</td>
                </tr>
                <tr key={"加締・巻取決定値計算設定値以外項目"}>
                    <th>
                        総厚み Σt
                    </th>
                    <th>
                      素子径
                    </th>
                    <th>
                      巻取指導票
                    </th>
                    <Th Flg={watch(`classification_Error`) !== undefined}>
                      仕様区分 
                    </Th>
                    <Th Flg={watch(`gauge_number_Error`) !== undefined}>
                      ゲージNo
                    </Th>
                    <th colSpan={3}>巻きズラシ</th>
                    <th colSpan={2}>保護箔</th>
                </tr>
                <tr key={"加締・巻取決定値計算設定値以外データ"}>
                  <td>{watch(`total_thickness`) != null?Round(watch(`total_thickness`),3):""}</td>
                  <td>{watch(`device_diameter`) != null?Round(watch(`device_diameter`),3):""}</td>
                  <td>{watch(`winding_guid`)}</td>
                  <td>{watch(`classification`)}</td>
                  <td>{watch(`gauge_number`)}</td>
                  <td colSpan={3}>
                    {watch(`device_length`) && paperRange && paperRange !== watch(`device_length`)?
                      <div className='shift'>
                        <img src="/巻きズラシ.png" alt="巻きズラシ"/>
                        <p style={{top:110,left:80}}>{Round(watch(`parts.0.range`))}</p>
                        <p style={{top:150,left:280}}>{Round(watch(`parts.1.range`))}</p>
                        <p style={{top:130,left:210}}>{Round(watch(`parts.${PaperIndexs[0]}.range`))}</p>
                        <p style={{top:0,left:80,fontSize:40}}>{watch(`wind_shift_top`)}</p>
                        <p style={{top:130,left:80,fontSize:40}}>{watch(`wind_shift_under`)}</p>
                        <div style={{top:175,left:80}}><Tolerance value={watch(`device_length`) - paperRange} max={watch(`wind_shift_range.plus`)} min={watch(`wind_shift_range.minus`)}/></div>
                      </div>:watch(`wind_shift_check`) && paperRange && watch(`device_length`)?
                      <div className='shift'>
                        <img src="/巻きズラシ面.png" alt="巻きズラシ面"/>
                        <p style={{top:75,left:70}}>{Round(watch(`parts.0.range`))}</p>
                        <p style={{top:95,left:285}}>{Round(watch(`parts.1.range`))}</p>
                        <p style={{top:85,left:210}}>{Round(watch(`parts.${PaperIndexs[0]}.range`))}</p>
                        <p style={{top:-30,left:70,fontSize:40}}>{watch(`wind_shift_top`)}</p>
                        <p style={{top:93,left:70,fontSize:40}}>{watch(`wind_shift_under`)}</p>
                        <p style={{top:80,left:355}}><Tolerance value={paperRange?watch(`device_length`) - paperRange:0} max={watch(`wind_shift_range2.plus`)} min={watch(`wind_shift_range2.minus`)}/></p>
                      </div>
                    :<></>}
                  </td>
                  <td colSpan={2}>{watchSelect?.includes('保護箔')?<img src="/保護箔.png" alt='保護箔'/>:<></>}</td>
                </tr>


                <tr key={"部材(加締・巻取)項目"}>
                  <Th Flg={watch(`parts_Error`) !== undefined}>部材材料</Th>
                  <th>部材コード</th>
                  <th>数量</th>
                  <th>幅 mm</th>
                  <th>厚み μm</th>
                  <th>長さ mm</th>
                  <th>重量 g</th>
                  <th>面積 cm²</th>
                  <th>
                    箔容量 F/cm²
                  </th>
                  <th>コスト 円</th>
                </tr>
                {watch(`parts`)?watch(`parts`).map((val:any,index:number)=>{
                  if(val && WindingList.all.includes(val.name)){
                    return(
                      <tr key={index}>
                          <Th Flg={watch(`parts.${index}.error`) !== undefined}>{watch(`parts.${index}.name`)}</Th>
                          <td>{watch(`parts.${index}.code`)}</td>
                          <td>{Round(watch(`parts.${index}.quantity`),2)}</td>
                          {!WindingList.range.includes(val.name)?<Cell></Cell>
                          :<td>{Round(watch(`parts.${index}.range`),2)}</td>}
                          {!WindingList.thickness.includes(val.name)?<Cell></Cell>
                          :<td>{Round(watch(`parts.${index}.thickness`),2)}</td>}
                          {!WindingList.length.includes(val.name)?<Cell></Cell>
                          :<td>{Round(watch(`parts.${index}.length`),2)}</td>}
                          {!WindingList.weight.includes(val.name)?<Cell></Cell>
                          :<td>{Round(watch(`parts.${index}.weight`),3)}</td>}
                          {!WindingList.area.includes(val.name)?<Cell></Cell>
                          :<td>{Round(watch(`parts.${index}.area`),2)}</td>}
                          {!WindingList.capacitance.includes(val.name)?<Cell></Cell>
                          :<td>{watch(`parts.${index}.capacitance`)}</td>}
                          {!WindingList.cost.includes(val.name)?<Cell></Cell>
                          :<td>{Round(watch(`parts.${index}.cost`),2)}</td>}
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

                          <td>{watch(`parts.${index}.code`)}</td>
                          {!Weight_BZI.includes(val.name)?
                          <td>個数{Round(watch(`parts.${index}.quantity`),1)}個</td>:
                          <td>重量{Round(watch(`parts.${index}.weight`),1)}g</td>}
                          
                          {val.name === '電解液'?<td colSpan={6}>{watch(`impregnation_comment`)}</td>:<Cell colSpan={6}></Cell>}
                          <td>{Round(watch(`parts.${index}.cost`),1)}</td>
                        </tr>
                    )
                  }
                  return ""
                }):<></>}
                <tr key={"部材(チューブ類)項目"}>
                  <Th Flg={watch(`parts_Error`) !== undefined}>部材材料</Th>
                  <th>部材コード</th>
                  <th>数量</th>
                  <th>折径 mm</th>
                  <th>厚み mm</th>
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
                        <td>{watch(`parts.${index}.code`)}</td>
                          
                        <td>{Round(watch(`parts.${index}.quantity`),2)}</td>

                        {TubeList.fold_diameter.includes(val.name)?<td>{Round(watch(`parts.${index}.fold_diameter`),2)}</td>
                        :<Cell></Cell>}
                        {TubeList.thickness.includes(val.name)?<td>{Round(watch(`parts.${index}.thickness`),3)}</td>
                        :<Cell></Cell>}
                        {TubeList.length.includes(val.name)?<td>{Round(watch(`parts.${index}.length`),4)}</td>
                        :<Cell></Cell>}
                        {TubeList.color.includes(val.name)?
                        <td>
                            {colorList.map((val:any)=>{
                              if(val.value[0] === watch(`parts.${index}.color.0`) && val.value[1] === watch(`parts.${index}.color.1`) && val.value[2] === watch(`parts.${index}.color.2`)){
                                return val.label
                              }
                              return ""
                            })}
                        </td>:<Cell></Cell>}
                        {TubeList.text_color.includes(val.name)?
                        <td>
                            {colorList.map((val:any)=>{
                              if(val.value[0] === watch(`parts.${index}.text_color.0`) && val.value[1] === watch(`parts.${index}.text_color.1`) && val.value[2] === watch(`parts.${index}.text_color.2`)){
                                return val.label
                              }
                              return ""
                            })}
                        </td>:<Cell></Cell>}
                        {TubeList.material_properties.includes(val.name)?<td>{val.material_properties}</td>:<Cell></Cell>}
                        <td>{Round(watch(`parts.${index}.cost`),1)}</td>
                      </tr>
                    )
                  }
                  return ""
                }):<></>}
                <tr key={"チューブ画像と表示する文字、数字,仕上、封入指導票項目"}>
                    <Th Flg={watch(`pic_Error`) !== undefined} colSpan={6}>
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
                    <td colSpan={6}>
                      <div>
                        {Pict}
                      </div>
                    </td>
                    <td colSpan={2}>{watch(`inclusion_guid`)}</td>
                    <td colSpan={2}>{watch(`finish_guid`)}</td>
                </tr>
                <tr key={"エージング情報と加工情報"}>
                    <th rowSpan={(watch(`parts`)?watch(`parts`).filter((val:any)=> val && AgingList.includes(val.name)).length:0)+3}>エlジング{/*縦書きだとエージングに見えるように*/}</th>
                    <Th Flg={watch(`aging_voltage_Error`) !== undefined}>印加電圧 V</Th>
                    {watch(`Product.breed`)=== '電気二重層コンデンサ'?
                    <Th Flg={watch(`aging_time_Error`) !== undefined}>エージング時間 hour</Th>:
                    <Th Flg={watch(`aging_current_Error`) !== undefined}>エージング最終電流 mA</Th>}
                    <Th Flg={watch(`aging_temperature_Error`) !== undefined}>温度 ℃</Th>
                    <th colSpan={8}>エージングコメント</th>
                </tr>
                <tr key={"エージング情報と加工情報データ"}>
                    <td>{watch(`aging_voltage`)}</td>
                    <td>{watch(`Product.breed`)=== '電気二重層コンデンサ'?watch(`aging_time`):watch(`aging_current`)}</td>
                    <td>{watch(`aging_temperature`)}</td>
                    <td colSpan={8}>{watch(`aging_comment`)}</td>
                </tr>
                <tr key={"エージング部材(梱包箱)"}>
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
                        <td>{watch(`parts.${index}.code`)}</td>
                        <td>{Round(watch(`parts.${index}.quantity`),2)}</td>
                        <Cell colSpan={6}></Cell>
                        <td>{Round(watch(`parts.${index}.cost`),1)}</td>
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
                  <td colSpan={4}>{watch(`Machining.description`)}</td>
                  <td colSpan={3}>{watch(`Machining.code`)}</td>
                  <td colSpan={4}>{watch(`Machining.guid`)}</td>
                </tr>
              </tbody>
            </table>
          </Pdf>
        </div>
        <SpeedDial ariaLabel='test' style={{position: "fixed", bottom: 25,right: 45}} icon={<SpeedDialIcon />} >
          {speed?speed.map((action:any)=>(
            <SpeedDialAction
                key={action.name}
                icon={action.icon}
                tooltipTitle={action.name}
                tooltipOpen
                onClick={action.onclick}
              />
          )):<></>}
        </SpeedDial>
        <div>
          <IconButton onClick={pdhDownloadHandler}>
            <SavingsIcon />
          </IconButton>
        </div>
      </Dialog>
    </div>
    );
};

