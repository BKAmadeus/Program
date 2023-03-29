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
import { col,colorList,re2,TubeIndex,VerificationList,ApprovalList,ApprovalList2,AllAuthorityList } from "../Data/Data"
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
const TD = styled.td`
  background-color:lightblue;
`
const TD2 = styled.td`
  background-color:lightgreen;
`
const TD3 = styled.td<{ Flg: boolean }>`
  background-color:${props =>props.Flg?"lightgreen":"lightblue"};
`
export const ApprovalTube = () =>{
    const [state,setState] = useState(2);
    const [Pict,setPict] = useState<any>();
    const [DataList,setDataList] = useState<any>([]);
    const [TubeList,setTubeList] = useState<any>([]);
    const { register, watch, handleSubmit, reset, resetField, setValue } = useForm<FormProps>();
    const [submit,setSubmit] = useState<boolean>(true);
    const navigate = useNavigate();
    const watchPicSelect = watch("PictureSelect");
    const UserName = watch(`approval`);
    const UserData = useContext(AuthUserContext);
    const [rerender,Rerender] = useState<boolean>(false);

    const Submit: SubmitHandler<FormProps> = data => {
      console.log("submit:",data);
      func.postData({flg:"TubeSubmit",data:data,UserData:UserData,state:state,permit:true});
      navigate('/');
    };
    const Submit2: SubmitHandler<FormProps> = data => {
      console.log("submit:",data);
      func.postData({flg:"TubeSubmit",data:data,UserData:UserData,state:state,permit:false});
      navigate('/');
    };

    const CheckTube: SubmitHandler<FormProps> = data =>{
      func.postData({flg:"TubeCheck",data:data,UserData:UserData,state:state})
      .then((Data:any)=>{
        setSubmit(Data.flg);
        DataSetCalculation(Data,setValue);
      })
    }
    
    const handleListSelect = (Data:any) =>{
      if(Data){
        Reset(setValue,reset,resetField,watch)
        func.postData({flg:"TubeList",data:Data})
        .then((data:any) => {
          DataSetCalculation(data,setValue);
          DataSetConstant(Data,setValue);
          setValue(`id`,Data.id);
        })
      }
    }

    const handlePartsChange = (data:any,SET:any) => {
      if(data !== null){
        setValue(SET,data.code);
        var test = {};
        data.name = '外チューブ';
        test["parts"] = [data];
        DataSetCalculation(test,setValue);
      }
    }

    const handleState = (event: any) => {
      setState(parseFloat(event.target.value));
    }

    const ProductNumberCheck = () => {
      if(watch(`Product.code`)){
        func.postData({flg:"ProductNumberCheck",code:watch(`Product.code`)})
        .then((data:any) => {
          DataSetCalculation(data,setValue);
        })
      }
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
        setPict(CreatePicture(watchPicSelect,watch,resetField,register,state));
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
      func.postData({flg:1,select:[{value:'display', label:'チューブ表示'},
                                   {value:'ge',label:'チューブデータ'}]})
      .then((data:any) => {
        console.log("初期データ",data);
        setDataList(data.display.table);
        setTubeList(data.ge.table);
      });
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
                <Button variant="contained" disabled={!(UserData && UserData.product_authority)} color="error" onClick={handleSubmit(CheckTube)}>データチェック</Button>
              }
            />
            <Dialog open={!submit} onClose={()=>setSubmit(true)}>
              {!(1 <= state && state <= 2)?<DialogTitle>承認or照査を選択してください</DialogTitle>:
              <>
                <DialogTitle>チューブ画像を{state === 1?"承認":state === 2?"照査":"引き上げ承認"}しますか？</DialogTitle>
                <p>チューブ画像{state === 1?"承認":state === 2?"照査":"引き上げ承認"}時のコメントがある場合ここに書き込んでください。</p>
                <TextField multiline {...register(`autor_comment`)} className='df2' rows={2}/>
                <div className='two'>
                  <Button sx={{ width: 250 }} color="success" variant="contained" onClick={handleSubmit(Submit)}>
                    {state === 1?"承認":state === 2?"照査":"引き上げ承認"}
                  </Button>
                  <Button sx={{ width: 250 }} color="error" variant="contained" onClick={handleSubmit(Submit2)}>
                    棄却
                  </Button>
                </div>
              </>
              }
            </Dialog>
            {UserData && (((VerificationList.includes(UserData.post) || ApprovalList.includes(UserData.post)) && UserData.affiliations === '設計課') || ApprovalList2.includes(UserData.post) || AllAuthorityList.includes(UserData.post))?
            <CT>
              <div className='input'>
                <InputForm Label={"品番"} SET={"Product.code"} Type={"text"} End={""} setValue={setValue} alf={true} watch={watch} Button={<Button variant="contained" onClick={ProductNumberCheck}>品番チェック</Button>}/>
                <section>
                  <label>チューブコード</label>
                  <Autocomplete 
                    options={TubeList}
                    getOptionLabel={(option: any) => option.code}
                    onChange={(_, data) => handlePartsChange(data,`parts.${TubeIndex}.code`)}
                    renderInput={(params) => ( <TextField {...params} variant="filled" className='df'/>)}
                  />
                </section>
              </div>
              <div className='select'>
                <div>
                  <FormLabel>リスト表示選択</FormLabel>
                  <RadioGroup onChange={handleState} defaultValue={2}>
                    {UserData && ((VerificationList.includes(UserData.post) && UserData.affiliations === '設計課') || AllAuthorityList.includes(UserData.post))?<FormControlLabel value={2} control={<Radio />} label="照査" sx={{ '& .MuiSvgIcon-root': { fontSize: 40 } }}/>:<></>}
                    {UserData && ((ApprovalList.includes(UserData.post) && UserData.affiliations === '設計課') || ApprovalList2.includes(UserData.post) || AllAuthorityList.includes(UserData.post))?<FormControlLabel value={1} control={<Radio />} label="承認" sx={{ '& .MuiSvgIcon-root': { fontSize: 40 } }}/>:<></>}
                    {UserData && ((ApprovalList.includes(UserData.post) && UserData.affiliations === '設計課') || ApprovalList2.includes(UserData.post) || AllAuthorityList.includes(UserData.post))?<FormControlLabel value={1.5} control={<Radio />} label="引き上げ承認" sx={{ '& .MuiSvgIcon-root': { fontSize: 40 } }}/>:<></>}
                  </RadioGroup>
                </div>
              </div>
              <div className='list'>
                <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper', position: 'relative', overflow: 'auto', maxHeight: 500, '& ul': { padding: 0 } }} subheader={<li />}>
                  {DataList?DataList.filter((val:any)=>parseInt(val.available) === Math.ceil(state)).map((val:any,index:number)=>{
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
                          {watch(`approval.${index}.days`)?watch(`approval.${index}.days`).replace(re2,"$1年$2月$3日"):""}
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
                        <th>画像更新</th>
                        <th>底板色</th>
                        <th>文字、線の色</th>
                      </tr>
                      <tr>
                        <td><Button variant="contained" onClick={()=>{Rerender(!rerender)}}>更新</Button></td>
                        <td>{colorList.map((val:any)=>{
                          if(val.value[0] === watch(`Picture.Soko_color.0`) && val.value[1] === watch(`Picture.Soko_color.1`) && val.value[2] === watch(`Picture.Soko_color.2`)){
                            return val.label
                          }
                          return ""
                          })}
                        </td>
                        <td>{colorList.map((val:any)=>{
                          if(val.value[0] === watch(`Picture.Soko_text_color.0`) && val.value[1] === watch(`Picture.Soko_text_color.1`) && val.value[2] === watch(`Picture.Soko_text_color.2`)){
                            return val.label
                          }
                          return ""
                          })}
                        </td>
                      </tr>
                      <tr>
                        <Th Flg={watch(`Picture.code_error`) !== undefined}>表示コード</Th>
                        <Th Flg={watch(`Picture.description_error`) !== undefined} colSpan={2}>画像説明文</Th>
                        <Th Flg={watch(`Picture.angle_error`) !== undefined}>回転角度</Th>
                        <Th Flg={watch(`Picture.color_error`) !== undefined}>チューブ色</Th>
                        <Th Flg={watch(`Picture.text_color_error`) !== undefined}>チューブ文字、線の色</Th>
                      </tr>
                      <tr>
                        <td>{watch(`Picture.code`)}</td>
                        <td colSpan={2}>{watch(`Picture.description`)}</td>
                        <td>{watch(`Picture.angle`)}°</td>
                        <td>{colorList.map((val:any)=>{
                            if(val.value[0] === watch(`Picture.color.0`) && val.value[1] === watch(`Picture.color.1`) && val.value[2] === watch(`Picture.color.2`)){
                              return val.label
                            }
                            return ""
                          })}
                        </td>
                        <td>{colorList.map((val:any)=>{
                            if(val.value[0] === watch(`Picture.text_color.0`) && val.value[1] === watch(`Picture.text_color.1`) && val.value[2] === watch(`Picture.text_color.2`)){
                              return val.label
                            }
                            return ""
                          })}
                        </td>
                      </tr>
                      <tr>
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
                                <TD>{watch(`Picture.display.${index}.vertical`)}</TD>
                                <TD>{watch(`Picture.display.${index}.horizon`)}</TD>
                                <TD3 Flg={!val.label.includes('文字')}>{watch(`Picture.display.${index}.before`)}</TD3>
                                {!val.label.includes('文字')?<TD2>{watch(`Picture.display.${index}.after`)}</TD2>
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
            :<Title>権利者がログインしないと使えない</Title>}
        </div>
    )
}