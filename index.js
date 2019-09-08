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

// Var holds the starting count ie. from where it will count down
const initialCount = 10

/**
 * Function returns UTC date time in yyyy-mm-dd hh:mm:ss
 */
const getUTCDateTime = () => {
  return new Date().toISOString().replace('T', ' ').substr(0, 19)
}

// EXCEPTION HANDLING FUNCTIONS
function logErrors(err, req, res, next) {
  console.error(err.stack)
  next(err)
}

function clientErrorHandler(err, req, res, next) {
  if (req.xhr) {
    res.status(500).json({ error: 'Something failed!' })
  } else {
    next(err)
  }
}

function errorHandler(err, req, res, next) {
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
    total_countdowns: 0, // For total countdowns to 0 tracking
    last_hit_datetime: getUTCDateTime(), // To store the datetime of last countdown btn hit
    page_views: 0, // To track page Views
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

      let count = 0 // var to store current count
      let total_countdowns = 0 // var to total countdown hits to 0
      let last_hit_datetime = 0 // var to store last hit datetime

      if (countdown_body != undefined && countdown_body === true) {
        // decrement count if countdown is true
        db.update('count', n => n - 1)
          .write()
          .then(() => {
            // Update the last hit datetime to current datetime
            db.set('last_hit_datetime', getUTCDateTime())
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
                          // get total countdowns
                          total_countdowns = db.get('total_countdowns').value()
                          // get last hit date
                          last_hit_datetime = db.get('last_hit_datetime').value()
                          // Send count data
                          res.status(200).json({
                            count: count,
                            total_countdowns: total_countdowns,
                            last_hit_datetime: last_hit_datetime,
                          })
                        })
                    })
                } else {
                  // get total countdowns
                  total_countdowns = db.get('total_countdowns').value()
                  // get last hit date
                  last_hit_datetime = db.get('last_hit_datetime').value()
                  // Send count data
                  res.status(200).json({
                    count: count,
                    total_countdowns: total_countdowns,
                    last_hit_datetime: last_hit_datetime,
                  })
                }
              })
          })
      } else if (countdown_body != undefined && countdown_body === false) {
        /**
         * This part supplies the initial data on every page load
         * ie. send {countdown: false} from frontend
         */
        db.update('page_views', n => n + 1)
          .write()
          .then(() => {
            // get current count
            count = db.get('count').value()
            // get total countdowns
            total_countdowns = db.get('total_countdowns').value()
            // get last hit date
            last_hit_datetime = db.get('last_hit_datetime').value()
            // get page views
            let page_views = db.get('page_views').value()

            // Send count data
            res.status(200).json({
              count: count,
              total_countdowns: total_countdowns,
              last_hit_datetime: last_hit_datetime,
              page_views: page_views,
            })
          })
      }
      else {
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
