// import package
const http = require("http");
const express = require("express");
const path = require("path");
const session = require("express-session");
const app = express();
const hbs = require("hbs");
// handle location of file
var pathFile = "http://localhost:5000/uploads/";

// routing
const backendRoute = require("./routes/backend");
const processRoute = require("./routes/process");

// set connection & middlewares
const dbConnection = require("./connection/database");
const uploadFile = require("./middlewares/uploadFile");
const { response } = require("express");
const isLogin = false;

// set public
app.use("/public", express.static(path.join(__dirname, "public")));
// set uploaded file
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(express.urlencoded({ extended: false }));

// set views location to app
app.set("views", path.join(__dirname, "views"));

// set template/view engine
app.set("view engine", "hbs");

// register view partials
hbs.registerPartials(path.join(__dirname, "views/partials"));

// use session
app.use(
  session({
    cookie: {
      maxAge: 1000 * 60 * 60 * 2,
    },
    store: new session.MemoryStore(),
    resave: false,
    saveUninitialized: true,
    secret: "SecretKey",
  })
);

// session alert
app.use(function (req, res, next) {
  res.locals.message = req.session.message;
  delete req.session.message;
  next();
});

// render index page
app.get("/", function (request, res) {
  const query = `SELECT * FROM tb_movie`;

  dbConnection.getConnection(function (err, conn) {
    if (err) throw err;
    conn.query(query, function (err, results) {
      if (err) throw err;
      const movies = [];

      for (var result of results) {
        movies.push({
          id: result.id,
          name: result.name,
          duration: result.movie_hour,
          poster: pathFile + result.poster,
        });
      }
      res.render("index", {
        title: "Welcome to XXI Tegal",
        isLogin: request.session.isLogin,
        movies,
      });
    });
  });
});

// render signup
app.get("/signup", function (request, response) {
  const title = "signup";
  response.render("auth/signup", {
    title,
  });
});
// handle signup
app.post("/signup", function (request, response) {
  var { email, password } = request.body;

  if (email == "" || password == "") {
    request.session.message = {
      type: "danger",
      message: "Please insert all field!",
    };
    return response.redirect("/signup");
  }
  const query = `INSERT INTO tb_user (email, password) VALUES ("${email}", "${password}")`;
  dbConnection.getConnection(function (err, conn) {
    if (err) throw err;
    conn.query(query, function (err, result) {
      if (err) throw err;

      request.session.message = {
        type: "success",
        message: "successfully signup!",
      };

      response.redirect("/signup");
    });

    conn.release();
  });
});
// render login
app.get("/login", function (request, response) {
  const title = "Login";
  response.render("auth/login", {
    title,
    isLogin,
  });
});
// handle login
app.post("/login", function (request, response) {
  const { email, password } = request.body;

  if (email == "" || password == "") {
    request.session.message = {
      type: "danger",
      message: "Please insert all field!",
    };

    return response.redirect("login");
  }

  const query = `SELECT * FROM tb_user WHERE email = "${email}" AND password = "${password}"`;
  dbConnection.getConnection(function (err, conn) {
    if (err) throw err;
    conn.query(query, function (err, results) {
      if (err) throw err;

      if (results.length == 0) {
        request.session.message = {
          type: "danger",
          message: "Email and password dont match!",
        };
        return response.redirect("login");
        // handle user
      } else {
        request.session.isLogin = true;

        request.session.user = {
          id: results[0].user_id,
          email: results[0].email,
          status: results[0].status,
        };
        const user = results[0];
        let status = user.status;
        request.session.isAdmin = false;
        if (status == "admin") {
          request.session.isAdmin = true;
          response.redirect("/admin");
        } else if (status == "user") {
          request.session.isAdmin = false;
          response.redirect("/");
        }
      }
    });
    conn.release();
  });
});
// handle signout
app.get("/signout", function (request, response) {
  request.session.destroy();
  response.redirect("/");
});

// mount backend page
app.use("/", backendRoute);
// mount proses route
app.use("/", processRoute);

const server = http.createServer(app);
const port = 5000;
server.listen(port, () => {
  console.log("server running on port: ", port);
});
