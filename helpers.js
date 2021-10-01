const bcrypt = require('bcryptjs');

////////////////////  Helper Functions ////////////////////

function generateRandomString() {
  let randomString = Math.random().toString(36).slice(7);
  return randomString;
};


const createUser = function(email, password, users) {
  const userId = generateRandomString();
  users[userId] = {
    userId,
    email,
    password
  }
  return userId;
};


const getUserByEmail = function(email, database) {
  for (let userId in database) {
    const user = database[userId];
      if (email === user.email) {
        return user;
      }
  }
  return false;
};


const authenticateUser = function(email, passwordAttempt, users) {
  const userFound = getUserByEmail(email, users);
  if (userFound && bcrypt.compareSync(passwordAttempt, userFound.password)) {
    return userFound;
  }
  return false;
};


const urlsForUser = function (currentId, urlDatabase) {
  let userUrls = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url]['userId'] === currentId) {
      userUrls[url] = urlDatabase[url];
    }
  }
  return userUrls;
};


module.exports = { generateRandomString, createUser, getUserByEmail, authenticateUser, urlsForUser };