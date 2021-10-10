// handle upload image
const uploadFile = require('../middlewares/uploadFile');

const router = require('express').Router()
// handle connection
const dbConnection = require('../connection/database');
// handle location of file
var pathFile = 'http://localhost:5000/uploads/';


router.get("/admin", function(request, response) {
  const query = `SELECT * FROM tb_movie`;

  dbConnection.getConnection(function (err,conn) {
    if (err) throw err;
    conn.query(query, function (err, results) {
      if (err) throw err;
      const movies = [];

      for (var result of results) {
        movies.push({
          id: result.id,
          name: result.name,
          duration: result.movie_hour,
          poster: pathFile + result.poster
        });
      }

      if (request.session.isAdmin){
        response.render("admin/dashboard", {
        title: "dashboard", 
        isAdmin: request.session.isAdmin,
        movies
      })
      }
      else {
        response.redirect('/login')
      }
      conn.release()
      });
    });
})

router.get('/addMovies', function(request, response){

  const query = `SELECT id, name FROM tb_type`

  dbConnection.getConnection(function (err,conn) {
    if (err) throw err
    conn.query(query, function (err, results) {
      if (err) throw err
      const type = []

      for (var result of results) {
        type.push({
          id: result.id,
          name: result.name,
        });
      }

      if (request.session.isAdmin){
        response.render("admin/addMovies", {
        title: "add new movies", 
        isAdmin: request.session.isAdmin,
        type
      })
      }
      else {
        response.redirect('/login')
      }

      conn.release()
      })
    })
})

router.post('/addMovies', uploadFile('image'), function(request, response){
  const {movie_title, duration, sinopsis, category} = request.body
  var image = '';

// handle file
  if (request.file){
    image = request.file.filename;
  }

  if(movie_title == '' || image == '' || duration == ''){
    request.session.message = {
      type: 'danger',
      message: 'Please insert all field!',
    };

    response.redirect('/addMovies');
  }

  const query = `INSERT INTO tb_movie (name, movie_hour, poster, sinopsis, type_id) VALUES ("${movie_title}", "${duration}", "${image}", "${sinopsis}", "${category}")`
  dbConnection.getConnection(function(err,conn){
    if(err) throw err
      conn.query(query,function(err,result) {
        if (err) throw err

        request.session.message = {
          type: 'success',
          message: 'Add Movie has success',
        }

        response.redirect('/addMovies')
      })

      conn.release()
   })

})

router.get('/addGenre', function (request, response){
  if (request.session.isAdmin){
    
    response.render("admin/addGenre", {title: "add movie genre", isAdmin: request.session.isAdmin})
  }
  else {
    response.redirect('/login')
  }
})

router.post('/addGenre', function (request, response){
  const {genre} = request.body

  const query = `INSERT INTO tb_type (name) VALUES ("${genre}")`
  dbConnection.getConnection(function(err,conn){
    if(err) throw err;
      conn.query(query,function(err,result) {
        if (err) throw err;

        request.session.message = {
          type: 'success',
          message: 'Add genre has success',
        }

        response.redirect('/addGenre');
      })

      conn.release();
   })

})

router.get('/detail/:id', function(request,response) {
  const id = request.params.id;
  const query = `SELECT * FROM tb_movie WHERE id = ${id}`;

  dbConnection.getConnection(function (err,conn) {
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
          sinopsis: result.sinopsis
        });
      }

      if (request.session.isAdmin){
        response.render("admin/detail", {
        title: "Movies detail", 
        isAdmin: request.session.isAdmin,
        movies
      })
      }
      else {
        response.redirect('/login')
      }

      });
    });
})

router.get('/edit/:id', function (request, response){
  const id = request.params.id;
  const query = `SELECT * FROM tb_movie WHERE id = ${id}`;
  const movies = []
  dbConnection.getConnection(function (err,conn) {
    if (err) throw err;
    conn.query(query, function (err, results) {
      if (err) throw err;

      for (var result of results) {
        movies.push({
          id: result.id,
          name: result.name,
          duration: result.movie_hour,
          poster: pathFile + result.poster
        })
      }

      if (request.session.isAdmin){
        response.render("admin/edit", {
        title: "Edit Movies", 
        isAdmin: request.session.isAdmin,
        movies
      })
      }
      else {
        response.redirect('/login')
      }

      })
    })
})

router.post('/edit', uploadFile('image'), function(request,response) {
  const {movie_title, duration, oldPoster, id, sinopsis} = request.body

  var image = oldPoster.replace(pathFile, '')
  if (request.file) {
    image = request.file.filename
  }

  const query = `UPDATE tb_movie SET name = "${movie_title}", movie_hour = "${duration}", poster = "${image}", sinopsis = "${sinopsis}" WHERE id = "${id}"`

  dbConnection.getConnection(function(err,conn){
    if(err) throw err
      conn.query(query,function(err,results) {
        if (err) throw err
        console.log(query)
        response.redirect('/admin')
      })
      conn.release()
   })
})

router.get('/delete/:id', function (request, response){
  const id = request.params.id

  const query = `DELETE FROM tb_movie WHERE id = ${id}`

  dbConnection.getConnection(function(err,conn){
    if(err) throw err
    conn.query(query,function(err,result) {
      if (err) throw err

      response.redirect('/admin')
    })

    conn.release()
  })
  
})

//  handle logout
router.get('/logout', function(request,response) {
  request.session.destroy();
  response.redirect('/');
});

module.exports = router