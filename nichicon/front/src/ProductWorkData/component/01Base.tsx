import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Checkbox from '@mui/material/Checkbox';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import * as func from "../../Components/func";
//アイコン
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
//import CatchingPokemonIcon from '@mui/icons-material/CatchingPokemon';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

//時間処理
import { format } from "date-fns";
//CSS関係
import styled from "styled-components";
import '../../style.css';

const Complete = styled.div`
  display: grid;
  grid-template-columns: 100px 200px;
  color: blue;
`

export function Base(B:any) {
    const watchBase = B.watch(`Base`);
    const watchProgress = B.watch(`progress`);
    const watchStartTime = B.watch(`StartTime`);

    const handleBase = () => {
        let date = new Date();
        if(watchBase){
            var Baseflg = true;
            for(var boo in watchBase){
                if(!watchBase[boo]){
                    Baseflg = false;
                }
            }
            if(Baseflg && watchStartTime !== undefined){
                B.setValue(`EndTime`,date);
                console.log(watchStartTime,B.watch(`EndTime`));
                var post = {flg:"WorkDataBaseCompletion",progress:1,id:B.Data.data.id,deadline:B.Data.data.deadline,
                schedule:{start_time:watchStartTime.toLocaleString(),end_time:B.watch(`EndTime`).toLocaleString(),process:0}};
                func.postData(post);
                B.setValue(`progress`,1);
                B.setValue(`StartTime`,undefined);
            }
        }
    }

    return (
        <div>
            <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    {watchProgress >= 1?
                    <Complete><Typography variant="h6">基本情報</Typography><CheckCircleIcon/></Complete>
                    :<Typography variant="h6">基本情報</Typography>}
                </AccordionSummary>
                <Button onClick={()=>{B.setValue(`StartTime`,new Date())}} disabled={watchProgress >= 1}>作業開始</Button>
                <table border={1} key={"base"}>
                    <tbody key={"body"}>
                        {/*製品情報チェック項目*/}
                        <tr>
                            <th><Checkbox {...B.register(`Base.0`)} disabled={watchProgress >= 1 || watchStartTime === undefined}/>手配No.</th>
                            <th><Checkbox {...B.register(`Base.1`)} disabled={watchProgress >= 1 || watchStartTime === undefined}/>ロットNo.</th>
                            <th><Checkbox {...B.register(`Base.2`)} disabled={watchProgress >= 1 || watchStartTime === undefined}/>納入先</th>
                            <th><Checkbox {...B.register(`Base.3`)} disabled={watchProgress >= 1 || watchStartTime === undefined}/>受注数</th>
                        </tr>
                        <tr>
                            <td>{B.Data.data.search_number}</td>
                            <td>{format(B.Data.data.deadline,"yyMMdd-")+B.Data.data.lot}</td>
                            <td>{B.Data.data.destination}</td>
                            <td>{B.Data.data.quantity}</td>
                        </tr>
                        <tr>
                            <th><Checkbox {...B.register(`Base.4`)} disabled={watchProgress >= 1 || watchStartTime === undefined}/>品番</th>
                            <th><Checkbox {...B.register(`Base.5`)} disabled={watchProgress >= 1 || watchStartTime === undefined}/>設番</th>
                            <th><Checkbox {...B.register(`Base.6`)} disabled={watchProgress >= 1 || watchStartTime === undefined}/>定格</th>
                            <th><Checkbox {...B.register(`Base.7`)} disabled={watchProgress >= 1 || watchStartTime === undefined}/>サイズ</th>
                        </tr>
                        <tr>
                            <td>{B.Data.data.code}</td>
                            <td>{B.Data.data.dessign}</td>
                            <td>{(B.Data.data.code[0] === 'J'?parseFloat(B.Data.data.capacitance)/(10**6)+"F  ":parseFloat(B.Data.data.capacitance)+"μF  ")+B.Data.data.voltage+"V"}</td>
                            <td>{"φ"+parseFloat(B.Data.data.diameter)+"X"+parseFloat(B.Data.data.l_dimension)+"L"}</td>
                        </tr>
                    </tbody>
                </table>
                <Button onClick={handleBase} disabled={watchProgress >= 1 || watchStartTime === undefined}>作業完了</Button>
            </Accordion>
        </div>
    );
}
