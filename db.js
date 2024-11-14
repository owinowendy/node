const mongoose = require('mongoose');

// Database connection
mongoose.connect("<YOUR MONGODB CONNECTION URL>");

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function () {
    console.log("Connection Successful!");
});

// Model and schema creation
var UserSchema = mongoose.Schema({
    name: String,
    username: { type: String, unique: true },
    password: String,
    email: { type: String, unique: true },
    mobile: { type: Number, unique: true },
    admin: { type: Boolean, default: false }
});

var BookSchema = mongoose.Schema({
    name: String,
    author: String,
    genre: String,
    type: String,
    available: { type: Boolean, default: true }
}, { timestamps: true });

var BorrowerRecordSchema = mongoose.Schema({
    username: String,
    bookid: { type: mongoose.ObjectId, unique: true, ref: 'Book' },
    duedate: {
        type: Date,
        default: () => new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        required: 'Must Have DueDate'
    }
}, { timestamps: true });

var ReturnRecordSchema = mongoose.Schema({
    username: String,
    bookid: { type: mongoose.ObjectId, unique: true, ref: 'Book' },
    duedate: { type: Date, ref: 'BorrowerRecord' },
    fine: Number
}, { timestamps: true });

// Model creation
var User = mongoose.model('User', UserSchema, 'user');
var Book = mongoose.model('Book', BookSchema, 'books');
var BorrowerRecord = mongoose.model('BorrowerRecord', BorrowerRecordSchema, 'borrowers');
var ReturnRecord = mongoose.model('ReturnRecord', ReturnRecordSchema, 'returnrecords');

module.exports = { db, User, Book, BorrowerRecord, ReturnRecord };
