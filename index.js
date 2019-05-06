const fs = require('fs')
const parse = require('csv-parse')

let csvData=[]
const violations = {}
const userTimeHash = {}

function checkUser(userTransactionTimes) {
  let userViolations = []
  const LONG_BREAK_VIOALATION = 'LONG_BREAK_VIOALATION'
  const MAX_COUNT_BREAK_VIOALATION = 'MAX_COUNT_BREAK_VIOALATION'
  const MAX_INTERVAL_MINUTES = 20
  const MAX_BREAKS = 2
  const IGNORE_INTERVAL_MINUTES = 60

  let sameDayCounter = 0
  let previousDateTime 
  userTransactionTimes.forEach(dateTime => {
    if(previousDateTime) {
        if(previousDateTime.getDate() === dateTime.getDate()){
            let diff = (previousDateTime - dateTime)/1000/60
            if(diff > MAX_INTERVAL_MINUTES && diff < IGNORE_INTERVAL_MINUTES) 
                userViolations.push(LONG_BREAK_VIOALATION + ' ' + previousDateTime + ' ' + dateTime)

            if(diff > IGNORE_INTERVAL_MINUTES) 
              sameDayCounter++
            
            if(sameDayCounter > MAX_BREAKS) {
                userViolations.push(MAX_COUNT_BREAK_VIOALATION + ' ' + previousDateTime + ' ' +  dateTime)
                sameDayCounter = 0
            }
        } else {
            sameDayCounter = 0
        }
    }
    previousDateTime = dateTime
  })
  return userViolations
}

fs.createReadStream('data.csv')
  .pipe(parse({delimiter: ','}))
  .on('data', function(csvrow) {
    csvData.push(csvrow)   
  })
  .on('end',function() {
    csvData.forEach(data => {
      if(!userTimeHash[data[0]]) 
        userTimeHash[data[0]] = []
      userTimeHash[data[0]].push(new Date(data[5]));
    })
    Object.entries(userTimeHash).forEach(([key, dateTimes]) => {
      const userViolations = checkUser(dateTimes)
      if(userViolations.length) 
        violations[key] = userViolations
    })
    console.log(violations)
});
