import TextField from '@mui/material/TextField';
import '../style.css';
export const InputForm = (INP:any) => {
  const handleUpClick = (data:any) => {
    INP.setValue(INP.SET,data.toUpperCase());
  }
  const hadleClick = (data:any) => {
    if(INP.Type ==="number"){
      INP.setValue(INP.SET,parseFloat(data));
    }
    else{
      INP.setValue(INP.SET,data);
    }
  }
  return(
    <section>
      <label>{INP.Label+":"+INP.End}{(INP.Button?INP.Button:"")}</label>
      {INP.disabled?
      <TextField type={INP.Type} disabled value={INP.watch(INP.SET)?INP.watch(INP.SET):""} onChange={(e)=>hadleClick(e.target.value)} className='df'/>:
      INP.alf?
      <TextField type={INP.Type} value={INP.watch(INP.SET)?INP.watch(INP.SET):""} onChange={(e)=>handleUpClick(e.target.value)} className='df'/>:
      <TextField type={INP.Type} value={INP.watch(INP.SET)?INP.watch(INP.SET):""} onChange={(e)=>hadleClick(e.target.value)} className='df'/>
      }
    </section>
  )
}