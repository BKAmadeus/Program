import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Chip from "@mui/material/Chip";
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import FilledInput from '@mui/material/FilledInput';

export function MultipleSelectChip(MSC:any) {

    const handleChange = (event: SelectChangeEvent<string[]>) => {
      const {
        target: { value }
      } = event;
      MSC.SetValue(MSC.SET,value);
    };

    return (
        <FormControl variant="outlined">
            <InputLabel>{MSC.Label}</InputLabel>
            <Select
                multiple
                value={MSC.Default === undefined? [] : MSC.Default}
                sx={{ width: 1200 }}
                onChange={handleChange}
                input={<FilledInput />}
                renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((value:any) => (
                    <Chip key={value} label={value} />
                    ))}
                </Box>
                )}
            >
            {MSC.Data.map((name:any) => (
                <MenuItem
                key={name}
                value={name}
                >
                {name}
                </MenuItem>
            ))}
            </Select>
        </FormControl>
    );
}
