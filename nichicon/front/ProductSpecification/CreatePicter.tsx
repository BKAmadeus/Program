import { InputForm } from '../Components/inputForm';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { col } from '../Data/Data'

export const CreatePicture = (CP:any) => {
  var Pict:any[] = [];
  var Data:any[] = [];
  var TextColorStyle:any = {};
  var ColorStyle:any = {};
  var SokoStyle:any = {};
  var SokoTextStyle:any = {};
  SokoStyle.background = "rgb("+String(CP.watch(`Element.25.color.0`))+","+String(CP.watch(`Element.25.color.1`))+", "+String(CP.watch(`Element.25.color.2`))+")";
  SokoTextStyle.color = "rgb("+String(CP.watch(`Element.25.text_color.0`))+","+String(CP.watch(`Element.25.text_color.1`))+", "+String(CP.watch(`Element.25.text_color.2`))+")";
  ColorStyle.background = "rgb("+String(CP.watch(`Element.22.color.0`))+","+String(CP.watch(`Element.22.color.1`))+", "+String(CP.watch(`Element.22.color.2`))+")";
  TextColorStyle.color = "rgb("+String(CP.watch(`Element.22.text_color.0`))+","+String(CP.watch(`Element.22.text_color.1`))+", "+String(CP.watch(`Element.22.text_color.2`))+")";
  if(CP.watch(`Type`) !== 'tr'){
    ColorStyle.transform = "rotate(0.75turn)"
  }
  else{
    ColorStyle.transform = "rotate(0turn)"
  }
  if(CP.watchPicSelect){
    var Count:number = 0;
    var flg:number = 0;
    for(var row2 of col){
      for(var row of CP.watchPicSelect){
        if(row === row2.label){
          //CP.SetValue(`Element.22.display.${Count}.name`, row2.label);
          if(row.includes('文字')){
            flg = 1;
            Pict.push(
            <div className='three' key={Count}>
              <InputForm Label={row2.label+":上"} SET={`Element.22.display.${Count}.vertical`} Type={"number"} End={""} register={CP.register} disabled={false}/>
              <InputForm Label={"左"} SET={`Element.22.display.${Count}.horizon`} Type={"number"} End={""} register={CP.register} disabled={false}/>
              <InputForm Label={"文字列"} SET={`Element.22.display.${Count}.before`} Type={"text"} End={""} register={CP.register} disabled={false}/>
            </div>
            );
            var code = CP.watch(`Element.22.display.${Count}.before`);
          }
          else{
            flg = 1;
            Pict.push(
                <div className='four' key={Count}>
                  <InputForm Label={row2.label+":上"} SET={`Element.22.display.${Count}.vertical`} Type={"number"} End={""} register={CP.register} disabled={false}/>
                  <InputForm Label={"左"} SET={`Element.22.display.${Count}.horizon`} Type={"number"} End={""} register={CP.register} disabled={false}/>
                  <InputForm Label={"前文"} SET={`Element.22.display.${Count}.before`} Type={"text"} End={""} register={CP.register} disabled={false}/>
                  <InputForm Label={"追加文"} SET={`Element.22.display.${Count}.after`} Type={"text"} End={""} register={CP.register} disabled={false}/>
                </div>
            );
            var Code = String(!(row === 'シリーズ' && CP.watch(row2.code))?
            !(row === '容量許容差' && CP.watch(row2.code))?CP.watch(row2.code):CP.watch(row2.code).slice(8,22):CP.watch(row2.code).slice(1,3))
            Code = String(row === '静電容量' && CP.watch(`CapacitorType`) === "電気二重層コンデンサ"?parseFloat(Code)/(10**6):Code)
            code = (CP.watch(`Element.22.display.${Count}.before`)? CP.watch(`Element.22.display.${Count}.before`):"")+Code+(CP.watch(`Element.22.display.${Count}.after`)?CP.watch(`Element.22.display.${Count}.after`):"");
          }
          Data.push(
          <p key={Count} style={
            {
              top:String(CP.watch(`Element.22.display.${Count}.vertical`))+"px",
              left:String(CP.watch(`Element.22.display.${Count}.horizon`))+"px",
              color:"rgb("+String(CP.watch(`Element.22.text_color.0`))+","+String(CP.watch(`Element.22.text_color.1`))+", "+String(CP.watch(`Element.22.text_color.2`))+")"
            }}>
            {code}
          </p>
          );
        };
      };
      if(flg === 0){
        CP.resetField(`Element.22.display.${Count}`);
      }
      Count = Count + 1;
    };
  };
  return(
  <div>
    <div>
      <div className='tube'>
        <div className='box' style={{
          width:CP.watch(`widthPic`),
          height:CP.watch(`widthPic`),
          alignItems: "center",
          justifyContent: "center"
        }}>
          {CP.watch(`ViewPic`) !== undefined?(
            <img src={`data:image/jpeg;base64,${CP.watch(`ViewPic`)}`} id="img" alt="" style={{
            transform: "rotate("+String(CP.watch(`Transform`)/360)+"turn)"
            }}/>
          ):(<></>)}
          {Data}
        </div>
        <p>
        {CP.watch(`Type`) !== 'tr'? "端子方向":"リード方向"}
        <ArrowUpwardIcon style={{
          transform: "rotate("+String(CP.watch(`Transform`)/360)+"turn)"
        }}/>
        </p>
        <div className='flexbox' style={ColorStyle}>
          <p style={TextColorStyle}>{CP.watch(`Element.22.back1`)}</p>
          <p style={TextColorStyle}>{CP.watch(`Element.22.back2`)}</p>
          <p style={TextColorStyle}>{CP.watch(`Element.22.back3`)}</p>
        </div>
        {CP.watch(`Element.25.code`)?
        <span className='soko_circle' style={SokoStyle}>
        {CP.watch(`Element.25.soko_display`)?
        <p className='soko_circle' style={SokoTextStyle}>
          EIA日付(底板刻印)
        </p>
        :<></>};
        </span>
        :<></>}
      </div>
      {CP.flg === 0? "":Pict}
    </div>
  </div>
  );
}