const { request } = require('express')

const router = require('express').Router()
// handle connection
const dbConnection = require('../connection/database')
// handle location of file
var pathFile = 'http://localhost:5000/uploads/'

// render register page
router.get("/detailMovies/:id", function(request, res) {
  const id = request.params.id;
  const query = `SELECT * FROM tb_movie WHERE id = ${id}`;

  dbConnection.getConnection(function (err,conn) {
    if (err) throw err
    conn.query(query, function (err, results) {
      if (err) throw err
      const movies = []

      for (var result of results) {
        movies.push({
          id: result.id,
          name: result.name,
          duration: result.movie_hour,
          poster: pathFile + result.poster
        });
      }
      res.render("process/detail", {title: "detail movie", 
      isLogin: request.session.isLogin,
      movies
      })
    })
  })
})

//render checkout page
router.get("/checkout", function(request, res) {
  res.render("process/checkout", {title: "checkout", isLogin: request.session.isLogin})
})

//render buy ticket page
router.get("/buy/:id", function(request, res) {
  res.render("process/buy", {title: "buy now", isLogin: request.session.isLogin})
})

// handle buy
router.post("buy")
module.exports = router