const fs = require('fs')

const df3 = require('./df3.json')
const df4 = require('./df4.json')
const df5 = require('./df5.json')

let transaction_sum
let bun_name
let prev_transaction_sum

Object.keys(df5).forEach(key => {
  df5[key] = {}

  Object.keys(df4).forEach(key2 => {
    df5[key][key2] = 0
  })
})

prev_transaction_sum = {}
Object.keys(df3.time).forEach(key => {
  transaction_sum = df3.transaction_sum[key]
  bun_name = df3.value[key]
  time = df3.time[key]
  
  prev_transaction_sum[bun_name] = transaction_sum + (prev_transaction_sum[bun_name]?prev_transaction_sum[bun_name]:0)
  
  df5[bun_name][time] = prev_transaction_sum[bun_name]
})


Object.keys(df5).forEach(key => {
  prev_transaction_sum[key]=0
  Object.keys(df5[key]).forEach(key2 => {
    if(df5[key][key2] === 0){
      df5[key][key2] = prev_transaction_sum[key]
    } else {
      prev_transaction_sum[key] = df5[key][key2]
    }
  })
})

fs.writeFile("raceData.json", JSON.stringify(df5), 'utf8', function (err) {
  if (err) {
      console.log("An error occured while writing JSON Object to File.");
      return console.log(err);
  }

  console.log("JSON file has been saved.");
});
