var express = require('express')
var multer = require('multer')
var mongoose = require('mongoose')
var path = require('path')
var bodyParser = require('body-parser')
var csv = require('csvtojson')
var empSchema = require('./models/EmpModel')
const app = express()

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads')
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  },
})
var uploads = multer({ storage: storage })
mongoose
  .connect('mongodb://localhost:27017/test', { useNewUrlParser: true })
  .then(() => console.log('Connected'))
  .catch((err) => console.log(err))
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.resolve(__dirname, 'public')))
app.get('/', (req, res) => {
  empSchema.find((err, data) => {
    if (err) {
    } else {
      if (data != '') {
        res.render('index', { data: data })
      } else {
        res.render('index', { data: '' })
      }
    }
  })
})
var empResponse
app.post('/', uploads.single('csvFile'), (req, res) => {
  csv()
    .fromFile(req.file.path)
    .then((response) => {
      for (var x = 0; x < response; x++) {
        empResponse = parseFloat(response[x].Name)
        response[x].Name = empResponse
        empResponse = parseFloat(response[x].Email)
        response[x].Email = empResponse
        empResponse = parseFloat(response[x].Designation)
        response[x].Designation = empResponse
        empResponse = parseFloat(response[x].Mobile)
        response[x].Mobile = empResponse
      }
      empSchema.insertMany(response, (err, data) => {
        if (err) {
          console.log(err)
        } else {
          res.redirect('/')
        }
      })
    })
})
var port = process.env.PORT || 5555
app.listen(port, () => console.log('App connected on: ' + port))