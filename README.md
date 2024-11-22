# **My Plans_api Project**

A RESTful API built using **Express.js**, **MySQL**, and **JWT authentication**. The project includes functionalities for user signup/login, managing plans, adding/removing friends, and filtering data based on various criteria.

---

## **Features**
- **User Authentication**: Secure signup and login using hashed passwords (bcrypt) and JWT authentication.
- **Plans Management**: 
  - Create, update, delete, and fetch plans for a user.
  - Filter plans based on category, location, and user-defined criteria.
- **Authorization**: Protect routes with JWT middleware for secure access.

---

## **Installation**

### **1. Clone the Repository**
```bash
git clone https://github.com/username/repository-name.git
cd repository-name
```

### **2. Install Dependencies**
```bash
npm install
```

### **3. Set Up MySQL Database**
- Create a MySQL database (e.g., `plans_db`).
- Run the following SQL commands to create the required tables:

#### **Users Table**
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### **Plans Table**
```sql
CREATE TABLE plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  duration VARCHAR(50) NOT NULL,
  features TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  location_name VARCHAR(255),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  user_id INT,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### **Friends Table**
```sql
CREATE TABLE friends (
  user_id INT PRIMARY KEY,
  friend JSON NOT NULL,
  plan_id INT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### **4. Configure Environment Variables**
- Create a `.env` file in the root directory:
```bash
JWT_SECRET=your_jwt_secret_key
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=plans_db
```

---

## **Usage**

### **1. Start the Server**
```bash
node app.js
```

### **2. Access the API**
Use tools like **Postman** to test the API endpoints.

---

## **API Endpoints**

### **User Authentication**
| Method | Endpoint         | Description              |
|--------|------------------|--------------------------|
| POST   | `/api/signup`    | Signup a new user        |
| POST   | `/api/login`     | Login and get a JWT token|

### **Plans Management**
| Method | Endpoint         | Description                     |
|--------|------------------|---------------------------------|
| POST   | `/api/plans`     | Create a new plan               |
| GET    | `/api/plans`     | Get all plans for a user        |
| PUT    | `/api/plans/:id` | Update a plan by ID             |
| DELETE | `/api/plans/:id` | Delete a plan by ID             |
| GET    | `/api/plans/filter` | Filter plans based on criteria |


---

## **Testing**

### **Postman**
- Use **Postman** to test the API endpoints.
- Include the **Authorization** header for protected routes:
  ```
  Authorization: Bearer <JWT_TOKEN>
  ```

---

## **Project Structure**

```
/my-express-app
  /models
    db.js            # MySQL database connection
  /routes
    plans.js         # Routes for managing plans
  app.js             # Entry point for the server
  .env               # Environment variables
  package.json       # Dependencies and scripts
  README.md          # Project documentation
```
