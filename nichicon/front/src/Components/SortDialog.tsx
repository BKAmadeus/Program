import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
//import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import IconButton from '@mui/material/IconButton';
import '../style.css';

export function FormDialog(FD:any) {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    FD.setValue(FD.SET2,FD.value);
    FD.setValue(`reEffect`,!FD.watch(`reEffect`));
    setOpen(false);
  };
  const handleReset = () => {
    FD.resetField(FD.Reset);
    FD.setValue(`reEffect`,!FD.watch(`reEffect`));
    setOpen(false);
  };
  const handle = () =>{
    setOpen(false);
  }

  return (
    <div>
        <IconButton onClick={handleClickOpen}>
            <FilterAltIcon className={FD.watch(FD.SET2)? 'red':'default'}/>
        </IconButton>
        <Dialog open={open} onClose={handle}>
            <DialogTitle>絞り込み</DialogTitle>
            <DialogContent>
            <DialogContentText>
                絞り込みを行う文字列.
            </DialogContentText>
            <DialogContentText>
                例:0を入れると 0,10,101等の0を含む文字列が表示
            </DialogContentText>
            <TextField
                autoFocus
                margin="dense"
                label="絞り込み"
                fullWidth
                variant="standard"
                {...FD.register(FD.SET)}
            />
            </DialogContent>
            <DialogActions>
            <Button onClick={handleReset}>削除</Button>
            <Button onClick={handleClose}>完了</Button>
            </DialogActions>
        </Dialog>
    </div>
  );
}
