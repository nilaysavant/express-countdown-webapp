const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const morgan = require('morgan')

// LOWDB Database init : https://github.com/typicode/lowdb
// Its derived from loadash : https://lodash.com/docs/4.17.15#update
const low = require('lowdb')
const FileAsync = require('lowdb/adapters/FileAsync')

const PORT = 3000 // Server Port Variable

const app = express() // init express app

app.use(morgan('dev')) // a logger for express

// to parse the body of post requests -> bodyParser :
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Set public folder
app.use(express.static(path.join(__dirname, 'public')))

// handle exceptions and errors
app.use(logErrors)
app.use(clientErrorHandler)
app.use(errorHandler)

const initialCount = 10

// EXCEPTION HANDLING FUNCTIONS
function logErrors (err, req, res, next) {
  console.error(err.stack)
  next(err)
}

function clientErrorHandler (err, req, res, next) {
  if (req.xhr) {
    res.status(500).json({ error: 'Something failed!' })
  } else {
    next(err)
  }
}

function errorHandler (err, req, res, next) {
  res.status(500).json({ error: 'Something failed!' })
}

// MAIN FUNCTION ---------------------------------------------------------------------------
const main = async function () {
  // Async lowdb init
  const adapter = new FileAsync('./database/db.json');
  const db = await low(adapter);

  // DB Setup :-------------------------------------------
  // Set some defaults (required if your JSON file is empty)
  db.defaults({
    count: initialCount, // Set Countdown Count = 100 initially
    total_countdowns: 0, // For total countdown to 0 tracking
  }).write()


  /**
 * "/countdown" : POST
 * BODY: { "countdown" : true }
 * Send post req to count down the var in db
 */
  app.post('/countdown', (req, res) => {

    try {
      let countdown_body = req.body.countdown
      console.log("TCL: countdown_body", countdown_body)

      let count = 0 // var to store cout

      if (countdown_body != undefined && countdown_body === true) {
        // decrement count if countdown is true
        db.update('count', n => n - 1)
          .write()
          .then(() => {
            // get new value of count
            count = db.get('count').value()
            if (count <= 0) {
              // Update total countdowns after every 0 hit
              db.update('total_countdowns', n => n + 1)
                .write()
                .then(() => {
                  // reset count to 0
                  db.set('count', initialCount)
                    .write()
                    .then(() => {
                      // Send count
                      res.status(200).json({
                        count: count
                      })
                    })
                })
            } else {
              // Send count
              res.status(200).json({
                count: count
              })
            }


          })
      } else {
        res.status(400).send("Error! Check request body!")
      }
    } catch (error) {
      console.log("TCL: error", error)

    }

  })


  /**
   * Listen for requests on port
   */
  app.listen(PORT, () => {
    console.log('Serving on port:', PORT)
  })
}


// MAIN EXECUTION (Do not remove!) -----------------------------------------------------
main()
