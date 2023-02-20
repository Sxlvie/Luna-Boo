// Uncomplete function, newer version located on local machine, will be uploaded laters

function getBirthday(date1, date2) {
    
}


async function checkDate({ date: date, db: db,}) {
    const dbPattern = date.compile('YYYY/MM/DD')

    let today = date.format(new Date(), dbPattern)

    console.log(today)


    let bdayList = await db.get('birthdays')
    console.log({bdayList})
    if (bdayList == null) {
        return
    }
    bdayList.forEach((bday) => {
        
        let bday2 = bday.date
        // remove the year from both dates and compare
        bday2 = bday2.slice(5)
        today = today.slice(5)
        console.log({bday2, today})
        

        if(bday2 == today) {
            // get a channel as a param, and send a message to that channel with the user's name
            // get the user's name from the client with the userid from the bday.id object
        }
    })
    

}   

module.exports = {
    checkDate
}

// format = 'YYYY/MM/DD:userid'