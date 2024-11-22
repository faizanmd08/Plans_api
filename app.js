const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const plansRoutes = require("./routes/plans");
// const friendsRoutes = require("./friends"); // friends.js is in the root directory

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());

// Routes
app.use("/api/plans", plansRoutes); // Plan routes
// app.use("/api/friends", friendsRoutes); // Friends routes (friends.js in root)

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
