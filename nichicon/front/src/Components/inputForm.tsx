import TextField from '@mui/material/TextField';
import {Hollow} from './func';
import '../style.css';
export const InputForm = (INP:any) => {
  const hadleClick = (data:any) => {
    if(INP.Type ==="number"){
      INP.setValue(INP.SET,parseFloat(data));
    }
    else if(INP.alf){
      INP.setValue(INP.SET,data.toUpperCase());
    }
    else{
      INP.setValue(INP.SET,data);
    }
  }
  
  return(
      <section>
        <div className='yoko'>
          <label style={{lineHeight: "2",textAlign:"left",display:"block",marginBottom:"5px",marginRight:"20px",marginTop:"5px",fontSize:"16px"}}>
            {INP.Label+":"+(Hollow(INP.watch(INP.SET))?
            INP.digit?INP.watch(INP.SET)*INP.digit:INP.watch(INP.SET)
            :"")+INP.End}
          </label>
          {(INP.Button?INP.Button:"")}
        </div>
        <TextField type={INP.Type} disabled={INP.disabled?true:false}
         value={Hollow(INP.watch(INP.SET))?INP.watch(INP.SET):""}
         onChange={(e)=>hadleClick(e.target.value)}
         className={INP.class?INP.class:'df'}
        />

        <h4 className='Error'>{INP.error?INP.error:""}</h4>
      </section>
  )
}