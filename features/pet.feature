Feature: Pet API CRUD operations

  @pet
  Scenario: Create a pet
    Given set base url "baseURL"
    And set url "pet"
    And set body "id" = "12345"
    And set body "category.id" = "1"
    And set body "category.name" = "dog"
    And set body "name" = "ecem"
    And set body "photoUrls[0]" = "string"
    And set body "tags[0].id" = "1"
    And set body "tags[0].name" = "tag1"
    And set body "status" = "available"
    When make "POST" request
    Then check status code = "200"
    Then store "petID" = "id"


  @pet
  Scenario: Get a pet
    Given set base url "baseURL"
    And set url "pet"
    And set url "[petID]"
    When make "GET" request
    Then check status code = "200"
    And check response "id" = "[petID]"


  @pet
  Scenario: Put a pet
    Given set base url "baseURL"
    And set url "pet"
    And set body "id" = "12345"
    And set body "category.id" = "1"
    And set body "category.name" = "dog"
    And set body "name" = "ecem"
    And set body "photoUrls[0]" = "string"
    And set body "tags[0].id" = "1"
    And set body "tags[0].name" = "tag1"
    And set body "status" = "available"
    When make "PUT" request
    Then check status code = "200"


  @pet
  Scenario: Delete a pet
    Given set base url "baseURL"
    And set url "pet"
    And set url "[petID]"
    When make "DELETE" request
    Then check status code = "200"

  @pet
  Scenario: Delete a same petID
    Given set base url "baseURL"
    And set url "pet"
    And set url "[petID]"
    When make "DELETE" request
    Then check status code = "404"




