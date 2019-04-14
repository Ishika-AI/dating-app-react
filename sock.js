
const express = require('express')
const http = require('http')
const socketIO = require('socket.io')
const r = require( 'rethinkdb' );
var config = require(__dirname + '/config.js');

const port = 4001

const app = express()

const server = http.createServer(app)
var dbcon;
  r.connect(config.rethinkdb, function(error, conn) {
      if (error) {
          // handleError(res, error);
          console.log('not connected to database');
        dbcon= 0;
      }
      else {
          // Save the connection in `req`
          console.log('connected to database');
          dbcon = conn;
          // Pass the current request to the next middleware
          // next();
      }
  });
// function createConnection(req, res, next) {
//   r.connect(config.rethinkdb, function(error, conn) {
//       if (error) {
//           handleError(res, error);
//       }
//       else {
//           // Save the connection in `req`
//           console.log('connected to database');
//           req._rdbConn = conn;
//           // Pass the current request to the next middleware
//           next();
//       }
//   });
// }
// function handleError(res, error) {
//   return res.send(500, {error: error.message});
// }
// function closeConnection(req, res, next) {
//   req._rdbConn.close();
//   next();
// }
// app.use(createConnection);
const io = socketIO(server)

io.on('connection', socket => {
    socket.on('like', (payload) => {
    console.log('like --------', payload)
    r.db("dating")
    .table("likes")
    .filter(
      r
        .row("by")
        .eq(payload.by)
        .and(r.row("uid").eq(payload.uid)).and(r.row("img").eq(payload.img))
    )
    .run(dbcon)
    .then(cursor => cursor.toArray())
    .then(result => {
       if(result.length==0){
                  r.db("dating")
                  .table("likes")
                  .insert(payload, { returnChanges: true })
                  .run(dbcon, (error, result) => {
                    if (error) {
                        throw error;
                      }else {
                        console.log('i am here after intertion');
                        r.db("dating")
                        .table("user")
                        .filter(
                          r
                            .row("id")
                            .eq(payload.by)
                        )
                        .run(dbcon)
                        .then(cursor => cursor.toArray())
                        .then(result => {
                           if(result.length==1){
                              var byname = result[0].email;
                              console.log('byname - '+result[0].email);
                              r.db("dating")
                              .table("images")
                              .filter(
                                r
                                  .row("id")
                                  .eq(payload.img)
                              )
                              .run(dbcon)
                              .then(cursor => cursor.toArray())
                              .then(result=>{
                                var imgname = result[0].imagename;
                                console.log('imgname - '+imgname);

                                var returnload = {imgname : imgname,byname:null,uid:payload.uid};
                                console.log(returnload);
                                io.sockets.emit('likeby', returnload);
                              });



                      }});}
                  })
                  .catch(error => {
                   
                    io.sockets.emit('likeby', 0);


                  });
        }else{
           

          
        }
    })
    .catch(error =>{
    io.sockets.emit('likeby', 0);

    console.log(error)
    });

    
  });
  socket.on('superlike', (payload) => {
    console.log('superlike ---', payload)
    r.db("dating")
    .table("superlikes")
    .filter(
      r
        .row("by")
        .eq(payload.by)
        .and(r.row("uid").eq(payload.uid)).and(r.row("img").eq(payload.img))
    )
    .run(dbcon)
    .then(cursor => cursor.toArray())
    .then(result => {
       if(result.length==0){
                  r.db("dating")
                  .table("superlikes")
                  .insert(payload, { returnChanges: true })
                  .run(dbcon, (error, result) => {
                    if (error) {
                        throw error;
                      }else {
                        console.log('i am here after intertion');
                        r.db("dating")
                        .table("user")
                        .filter(
                          r
                            .row("id")
                            .eq(payload.by)
                        )
                        .run(dbcon)
                        .then(cursor => cursor.toArray())
                        .then(result => {
                           if(result.length==1){
                              var byname = result[0].email;
                              console.log('byname - '+result[0].email);
                              r.db("dating")
                              .table("images")
                              .filter(
                                r
                                  .row("id")
                                  .eq(payload.img)
                              )
                              .run(dbcon)
                              .then(cursor => cursor.toArray())
                              .then(result=>{
                                var imgname = result[0].imagename;
                                console.log('imgname - '+imgname);

                                var returnload = {imgname : imgname,byname:byname,uid:payload.uid};
                                console.log(returnload);
                                io.sockets.emit('superlikeby', returnload);
                              });



                      }});}
                  })
                  .catch(error => {
                   
                    io.sockets.emit('superlikeby', 0);


                  });
        }else{
           

          
        }
    })
    .catch(error =>{
    io.sockets.emit('superlikeby', 0);

    console.log(error)
    });
 });
  socket.on('disconnect', () => {
    console.log('user disconnected')
  });
})
// app.use(closeConnection);  
server.listen(port, () => console.log(`Listening on port ${port}`))