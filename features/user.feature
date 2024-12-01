Feature: USER API CRUD operations

    @user
    Scenario: Create a user
        Given set base url "baseURL"
        And set url "user"
        And set body "id" = "123"
        And set body "username" = "ecmyilmz"
        And set body "firstName" = "ecem"
        And set body "lastName" = "yilmaz"
        And set body "email" = "ecmyilmz@gmail.com"
        And set body "password" = "12345"
        And set body "phone" = "1234567"
        And set body "userStatus" = "0"
        When make "POST" request
        Then check status code = "200"

    @user
    Scenario: Get the user
        Given set base url "baseURL"
        And set url "user"
        And set url "ecmyilmz"
        When make "GET" request
        Then check status code = "200"
        And store "username" = "username"


    @user
    Scenario: Get the user invalid username
        Given set base url "baseURL"
        And set url "user"
        And set url "invalid"
        When make "GET" request
        Then check status code = "404"
        And check response "message" = "User not found"



    @user
    Scenario: Login a USSER
        Given set base url "baseURL"
        And set url "user"
        And set url "login"
        And add query param "username" = "[username]"
        And add query param "password" = "12345"
        When make "GET" request
        Then check status code = "200"

    @user
    Scenario: Logout a USSER
        Given set base url "baseURL"
        And set url "user"
        And set url "logout"
        When make "GET" request
        Then check status code = "200"
        And check response "message" = "ok"

         @user
    Scenario: Get the user
        Given set base url "baseURL"
        And set url "user"
        And set url "[username]"
        When make "DELETE" request
        Then check status code = "200"
          And check response "message" = "[username]"
        



