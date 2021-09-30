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
}

// ---------- Helper Functions ----------
function generateRandomString() {
  let randomString = Math.random().toString(36).slice(7);
  return randomString;
}

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



// ---------- Routes/Renders ----------

// This is the route for the main '/urls' page with the list of short URLs and long URLs (urls_index).
app.get('/urls', (req, res) => {
  const userId = req.cookies["user_id"];
  const user = users[userId];
  let templateVars = {email: undefined, urls: urlDatabase };
  if (user) {
    templateVars.email = users[userId].email;
  }
  res.render('urls_index', templateVars);
})

// This is the route for the '/urls/new' page for creating a new short URL (urls_new).
app.get('/urls/new', (req, res) => {
  const userId = req.cookies["user_id"];
  const user = users[userId];
  let templateVars = {email: undefined};
  if (user) {
    templateVars.email = users[userId].email;
  }
  res.render('urls_new', templateVars);
})

// This is the route for the 'urls/:shortURL' individual page for each URL (urls_show).
app.get('/urls/:shortURL', (req, res) => {
  const userId = req.cookies["user_id"];
  const user = users[userId];
  let templateVars = { email: undefined, shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  if (user) {
    templateVars.email = users[userId].email;
  }
  res.render('urls_show', templateVars);
  });

// This is the route for the 'urls/register' page for registering new users (urls_register).
app.get('/register', (req, res) => {
  // if there is a user id in the cookie, redirect them to the /urls route
  const templateVars = { email: undefined };
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
  const shortURL = generateRandomString();
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
  res.cookie('user_id', userId); // this line will need to be erased or changed
  res.redirect('/urls');
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
  const password = req.body.password;

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
  console.log(users);
  res.redirect('/urls');
});





// ---------- Server Up ----------
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


