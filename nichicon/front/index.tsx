import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter , Routes, Route, Navigate } from "react-router-dom";
import Home from './home';
import Login from './login';
import ProductSpecification from './ProductSpecification';
import { Schedule } from './ProductSchedule';
import { ProductWorkData } from './ProductWorkData';
import { MyPage } from './MyPage';
import AuthUserProvider,{AuthUserContext} from './Data/SharedVariable';

function PrivateRoute({children}) {
  const User = React.useContext(AuthUserContext);
  console.log("index",User);
  if (User) {
    return children
  }else{
    return <Navigate to="/login"/>
  }
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
    <BrowserRouter>
      <AuthUserProvider>
        <Routes>
          <Route path="/" element={<Home />}/>
          <Route path="/Login" element={<Login />}/>
          <Route path="/CreateProduct" element={<ProductSpecification />}/>
          <Route path="/Schedule" element={<Schedule />}/>
          <Route path="/ProductWorkData" element={<ProductWorkData />}/>
          <Route path="/MyPage" element={<PrivateRoute><MyPage /></PrivateRoute>}/>
        </Routes>
      </AuthUserProvider>
    </BrowserRouter>
);

/*
<Route path="/" element={<PrivateRoute><Home /></PrivateRoute>}/>
<Route path="/Login" element={<Login />}/>
<Route path="/CreateProduct" element={<PrivateRoute><ProductSpecification /></PrivateRoute>}/>
<Route path="/Schedule" element={<PrivateRoute><Schedule /></PrivateRoute>}/>
<Route path="/ProductWorkData" element={<PrivateRoute><ProductWorkData /></PrivateRoute>}/>
*/