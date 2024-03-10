import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Form from "./components/Form";
import SharedDocumentComponent from "./components/SharedDocumentComponent";

const App = () => {
  return (
    <div className="wrapper">
      <BrowserRouter>
        <Routes>  
          <Route path="/" element={<Form />} />
          <Route path="/editor" element={<SharedDocumentComponent />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;