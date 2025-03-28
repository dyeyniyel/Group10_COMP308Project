import React, { useState, useEffect, lazy, Suspense } from "react";
import { useQuery, gql } from "@apollo/client";
import "./App.css";

const UserApp = lazy(() => import("userApp/App"));
const CommunityApp = lazy(() => import("communityApp/App"));
// Import the LogoutButton from user microfrontend
const LogoutButton = lazy(() => import("userApp/LogoutButton"));

//GraphQL query to fetch the current user's information (only username here)
const CURRENT_USER_QUERY = gql`
  query CurrentUser {
    currentUser {
      username
    }
  }
`;

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); //Local state to track if a user is logged in

  //Query the current user from the GraphQL endpoint
  const { loading, error, data, refetch } = useQuery(CURRENT_USER_QUERY, {
    fetchPolicy: "network-only",
  });

  //Define a handler for a custom event that signals a successful login
  useEffect(() => {
    const handleLoginSuccess = (event) => {
      setIsLoggedIn(event.detail.isLoggedIn);
      refetch();
    };

    window.addEventListener("loginSuccess", handleLoginSuccess);

    if (!loading && !error) {
      setIsLoggedIn(!!data.currentUser);
    }

    return () => {
      window.removeEventListener("loginSuccess", handleLoginSuccess);
    };
  }, [loading, error, data]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error! {error.message}</div>;

  return (
    <div className="App">
      <Suspense fallback={<div>Loading...</div>}>
        {isLoggedIn && (
          <div style={{ textAlign: "right", padding: "1rem" }}>
            <LogoutButton />
          </div>
        )}
        {!isLoggedIn ? <UserApp /> : <CommunityApp />}
      </Suspense>
    </div>
  );
}

export default App;
