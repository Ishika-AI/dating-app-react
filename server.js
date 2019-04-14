
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const exjwt = require('express-jwt');
const r = require( 'rethinkdb' );
const cors = require('cors');
const fileUpload = require('express-fileupload');

var config = require(__dirname + '/config.js');

const app = express();
app.use(cors());
function createConnection(req, res, next) {
    r.connect(config.rethinkdb, function(error, conn) {
        if (error) {
            handleError(res, error);
        }
        else {
            // Save the connection in `req`
            req._rdbConn = conn;
            // Pass the current request to the next middleware
            next();
        }
    });
}
function handleError(res, error) {
    return res.send(500, {error: error.message});
}
function closeConnection(req, res, next) {
    req._rdbConn.close();
    next();
}
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Headers', 'Content-type,Authorization');
    next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(createConnection);                  
app.use(fileUpload());

const jwtMW = exjwt({
    secret: 'cancer'
});


// let users = [
//     {
//         id: 1,
//         username: 'test',
//         password: 'asdf123'
//     },
//     {
//         id: 2,
//         username: 'test2',
//         password: 'asdf12345'
//     }
// ];



app.post('/login', (req, res) => {
    const { username, password } = req.body;
    r.db("dating")
    .table("user")
    .filter(
      r
        .row("email")
        .eq(username)
        .and(r.row("password").eq(password))
    )
    .run(req._rdbConn)
    .then(cursor => cursor.toArray())
    .then(result => {
       if(result.length==1){
        let token = jwt.sign({ id : result[0].id, username: username }, 'cancer', { expiresIn: 129600 }); 
        res.json({
            sucess: true,
            err: null,
            token
        });
        }else{
            res.status(401).json({
                sucess: false,
                token: null,
                err: 'Username or password is incorrect'
            })
        }
    })
    .catch(error =>  res.status(401).json({
        sucess: false,
        token: null,
        err: 'Username or password is incorrect'
    }));
});
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    let userReg =  {

        "email": username,"password": password
      }
    console.log(userReg);
    r.db("dating")
    .table("user")
    .filter(r.row("email").eq(userReg.email))
    .run(req._rdbConn)
    .then(cursor => cursor.toArray())
    .then(result => {
      if (result.length == 0) {
        r.db("dating")
          .table("user")
          .insert(userReg, { returnChanges: true })
          .run(req._rdbConn, (error, result) => {
            if (error) {
                throw error;
              } else if (result.inserted !== 1) {
                res.json(result);
              } else {
                r.db("dating")
                .table("user")
                .filter(
                  r
                    .row("email")
                    .eq(username)
                    .and(r.row("password").eq(password))
                )
                .run(req._rdbConn)
                .then(cursor => cursor.toArray())
                .then(result => {
                   if(result.length==1){

                    console.log('i am here');
                    let token = jwt.sign({ id : result[0].id, username: username }, 'cancer', { expiresIn: 129600 }); 
                    res.json({
                        sucess: true,
                        err: null,
                        token
                    });
                    }else{
                        res.status(401).json({
                            sucess: false,
                            token: null,
                            err: 'Username or password is incorrect'
                        })
                    }
                })
         
                // response.send(result.changes[0].new_val);
              }
          })
          .catch(error => {
            console.log("Error:", error);
            res.status(401).json({
                sucess: false,
                token: null,
                err: 'Username or password is incorrect'
            });
          });
      } else {
        const err = { first_error: "Email already exists", errors: "1" };
        res.status(401).json({
            sucess: false,
            token: null,
            err: err
        });
      }
    });
});
app.post('/upload', (req, res) => {
    if (req.files === null) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }
    
    const file = req.files.file;
    console.log(req.body.uid);
    file.mv(`${__dirname}/client/public/uploads/${file.name}`, err => {
      if (err) {
        console.error(err);
        return res.status(500).send(err);
      }
      let imgReg =  {

        "userid": req.body.uid,"imagename": file.name
      }
        r.db("dating")
        .table("images")
        .insert(imgReg, { returnChanges: true })
        .run(req._rdbConn, (error, result) => {
        if (error) {
            throw error;
            } else if (result.inserted !== 1) {
                res.json({ fileName: file.name, filePath: `/uploads/${file.name}` });

            } else {
                res.json({ fileName: file.name, filePath: `/uploads/${file.name}` });
            }
        })
        .catch(error => {
        console.log("Error:", error);
        res.status(401).json({
            err: "error in uploading"
        });
        });
    });
    



  });

app.post('/listuserimages', (req, res) => {
    
    r.db("dating")
    .table("images")
    .filter(r.row("userid").eq(req.body.user))
    .run(req._rdbConn)
    .then(cursor => cursor.toArray())
    .then(result => {
                console.log(result);
                res.send(result);
    })
    // .catch(error => {
    //         console.log("Error:", error);
    //         res.status(401).json({
    //             sucess: false,
    //             token: null,
    //             err: 'login first'
    //         });
    // });
});

app.post('/showfeeds', (req, res) => {
    
    r.db("dating")
    .table("images")
    .filter(r.row("userid").ne(req.body.user))
    .run(req._rdbConn)
    .then(cursor => cursor.toArray())
    .then(result => {
                console.log(result);
                res.send(result);
    })
    // .catch(error => {
    //         console.log("Error:", error);
    //         res.status(401).json({
    //             sucess: false,
    //             token: null,
    //             err: 'login first'
    //         });
    // });
});


app.get('/', jwtMW /* Using the express jwt MW here */, (req, res) => {
    res.send('You are authenticated'); //Sending some response when authenticated
});

// Error handling 
app.use(function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') { // Send the error rather than to show it on the console
        res.status(401).send(err);
    }
    else {
        next(err);
    }
});
app.use(closeConnection);                       // Close the RethinkDB connection previously opened

// Starting the app on PORT 3000
const PORT = 4000;
app.listen(PORT, () => {
    // eslint-disable-next-line
    console.log(`Magic happens on port ${PORT}`);
});