////////////////////////////////////////  SERVER  ///////////////////////////////////////

const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const helpers = require('./helpers');


//////////////////////////////////////  MIDDLEWARE  /////////////////////////////////////

const bodyParser = require("body-parser");
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['I live and breathe bootcamp', 'Midnight coding brain fatigue']
}));


//////////////////////////////////////  DATABASES  //////////////////////////////////////

const urlDatabase = {
  // "b2xVn2": {
  //   longURL: "http://www.lighthouselabs.ca",
  //   userId: 'aJ48lW'
  // },
  // "9sm5xK": {
  //   longURL: "http://www.google.com",
  //   userId: 'aJ48lW'
  // }
};

const users = {
//   "userRandomID": {
//     userId: "userRandomID",
//     email: "user@example.com",
//     password: "purple-monkey-dinosaur"
//   },
//  "user2RandomID": {
//     userId: "user2RandomID",
//     email: "user2@example.com",
//     password: "dishwasher-funk"
//   }
};


/////////////////////////////////////  GET REQUESTS  ////////////////////////////////////

//////////  GET '/'  --------------------------------------------------------------------
app.get("/", (req, res) => {
  res.redirect('/login');
});

// app.get('/hello', (req, res) => {
//   res.send('<html><body>Hello <b>World</b></body></html>\n');
// });

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });



//////////  GET '/urls' => renders the MyUrls page  -------------------------------------
app.get('/urls', (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];

  const userUrls = helpers.urlsForUser(userId, urlDatabase);
  const templateVars = {
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



//////////  GET '/urls/new' => renders the Create New URL page  -------------------------!!!
app.get('/urls/new', (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];

  const templateVars = {email: undefined};

  if (!user) {
    // res.status(403).send('Please register or login first.');
    res.redirect('/login');
    return;
  };

  templateVars.email = users[userId].email;
  res.render('urls_new', templateVars);

  // if (user) {
  //   templateVars.email = users[userId].email;
  //   return res.render('urls_new', templateVars);
  // };

  // res.redirect('/login');
});



//////////  GET '/urls/:shortURL' => renders the Edit ShortURL page ---------------------
app.get('/urls/:shortURL', (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];

  const userUrls = helpers.urlsForUser(userId, urlDatabase);

  const urlObject = urlDatabase[req.params.shortURL];
  if (!urlObject) {
    res.status(403).send('This short URL does not exist.');
    return;
  };

  const templateVars = {
    user: user,
    email: undefined,
    shortURL: req.params.shortURL,
    longURL: urlObject.longURL
  };

  if (!user) {
    res.status(403).send('Please register or login first.');
    return;
  };

  const shortURL = req.params.shortURL;
  const urlFile = urlDatabase[shortURL];

  if (urlFile && urlFile.userId !== userId) {
    res.status(403).send('Sorry - you do not have access to this Url.');
    return;
  };

  templateVars.email = users[userId].email;
  res.render('urls_show', templateVars);
});



//////////  GET '/u/:shortURL' => redirects to original longURL websites ----------------
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;

  const urlObject = urlDatabase[req.params.shortURL];

  if (!urlObject) {
    res.status(404).send('Sorry - this shortURL does not exist.');
    return;
  };

  const longURL = urlDatabase[shortURL].longURL;

  if (!urlDatabase[shortURL]) {
    return res.status(404).send('Sorry - the shortURL you have entered is invalid.');
  };

  res.redirect(longURL);
});



//////////  GET '/register' => renders the Register page --------------------------------
app.get('/register', (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  const templateVars = { email: undefined };

  if (user) {
    templateVars.email = users[userId].email;
    return res.redirect('urls');
  };

  res.render('register', templateVars);
});



//////////  GET '/login' => renders the Login page --------------------------------------
app.get('/login' , (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];

  const templateVars = {
    email: undefined,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]};

  if (user) {
    templateVars.email = users[userId].email;
    return res.redirect('urls');
  };

  res.render('login', templateVars);
});



///////////////////////////////////// POST REQUESTS /////////////////////////////////////

//////////  POST '/urls' ==> create a new shortURL ---------------------------------------
app.post("/urls", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];

  if (!user) {
    res.status(403).send('Please register or login first.');
    return;
  };

  const shortURL = helpers.generateRandomString();

  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userId: req.session.user_id
  };

  res.redirect(`/urls/${shortURL}`);
});



//////////  POST '/urls/:shortURL' => edit a shortURL ---------------------------------------------
app.post('/urls/:shortURL', (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];

  const userUrls = helpers.urlsForUser(userId, urlDatabase);

  const templateVars = {
    user: user,
    email: undefined,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL
  };

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

  urlDatabase[shortURL].longURL = req.body.longURL;
  res.redirect(`/urls`);
});



//////////  POST '/urls/:shortURL/delete' => delete a shortURL --------------------------
app.post('/urls/:shortURL/delete', (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];

  const userUrls = helpers.urlsForUser(userId, urlDatabase);

  const templateVars = {
    user: user,
    email: undefined,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL
  };

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



//////////  POST '/login' => login the user ---------------------------------------------
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // If no valid email or password is entered
  if (!email || !password) {
    return res.status(400).send('Pleae enter a valid email and/or password.');
  };

  const user = helpers.authenticateUser(email, password, users);

  // If the user is not found, or the email and password don't match
  if (!user) {
    return res.status(403).send('Sorry: the email and password do not match.');
  };

  if (user) {
    req.session.user_id = user.userId;
    res.redirect('/urls');
  };
});



//////////  POST '/logout' => logout the user -------------------------------------------
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});



//////////  POST '/register' => register a new user -------------------------------------
app.post('/register', (req, res) => {
  const userId = helpers.generateRandomString();
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password, 10);

  // If no valid email or password is entered
  if (!email || !req.body.password) {
    return res.status(400).send('Pleae enter a valid email and/or password.');
  };

  // If the user (based on email) is already in the database
  const userFound = helpers.getUserByEmail(email, users);
  if (userFound) {
    return res.status(400).send('This user is already registered.');
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



/////////////////////////////////////// Server Up ///////////////////////////////////////
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


