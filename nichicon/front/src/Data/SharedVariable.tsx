import React,{ createContext,useState } from "react"
import * as func from "../Components/func";
type Props = {
    children?: React.ReactNode;
  };

type OperationType = {
    login: (userId: string,password: string) => void
    logout: () => void
  }

export const AuthUserContext = createContext<any>(null)
export const AuthOperationContext = createContext<OperationType>({
    login: (_) => console.error("Providerが設定されていません"),
    logout: () => console.error("Providerが設定されていません")
  })
  
  const AuthUserProvider: React.FC<Props> = ({ children }) => {
    const [authUser, setAuthUser] = useState<any>(null)
    
    const login = (userId: string,password: string) => {
      // await login() //ログイン処理
      func.postData({flg:"login",user:userId,password:password})
      .then((data:any) => {
          if(data.flg){
            setAuthUser(data);
          }
        });
    }
    
    const logout = () => {
      // await login() //ログアウト処理
      setAuthUser(null)
    }
    
    return (
      <AuthOperationContext.Provider value={{login, logout}}>
        <AuthUserContext.Provider value={authUser}>
          { children }
        </AuthUserContext.Provider>
      </AuthOperationContext.Provider>
    )
  }

export default AuthUserProvider