import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter , Routes, Route, Navigate } from "react-router-dom";
import Home from './home/home';
import Login from './Login/login';
import { ProductSpecification } from './ProductSpecification/ProductSpecification';
import { ProductApproval } from './ProductSpecification/ProductApproval';
import { Schedule } from './ProductSchedule/ProductSchedule';
import { ProductWorkData } from './ProductWorkData/ProductWorkData';
import { Simplification } from './Simplification/Simplification';
import { SimplificationApproval } from './Simplification/SimplificationApproval';
import { MyPage } from './MyPage/MyPage';
import { CreateTube } from './Tube/CreateTube';
import { ApprovalTube } from './Tube/ApprovalTube';
import AuthUserProvider,{AuthUserContext} from './Data/SharedVariable';

function PrivateRoute({children}) {
  const User = React.useContext(AuthUserContext);
  console.log("index",User);
  if (User) {
    return children
  }else{
    return <Navigate to="/Login"/>
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
          <Route path="/ProductApproval" element={<ProductApproval />}/>
          <Route path="/CreateTube" element={<CreateTube />}/>
          <Route path="/ApprovalTube" element={<ApprovalTube />}/>
          <Route path="/Schedule" element={<Schedule />}/>
          <Route path="/ProductWorkData" element={<ProductWorkData />}/>
          <Route path="/Simplification" element={<Simplification />}/>
          <Route path="/SimplificationApproval" element={<SimplificationApproval />}/>
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