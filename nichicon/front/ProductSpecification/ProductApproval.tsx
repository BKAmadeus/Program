//material-uiコンポーネント
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';

//CSS関係
import styled from "styled-components";
//PDF関係
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
//アイコン
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import SavingsIcon from '@mui/icons-material/Savings';
//reactのフォーム入力一斉送信用
import { SubmitHandler, useForm } from 'react-hook-form';
import * as func from "../Components/func";
import { Reset,DataSetCalculation,DataSet } from '../Components/ProductSelect';
import { CreatePicture } from '../Components/CreatePicter';
import  { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ports,col,colorList,re2,Weight_BZI,init_BZI,VerificationList,ApprovalList,ApprovalList2,AllAuthorityList } from "../Data/Data"
import { WindingList,TubeList,AgingList } from '../Data/Data';
import type { FormProps } from "../Data/Data";
import { AuthUserContext } from '../Data/SharedVariable';
import { Header } from "../Components/Header";

var scrollsize = 5
//var As:any
const Specification = styled.div`
  display: grid;
  grid-template-columns: 400px 350px 350px 750px; /* 幅5等分 */
  grid-template-rows: 500px 1fr 1fr; /* 100pxの2行 */
  grid-gap: 10px; /* 隙間10px */
  margin-bottom: 20px;
  .list {
      grid-column: 1; /* 列開始位置2(の始端)/終了位置4(の始端) */
      grid-row: 1; /* 行開始位置1(の始端) */
      border: solid 3px #555555;
  }
  .select {
      grid-column: 2; /* 列開始位置2(の始端)/終了位置4(の始端) */
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
  .workflow {
    grid-row: 3;
    grid-column: 1/4;
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

export const ProductApproval = () => {
  const [scroll,setScroll] = useState(0);
  const [state,setState] = useState(2);
  const [tables,setTables] = useState<any>();
  const [DataList,setDataList] = useState([]);
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
    console.log("submit:",{flg:8,data:data,UserData:UserData,state:state,permit:true});
    func.postData({flg:8,data:data,UserData:UserData,state:state,permit:true});
    navigate('/');
  };
  const Submit2: SubmitHandler<FormProps> = data => {
    console.log("submit:",{flg:8,data:data,UserData:UserData,state:state,permit:false});
    func.postData({flg:8,data:data,UserData:UserData,state:state,permit:false});
    navigate('/');
  };

  
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

  const handleSearchClick = (data:any) => {
    if(data){
      var post = {flg:5,Product:data,tables:tables,state:state};
      Reset(setValue,reset,resetField,watch);
      setValue(`CheckCode`,data.code);
      setValue(`CheckDessign`,data.dessign);
      Rerender(!rerender);
      func.postData(post).then((Data:any) => {
        console.log("データ",{data:data,Data:Data});
        DataSet(Data,data,setValue);
      })
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

  const handleState = (event: any) => {
    if([1,2].includes(parseInt(event.target.value))){
      Reset(setValue,reset,resetField,watch);
    }
    setState(parseFloat(event.target.value));
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
      <Header Label={"仕様書承認画面"}
        Button1={
          <Button autoFocus sx={{ width: 120 }} color="secondary" variant="contained" onClick={() => Reset(setValue,reset,resetField,watch)}>
           reset
          </Button>
        }
        Button2={
          <Button variant="contained" disabled={!(UserData && UserData.product_authority)} color="error" onClick={handleSubmit(handleCheckClick)}>データチェック</Button>
        }
        Button3={
          <IconButton onClick={pdhDownloadHandler}>
            <SavingsIcon/>
          </IconButton>
        }
        Text={watch(`Product.code`) && watch(`dessign`)?"品番="+watch(`Product.code`)+",設番="+watch(`dessign`):undefined}
      />
      
      <Dialog open={!submit} onClose={()=>setSubmit(true)}>
        <DialogTitle>品番{watch(`Product.code`)}を{state === 2?"照査":state===1?"承認":"引き上げ承認"}しますか？</DialogTitle>
        <p>{state === 2?"照査":state===1?"承認":"引き上げ承認"}時のコメントがある場合ここに書き込んでください。</p>
        <TextField multiline {...register(`autor_comment`)} className='df2' rows={2}/>
        <div className='two'>
          <Button sx={{ width: 250 }} color="success" variant="contained" onClick={handleSubmit(Submit)}>
            登録
          </Button>
          <Button sx={{ width: 250 }} color="error" variant="contained" onClick={handleSubmit(Submit2)}>
            棄却
          </Button>
        </div>
      </Dialog>
      {UserData && (((VerificationList.includes(UserData.post) || ApprovalList.includes(UserData.post)) && UserData.affiliations === '設計課') || (ApprovalList2.includes(UserData.post)) || AllAuthorityList.includes(UserData.post))?
      <Specification>
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
          <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper', position: 'relative', overflow: 'auto', maxHeight: 800, '& ul': { padding: 0 } }} subheader={<li />}>
            {DataList?DataList.filter((val:any)=>parseInt(val.available) === Math.ceil(state)).map((val:any,index:number) => {
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
        <div className='select'>
            <RadioGroup onChange={handleState} defaultValue={2}>
                {UserData && ((VerificationList.includes(UserData.post) && UserData.affiliations === '設計課') || AllAuthorityList.includes(UserData.post))?<FormControlLabel value={2} control={<Radio />} label="照査" sx={{ '& .MuiSvgIcon-root': { fontSize: 40 } }}/>:<></>}
                {UserData && ((ApprovalList.includes(UserData.post) && UserData.affiliations === '設計課') || ApprovalList2.includes(UserData.post) || AllAuthorityList.includes(UserData.post))?<FormControlLabel value={1} control={<Radio />} label="承認" sx={{ '& .MuiSvgIcon-root': { fontSize: 40 } }}/>:<></>}
                {UserData && ((ApprovalList.includes(UserData.post) && UserData.affiliations === '設計課') || ApprovalList2.includes(UserData.post) || AllAuthorityList.includes(UserData.post))?<FormControlLabel value={1.5} control={<Radio />} label="引き上げ承認" sx={{ '& .MuiSvgIcon-root': { fontSize: 40 } }}/>:<></>}
            </RadioGroup>

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
          <table className={"Table"}>
            <tbody key={"body"}>
              <tr key={"備考、付属情報"} className="row0">
                  <th className="row0" rowSpan={5}>
                      規格{<br/>}・品番
                  </th>
                  <Th Flg={watch(`Product.error`) !== undefined} className="row1">品番 </Th>
                  <Th Flg={watch(`dessign_Error`) !== undefined} className="row1">設番リスト</Th>
                  <Th Flg={watch(`search_number_Error`) !== undefined} className="row2">手配No</Th>
                  <Th className="row1" Flg={watch(`Assembly.error`) !== undefined}>組立形式</Th>
                  <th colSpan={3} className="row3">納入先</th>
                  <Th Flg={watch(`size_Error`) !== undefined || watch(`diameter_Error`) !== undefined} colSpan={2} className="row2">公称 φ径</Th>
                  <Th Flg={watch(`l_dimension_Error`) !== undefined} colSpan={2} className="row2">公称 L寸</Th>
              </tr>
              <tr key={"備考、付属情報データ"}>
                  <TD>{watch(`Product.code`)}</TD>
                  <TD>{watch(`dessign`)}</TD>
                  <TD>{watch(`search_number`)}</TD>
                  <TD>{watch(`Assembly.code`)}</TD>
                  <TD colSpan={3}>{watch(`destination`)}</TD>
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
                  <TD rowSpan={2}>{watch(`Product.breed`) === '電気二重層コンデンサ'? watch(`Product.capacitance`)/(10**6) +" F": watch(`Product.capacitance`) +" μF"}</TD>
                  <TD rowSpan={2}>{watch(`Product.voltage`)} V</TD>
                  <TD rowSpan={2}>{watch(`Product.series`)}</TD>
                  <TD colSpan={2}>{watch(`Product.capacitance_tolerance_level_outside.minus`)+"% ~ "+watch(`Product.capacitance_tolerance_level_outside.plus`)+"%"}</TD>
                  <TD2 colSpan={2}>{watch(`outside_esr`)}</TD2>
                  <TD2 colSpan={2}>{watch(`outside_dcr`)}</TD2>
                  <TD colSpan={2}>{watch(`outside_leakage_current`)}</TD>
              </tr>
              <tr key={"製品スペックデータ2"}>
                  <TD colSpan={2}>{watch(`capacitance_tolerance_level_inside.minus`)+"% ~ "+watch(`capacitance_tolerance_level_inside.plus`)+"%"}</TD>
                  <TD2 colSpan={2}>{watch(`inside_esr`)}</TD2>
                  <TD2 colSpan={2}>{watch(`inside_dcr`)}</TD2>
                  <TD colSpan={2}>{watch(`inside_leakage_current`)}</TD>
              </tr>
              <tr key={"加締・巻取項目"}>
                  <th rowSpan={(watch(`parts`)?watch(`parts`).filter((val:any)=> val && WindingList.all.includes(val.name)).length:0)+3}>
                      加締{<br/>}・巻取
                  </th>
                  <Th Flg={watch(`infiltration_rate_Error`) !== undefined}>含浸率</Th>
                  <Th Flg={watch(`target_value_Error`) !== undefined}>狙い値</Th>
                  <th>裁断係数</th>
                  <Th Flg={watch(`core_diameter_Error`) !== undefined}>巻芯径</Th>
                  <Th Flg={watch(`total_thickness_correction_factor_Error`) !== undefined}>総厚み補正係数</Th>
                  <th>総厚み Σt</th>
                  <th>素子径</th>
                  <th colSpan={2}>巻取指導票</th>
                  <Th Flg={watch(`classification_Error`) !== undefined}>仕様区分</Th>
                  <Th Flg={watch(`gauge_number_Error`) !== undefined}>ゲージNo</Th>
              </tr>
              <tr key={"加締・巻取データ"}>
                  <TD>{func.Round(watch(`infiltration_rate`))} %</TD>
                  <TD>{func.Round(watch(`target_value`))}</TD>
                  <TD>{func.Round(watch(`CutoffFactor`),2)}</TD>
                  <TD>{func.Round(watch(`core_diameter`),3)}</TD>
                  <TD>{func.Round(watch(`total_thickness_correction_factor`),3)}</TD>
                  <TD>{func.Round(watch(`TotalThickness`),3)}</TD>
                  <TD>{func.Round(watch(`device_diameter`),3)}</TD>
                  <TD colSpan={2}>{watch(`winding_guid`)}</TD>
                  <TD>{watch(`classification`)}</TD>
                  <TD3 Flg={watch(`classification`)==='見積'}>{watch(`gauge_number`)}</TD3>
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
                <Th2 Flg={watch(`Anomaly`)?watch(`Anomaly`).filter((val:any)=>val.element === 'min_capacitance').length === 0:false}>箔容量 F/cm²</Th2>
                <th colSpan={2}>コスト 円</th>
              </tr>
              {watch(`parts`)?watch(`parts`).map((val:any,index:number)=>{
                if(val && WindingList.all.includes(val.name)){
                  return(
                    <tr key={index}>
                        <Th Flg={watch(`parts.${index}.error`) !== undefined}>{watch(`parts.${index}.name`)}</Th>
                        <TD>{watch(`parts.${index}.code`)}</TD>
                        <TD>{func.Round(watch(`parts.${index}.quantity`),2)}</TD>
                        {WindingList.range.includes(val.name)?<TD>{func.Round(watch(`parts.${index}.range`),2)}</TD>:<Cell></Cell>}
                        {WindingList.thickness.includes(val.name)?<TD>{func.Round(watch(`parts.${index}.thickness`),2)}</TD>:<Cell></Cell>}
                        {WindingList.length.includes(val.name)?<TD>{func.Round(watch(`parts.${index}.length`),2)}</TD>:<Cell></Cell>}
                        {WindingList.weight.includes(val.name)?<TD>{func.Round(watch(`parts.${index}.weight`),3)}</TD>:<Cell></Cell>}
                        {WindingList.area.includes(val.name)?<TD>{func.Round(watch(`parts.${index}.area`),2)}</TD>:<Cell></Cell>}
                        {WindingList.capacitance.includes(val.name)?<TD>{func.Round(watch(`parts.${index}.capacitance`),4)}</TD>:<Cell></Cell>}
                        {WindingList.cost.includes(val.name)?<TD2 colSpan={2}>{watch(`parts.${index}.cost`)?func.Round(watch(`parts.${index}.cost`),1):watch(`parts.${index}.cost_attention`)}</TD2>:<Cell></Cell>}
                    </tr>
                  )
                }
                return ""
              }):<></>}
              <tr key={"部材(含浸・組立・仕上)項目2"}>
                  <th rowSpan={
                    (watch(`parts`)?watch(`parts`).filter((val:any)=> val && TubeList.all.includes(val.name)).length:0)
                    + (watch(`parts`)?watch(`parts`).filter((val:any)=> val && val.name && !WindingList.all.includes(val.name) && !TubeList.all.includes(val.name)).length:0)
                    + 4} className="row0">
                      含浸{<br/>}・組立{<br/>}・仕上
                  </th>
                  <Th Flg={watch(`parts_Error`) !== undefined}>部材材料</Th>
                  <th>部材コード</th>
                  <th>数量</th>
                  <th colSpan={6}>コメント</th>
                  <th colSpan={2}>コスト</th>
              </tr>
              {watch(`parts`)?watch(`parts`).map((val:any,index:number)=>{
                if(val && val.name && !WindingList.all.includes(val.name) && !TubeList.all.includes(val.name)){
                  return(
                      <tr key={val.name}>
                        <Th Flg={watch(`parts.${index}.error`) !== undefined}>{watch(`parts.${index}.name`)}</Th>
                        <TD>{watch(`parts.${index}.code`)}</TD>
                        {!Weight_BZI.includes(val.name)?
                        <TD>{func.Round(watch(`parts.${index}.quantity`),1)}個</TD>
                        :<TD>{func.Round(watch(`parts.${index}.weight`),2)} g</TD>}
                        {val.name === '電解液'?<TD2 colSpan={6}>{watch(`impregnation_comment`)}</TD2>:
                        <Cell colSpan={6}></Cell>}
                        <TD2 colSpan={2}>{watch(`parts.${index}.cost`)}</TD2>
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
                <th>厚み μm</th>
                <th>長さ mm</th>
                <th>色</th>
                <th>文字色</th>
                <th>材質</th>
                <th colSpan={2}>コスト</th>
              </tr>
              {watch(`parts`)?watch(`parts`).map((val:any,index:any)=>{
                if(val && TubeList.all.includes(val.name)){
                  return(
                    <tr key={val.name}>
                      <Th Flg={watch(`parts.${index}.error`) !== undefined}>{watch(`parts.${index}.name`)}</Th>
                      <TD3 Flg={watch(`classification`) === '見積'}>{watch(`parts.${index}.code`)}</TD3>
                      <TD3 Flg={watch(`classification`) === '見積'}>{func.Round(watch(`parts.${index}.quantity`),2)}</TD3>
                        <TD>{func.Round(watch(`parts.${index}.fold_diameter`),2)}</TD>
                        <TD>{func.Round(watch(`parts.${index}.thickness`),3)}</TD>
                        <TD>{func.Round(watch(`parts.${index}.length`),4)}</TD> 
                        <TD>
                          {colorList.map((val:any)=>{
                            if(val.value[0] === watch(`Picture.color.0`) && val.value[1] === watch(`Picture.color.1`) && val.value[2] === watch(`Picture.color.2`)){
                              return val.label
                            }
                            return ""
                          })}
                        </TD>
                        <TD>
                          {colorList.map((val:any)=>{
                            if(val.value[0] === watch(`Picture.text_color.0`) && val.value[1] === watch(`Picture.text_color.1`) && val.value[2] === watch(`Picture.text_color.2`)){
                              return val.label
                            }
                            return ""
                          })}
                        </TD>
                      {TubeList.material_properties.includes(val.name)?<TD>{val.material_properties}</TD>:<Cell></Cell>}
                      <TD colSpan={2}>{watch(`parts.${index}.cost`)?func.Round(watch(`parts.${index}.cost`),1):watch(`parts.${index}.cost_attention`)}</TD>
                    </tr>
                  )
                }
                return ""
              }):<></>}
              <tr key={"チューブ画像と表示する文字、数字,仕上、封入指導票項目"}>
                <Th Flg={watch(`pic_Error`) !== undefined} colSpan={7}>チューブ表示</Th>
                <th colSpan={2}>封入指導票</th>
                <th colSpan={2}>仕上指導票</th>
              </tr>
              <tr key={"チューブ画像と表示する文字、数字,仕上、封入指導票データ"}>
                  <td colSpan={7}>
                    <div>
                      {Pict}
                    </div>
                  </td>
                  <TD colSpan={2}>{watch(`inclusion_guid`)}</TD>
                  <TD colSpan={2}>{watch(`finish_guid`)}</TD>
              </tr>
              <tr key={"エージング情報と加工情報"}>
                <th rowSpan={(watch(`parts`)?watch(`parts`).filter((val:any)=> val && AgingList.includes(val.name)).length:0)+3}>エlジング{/*縦書きだとエージングに見えるように*/}</th>
                <Th Flg={watch(`aging_voltage_Error`) !== undefined}>印加電圧 V</Th>
                <Th Flg={watch(`aging_time_Error`) !== undefined}>エージング時間 hour</Th>
                <Th Flg={watch(`aging_temperature_Error`) !== undefined}>温度 ℃</Th>
                <th colSpan={8}>エージングコメント</th>
              </tr>
              <tr key={"エージング情報と加工情報データ"}>
                <TD>{watch(`aging_voltage`)}</TD>
                <TD>{watch(`aging_time`)}</TD>
                <TD>{watch(`aging_temperature`)}</TD>
                <TD colSpan={8}>{watch(`aging_comment`)}
                </TD>
              </tr>
              <tr key={"エージング部材(梱包箱)"}>
                <Th Flg={watch(`parts_Error`) !== undefined}>部材材料</Th>
                <th>部材コード</th>
                <th>梱包数</th>
                <th colSpan={6}></th>
                <th colSpan={2}>コスト</th>
              </tr>
              {watch(`parts`)?watch(`parts`).map((val:any,index:number)=>{
                if(val && AgingList.includes(val.name)){
                  return (
                    <tr key={index}>
                      <th>{val.name}</th>
                        <TD3 Flg={watch(`classification`) === '見積'}>{watch(`parts.${index}.code`)}</TD3>
                        <TD3 Flg={watch(`classification`) === '見積'}>{func.Round(watch(`parts.${index}.quantity`),2)}</TD3>
                        <Cell colSpan={6}></Cell>
                        <TD2 colSpan={2}>{func.Round(watch(`parts.${index}.cost`),1)}</TD2>
                    </tr>
                  )
                }
                return ""
              }):<></>}
              <tr key={"加工情報"}>
                <th className="row0" rowSpan={2}>二次加工</th>
                <th colSpan={4}>加工方法</th>
                <th colSpan={3}>二次加工コード</th>
                <th colSpan={4}>二次加工指導票No.</th>
              </tr>
              <tr key={"加工情報データ"}>
                <TD2 colSpan={4}>{watch(`MachiningMethod`)}</TD2>
                <TD2 colSpan={3}>{watch(`MachiningCode`)}</TD2>
                <TD2 colSpan={4}>{watch(`machining_guid`)}</TD2>
              </tr>
            </tbody>
          </table>
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
      </Specification>
      :<Title>権利者がログインしないと使えない</Title>}
    </div>
    );
};
