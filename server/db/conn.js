const mongoose = require('mongoose')

const db = process.env.DATABASE_URI
mongoose.connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected')
}).catch((error) => {
    console.log('Failed to connect' + error)
})
