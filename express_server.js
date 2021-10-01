////////////////////  SERVER  ////////////////////
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const helpers = require('./helpers');


////////////////////  MIDDLEWARE  ////////////////////
const bodyParser = require("body-parser");
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['I live and breathe bootcamp', 'Midnight coding brain fatigue']
}));


////////////////////  DATABASES  ////////////////////
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


////////////////////  SETTING UP ROUTES  ////////////////////
app.get("/", (req, res) => {
  res.redirect('/login');
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


//--- MyURLs route ===> (urls_index).
app.get('/urls', (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];

  const userUrls = helpers.urlsForUser(userId, urlDatabase);
  let templateVars = {
    user: user,
    email: undefined,
    urls: userUrls
  };

  if (!user) {
    res.status(403).send('Please register or login first.');
    return;
  };

  templateVars.email = users[userId].email;
  res.render('urls_index', templateVars);
});


//--- New ShortURL route ===> (urls_new).
app.get('/urls/new', (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];

  let templateVars = {email: undefined};

  if (user) {
    templateVars.email = users[userId].email;
    return res.render('urls_new', templateVars);
  };

  res.redirect('/login');
});


//--- Edit ShortURL route ===> (urls_show).
app.get('/urls/:shortURL', (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];

  const userUrls = helpers.urlsForUser(userId, urlDatabase);
  let templateVars = {
    user: user,
    email: undefined,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL};

  if (!user) {
    res.status(403).send('Please register or login first.');
    return;
  }

  const shortURL = req.params.shortURL;
  const urlFile = urlDatabase[shortURL];

  if (urlFile.userId !== userId) {
    res.status(403).send('Sorry - you do not have access to this Url.');
    return;
  }

  templateVars.email = users[userId].email;
  res.render('urls_show', templateVars);
});


//--- Register Route ===> (register.ejs).
app.get('/register', (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  const templateVars = { email: undefined };

  if (user) {
    templateVars.email = users[userId].email;
    res.redirect('urls');
  };

  res.render('register', templateVars);
});


//--- Login Route ===> (login.ejs).
app.get('/login' , (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  let templateVars = {
    email: undefined,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]};

  if (user) {
    templateVars.email = users[userId].email;
    res.redirect('urls');
  };

  res.render('login', templateVars);
});


//////////////////// CRUD OPERATIONS ////////////////////


//--- Create new shortURL
app.post("/urls", (req, res) => {
  const shortURL = helpers.generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userId: req.session.user_id};

  res.redirect(`/urls/${shortURL}`);
});


//--- Link to shortURL websites
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;

  if (!urlDatabase[shortURL]) {
    return res.status(404).send('Sorry - the shortURL you have entered is invalid.');
  };

  res.redirect(longURL);
});


//--- Delete URL
app.post('/urls/:shortURL/delete', (req, res) => {
    const userId = req.session.user_id;
  const user = users[userId];

  const userUrls = helpers.urlsForUser(userId, urlDatabase);
  let templateVars = {
    user: user,
    email: undefined,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL};

  if (!user) {
    res.status(403).send('Please register or login first.');
    return;
  };

  const shortURL = req.params.shortURL;
  const urlFile = urlDatabase[shortURL];

  if (urlFile.userId !== userId) {
    res.status(403).send('Sorry - you do not have access to this Url.');
    return;
  };

  delete urlDatabase[shortURL];
  res.redirect('/urls');
});


//--- Update URL
app.post('/urls/:shortURL', (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];

  const userUrls = helpers.urlsForUser(userId, urlDatabase);
  let templateVars = {
    user: user,
    email: undefined,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL};

  if (!user) {
    res.status(403).send('Please register or login first.');
    return;
  }

  const shortURL = req.params.shortURL;
  const urlFile = urlDatabase[shortURL];

  if (urlFile.userId !== userId) {
    res.status(403).send('Sorry - you do not have access to this Url.');
    return;
  };

  urlDatabase[shortURL].longURL = req.body.longURL;
  res.redirect(`/urls`);
});


//--- Login user
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // If no valid email or password is entered
  if (!email || !password) {
    res.status(400).send('Pleae enter a valid email and/or password.');
  };

  const user = helpers.authenticateUser(email, password, users);

  // If the user is not found, or the email and password don't match
  if (!user) {
    res.status(403).send('Sorry: the email and password do not match.');
  };

  if (user) {
    req.session.user_id = user.userId;
    res.redirect('/urls');
  };
});


//--- Logout user
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});


//--- Register new user
app.post('/register', (req, res) => {
  const userId = helpers.generateRandomString();
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password, 10);

  // If no valid email or password is entered
  if (!email || !password) {
    res.status(400).send('Pleae enter a valid email and/or password.');
  };

  // If the user (based on email) is already in the database
  const userFound = helpers.getUserByEmail(email, users);
    if (userFound) {
      res.status(400).send('This user is already registered.');
    };

  // Create a new user entry in the users database and return the userId.
  users[userId] = {
      userId,
      email,
      password
    };

  req.session.user_id = userId;
  res.redirect('/urls');
});


//////////////////// Server Up ////////////////////
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


