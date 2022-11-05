import "./App.scss";
import HomePage from "./components/HomePage";
import SecretPage from "./components/SecretPage";
import Navigation from "./components/Navigation";
import AboutPage from "./components/AboutPage";
import NotFound from "./components/NotFound";
import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

const App = () => {
  return (
    <React.Fragment>
      <BrowserRouter>
        <Navigation />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/secret" element={<SecretPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </React.Fragment>
  );
};

export default App;
