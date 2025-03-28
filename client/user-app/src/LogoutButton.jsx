// user-app/src/LogoutButton.jsx
import React from "react";
import { useMutation, gql } from "@apollo/client";
import { Button } from "react-bootstrap";

//Define a GraphQL mutation to log out the user.
const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout
  }
`;

function LogoutButton() {
  //useMutation hook to execute the logout mutation.
  const [logout, { loading }] = useMutation(LOGOUT_MUTATION, {
    onCompleted: () => {
      //Dispatch a custom event to notify that the user is no longer logged in.
      window.dispatchEvent(
        new CustomEvent("loginSuccess", { detail: { isLoggedIn: false } })
      );
    },
    onError: (error) => console.error("Logout failed:", error.message),
  });

  //Render a button that calls the logout function when clicked.
  return (
    <Button onClick={() => logout()} disabled={loading}>
      {loading ? "Logging out..." : "Logout"}
    </Button>
  );
}

export default LogoutButton;
