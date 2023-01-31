# Collaby Web Server

A Restful API that will register a new user, manage login and logout, and safely handle access and refresh tokens.

To access the welcome screen on the web.

https://collabyserver.herokuapp.com/user/main

### Basic Overview

This Restful API will serve as the backend for a front end application. It will register a new user using their email address and their password which will be hashed using `bcrypt`. The user
information will be stored in a `MongoDB` database with other information that can be used later.

`{email, password, editor, code, team}`

Users will be able to login using their email and password. The API will search the database using the proveded email address and use `bcrypt` to compare the stored password and the provided password.
If passwords match, the API will send an `Access Token` and a `Refresh Token` back to the user through headers. The refresh token is stored in a our database to validate the user after their acess
token has expired.

To ensure persistance, this API contains a validate function can be used to ensure the user still has access as they navigate through the frontend. The validate function will take an `Access Token`
and validate it using the `verify` method from `JSONWebToken`. If the access code is valid, the API will return a `200` status.

For security purposes, the access token provided to our user will have 200 second expiration time. One this time has expired, the front end an make a request for a new access token using the `/token`
route. The refresh token shared to user after login will be required and validated. If the refresh token is found to be valid, the user will receive a new access token.

This API also contains a logout method that will remove the refresh token from the database.

To protect user information when saving and aquiring user data from the API, the user Id is returned after confirming tokens are valid. When aquiring project information, all projects that have a the
same user Id is sent to the browser. When updating a project, the browser will send a request to the API with a project ID and the project information to updated. The API will validate tokens, which
will return a user ID. The API will then only update the project with the correct user ID and project ID.

### How to run:

To run API locally

1. Clone the repo locally.
2. run `npm install` in terminal.
3. After install, enter run `npm run start` in terminal.

### Using the API

View all users -> (GET) http://localhost:3000/user/get/all

Register new user -> (POST) http://localhost:3000/user/register

-   The request body must include
    -   `"email"` as a key and a string as a value.
    -   `"password"` as a key and a string as a value

Log in user -> (POST) http://localhost:3000/user/login

-   The request body must include
    -   `"email"` as a key and a string as a value.
    -   `"password"` as a key and a string as a value
-   API will send an access and refresh token in headers.

Validate user -> (GET) http://localhost:3000/user/validate

-   Must have a header of Authorization with value of `Bearer <Place access token here>`

Get new Access Token -> (POST) http://localhost:3000/user/token

-   The request body must include
    -   `"email"` as a key and a string as a value.
    -   `"refreshToken"` as a key and a string as a value
-   A new access token will be sent and found in the response headers.

Logout User (DELETE) http://localhost:3000/user/logout

-   The request body must include
    -   `"refreshToken"` as a key and a string as a value

### Design Choices

In this project, I decided to leverage the Joi validation library to validate all inputs to my database. It made sense to create a file to hold all my Joi schemas as well as my validation function,
and utilize it as middleware. In my router file, register and login both will call the Joi middleware to ensure entered data is formatted correctly. After this check, we will then send data to
database for registration or to bcypt for more validation.

### Challenges

My biggest challenge was figuring how to manage the exchange of web tokens efficiently. Currently I have 3 validation files that all import the same methods from `JSONWebtoken`. I initially set off to
have one file to contain all my validation methods but ran into issues with JWT. `JWT.sign()` requires an objet as its first argument with a user information. In the instance where I need a new access
token, I do not have any user information available to provide to `JWT.sign()` since that information is not currently sent with the request. I debated required more user information from the frontend
but just settled the current design. I do plan to do a refactor in the near future.
