import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Form from "./components/Form";
import SharedDocumentComponent from "./components/SharedDocumentComponent";
import Signin from "./routes/Signin/Signin";
import Signup from "./routes/Signup/Signup";
import Home from "./routes/Home/Home";

const App = () => {
  return (
    <div className="wrapper">
      <BrowserRouter>
        <Routes>  
          <Route path="/" element={<Signin />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/home" element={<Home />} />
          <Route path="/editor/:docId" element={<SharedDocumentComponent />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;