// Importing necessary libraries and components
import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import SharedDocumentComponent from "./components/SharedDocumentComponent";
import Signin from "./routes/Signin/Signin";
import Signup from "./routes/Signup/Signup";
import Home from "./routes/Home/Home";

// Defining the App component
const App = () => {
  return (
    <div className="wrapper">
      <BrowserRouter>
        <Routes>  
          <Route path="/" element={<Signin />} /> {/* Route for the root path, renders the Signin component */}
          <Route path="/signin" element={<Signin />} /> {/* Route for the '/signin' path, renders the Signin component */}
          <Route path="/signup" element={<Signup />} /> {/* Route for the '/signup' path, renders the Signup component */}
          <Route path="/home" element={<Home />} /> {/* Route for the '/home' path, renders the Home component */}
          <Route path="/editor/:docId" element={<SharedDocumentComponent />} /> {/* Route for the '/editor/:docId' path, renders the SharedDocumentComponent */}
        </Routes>
      </BrowserRouter>
    </div>
  );
};

// Exporting the App component to be used in other parts of the app
export default App;