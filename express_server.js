const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

////////////////////  Middleware ////////////////////
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set('view engine', 'ejs');


const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userId: 'aJ48lW'
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userId: 'aJ48lW'
  }
};

const users = {
  "userRandomID": {
    userId: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    userId: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

////////////////////  Helper Functions ////////////////////
function generateRandomString() {
  let randomString = Math.random().toString(36).slice(7);
  return randomString;
};

// This helper function from Dominic Tremblay's lecture w03d03.
// It will create a new user object and return the randomly-generated userID string.
const createUser = function(email, password, users) {
  const userId = generateRandomString();
  users[userId] = {
    userId,
    email,
    password
  }
  return userId;
};

// This helper function from Dominic Tremblay's lecture w03d03.
const findUserByEmail = function(email, users) {
  for (let userId in users) {
    const user = users[userId];
      if (email === user.email) {
        return user;
      }
  }
  return false;
};

// This helper function from Dominic Tremblay's lecture w03d03.
const authenticateUser = function(email, passwordAttempt, users) {
  const userFound = findUserByEmail(email, users);
  if (userFound && bcrypt.compareSync(passwordAttempt, userFound.password)) {
    return userFound;
  }
  return false;
};

const urlsForUser = function (currentId) {
  let userUrls = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url]['userId'] === currentId) {
      userUrls[url] = urlDatabase[url];
    }
  }
  return userUrls;
};


////////////////////  Routes/Renders ////////////////////

// This is the route for the main '/urls' page with the list of short URLs and long URLs (urls_index).
app.get('/urls', (req, res) => {
  const userId = req.cookies["user_id"];
  const user = users[userId];

  const userUrls = urlsForUser(userId);
  let templateVars = { user: user, email: undefined, urls: userUrls };

  if (!user) {
    // change this line so that users who are not logged in can be redirected to the login page instead
    res.status(403).send('Please register or login first.');
    return;
  }
  templateVars.email = users[userId].email;
  res.render('urls_index', templateVars);
})

// This is the route for the '/urls/new' page for creating a new short URL (urls_new).
app.get('/urls/new', (req, res) => {
  const userId = req.cookies["user_id"];
  const user = users[userId];
  let templateVars = {email: undefined};
  if (user) {
    templateVars.email = users[userId].email;
    return res.render('urls_new', templateVars);
  }
  res.redirect('/login');
})

// !!!! This is the route for the 'urls/:shortURL' individual page for each URL (urls_show).
app.get('/urls/:shortURL', (req, res) => {
  const userId = req.cookies["user_id"];
  const user = users[userId];

  const userUrls = urlsForUser(userId);
  let templateVars = { user: user, email: undefined, shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL};

  if (!user) {
    res.status(403).send('Please register or login first.');
    return;
  }

  const shortURL = req.params.shortURL;
  const urlFile = urlDatabase[shortURL];

  if (urlFile.userId !== userId) {
    res.status(403).send('Sorry: you do not have access to this Url.');
    return;
  }

  templateVars.email = users[userId].email;
  res.render('urls_show', templateVars);
  });

// This is the route for the '/register' page for registering new users (register.ejs).
app.get('/register', (req, res) => {
  // if there is a user id in the cookie, redirect them to the /urls route
  const userId = req.cookies['user_id'];
  const user = users[userId];
  const templateVars = { email: undefined };
  if (user) {
    templateVars.email = users[userId].email;
    res.redirect('urls');
  }
  res.render('register', templateVars);
})

// This is the route for the dedicated '/login' page (login.ejs).
app.get('/login' , (req, res) => {
  const userId = req.cookies["user_id"];
  const user = users[userId];
  let templateVars = { email: undefined, shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  if (user) {
    templateVars.email = users[userId].email;
    res.redirect('urls');
  }
  res.render('login', templateVars);
})

//////////////////// Server CRUD Operations ////////////////////

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
})

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// This creates the new shortURL and adds it to the database; redirects to 'urls/:shortURL'
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL: req.body.longURL, userId: req.cookies['user_id']};
  // console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});

// This redirects the shortURL to the actual web page of each longURL.
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;

  if (!urlDatabase[shortURL]) {
    return res.status(404).send('Sorry: the shortURL you have entered is invalid.');
  }

  // if (!longURL) {
  //   return res.status(404).send('Sorry: the requested URL cannot be found.');
  // }
  res.redirect(longURL);
});

// This deletes a URL from the database.
app.post('/urls/:shortURL/delete', (req, res) => {
    const userId = req.cookies["user_id"];
  const user = users[userId];

  const userUrls = urlsForUser(userId);
  let templateVars = { user: user, email: undefined, shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL};

  if (!user) {
    res.status(403).send('Please register or login first.');
    return;
  }

  const shortURL = req.params.shortURL;
  const urlFile = urlDatabase[shortURL];

  if (urlFile.userId !== userId) {
    res.status(403).send('Sorry: you do not have access to this Url.');
    return;
  }

  delete urlDatabase[shortURL];
  res.redirect('/urls');
})

// This updates a URL from the database.
app.post('/urls/:shortURL', (req, res) => {
  const userId = req.cookies["user_id"];
const user = users[userId];

const userUrls = urlsForUser(userId);
let templateVars = { user: user, email: undefined, shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL};

if (!user) {
  res.status(403).send('Please register or login first.');
  return;
}

  const shortURL = req.params.shortURL;
  const urlFile = urlDatabase[shortURL];

  if (urlFile.userId !== userId) {
    res.status(403).send('Sorry: you do not have access to this Url.');
    return;
  }

  urlDatabase[shortURL].longURL = req.body.longURL;
  res.redirect(`/urls`);
})

// This handles the login request in the header partial (_header).
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // If no valid email or password is entered...
  if (!email || !password) {
    res.status(400).send('Pleae enter a valid email and/or password.');
  }

  const user = authenticateUser(email, password, users);

  // If the user is not found, or the email and password don't match...
  if (!user) {
    res.status(403).send('Sorry: the email and password do not match.');
  }

  if (user) {
    // console.log(user);
    // console.log(user.userId)
    res.cookie('user_id', user.userId);
    res.redirect('/urls');

  }

});

// This handles the logout request in the header partial (_header).
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
})

// This registers a new user and adds that user's data to the users database.
app.post('/register', (req, res) => {
  const userId = generateRandomString();
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password, 10);
  console.log('Hashed Password: ', password)

  // If no valid email or password is entered...
  if (!email || !password) {
    res.status(400).send('Pleae enter a valid email and/or password.');
  }

  // If the user (based on email) is already in the database...
  const userFound = findUserByEmail(email, users);
    if (userFound) {
      res.status(400).send('This user is already registered.');
    }

  // Create a new user entry in the users database and return the userId.
  users[userId] = {
      userId,
      email,
      password
    };

  // Using a helper function to create a new user entry in the users database and return the userId.
  // const userId  = createUser(email, password, users);

  res.cookie('user_id', userId);
  // console.log(users);
  res.redirect('/urls');
});





//////////////////// Server Up ////////////////////
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


