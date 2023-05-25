//material-uiコンポーネント
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import FormLabel from '@mui/material/FormLabel';

//時間処理
import { format } from "date-fns";
//CSS関係
import styled from "styled-components";
import '../style.css';
//reactのフォーム入力一斉送信用
import { SubmitHandler, useForm } from 'react-hook-form';
import * as func from "../Components/func";
import { Reset,DataSetCalculation, DataSetConstant } from '../Components/ProductSelect';
import { CreatePicture } from '../Components/CreatePicter';
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { col,orientation,colorList,TubeIndex,SokoIndex } from "../Data/Data"
import { InputForm } from '../Components/inputForm';
//import {WindingList,TubeList} from "../Data/Data";
import type { FormProps } from "../Data/Data"
import { AuthUserContext } from '../Data/SharedVariable';
import { Header } from "../Components/Header";
const CT = styled.div`
  display: grid;
  grid-template-columns: 350px 1fr;
  grid-template-rows: 260px 240px 600px 1fr;
  grid-gap: 10px; /* 隙間10px */
  margin-bottom: 20px;
  .input {
      grid-column: 1; /* 列開始位置2(の始端)/終了位置4(の始端) */
      grid-row: 1; /* 行開始位置1(の始端) */
      border: solid 3px #555555;
  }
  .select {
      display: flex;
      grid-column: 1; /* 列開始位置2(の始端)/終了位置4(の始端) */
      grid-row: 2; /* 行開始位置1(の始端) */
      border: solid 3px #555555;
  }
  .list {
      grid-column: 1; /* 列開始位置2(の始端)/終了位置4(の始端) */
      grid-row: 3; /* 行開始位置1(の始端) */
      border: solid 3px #555555;
  }
  .box {
      grid-column: 2; /* 列開始位置2(の始端)/終了位置4(の始端) */
      grid-row: 1/4; /* 行開始位置1(の始端) */
      .approver{
        position: absolute;
        display:grid;
        left: 820px;
        grid-template-columns: 220px 220px 220px;
      }
      .display{
        border: solid 3px #555555;
      }
  }
`;
const Cell = styled.td`
  background-image: linear-gradient(to right top, transparent calc(50% - 0.5px), #999 50%, #999 calc(50% + 0.5px), transparent calc(50% + 1px));
`;
const Title = styled.h1`
  margin : 60px;
  vertical-align: middle;
  text-align:top;
  height: 100px;
  font-size:60px;
`;
const Th = styled.th<{ Flg: boolean }>`
  background-color: ${props => props.Flg ? "red" : "silver"};
  color: ${props => props.Flg ? "white" : "black"};
`;
export const CreateTube = () =>{
    const [state,setState] = useState(0);
    const [Pict,setPict] = useState<any>();
    const [rerender,Rerender] = useState<boolean>(false);
    const [TubeCode,setTubeCode] = useState<boolean>(false);
    const [tables,setTables] = useState<any>();
    const { register, watch, handleSubmit, reset, resetField, setValue } = useForm<FormProps>();
    const [submit,setSubmit] = useState<boolean>(true);
    const [Incomplete,setIncomplete] = useState(0);
    const navigate = useNavigate();
    const watchPicSelect = watch("PictureSelect");
    const UserName = watch(`approval`);
    const UserData = useContext(AuthUserContext);

    const Submit: SubmitHandler<FormProps> = data => {
      console.log("submit:",data);
      func.postData({flg:"TubeSubmit",data:data,UserData:UserData,state:state});
      navigate('/');
    };

    const CheckTube: SubmitHandler<FormProps> = data =>{
      func.postData({flg:"TubeCheck",data:data,UserData:UserData,state:state})
      .then((Data:any)=>{
        setSubmit(Data.flg);
        DataSetCalculation(Data,setValue,watch);
      })
    }
    
    const handleListSelect = (Data:any) =>{
      if(Data){
        func.postData({flg:"TubeList",data:Data,Tube:watch(`parts.${TubeIndex}`)})
        .then((data:any) => {
          DataSetCalculation(data,setValue,watch);
          DataSetConstant(Data,setValue);
          Rerender(!rerender);
        })
      }
    }

    const handlePartsChange = (SET:any) => {
      var data:any = tables['ge'].table.filter((val:any)=>watch(SET) === val.code);
      var test ={}
      if(data.length !== 0){
        setTubeCode(false);
        data = data[0];
        data.name = '外チューブ';
        test["parts"] = [data];
        console.log("parts",data);
        DataSetCalculation(test,setValue,watch);
        var DATA = tables['display'].table.filter((val:any)=>val.code === data.display_code);
        handleListSelect(DATA[0]);
        Rerender(!rerender);
      }
      else{
        setTubeCode(true);
      }
    }

    const handleColorChange = () => {
      const Data = {flg:9,Pic:watch(`Picture.SetPic`),color:watch(`parts.${TubeIndex}.color`),text_color:watch(`parts.${TubeIndex}.text_color`)};
      func.postData(Data)
      .then((data:any) => {
        setValue(`Picture.ViewPic`,data.data);
        setValue(`Picture.width`,data.width);
        setValue(`Picture.height`,data.height);
      });
  }

    const handleNewPic = (data:any) => {
      const imageUrl = URL.createObjectURL(data.target.files[0]);
      toBase64Url(imageUrl, function(base64Url:any){
        setValue(`Picture.SetPic`,base64Url);
        handleColorChange();
      });
    }

    const handleState = (event: any) => {
      setState(parseInt(event.target.value));
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
            UserName.map((val2:any,index:number)=>{
              data.map((val:any)=>{
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
    },[UserName,rerender])

    useEffect(() => {
      func.postData({flg:1,select:[{value:'display', label:'チューブ表示'},
                                   {value:'ge',label:'チューブデータ'}]})
      .then((data:any) => {
        console.log("初期データ",data);
        setTables(data);
      });
      setValue(`parts.${TubeIndex}.color`,[0,0,0]);
      setValue(`parts.${TubeIndex}.text_color`,[200,200,200]);
      setValue(`Picture.display.0.before`,'nichicon');
      setValue(`PictureSelect`,['文字1']);
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
                <Button variant="contained" disabled={!(UserData && UserData.product_authority)} color="error" onClick={handleSubmit(CheckTube)}>データチェック</Button>
              }
            />
            <Dialog open={!submit} onClose={()=>setSubmit(true)}>
              <DialogTitle>チューブ画像を{state === 3?"登録":"改訂"}しますか？</DialogTitle>
              <p>チューブ画像用のコメントがある場合ここに書き込んでください。</p>
              <TextField multiline {...register(`autor_comment`)} className='df2' rows={2}/>
              <div className='two'>
                <Button sx={{ width: 250 }} color="success" variant="contained" onClick={handleSubmit(Submit)}>
                  {state === 3?"登録":"改訂"}
                </Button>
                <Button sx={{ width: 250 }} color="error" variant="contained" onClick={()=>setSubmit(true)}>
                  キャンセル
                </Button>
              </div>
            </Dialog>
            <CT>
              <div className='input'>
                <InputForm Label={"チューブコード"} SET={`parts.${TubeIndex}.code`} Type={"text"} End={""} setValue={setValue} alf={true} watch={watch} Button={<Button variant="contained" onClick={()=>handlePartsChange(`parts.${TubeIndex}.code`)}>チューブチェック</Button>}/>
                {TubeCode?<h4 className='loginError'>
                  そのチューブコードは存在しません
                </h4>:<></>}
              
              </div>
              <div className='select'>
                <div>
                  <FormLabel>リスト表示選択</FormLabel>
                  <RadioGroup onChange={handleState} defaultValue={0}>
                    <FormControlLabel value={0} control={<Radio />} label="閲覧" sx={{ '& .MuiSvgIcon-root': { fontSize: 40 } }}/>
                    {UserData && UserData.product_authority?<FormControlLabel value={3} control={<Radio />} label="作成" sx={{ '& .MuiSvgIcon-root': { fontSize: 40 } }}/>:<></>}
                    {UserData && UserData.product_authority?<FormControlLabel value={4} control={<Radio />} label="改訂" sx={{ '& .MuiSvgIcon-root': { fontSize: 40 } }}/>:<></>}
                  </RadioGroup>
                </div>
                <div>
                  <FormLabel>リスト表示選択</FormLabel>
                  <RadioGroup onChange={(e)=>{setIncomplete(parseInt(e.target.value))}} defaultValue={0}>
                    <FormControlLabel value={0} control={<Radio />} label="使用可能のみ" sx={{ '& .MuiSvgIcon-root': { fontSize: 40 } }}/>
                    <FormControlLabel value={1} control={<Radio />} label="未承認" sx={{ '& .MuiSvgIcon-root': { fontSize: 40 } }}/>
                    <FormControlLabel value={2} control={<Radio />} label="本人作成棄却物" sx={{ '& .MuiSvgIcon-root': { fontSize: 40 } }}/>
                  </RadioGroup>
                </div>
              </div>
              <div className='list'>
                <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper', position: 'relative', overflow: 'auto', maxHeight: 500, '& ul': { padding: 0 } }} subheader={<li />}>
                  {tables && tables['display'].table?(Incomplete === 0?tables['display'].table.filter((val:any)=>parseInt(val.available) === 0)
                  :Incomplete === 1?tables['display'].table.filter((val:any)=>parseInt(val.available) > 0)
                  :tables['display'].table.filter((val:any)=>parseInt(val.available) === -2 && UserData && UserData.code === val.approval[0].code)
                  ).map((val:any,index:number)=>{
                    return(
                      <li key={index}>
                        <ul>
                          <ListItem disablePadding className={watch(`Picture.code`) === val.code?"checklist":""}>
                            <ListItemButton onClick={(_)=>{handleListSelect(val)}}>{val.code}:{val.description}</ListItemButton>
                          </ListItem>
                        </ul>
                      </li>
                    )
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
                          {watch(`approval.${index}.days`)?format(new Date(watch(`approval.${index}.days`)),"yyyy年MM月dd日"):""}
                        </span>
                      )
                    }
                    return <span className='HankoCircle' key={index}></span>
                  })}
                </div>
                <Title>チューブ作成</Title>
                <div>
                  <table>
                    <tbody>
                      <tr>
                        <Th Flg={watch(`Picture.SetPic_error`) !== undefined || watch(`Picture.ViewPic_error`) !== undefined} colSpan={6}>
                          表示
                        </Th>
                      </tr>
                      <tr>
                        <td colSpan={6}>
                          <div>
                            {Pict}
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <th colSpan={2}>画像処理反映ボタン</th>
                        <th colSpan={2}>新規画像アップロード</th>
                        <th>底板色</th>
                        <th>文字、線の色</th>
                      </tr>
                      <tr>
                        <td colSpan={2}><Button variant="contained" onClick={()=>{Rerender(!rerender)}}>反映</Button></td>
                        <td colSpan={2}>
                          <Button variant="contained" color="warning" component="label">
                            Upload
                            <input hidden accept="image/*" type="file" onChange={handleNewPic}/>
                          </Button>
                        </td>
                        <td>{colorList.map((val:any)=>
                        {
                          if(val.value[0] === watch(`parts.${SokoIndex}.color.0`) && val.value[1] === watch(`parts.${SokoIndex}.color.1`) && val.value[2] === watch(`parts.${SokoIndex}.color.2`)){
                            return val.label
                          }
                          return ""
                          })}
                          <Autocomplete options={colorList} sx={{ width: 200 }} onChange={(_, data) => data?setValue(`parts.${SokoIndex}.color`,data.value):""} renderInput={(params) => <TextField {...params} className='df2'/>}/></td>
                        <td>{colorList.map((val:any)=>
                        {
                          if(val.value[0] === watch(`parts.${SokoIndex}.text_color.0`) && val.value[1] === watch(`parts.${SokoIndex}.text_color.1`) && val.value[2] === watch(`parts.${SokoIndex}.text_color.2`)){
                            return val.label
                          }
                          return ""
                          })}
                          <Autocomplete options={colorList} sx={{ width: 200 }} onChange={(_, data) => data?setValue(`parts.${SokoIndex}.text_color`,data.value):""} renderInput={(params) => <TextField {...params} className='df2'/>}/></td>
                      </tr>
                      <tr>
                        <Th Flg={watch(`Picture.code_error`) !== undefined}>表示コード</Th>
                        <Th Flg={watch(`Picture.description_error`) !== undefined} colSpan={2}>画像説明文</Th>
                        <Th Flg={watch(`Picture.angle_error`) !== undefined}>回転角度</Th>
                        <th>チューブ色</th>
                        <th>チューブ文字、線の色</th>
                      </tr>
                      <tr>
                        <td><TextField {...register(`Picture.code`)} className='df'/></td>
                        <td colSpan={2}><TextField multiline {...register(`Picture.description`)} className='df'/></td>
                        <td>{watch(`Picture.angle`)}°<Autocomplete options={orientation} sx={{ width: 200 }} onChange={(_, data) => data? setValue(`Picture.angle`,data.value):""} renderInput={(params) => <TextField {...params} className='df'/>}/></td>
                        <td>{colorList.map((val:any)=>{
                            if(val.value[0] === watch(`parts.${TubeIndex}.color.0`) && val.value[1] === watch(`parts.${TubeIndex}.color.1`) && val.value[2] === watch(`parts.${TubeIndex}.color.2`)){
                              return val.label
                            }
                            return ""
                          })}
                          <Autocomplete options={colorList} sx={{ width: 200 }} onChange={(_, data) => {if(data){setValue(`parts.${TubeIndex}.color`,data.value);} handleColorChange()}} renderInput={(params) => <TextField {...params} className='df'/>}/></td>
                        <td>{colorList.map((val:any)=>{
                            if(val.value[0] === watch(`parts.${TubeIndex}.text_color.0`) && val.value[1] === watch(`parts.${TubeIndex}.text_color.1`) && val.value[2] === watch(`parts.${TubeIndex}.text_color.2`)){
                              return val.label
                            }
                            return ""
                          })}
                          <Autocomplete options={colorList} sx={{ width: 200 }} onChange={(_, data) => {if(data){setValue(`parts.${TubeIndex}.text_color`,data.value);} handleColorChange()}} renderInput={(params) => <TextField {...params} className='df'/>}/></td>
                      </tr>
                      <tr>
                          <th rowSpan={20}>
                            OUTリスト
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
                              {col.map((val:any,index:number)=>{
                                if(!watchPicSelect?.includes(val.label)){
                                  return(
                                    <li key={index+"test"}>
                                      <ul>
                                        <ListItem key={index}>
                                          <ListItemButton onClick={()=>{setValue(`PictureSelect`,watchPicSelect?[...watchPicSelect,val.label]:[val.label])}}>{val.label}</ListItemButton>
                                        </ListItem>
                                      </ul>
                                    </li>
                                  )
                                }
                                return ""
                              })}
                            </List>
                            INリスト
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
                              {col.map((val:any,index:number)=>{
                                if(watchPicSelect?.includes(val.label)){
                                  return(
                                    <li key={index+"test"}>
                                      <ul>
                                        <ListItem key={index}>
                                          <ListItemButton onClick={()=>{setValue(`PictureSelect`,watchPicSelect.filter((item:any)=> item !== val.label))}}>{val.label}</ListItemButton>
                                        </ListItem>
                                      </ul>
                                    </li>
                                  )
                                }
                                return ""
                              })}
                            </List>
                          </th>
                          <Th Flg={watch(`Picture.display_error`) !== undefined}>呼び名</Th>
                          <th>上</th>
                          <th>左</th>
                          <th>前文</th>
                          <th>追加文</th>
                      </tr>
                      {col?.map((val:any,index:number)=>{
                          if(watch(`PictureSelect`)?.includes(val.label)){
                            return(
                              <tr key={index}>
                                <th>{val.label}</th>
                                <td><TextField {...register(`Picture.display.${index}.vertical`)} type='number' className='df'/></td>
                                <td><TextField {...register(`Picture.display.${index}.horizon`)} type='number' className='df'/></td>
                                <td><TextField {...register(`Picture.display.${index}.before`)} className={val.label.includes('文字')?"df":"df2"}/></td>
                                {!val.label.includes('文字')?<td><TextField {...register(`Picture.display.${index}.after`)} className='df2'/></td>
                                :<Cell></Cell>}
                              </tr>
                            )
                          }
                          return ""
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </CT>
        </div>
    )
}