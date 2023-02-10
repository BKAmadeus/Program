import Slider from '@mui/material/Slider';
import TextField from '@mui/material/TextField';
export function ColorBar(CB:any) {
    
    const RChange = (event: Event, newValue: number | number[]) => {
        CB.SetValue(CB.SET1,newValue as number);
    };
    const GChange = (event: Event, newValue: number | number[]) => {
        CB.SetValue(CB.SET2,newValue as number);
    };
    const BChange = (event: Event, newValue: number | number[]) => {
        CB.SetValue(CB.SET3,newValue as number);
    };

    return(
        <div className='flexbox'>
            <p>
                {CB.text}
            </p>
            <div>
                <p>赤</p>
                <Slider value={CB.watch(CB.SET1)} onChange={RChange} valueLabelDisplay="auto" min={0} max={255} sx={{ width: 200 }}/>
                <TextField type='number' {...CB.register(CB.SET1)} sx={{ width: 100 }}/>
            </div>
            <div>
                <p>緑</p>
                <Slider value={CB.watch(CB.SET2)} onChange={GChange} valueLabelDisplay="auto" min={0} max={255} sx={{ width: 200 }}/>
                <TextField type='number' {...CB.register(CB.SET2)} sx={{ width: 100 }}/>
            </div>
            <div>
                <p>青</p>
                <Slider value={CB.watch(CB.SET3)} onChange={BChange} valueLabelDisplay="auto" min={0} max={255} sx={{ width: 200 }}/>
                <TextField type='number' {...CB.register(CB.SET3)} sx={{ width: 100 }}/>
            </div>
        </div>
    )
}