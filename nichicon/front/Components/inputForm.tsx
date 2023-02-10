
//import OutlinedInput from "@mui/material/OutlinedInput";
import TextField from '@mui/material/TextField';
import '../style.css';

export const InputForm = (INP:any) => {
  return(
    <section>
      <label>{INP.Label+":"+INP.End}{(INP.Button?INP.Button:"")}</label>
      {INP.disabled?
      <TextField type={INP.Type} disabled {...INP.register(INP.SET)} className='df'/>:
      <TextField type={INP.Type} {...INP.register(INP.SET)} className='df'/>
      }
      
      {/*<OutlinedInput type={INP.Type} disabled endAdornment={INP.End} value={INP.watch(INP.SET)/(10**INP.flg)} onChange={handleChange} className='df'/>*/}
    </section>
  )
}