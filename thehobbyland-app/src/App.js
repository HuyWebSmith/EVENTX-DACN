import React, { Fragment, useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { routes } from "./routes";
import DefaultComponent from "./components/DefaultComponent/DefaultComponent.jsx";
import { jwtDecode } from "jwt-decode";

import { useDispatch, useSelector } from "react-redux";
import * as UserService from "./services/UserService.js";
import { updateUser } from "./redux/slides/userSlide.js";
import LoadingComponent from "./components/LoadingComponent/LoadingComponent.jsx";

export function App() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const [isLoading, setIsLoading] = useState(true);

  // decode token
  const handleDecode = () => {
    const storageData = localStorage.getItem("access_token");

    if (!storageData) {
      console.warn("Không có access_token trong localStorage");
      return { decoded: null, storageData: null, refresh_token: null };
    }

    try {
      const decoded = jwtDecode(storageData);
      return { decoded, storageData };
    } catch (err) {
      console.error("JWT decode lỗi:", err);
      return { decoded: null, storageData: null, refresh_token: null };
    }
  };

  // Fetch thông tin user từ server
  const fetchUser = async () => {
    setIsLoading(true);
    const decoded = handleDecode();
    if (!decoded?.id) {
      setIsLoading(false);
      return;
    }

    localStorage.setItem("currentUserId", decoded.id);

    try {
      const res = await UserService.getDetailUser(decoded.id);
      const userData = res.data || res;
      dispatch(
        updateUser({
          _id: userData._id,
          fullName: userData.fullName,
          email: userData.email,
          isAdmin: userData.isAdmin,
          access_token: localStorage.getItem("access_token"),
        })
      );
    } catch (err) {
      console.error(err);
      localStorage.removeItem("access_token");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <LoadingComponent isLoading={isLoading} style={{ background: "#ccc" }}>
      {!isLoading && (
        <Router>
          <Routes>
            {routes.map((route) => {
              const Page = route.page;
              const Layout = route.isShowHeader ? DefaultComponent : Fragment;

              if (route.isPrivate) {
                return (
                  <Route
                    key={route.path}
                    path={route.path}
                    element={
                      <Layout>
                        {user.isAdmin ? (
                          <Page />
                        ) : (
                          <Navigate to="/sign-in" replace />
                        )}
                      </Layout>
                    }
                  />
                );
              }

              return (
                <Route
                  key={route.path}
                  path={route.path}
                  element={
                    <Layout>
                      <Page />
                    </Layout>
                  }
                />
              );
            })}
          </Routes>
        </Router>
      )}
    </LoadingComponent>
  );
}

export default App;
