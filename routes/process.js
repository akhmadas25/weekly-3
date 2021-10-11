const { request } = require('express')

const router = require('express').Router()
// handle connection
const dbConnection = require('../connection/database')
// handle location of file
var pathFile = 'http://localhost:5000/uploads/'

// render detail movie
router.get("/detailMovies/:id", function(request, res) {
  const id = request.params.id
  const query = `SELECT * FROM tb_movie WHERE id = ${id}`

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
          poster: pathFile + result.poster,
          sinopsis: result.sinopsis
        })
      }
      res.render("process/detail", {title: "detail movie", 
      isLogin: request.session.isLogin,
      movies
      })
    })
    conn.release()
  })
})

//render buy ticket page
router.get("/buy/:id", function(request, res) {
  const id = request.params.id
  if (request.session.isLogin){
    
    res.render("process/buy", {title: "buy now", isLogin: request.session.isLogin, id})
  }
  else {
    res.redirect('/login')
  }
})

// handle buy
router.post("/buy", function(request, response){
  const {showDate, time, movie_id, venue, amount} = request.body
  const user = request.session.user
  const user_id = user.id
  const price = 30000
  const ticket_number = Date.now()
  const query = `INSERT INTO tb_ticket (ticket_number, date_show, time_show, price, venue, amount, movie_id, user_id) VALUES ("${ticket_number}", "${showDate}", "${time}", "${price}", "${venue}", "${amount}", "${movie_id}", "${user_id}")`
  dbConnection.getConnection(function(err,conn){
    if(err) throw err
      conn.query(query,function(err,result) {
        if (err) throw err
        
        response.redirect(`/checkout/${movie_id}`);
      })

      conn.release()
   })
})

router.get("/chart", function(request, res){
  if (request.session.isLogin){
    const user = request.session.user
    const user_id = user.id
    const query = `SELECT t.id, t.ticket_number, t.user_id, t.created_at, t.price, t.amount, t.movie_id, m.name, u.email
    FROM tb_ticket t
    INNER JOIN tb_movie m
    ON t.movie_id = m.id
    INNER JOIN tb_user u
    ON t.user_id = u.user_id
    WHERE t.user_id = ${user_id};`
    dbConnection.getConnection(function (err,conn) {
      if (err) throw err
      conn.query(query, function (err, results) {
        if (err) throw err
        const ticket = []

        for (var result of results) {
          ticket.push({
            id: result.id,
            ticketNumber: result.ticket_number,
            name: result.name,
            email: result.email,
            date: result.created_at,
            user_id: result.user_id,
            movie_id: result.movie_id,
            price: result.price,
            amount: result.amount,
            total: result.price * result.amount
          })
        }
        res.render("process/invoice", {title: "chart", 
        isLogin: request.session.isLogin,
        ticket
        })
      })
      conn.release()
    })
  }
  else {
    res.redirect('/login')
  }
})

//render checkout
router.get("/checkout/:id", function(request, res) {
  if (request.session.isLogin){
    const movie_id = request.params.id
    const user = request.session.user
    const user_id = user.id
    const query = `
    SELECT t.id, t.ticket_number, t.user_id, t.created_at, t.price, t.amount, t.movie_id, m.name, u.email
    FROM tb_ticket t
    INNER JOIN tb_movie m
    ON t.movie_id = m.id
    INNER JOIN tb_user u
    ON t.user_id = u.user_id
    WHERE t.movie_id = ${movie_id} AND t.user_id = ${user_id};`
  
    dbConnection.getConnection(function (err,conn) {
      if (err) throw err
      conn.query(query, function (err, results) {
        if (err) throw err
        const ticket = []
        for (var result of results) {
          ticket.push({
            id: result.id,
            ticketNumber: result.ticket_number,
            name: result.name,
            email: result.email,
            date: result.created_at,
            user_id: result.user_id,
            movie_id: result.movie_id,
            price: result.price,
            amount: result.amount,
            total: result.price * result.amount
          })
        }
        res.render("process/invoice", {title: "checkout", 
        isLogin: request.session.isLogin,
        ticket,
        user_id
        })
      })
      conn.release()
    })
  } 
  else {
    res.redirect('/login')
  }
})

// handle checkout to payment
router.post("/checkout", function(request, res){
  const {ticketId, amount, subTotal} = request.body
  const user = request.session.user
  const user_id = user.id
  const query = `INSERT INTO tb_payment (ticket_id, amount, sub_total) VALUES ("${ticketId}", "${amount}", "${subTotal}")`
  dbConnection.getConnection(function(err,conn){
    if(err) throw err
      conn.query(query,function(err,result) {
        if (err) throw err
        
        res.redirect('/myTicket');
      })

      conn.release()
   })
})

router.get("/myTicket", function(request, res){
  const user = request.session.user
  const user_id = user.id
  const query = `
  SELECT t.ticket_number, t.user_id, t.date_show, t.time_show, t.venue, t.price, m.name, u.email
  FROM tb_ticket t
  INNER JOIN tb_movie m
  ON t.movie_id = m.id
  INNER JOIN tb_user u
  ON t.user_id = u.user_id
  WHERE t.user_id = ${user_id};`

  dbConnection.getConnection(function (err,conn) {
    if (err) throw err
    conn.query(query, function (err, results) {
      if (err) throw err
      const ticket = []
      for (var result of results) {
        ticket.push({
          ticketNumber: result.ticket_number,
          name: result.name,
          email: result.email,
          user_id: result.user_id,
          price: result.price,
          date: result.date_show,
          time: result.time_show,
          venue: result.venue
        })
      }
      res.render("process/myTicket", {title: "my ticket", 
      isLogin: request.session.isLogin,
      ticket
      })
    })
    conn.release()
  })
})

module.exports = router