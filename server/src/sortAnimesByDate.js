function sortAnimesByDate(items) {
  let len = items.length,
    min
  let nullArr = []

  // get all nulls and put them at the end
  for (let i = 0; i < len; i++) {
    if (items[i].startDate === null) {
      items[i].startDate = 'Not available'
      nullArr.push.apply(nullArr, items.splice(i, 1))
      --i
      --len
    }
  }

  for (let i = 0; i < len; i++) {
    //set minimum to this position
    min = i

    //check the rest of the array to see if anything is smaller
    for (let j = i + 1; j < len; j++) {
      if (items[j].startDate < items[min].startDate) {
        min = j
      }
    }

    //if the minimum isn't in the position, swap it
    if (i != min) {
      const temp = items[i]
      items[i] = items[min]
      items[min] = temp
    }
    if (items[i].startDate instanceof Date) items[i].startDate = formatDate(items[i].startDate)
  }

  items.push.apply(items, nullArr)
  return items
}

function formatDate(date) {
  var monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]

  var day = date.getDate()
  var monthIndex = date.getMonth()
  var year = date.getFullYear()

  return monthNames[monthIndex] + ' ' + day + ', ' + year
}

module.exports = sortAnimesByDate
