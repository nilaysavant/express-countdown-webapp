const base_url = "http://localhost:3000"

// Get various html elemnts as DOM objects(arrays because theyre class based selectors
// so that multiple cards can be selected laster on)
let count_array = document.getElementsByClassName("card__count-number")
let total_countdowns_array = document.getElementsByClassName("total-countdowns")
let last_hit_date_array = document.getElementsByClassName("last-hit-date")
let button_array = document.getElementsByClassName("card__button")

// count down btn on click event
button_array[0].onclick = function () {
    console.log("clickkkk")

    postData(base_url + '/countdown', { countdown: true })
        .then(data => {
            // data: { count: 1}
            console.log("TCL: button_array[0].onclick -> data.count", data.count)
            count_array[0].innerHTML = parseInt(data.count)
        })
        .catch(error => console.error(error));
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