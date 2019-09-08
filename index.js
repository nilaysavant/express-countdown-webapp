const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const morgan = require('morgan')

// LOWDB Database init : https://github.com/typicode/lowdb
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('./database/db.json')
const db = low(adapter)

// DB Setup :-------------------------------------------
// Set some defaults (required if your JSON file is empty)
db.defaults({ count: 100 }) // Set Countdown Count = 100 initially
    .write()


const PORT = 3000 // Server Port Variable

const app = express() // init express app

app.use(morgan('dev')) // a logger for express

// to parse the body of post requests -> bodyParser :
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Set public folder
app.use(express.static(path.join(__dirname, 'public')))

/**
 * "/countdown" : POST
 * BODY: { "countdown" : true }
 * Send post req to count down the var in db
 */
app.post('/countdown', (req, res) => {
    let count = 0 // var to store cout
    if (req.body.countdown === true) {
        // decrement count if countdown is true
        db.update('count', n => n - 1)
            .write()
        // get new value of count
        count = db.get('count').value()
        // Send count
        res.status(200).json({
            count: count
        })
    } else {
        res.status(400).send("Error! Check request body!")
    }
})


/**
 * Listen for requests on port
 */
app.listen(PORT, () => {
    console.log('Serving on port:', PORT)
})