const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

// ---------- Middleware Being Used ----------
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set('view engine', 'ejs');


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


// ---------- Helper Functions ----------
function generateRandomString() {
  let randomString = Math.random().toString(36).slice(7);
  return randomString;
}


// ---------- Routes/Renders ----------

// This is the route for the main '/urls' page with the list of short URLs and long URLs (urls_index).
app.get('/urls', (req, res) => {
  const templateVars = { username: req.cookies["username"], urls: urlDatabase };
  res.render('urls_index', templateVars);
})

// This is the route for the '/urls/new' page for creating a new short URL (urls_new).
app.get('/urls/new', (req, res) => {
  const templateVars = { username: req.cookies["username"] };
  res.render('urls_new', templateVars);
})

// This is the route for the 'urls/:shortURL' individual page for each URL (urls_show).
app.get('/urls/:shortURL', (req, res) => {
  const templateVars = { username: req.cookies["username"], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render('urls_show', templateVars);
});

// This is the route for the 'urls/register' page for registering new users (urls_register).
app.get('/register', (req, res) => {
  const templateVars = { username: req.cookies["username"] };
  res.render('register', templateVars);
})


// ---------- Server CRUD Operations ----------

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
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

// This redirects the shortURL to the actual web page of each longURL.
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// This deletes a URL from the database.
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
})

// This updates a URL from the database.
app.post('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls`);
})

// This handles the login request in the header partial (_header).
app.post('/login', (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('username', req.body.username);
  res.redirect('/urls');
})



// ---------- Server Up ----------
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


