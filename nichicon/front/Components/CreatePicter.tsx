import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { col,TubeIndex } from '../Data/Data'
import '../style.css'

export const CreatePicture = (watchPicSelect:string[],watch:any,resetField:any,register:any,state:number) => {
  var Data:any[] = [];
  if(watchPicSelect){
    var Count:number = 0;
    var flg:number = 0;
    for(var row2 of col){
      for(var row of watchPicSelect){
        if(row === row2.label){
          if(row.includes('文字')){
            flg = 1;
            var code = watch(`Picture.display.${Count}.before`);
          }
          else{
            flg = 1;
            var Code = String(!(row === 'シリーズ2' && watch(row2.code))?
            !(row === '容量許容差' && watch(row2.code))?watch(row2.code):watch(row2.code).slice(8,9):watch(row2.code).slice(1,3))
            Code = String(row === '静電容量' && watch(`Product.breed`) === "電気二重層コンデンサ"?parseFloat(Code)/(10**6):Code)
            code =(watch(`Picture.display.${Count}.before`)? watch(`Picture.display.${Count}.before`):"");
            code+=Code;
            code+=(watch(`Picture.display.${Count}.after`)?watch(`Picture.display.${Count}.after`):"");
          }
          Data.push(
          <p key={Count} style={
            {
              top:`${watch(`Picture.display.${Count}.vertical`)}px`,
              left:`${watch(`Picture.display.${Count}.horizon`)}px`,
              color:`rgb(${watch(`Picture.text_color.0`)},${watch(`Picture.text_color.1`)},${watch(`Picture.text_color.2`)})`
            }}>
            {code}
          </p>
          );
        };
      };
      if(flg === 0){
        resetField(`Picture.display.${Count}`);
      }
      Count = Count + 1;
    };
  };
  
  return(
  <div>
    <div className='tube'>
      <div className='tubefront' style={{
        width:watch(`Picture.width`)>watch(`Picture.height`)?watch(`Picture.width`):watch(`Picture.height`),
        height:watch(`Picture.width`)>watch(`Picture.height`)?watch(`Picture.width`):watch(`Picture.height`),
        alignItems: "center"
      }}>
        {watch(`Picture.ViewPic`) !== undefined?
          <img src={`data:image/jpeg;base64,${watch(`Picture.ViewPic`)}`} id="img" alt="" style={{
          transform: `rotate(${watch(`Picture.angle`)/360}turn)`
          }}/>
        :<></>}
        {Data}
      </div>
      <div>
        <p>
          {watch(`type`) !== 'tr'? "端子方向":"リード方向"}
          <ArrowUpwardIcon style={{
            transform: `rotate(${watch(`Picture.angle`)/360}turn)`
          }}/>
        </p>
      </div>
      <div style={{
        width:watch(`Picture.width`)>watch(`Picture.height`)?watch(`Picture.width`):watch(`Picture.height`),
        height:watch(`Picture.width`)>watch(`Picture.height`)?watch(`Picture.width`):watch(`Picture.height`),
        transform: `rotate(${watch(`type`) !== 'tr'?0.75:0}turn)`
      }}>
        <div className='tubeback' style={{
          backgroundColor:`rgb(${watch(`Picture.color.0`)},${watch(`Picture.color.1`)},${watch(`Picture.color.2`)})`
        }}>
          <p style={{color:`rgb(${watch(`Picture.text_color.0`)},${watch(`Picture.text_color.1`)},${watch(`Picture.text_color.2`)})`}}>
            {watch(`parts.${TubeIndex}.back1`)}
          </p>
          <p style={{color:`rgb(${watch(`Picture.text_color.0`)},${watch(`Picture.text_color.1`)},${watch(`Picture.text_color.2`)})`}}>
            {watch(`parts.${TubeIndex}.back2`)}
          </p>
          <p style={{color:`rgb(${watch(`Picture.text_color.0`)},${watch(`Picture.text_color.1`)},${watch(`Picture.text_color.2`)})`}}>
            {watch(`parts.${TubeIndex}.back3`)}
          </p>
        </div>
      </div>
      {watch(`parts.${TubeIndex}.soko_display`)?
      <span className='soko_circle' style={{backgroundColor:`rgb(${watch(`Picture.Soko_color.0`)},${watch(`Picture.Soko_color.1`)},${watch(`Picture.Soko_color.2`)})`}}>
      <p className='soko_circle' style={{color:`rgb(${watch(`Picture.Soko_text_color.0`)},${watch(`Picture.Soko_text_color.1`)},${watch(`Picture.Soko_text_color.2`)})`}}>
        EIA日付(底板刻印)
      </p>
      </span>
      :<></>}
    </div>
  </div>
  );
}