import "./App.scss";
import HomePage from "./components/HomePage";
import SecretPage from "./components/SecretPage";
import Navigation from "./components/Navigation";
import AboutPage from "./components/AboutPage";
import NotFound from "./components/NotFound";
import React from "react";
import RbacContext from "./rbac/RbacContext";
import rbac from "./rbac/RolesConfig";
import Cookies from "js-cookie";
import { BrowserRouter, Route, Routes } from "react-router-dom";

rbac.addUserRoles("Ethan", ["ADMIN"]);
rbac.addUserRoles("Happy", ["USER"]);

const App = () => {
  const authUser = Cookies.get("authUser");
  const isAllowed = rbac.isAllowed(authUser, "EDIT") === true;

  return (
    <React.Fragment>
      <RbacContext.Provider
        value={{
          isAllowed,
        }}
      >
        <BrowserRouter>
          <Navigation />
          <Routes>
            <Route path="/" element={<HomePage />} />
            {isAllowed ? <Route path="/secret" element={<SecretPage />} /> : <></>}
            <Route path="/about" element={<AboutPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </RbacContext.Provider>
    </React.Fragment>
  );
};

export default App;
