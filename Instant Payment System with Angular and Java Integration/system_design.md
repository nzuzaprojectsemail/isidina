# Instant Payment System Design Document

## 1. Introduction

This document outlines the design for an instant payment system, encompassing both frontend (Angular) and backend (Java Spring Boot) components, along with database schema and API specifications. The system aims to provide secure authentication, real-time balance display, and various money transfer and withdrawal functionalities.

## 2. System Architecture

The system will follow a client-server architecture:

*   **Frontend:** An Angular application will provide the user interface, handling user interactions, data presentation, and communication with the backend via RESTful APIs.
*   **Backend:** A Java Spring Boot application will serve as the API layer, implementing business logic, managing data persistence, and ensuring security.
*   **Database:** Bolt Database will be used for storing all system data, including user profiles, transaction records, and administrative information.

```mermaid
graph TD
    A[User] -->|Interacts with| B(Angular Frontend)
    B -->|API Calls (HTTPS)| C(Java Spring Boot Backend)
    C -->|Data Access| D[Bolt Database]
    C -->|Sends| E(Email/SMS Service)
```

## 3. Database Schema (Bolt Database)

The following entities and their attributes will form the core of the Bolt Database schema. Row-level security will be implemented to ensure users can only access their own data.

### 3.1. User Profile (`users` collection/table)

| Field Name        | Data Type | Description                                       | Constraints                  |
| :---------------- | :-------- | :------------------------------------------------ | :--------------------------- |
| `id`              | String    | Unique user identifier                            | Primary Key, Auto-generated  |
| `email`           | String    | User's email address (for sign-up/sign-in)        | Unique, Not Null             |
| `password_hash`   | String    | Hashed password                                   | Not Null                     |
| `first_name`      | String    | Sender's first name                               | Not Null                     |
| `last_name`       | String    | Sender's last name                                | Not Null                     |
| `id_passport`     | String    | Sender's ID or passport number                    | Unique, Not Null             |
| `physical_address`| String    | Sender's physical address                         | Not Null                     |
| `cell_number`     | String    | Sender's cellphone number                         | Unique, Not Null             |
| `balance`         | Decimal   | Current account balance                           | Default: 1000.00, Not Null   |
| `created_at`      | Timestamp | Account creation timestamp                        | Auto-generated               |
| `updated_at`      | Timestamp | Last update timestamp                             | Auto-generated               |

### 3.2. Transaction (`transactions` collection/table)

| Field Name        | Data Type | Description                                       | Constraints                  |
| :---------------- | :-------- | :------------------------------------------------ | :--------------------------- |
| `id`              | String    | Unique transaction identifier                     | Primary Key, Auto-generated  |
| `sender_user_id`  | String    | Foreign key to `users.id` (sender)                | Not Null                     |
| `receiver_cell_number` | String | Receiver's cellphone number                       | Not Null                     |
| `transaction_type`| String    | Type of transaction (e.g., 'SEND', 'FULL_WITHDRAWAL', 'PARTIAL_WITHDRAWAL') | Not Null                     |
| `amount`          | Decimal   | Amount of money involved                          | Not Null, Positive           |
| `commission_amount`| Decimal  | Commission charged for the transaction            | Nullable                     |
| `vat_amount`      | Decimal   | VAT charged on commission                         | Nullable                     |
| `withdrawal_pin`  | String    | PIN for withdrawal (hashed)                       | Nullable (for SEND)          |
| `voucher_number`  | String    | System-generated voucher number                   | Unique, Auto-generated       |
| `status`          | String    | Transaction status (e.g., 'PENDING', 'COMPLETED', 'FAILED') | Not Null                     |
| `created_at`      | Timestamp | Transaction creation timestamp                    | Auto-generated               |
| `receiver_name`   | String    | Receiver's name (for partial withdrawal)          | Nullable                     |
| `receiver_surname`| String    | Receiver's surname (for partial withdrawal)       | Nullable                     |
| `receiver_id_passport`| String | Receiver's ID/passport (for partial withdrawal)   | Nullable                     |
| `receiver_address`| String    | Receiver's address (for partial withdrawal)       | Nullable                     |

### 3.3. Enquiry (`enquiries` collection/table)

| Field Name        | Data Type | Description                                       | Constraints                  |
| :---------------- | :-------- | :------------------------------------------------ | :--------------------------- |
| `id`              | String    | Unique enquiry identifier                         | Primary Key, Auto-generated  |
| `user_id`         | String    | Foreign key to `users.id`                         | Not Null                     |
| `subject`         | String    | Subject of the enquiry                            | Not Null                     |
| `message`         | String    | Full message of the enquiry                       | Not Null                     |
| `status`          | String    | Status of the enquiry (e.g., 'OPEN', 'CLOSED', 'IN_PROGRESS') | Not Null                     |
| `created_at`      | Timestamp | Enquiry creation timestamp                        | Auto-generated               |
| `response`        | String    | Administrator's response to the enquiry           | Nullable                     |
| `responded_at`    | Timestamp | Timestamp of administrator's response             | Nullable                     |

### 3.4. Administrator (`admins` collection/table) - for Maintenance

| Field Name        | Data Type | Description                                       | Constraints                  |
| :---------------- | :-------- | :------------------------------------------------ | :--------------------------- |
| `id`              | String    | Unique admin identifier                           | Primary Key, Auto-generated  |
| `email`           | String    | Admin's email address                             | Unique, Not Null             |
| `password_hash`   | String    | Hashed password                                   | Not Null                     |
| `role`            | String    | Admin role (e.g., 'SUPER_ADMIN', 'SUPPORT')       | Not Null                     |

### 3.5. Organization/Outlet (`organizations` collection/table) - for Maintenance

| Field Name        | Data Type | Description                                       | Constraints                  |
| :---------------- | :-------- | :------------------------------------------------ | :--------------------------- |\n| `id`              | String    | Unique organization identifier                    | Primary Key, Auto-generated  |
| `name`            | String    | Name of the organization/outlet                   | Unique, Not Null             |
| `address`         | String    | Physical address of the organization              | Not Null                     |
| `contact_person`  | String    | Contact person for the organization               | Nullable                     |
| `contact_number`  | String    | Contact number for the organization               | Nullable                     |

## 4. API Endpoints

### 4.1. Authentication

*   `POST /api/auth/signup`: Register a new user.
    *   **Request Body:** `email`, `password`, `first_name`, `last_name`, `id_passport`, `physical_address`, `cell_number`
    *   **Response:** `token`, `user_id`
*   `POST /api/auth/signin`: Authenticate user and generate token.
    *   **Request Body:** `email`, `password`
    *   **Response:** `token`, `user_id`
*   `GET /api/auth/me`: Get current authenticated user's details.
    *   **Requires:** `Authorization` header with Bearer token
    *   **Response:** `user` object (excluding password hash)

### 4.2. User Dashboard & Profile

*   `GET /api/users/{userId}/balance`: Get real-time balance for a user.
    *   **Requires:** `Authorization` header with Bearer token
    *   **Response:** `balance`
*   `GET /api/users/{userId}/profile`: Get user profile details.
    *   **Requires:** `Authorization` header with Bearer token
    *   **Response:** `user` object

### 4.3. Send Money

*   `POST /api/transactions/send`: Initiate a money transfer.
    *   **Requires:** `Authorization` header with Bearer token
    *   **Request Body:** `sender_user_id`, `receiver_cell_number`, `amount`, `pin_type` (system/manual), `withdrawal_pin` (if manual), `sender_first_name`, `sender_last_name`, `sender_id_passport`, `sender_physical_address`, `sender_cell_number`
    *   **Response:** `transaction_id`, `voucher_number`, `commission_amount`, `vat_amount`

### 4.4. Withdrawals

*   `POST /api/transactions/withdraw/full`: Process a full account withdrawal.
    *   **Requires:** `Authorization` header with Bearer token
    *   **Request Body:** `sender_user_id`, `receiver_cell_number`, `withdrawal_pin`
    *   **Response:** `transaction_id`, `voucher_number`, `withdrawal_amount`
*   `POST /api/transactions/withdraw/partial`: Process a partial account withdrawal.
    *   **Requires:** `Authorization` header with Bearer token
    *   **Request Body:** `sender_user_id`, `receiver_cell_number`, `withdrawal_pin`, `amount`, `new_withdrawal_pin` (optional), `receiver_name`, `receiver_surname`, `receiver_id_passport`, `receiver_address`
    *   **Response:** `transaction_id`, `voucher_number`, `withdrawal_amount`, `credit_balance_amount`

### 4.5. Enquiries

*   `POST /api/enquiries`: Submit a new enquiry.
    *   **Requires:** `Authorization` header with Bearer token
    *   **Request Body:** `user_id`, `subject`, `message`
    *   **Response:** `enquiry_id`
*   `GET /api/enquiries/{userId}`: Get enquiry history for a user.
    *   **Requires:** `Authorization` header with Bearer token
    *   **Response:** List of `enquiry` objects

### 4.6. Maintenance (Admin Only)

*   `GET /api/admin/users`: Get all user accounts.
    *   **Requires:** `Authorization` header with Admin Bearer token
    *   **Response:** List of `user` objects
*   `POST /api/admin/users`: Create a new user account (by admin).
    *   **Requires:** `Authorization` header with Admin Bearer token
    *   **Request Body:** `email`, `password`, `first_name`, `last_name`, `id_passport`, `physical_address`, `cell_number`
    *   **Response:** `user_id`
*   `PUT /api/admin/users/{userId}/password`: Maintain/reset user password (by admin).
    *   **Requires:** `Authorization` header with Admin Bearer token
    *   **Request Body:** `new_password`
    *   **Response:** Success message
*   `GET /api/admin/transactions`: Get all transaction history.
    *   **Requires:** `Authorization` header with Admin Bearer token
    *   **Response:** List of `transaction` objects
*   `GET /api/admin/enquiries`: Get all enquiries.
    *   **Requires:** `Authorization` header with Admin Bearer token
    *   **Response:** List of `enquiry` objects
*   `PUT /api/admin/enquiries/{enquiryId}/respond`: Respond to an enquiry.
    *   **Requires:** `Authorization` header with Admin Bearer token
    *   **Request Body:** `response_message`
    *   **Response:** Success message
*   `POST /api/admin/organizations`: Create a new organization/outlet.
    *   **Requires:** `Authorization` header with Admin Bearer token
    *   **Request Body:** `name`, `address`, `contact_person`, `contact_number`
    *   **Response:** `organization_id`

## 5. Security Considerations

*   **Authentication:** JWT (JSON Web Tokens) will be used for secure authentication. Tokens will be short-lived and refreshed periodically.
*   **Authorization:** Role-based access control (RBAC) will be implemented to protect routes, ensuring only authorized users (or admins) can access specific functionalities.
*   **Data Protection:** Passwords will be hashed using a strong, industry-standard algorithm (e.g., bcrypt). All sensitive data will be encrypted at rest and in transit (HTTPS).
*   **Row-Level Security:** Database queries will be designed to ensure users can only retrieve or modify data associated with their `user_id`.
*   **Input Validation:** All API endpoints will perform rigorous input validation to prevent injection attacks and ensure data integrity.

## 6. Frontend Design Considerations

*   **Responsive Layout:** The Angular application will be designed with a responsive layout using a modern UI framework (e.g., Angular Material, Bootstrap) to ensure compatibility across various devices.
*   **Smooth Animations:** CSS transitions and animations will be used to provide a smooth and engaging user experience, especially for the collapsible navigation.
*   **Real-time Updates:** WebSockets or server-sent events (SSE) could be considered for real-time balance updates, though a polling mechanism might suffice for initial implementation.

## 7. Initial Balance

Upon successful registration, each new user will be provisioned with an initial balance of R1000.00.

