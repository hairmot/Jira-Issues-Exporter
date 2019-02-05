let base64 = require('base-64');
let fetch = require('node-fetch')
let fs = require('fs')
let config = require('./config')

var index = 0;


let jql = 'project="' + encodeURIComponent(config.project) + '"%20AND%20issuetype="' + encodeURIComponent(config.issueType) + '"%20AND%20resolution="' + encodeURIComponent(config.resolution) + '"'
let url = config.url + '//rest/api/3/search?startAt=' + index + '&maxResults=100&jql=' + jql;
let username = config.username;
let password = config.password;

var max = 0;
var issuesCollection = [];

fetch(url, {
    method:'GET',
    headers: {'Authorization': 'Basic ' + base64.encode(username + ":" + password)},
   })
.then(response => response.json())
.then(json => json.total)
.then(max => {
    var loops = (parseInt(max / 100) + 1)
    var promises = [];
    for(var i = 0; i < loops; i++) {
        promises.push(get100Reqs(i * 100));
    }
    Promise.all(promises).then(() => {
        output()
    })
})





function get100Reqs(index) {
    var promise = new Promise((res, fail) => {
        var url = 'https://kenttestteam.atlassian.net//rest/api/3/search?startAt=' + index + '&maxResults=100&jql=' + jql;
            fetch(url, {
                method:'GET',
                headers: {'Authorization': 'Basic ' + base64.encode(username + ":" + password)},
            })
        .then(response => response.json())
        .then(json => {
            issuesCollection = [...issuesCollection,...json.issues]
        })
        .then(() => {res()})
    })
    return promise;
}

function output() {

    issuesCollection.forEach(element => {
        var id = element.key
        var priority = element.fields.priority && element.fields.priority.id ? element.fields.priority.id : '';
        fs.writeFile("output.csv", [id, priority, element.fields.summary.replace(/,/g, ' '), element.fields.created, (element.fields.components[0] ? element.fields.components[0].name : 'none')].join(',') + '\r\n', {flag:'a'})
       
    });
}