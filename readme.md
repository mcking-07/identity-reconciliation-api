## Identity Reconciliation API (BiteSpeed Backend Task)

This repository serves as a task submission at BiteSpeed (Backend). The task involves creating an API for identifying and reconciling customer identities across multiple purchases. The API utilizes Node.js with Express framework for backend development, PostgreSQL for database management, and Docker for containerization.

### Installation

To set up and run the API locally, follow these steps:

- Clone this repository to your local machine.
- Ensure you have Docker installed.
- Navigate to the root directory of the project.
- Create a `.env` file in the root directory and configure the environment variables based on the provided `sampleEnv` file.
- Run `docker-compose up` to start the PostgreSQL database and database migrations.
- Run `npm install` to install the necessary dependencies.
- Run `npm start` to start the API server.

### Environment Configuration

The `.env` file contains environment variables used by the application, including database connection details and other configurations.

### Database

The API utilizes a PostgreSQL database to store contact information. Database migrations are managed using Flyway.

### Docker Configuration

The `docker-compose.yml` file defines the services required for running the application, including the PostgreSQL database and Flyway for handling database migrations.

### Usage

Once the API server is running, you can interact with it by sending HTTP requests to the defined routes. The API provides endpoints for identity reconciliation and health checks.

#### Identity Reconciliation Endpoint

- **URL**: `https://identity-reconciliation-api.mcking.in/identity`
- **Method**: POST
- **Description**: Identifies and reconciles customer identity based on provided email and phone number.
- **Request Body**:
  ```json
  {
    "email": "lorraine@hillvalley.edu",
    "phoneNumber": "123456"
  }
  ```
- **Response**:
  ```json
  {
    "contact": {
      "primaryContactId": "1",
      "emails": ["lorraine@hillvalley.edu"],
      "phoneNumbers": ["123456"],
      "secondaryContactIds": []
    }
  }
  ```
- **Request Body**:
  ```json
  {
    "email": "mcfly@hillvalley.edu",
    "phoneNumber": "123456"
  }
  ```
- **Response**:
  ```json
  {
    "contact": {
      "primaryContactId": 1,
      "emails": ["lorraine@hillvalley.edu","mcfly@hillvalley.edu"]
      "phoneNumbers": ["123456"]
      "secondaryContactIds": [2]
    }
  }
  ```

#### Health Check Endpoint

- **URL**: `https://identity-reconciliation-api.mcking.in/healthcheck`
- **Method**: GET
- **Description**: Verifies the health status of the API server.

### Hosting

This project is hosted on [identity-reconciliation-api.mcking.in](https://identity-reconciliation-api.mcking.in/).
