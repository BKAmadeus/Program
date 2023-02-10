import { useState,useContext } from 'react';
import { AuthOperationContext } from './Data/SharedVariable';
import './style.css';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

const Login = () => {
    const [user,setUser] = useState("");
    const [password,setPassword] = useState("");
    const [Error,setError] = useState(false);
    const login = useContext(AuthOperationContext).login;
    const handleLogin = () => {
        login(user,password);
        setError(true);
    }
    return (
        <div className='login'>
            ログイン画面<br/>
            <TextField required label="ユーザID" onChange={e=>{setUser(e.target.value)}} error={Error}/><br/>
            <TextField required label="パスワード" type="password" onChange={e=>{setPassword(e.target.value)}} error={Error}/><br/>
            {Error?<h4 className='loginError'>※ユーザ名もしくはパスワードが間違っています</h4>:""}
            <Button onClick={handleLogin} variant="contained">送信</Button>
        </div>
    )
}
export default Login;