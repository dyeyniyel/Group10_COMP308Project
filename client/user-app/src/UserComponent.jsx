// UserComponent.jsx
import React, { useState, useEffect } from "react";
import { useMutation, gql } from "@apollo/client";
import { Alert, Button, Form, Nav, Spinner } from "react-bootstrap";
import "./UserComponent.css"; // Import the CSS file

//GraphQL mutation for login
const LOGIN_MUTATION = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password)
  }
`;

//GraphQL mutation for signup
const SIGNUP_MUTATION = gql`
  mutation Signup(
    $username: String!
    $email: String!
    $password: String!
    $role: String!
  ) {
    signup(username: $username, email: $email, password: $password, role: $role)
  }
`;

function UserComponent() {
  //Component state for user input fields
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("resident"); //Set default role as "resident"
  const [activeTab, setActiveTab] = useState("login"); //State to control which tab is active ("login" or "signup")
  const [authError, setAuthError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --------------- Override Global Body Style ---------------
  // This effect overrides the global body style when the component mounts, and reverts it on unmount.
  useEffect(() => {
    const oldBodyStyle = {
      display: document.body.style.display,
      placeItems: document.body.style.placeItems,
      minHeight: document.body.style.minHeight,
      backgroundColor: document.body.style.backgroundColor,
      margin: document.body.style.margin,
      padding: document.body.style.padding,
    };

    document.body.style.display = "block";
    document.body.style.placeItems = "";
    document.body.style.minHeight = "auto";
    document.body.style.backgroundColor = "#121212";
    document.body.style.margin = "0";
    document.body.style.padding = "0";

    return () => {
      document.body.style.display = oldBodyStyle.display;
      document.body.style.placeItems = oldBodyStyle.placeItems;
      document.body.style.minHeight = oldBodyStyle.minHeight;
      document.body.style.backgroundColor = oldBodyStyle.backgroundColor;
      document.body.style.margin = oldBodyStyle.margin;
      document.body.style.padding = oldBodyStyle.padding;
    };
  }, []);

  //Set up the login mutation with success and error handlers
  const [login] = useMutation(LOGIN_MUTATION, {
    onCompleted: () => {
      window.dispatchEvent(
        new CustomEvent("loginSuccess", { detail: { isLoggedIn: true } })
      );
    },
    onError: (error) => setAuthError(error.message || "Login failed"),
  });

  //Set up the signup mutation with success and error handlers
  const [signup] = useMutation(SIGNUP_MUTATION, {
    onCompleted: () => {
      alert("Registration successful! Please log in.");
      setActiveTab("login");
    },
    onError: (error) => setAuthError(error.message || "Registration failed"),
  });

  //Handler for form submission, decides whether to perform login or signup
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAuthError("");

    //Validate required fields
    if (
      !username ||
      !password ||
      (activeTab === "signup" && (!email || !role))
    ) {
      setAuthError("All fields are required.");
      setIsSubmitting(false);
      return;
    }

    //Execute the corresponding mutation
    if (activeTab === "login") {
      await login({ variables: { username, password } });
    } else {
      await signup({ variables: { username, email, password, role } });
    }
    setIsSubmitting(false);
  };

  //Render the user authentication form (login/signup)
  return (
    <div className="user-container">
      <div className="user-card">
        {/* Navigation tabs for Login / Signup */}
        <Nav
          variant="tabs"
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          className="user-nav"
        >
          <Nav.Item>
            <Nav.Link
              eventKey="login"
              className={
                activeTab === "login"
                  ? "user-nav-link-active"
                  : "user-nav-link-inactive"
              }
            >
              Login
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              eventKey="signup"
              className={
                activeTab === "signup"
                  ? "user-nav-link-active"
                  : "user-nav-link-inactive"
              }
            >
              Sign Up
            </Nav.Link>
          </Nav.Item>
        </Nav>

        {/* Login / Signup Form */}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="formUsername">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="user-form-control"
            />
          </Form.Group>

          {activeTab === "signup" && (
            <>
              <Form.Group className="mb-3" controlId="formEmail">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="user-form-control"
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formRole">
                <Form.Label>Role</Form.Label>
                <Form.Select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="user-form-control"
                >
                  <option value="resident">Resident</option>
                  <option value="business_owner">Business Owner</option>
                  <option value="community_organizer">
                    Community Organizer
                  </option>
                </Form.Select>
              </Form.Group>
            </>
          )}

          <Form.Group className="mb-3" controlId="formPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="user-form-control"
            />
          </Form.Group>

          {authError && <Alert variant="danger">{authError}</Alert>}

          <Button
            variant="primary"
            type="submit"
            disabled={isSubmitting}
            className="user-submit-btn"
          >
            {isSubmitting ? (
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
              />
            ) : activeTab === "login" ? (
              "Login"
            ) : (
              "Sign Up"
            )}
          </Button>
        </Form>
      </div>
    </div>
  );
}

export default UserComponent;
