const express = require("express");
var passport = require("passport");
var router = express.Router();
var { User, Book, BorrowerRecord, ReturnRecord } = require("./db");
//home endpoint
router.get( (req, res) => {
    res.send("Welcome To Library Management System");
});
//route for getting all books from database
router.get("/getbooks", async (req, res) => {
    const books = await Book.find({});
    res.send({ status: 200, books: books });
});
//route for creating a new book
router.post("/createbook", async (req, res) => {
    //new book from request body
    var book = new Book(req.body);});
    //route for creating a new book
router.post("/createbook", async (req, res) => {
    //new book from request body
    var book = new Book(req.body);});

//authentication
passport.authenticate(jwt, { session: false }, async (err, user) => {
    if (err || !user) {
        res.send({ status: 401, message: "Not Authorized" });
    } else {
        //checking if the user is admin
        if (user.admin) {
            //saving book to db
            await book.save().then(
                function (saveres) {
                    if (saveres) {
                        res.send({ status: 200, message: saveres });
                    }
                },
                function (err) {
                    res.send({
                        status: 500,
                        message: "Internal Server Error",
                    });
                }
            );
        } else {
            res.send({
                status: 401,
                message: "You are not authorized to perform this action",
            });
        }
    }
})(req, res);


//route for borrowing a new book
router.post("/borrowbook", async (req, res) => {
//userid and bookid from request
var bookid = req.body.bookid;
var borrowerusername = req.body.username;

//authentication
passport.authenticate(jwt, { session: false }, async (err, user) => {
    if (err || !user) {
        res.send({ status: 401, message: "Not Authorized"});
    } else {
        if (user.admin) {
            User.findOne({ username: borrowerusername })
                .then((user) => {
                    console.log(user);
                    if (user) {
                        Book.findOne({ _id: bookid })
                            .then((book) => {
                                console.log(book);
                                if (book) {
                                    if (book.available) {
                                        //creating and saving new borrower record in database.
                                        var newBorrowerRecord =
                                            new BorrowerRecord({
                                                username: user.username,
                                                bookid: book[_id],
                                            });
                                        newBorrowerRecord
                                            .save()
                                            .then((saveres) => {
                                                if (saveres) {
                                                    Book.where({
                                                        _id: book[_id&quot],
                                                    })
                                                        .updateOne({
                                                            available: false,
                                                        })
                                                        .then((updtres) => {
                                                            res.send({
                                                                status: 200,
                                                                message:
                                                                   " book borrowed successfully by"  +
                                                                    user.username,
                                                            });
                                                        });
                                                } else {
                                                    res.send({
                                                        status: 500,
                                                        message:
                                                            "Error Borrowing ",
                                                    });
                                                }
                                            })
                                            .catch((err) => {
                                                res.send({
                                                    status: 500,
                                                    message:
                                                        "Error Borrowing Book",
                                                });
                                            });
                                    } else {
                                        res.send({
                                            status: 500,
                                            message:
                                            "Book Is not available",
                                        });
                                    }
                                } else {
                                    res.send({
                                        status: 500,
                                        message:
                                            "Book with Id Does Not Exist",
                                    });
                                }
                            })
                            .catch((err) => {
                                res.send({
                                    status: 500,
                                    message: "Internal Server Error",
                                });
                            });
                    } else {
                        res.send({
                            status: 500,
                            message:"Borrower Does Not Exist",
                        });
                    }
                })
                .catch((err) => {
                    res.send({
                        status: 500,
                        message: "Internal Server Error",
                    });
                });
        } else {
            res.send({
                status: 401,
                message: "You are not authorized to perform this action",
            });
        }
    }
})(req, res);
});

//route for returning a book
router.post("/returnbook", async (req, res, next) => {
var bookid = req.body.bookid;
var borrowerusername = req.body.username;

//authentication
passport.authenticate(jwt, { session: false }, async (err, user) => {
    if (err || !user) {
        res.send({ status: 401, message: "Not Authorized" });
    } else {
        if (user.admin) {
            //checking for existance of borrower record in db
            BorrowerRecord.findOne({
                bookid: bookid,
                username: borrowerusername,
            })
                .then((borrowrec) => {
                    if (borrowrec) {
                        var todaysdate = new Date().toISOString();

                        //calculation of fine if delayed in returning
                        const fine = 0;
                        if (todaysdate > borrowrec.submitdate) {
                            const diffTime = Math.abs(
                                todaysdate - borrowrec.submitdate
                            );
                            const diffDays = Math.ceil(
                                diffTime / (1000 * 60 * 60 * 24)
                            );

                            fine = diffDays * 2;
                        }
                    }

                        //creating and saving new return record.
                        var returnrec = new ReturnRecord({
                            username: borrowerusername,
                            bookid: bookid,
                            duedate: borrowrec.submitdate,
                            fine: fine,
                        });

                        const express = require('express');
                        const passport = require('passport');
                        const router = express.Router();
                        const { BorrowerRecord, ReturnRecord, Book } = require('./db'); // Import your models
                        
                        // Route for returning a book
                        router.post("/returnbook", async (req, res) => {
                            const { bookid, username: borrowerUsername } = req.body;
                        
                            // Authentication using Passport JWT
                            passport.authenticate("jwt", { session: false }, async (err, user) => {
                                if (err || !user) {
                                    return res.status(401).json({ message: "Not Authorized" });
                                }
                        
                                if (!user.admin) {
                                    return res.status(403).json({ message: "You are not authorized to perform this action" });
                                }
                        
                                try {
                                    // Check if a borrower record exists in the database
                                    const borrowRecord = await BorrowerRecord.findOne({ bookid, username: borrowerUsername });
                                    if (!borrowRecord) {
                                        return res.status(404).json({ message: "No Record Found" });
                                    }
                        
                                    const todaysDate = new Date().toISOString();
                                    let fine = 0;
                        
                                    // Calculate fine if the return is delayed
                                    if (todaysDate > borrowRecord.submitdate) {
                                        const diffTime = new Date(todaysDate) - new Date(borrowRecord.submitdate);
                                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                        fine = diffDays * 2; // Assuming fine is $2 per day
                                    }
                        
                                    // Create and save a new return record
                                    const returnRecord = new ReturnRecord({
                                        username: borrowerUsername,
                                        bookid,
                                        duedate: borrowRecord.submitdate,
                                        fine,
                                    });
                        
                                    await returnRecord.save();
                        
                                    // Update the book's availability status
                                    const bookUpdate = await Book.updateOne({ _id: bookid }, { available: true });
                                    if (!bookUpdate.modifiedCount) {
                                        return res.status(500).json({ message: "Error Updating Book Status" });
                                    }
                        
                                    res.status(200).json({ message: "Book Returned Successfully", fine });
                                } catch (error) {
                                    console.error("Error in returnbook route:", error);
                                    res.status(500).json({ message: "Internal Server Error" });
                                }
                            })(req, res);
                        });
                        
                        // Route for paying fine
                        router.post("/payfine", (req, res) => {
                            const { returnrecordid } = req.body;
                        
                            // Authentication using Passport JWT
                            passport.authenticate("jwt", { session: false }, async (err, user) => {
                                if (err || !user) {
                                    return res.status(401).json({ message: "Not Authorized" });
                                }
                        
                                if (!user.admin) {
                                    return res.status(403).json({ message: "You are not authorized to perform this action" });
                                }
                        
                                try {
                                    // Update the fine to 0 in the return record
                                    const updateResult = await ReturnRecord.updateOne({ _id: returnrecordid }, { fine: 0 });
                                    if (!updateResult.modifiedCount) {
                                        return res.status(500).json({ message: "Error Paying Fine" });
                                    }
                        
                                    res.status(200).json({ message: "Fine Paid Successfully" });
                                } catch (error) {
                                    console.error("Error in payfine route:", error);
                                    res.status(500).json({ message: "Internal Server Error" });
                                }
                            })(req, res);
                        });
                        
                
                        
module.exports = router; 
