const base_url = "http://localhost:3000"

// Get various html elemnts as DOM objects(arrays because theyre class based selectors
// so that multiple cards can be selected laster on)
let count_array = document.getElementsByClassName("card__count-number")
let total_countdowns_array = document.getElementsByClassName("total-countdowns")
let last_hit_date_array = document.getElementsByClassName("last-hit-date")
let button_array = document.getElementsByClassName("card__button")

/**
 * looping throught all countdown cards
 * and updating them automatically on page load
 */
for (let i = 0; i < count_array.length; i++) {
    /**
     * Run this on every page load so that inital data is set
     */
    postData(base_url + '/countdown', { countdown: false })
        .then(data => {
            // data: { count: 5, last_hit_datetime: "2019-09-08 19:36:59", total_countdowns: 6}

            // Set the labels accordingly
            count_array[i].innerHTML = parseInt(data.count)
            total_countdowns_array[i].innerHTML = parseInt(data.total_countdowns)
            last_hit_date_array[i].innerHTML = data.last_hit_datetime
        })
        .catch(error => console.error(error));
}

/**
 * looping throught all countdown cards
 * and add the on click listener with functionality
 * and data updates to each card
 */
for (let i = 0; i < count_array.length; i++) {
    // count down btn on click event
    button_array[i].onclick = function () {
        postData(base_url + '/countdown', { countdown: true })
            .then(data => {
                // data: { count: 5, last_hit_datetime: "2019-09-08 19:36:59", total_countdowns: 6}

                // Set the labels accordingly
                count_array[i].innerHTML = parseInt(data.count)
                total_countdowns_array[i].innerHTML = parseInt(data.total_countdowns)
                last_hit_date_array[i].innerHTML = data.last_hit_datetime
            })
            .catch(error => console.error(error));
    }
}




/*

// POST DATA EXAMPLE ------------>
postData('http://example.com/answer', {answer: 42})
  .then(data => console.log(JSON.stringify(data))) // JSON-string from `response.json()` call
  .catch(error => console.error(error));

*/

/**
 * 
 * @param {*} url to post data to
 * @param {*} data body data(json) to be posted
 */
function postData(url = '', data = {}) {
    // Default options are marked with *
    return fetch(url, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, cors, *same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        // credentials: 'same-origin', // include, *same-origin, omit
        headers: {
            'Content-Type': 'application/json',
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: 'follow', // manual, *follow, error
        referrer: 'no-referrer', // no-referrer, *client
        body: JSON.stringify(data), // body data type must match "Content-Type" header
    })
        .then(response => response.json()); // parses JSON response into native JavaScript objects 
}