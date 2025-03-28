import React, { useEffect, useState } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import {
  Button,
  Form,
  Container,
  ListGroup,
  Alert,
  Nav,
  Row,
  Col,
} from "react-bootstrap";
import "./CommunityComponent.css";

// ------------------ GraphQL QUERIES & MUTATIONS ------------------ //

// Query for community posts (includes aiSummary and updatedAt)
const GET_COMMUNITY_POSTS_QUERY = gql`
  query GetCommunityPosts {
    communityPosts {
      id
      title
      content
      category
      aiSummary
      createdAt
      updatedAt
      author {
        id
        username
      }
    }
  }
`;

//Mutation for adding a community post. It accepts title, content, category, and an AI summary as input
const ADD_COMMUNITY_POST_MUTATION = gql`
  mutation AddCommunityPost(
    $title: String!
    $content: String!
    $category: String!
    $aiSummary: String
  ) {
    addCommunityPost(
      title: $title
      content: $content
      category: $category
      aiSummary: $aiSummary
    ) {
      id
      title
      content
      category
      aiSummary
      createdAt
      updatedAt
      author {
        id
        username
      }
    }
  }
`;

//Query to fetch all help requests
const GET_HELP_REQUESTS_QUERY = gql`
  query GetHelpRequests {
    helpRequests {
      id
      description
      location
      isResolved
      createdAt
      updatedAt
      author {
        id
        username
      }
      volunteers {
        id
        username
      }
    }
  }
`;

//Mutation to add a new help request. Accepts description and location.
const ADD_HELP_REQUEST_MUTATION = gql`
  mutation AddHelpRequest($description: String!, $location: String) {
    addHelpRequest(description: $description, location: $location) {
      id
      description
      location
      isResolved
      createdAt
      updatedAt
      author {
        id
        username
      }
      volunteers {
        id
        username
      }
    }
  }
`;

//Mutation to volunteer for an existing help request.
const VOLUNTEER_MUTATION = gql`
  mutation VolunteerForHelpRequest($requestId: ID!) {
    volunteerForHelpRequest(requestId: $requestId) {
      id
      updatedAt
      volunteers {
        id
        username
      }
    }
  }
`;

//applies a dark theme to the entire page
function CommunityComponent() {
  useEffect(() => {
    const oldBodyStyle = {
      backgroundColor: document.body.style.backgroundColor,
    };
    document.body.style.backgroundColor = "#121212";
    return () => {
      //Revert on unmount
      document.body.style.backgroundColor = oldBodyStyle.backgroundColor;
    };
  }, []);

  //Local state for managing community posts and help requests
  const [activeSection, setActiveSection] = useState("posts");

  //Local state for the community post form fields.
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postCategory, setPostCategory] = useState("news");
  const [aiSummary, setAiSummary] = useState("");

  //Local state for the help request form fields.
  const [helpDescription, setHelpDescription] = useState("");
  const [helpLocation, setHelpLocation] = useState("");

  // ------------------ DATA FETCHING ------------------ //
  //Queries for community posts
  const {
    loading: postsLoading,
    error: postsError,
    data: postsData,
  } = useQuery(GET_COMMUNITY_POSTS_QUERY, {
    context: { credentials: "include" },
  });
  //Queries for help requests
  const {
    loading: helpLoading,
    error: helpError,
    data: helpData,
  } = useQuery(GET_HELP_REQUESTS_QUERY, {
    context: { credentials: "include" },
  });

  // ------------------ MUTATIONS ------------------ //
  //Mutation to add a new community post
  const [addCommunityPost, { loading: addingPost }] = useMutation(
    ADD_COMMUNITY_POST_MUTATION,
    {
      refetchQueries: [{ query: GET_COMMUNITY_POSTS_QUERY }],
    }
  );

  //Mutation to add a new help request
  const [addHelpRequest, { loading: addingHelp }] = useMutation(
    ADD_HELP_REQUEST_MUTATION,
    {
      refetchQueries: [{ query: GET_HELP_REQUESTS_QUERY }],
    }
  );

  //Mutation to volunteer for a help request
  const [volunteerForHelpRequest] = useMutation(VOLUNTEER_MUTATION, {
    refetchQueries: [{ query: GET_HELP_REQUESTS_QUERY }],
  });

  // ------------------ HANDLERS ------------------ //
  //Handler for submitting a new community post
  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!postTitle.trim() || !postContent.trim()) return;
    await addCommunityPost({
      variables: {
        title: postTitle,
        content: postContent,
        category: postCategory,
        aiSummary,
      },
    });

    //Clear the form fields after submission
    setPostTitle("");
    setPostContent("");
    setAiSummary("");
  };

  //Handler for submitting a new help request
  const handleHelpSubmit = async (e) => {
    e.preventDefault();
    if (!helpDescription.trim()) return;
    await addHelpRequest({
      variables: { description: helpDescription, location: helpLocation },
    });
    setHelpDescription("");
    setHelpLocation("");
  };

  //Handler for volunteering on a help request
  const handleVolunteer = async (requestId) => {
    try {
      await volunteerForHelpRequest({ variables: { requestId } });
    } catch (error) {
      console.error("Error volunteering:", error);
    }
  };

  // ------------------ RENDERING THE COMPONENT ------------------ //
  return (
    <Container fluid className="community-container">
      <Row className="mb-3">
        <Col>
          <h1>Community Engagement</h1>
        </Col>
      </Row>

      <Nav
        variant="tabs"
        activeKey={activeSection}
        onSelect={(selectedKey) => setActiveSection(selectedKey)}
      >
        <Nav.Item>
          <Nav.Link
            eventKey="posts"
            className={
              activeSection === "posts"
                ? "nav-link-active"
                : "nav-link-inactive"
            }
          >
            Community Posts
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link
            eventKey="help"
            className={
              activeSection === "help" ? "nav-link-active" : "nav-link-inactive"
            }
          >
            Help Requests
          </Nav.Link>
        </Nav.Item>
      </Nav>

      {activeSection === "posts" && (
        <>
          <h2 className="mt-4">Add a New Community Post</h2>
          <Form onSubmit={handlePostSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter post title"
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                className="form-control-dark"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Content</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter post content"
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                className="form-control-dark"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Control
                as="select"
                value={postCategory}
                onChange={(e) => setPostCategory(e.target.value)}
                className="form-control-dark"
              >
                <option value="news">News</option>
                <option value="discussion">Discussion</option>
              </Form.Control>
            </Form.Group>
            {/* New field for AI Summary */}
            <Form.Group className="mb-3">
              <Form.Label>AI Summary</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter AI summary"
                value={aiSummary}
                onChange={(e) => setAiSummary(e.target.value)}
                className="form-control-dark"
              />
            </Form.Group>
            <Button variant="primary" type="submit" disabled={addingPost}>
              {addingPost ? "Adding..." : "Add Post"}
            </Button>
          </Form>

          <h3 className="mt-4">Community Posts</h3>
          {postsLoading ? (
            <p>Loading posts...</p>
          ) : postsError ? (
            <Alert variant="danger">Error: {postsError.message}</Alert>
          ) : (
            <ListGroup>
              {postsData?.communityPosts?.map((post) => (
                <ListGroup.Item key={post.id} className="list-group-item-dark">
                  <strong>{post.title}</strong> ({post.category})
                  <br />
                  {post.content}
                  <br />
                  {/* Display AI Summary if available */}
                  {post.aiSummary && (
                    <>
                      <strong>AI Summary:</strong> {post.aiSummary}
                      <br />
                    </>
                  )}
                  <em>
                    By: {post.author?.username ?? "Unknown"} on{" "}
                    {new Date(Number(post.createdAt)).toLocaleString()}
                  </em>
                  <br />
                  {/* Display UpdatedAt value if available */}
                  {post.updatedAt && (
                    <em>
                      Updated at:{" "}
                      {new Date(Number(post.updatedAt)).toLocaleString()}
                    </em>
                  )}
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </>
      )}

      {activeSection === "help" && (
        <>
          <h2 className="mt-4">Submit a Help Request</h2>
          <Form onSubmit={handleHelpSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Describe your help request"
                value={helpDescription}
                onChange={(e) => setHelpDescription(e.target.value)}
                className="form-control-dark"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Location</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter location (optional)"
                value={helpLocation}
                onChange={(e) => setHelpLocation(e.target.value)}
                className="form-control-dark"
              />
            </Form.Group>
            <Button variant="primary" type="submit" disabled={addingHelp}>
              {addingHelp ? "Submitting..." : "Submit Help Request"}
            </Button>
          </Form>

          <h3 className="mt-4">Help Requests</h3>
          {helpLoading ? (
            <p>Loading help requests...</p>
          ) : helpError ? (
            <Alert variant="danger">Error: {helpError.message}</Alert>
          ) : (
            <ListGroup>
              {helpData?.helpRequests?.map((request) => (
                <ListGroup.Item
                  key={request.id}
                  className="list-group-item-dark"
                >
                  <strong>{request.description}</strong>
                  <br />
                  <span>
                    Submitted by: {request.author?.username ?? "Unknown"}
                  </span>
                  <br />
                  {request.location && (
                    <span>
                      Location: {request.location}
                      <br />
                    </span>
                  )}
                  <em>Status: {request.isResolved ? "Resolved" : "Pending"}</em>
                  <br />
                  {request.volunteers?.length > 0 ? (
                    <div>
                      Volunteers:{" "}
                      {request.volunteers.map((v) => v.username).join(", ")}
                    </div>
                  ) : (
                    <div>No volunteers yet</div>
                  )}
                  <div className="mt-2">
                    <Button
                      variant="outline-success"
                      onClick={() => handleVolunteer(request.id)}
                    >
                      Volunteer
                    </Button>
                  </div>
                  <small className="d-block mt-2">
                    Created:{" "}
                    {new Date(Number(request.createdAt)).toLocaleString()}
                    {request.updatedAt && (
                      <span className="d-block">
                        Updated:{" "}
                        {new Date(Number(request.updatedAt)).toLocaleString()}
                      </span>
                    )}
                  </small>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </>
      )}
    </Container>
  );
}

export default CommunityComponent;
