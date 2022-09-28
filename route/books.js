const express = require("express");
const expressAsyncHandler = require("express-async-handler");

//initialize the express router
const router = express.Router();


//import the booksModel form the model
const bookModel = require("../models/booksModel");
//import the authorsModel form the model
const authorModel = require("../models/authorsModel");

const imageMimeTypes=["image/jpeg","image/png","images/gif"]



//Search the book title
router.get("/", expressAsyncHandler(async (req, res) => {
  let searchOption = bookModel.find();

  if (req.query.title != null && req.query.title != "") {
    searchOption = searchOption.regex(
      "title",
      new RegExp(req.query.title, "i")
    );
  }

  if (req.query.publishBefore != null && req.query.publishBefore != "") {
    searchOption = searchOption.lte("publishDate", req.query.publishBefore);
  }

  if (req.query.publishAfter != null && req.query.publishAfter != "") {
    searchOption = searchOption.gte("publishDate", req.query.publishAfter);
  }

  try {
    const books = await searchOption.exec();
    res.render("Books/index", { books, searchParams: req.query });
  } catch {
    res.redirect("/");
  }
}));

//get the form book input
router.get("/new", (req, res) => {
  renderNewPage(res, new bookModel());
});

//post all requested input to model
router.post("/", expressAsyncHandler(async (req, res) => {
  
  const book = new bookModel({
    title: req.body.title,
    author: req.body.author,
    publishDate: new Date(req.body.publishDate),
    pageCount: req.body.pageCount,
    description: req.body.description,
  });
  saveCover(book, req.body.cover);
  
  
  try {
    const newBook = await book.save();
    res.redirect(`Books/${newBook.id}`);
    
  } catch  {
   
    renderNewPage(res, book, true);
   
  }
}));




//Show individual book
router.get("/:id",expressAsyncHandler(async (req, res) => {
  try {
    const book = await bookModel
      .findById(req.params.id)
      .populate("author")
      .exec();
    res.render("Books/show", { book });
  } catch (err) {
    res.redirect("/");
    console.log(err);
  }
}));

//get the Edit book form
router.get("/:id/edit", expressAsyncHandler(async (req, res) => {
  try {
    const book = await bookModel.findById(req.params.id);
    renderEditPage(res, book);
  } catch {
    res.redirect("/");
  }
}));

//PUT route to update the book model
router.put("/:id", expressAsyncHandler(async (req, res) => {
  let book;
  try {
    book = await bookModel.findById(req.params.id);
    book.title = req.body.title;
    book.author = req.body.author;
    book.publishDate = new Date(req.body.publishDate);
    book.pageCount = req.body.pageCount;
    book.description = req.body.description;
    if(req.body.cover!==null && req.body.cover!==""){
      saveCover(book,req.body.cover)
    }

    await book.save();
    res.redirect(`/books/${book.id}`);
  } catch (err) {
    if (book == null) {
      res.redirect("/");
    } else {
      renderEditPage(res, book, true);
    }
    console.log(err);
  }
}));

//delete route
router.delete("/:id",expressAsyncHandler(async (req, res) => {
  let book;
  try {
    book = await bookModel.findById(req.params.id);
    await book.remove();
    res.redirect("/Books");
  } catch {
    if (book == null) {
      res.redirect("/");
    } else {
      res.render("Books/show", { book, errorMessage: "Could not delete book" });
    }
  }
}));

//function for the new route
const renderNewPage = expressAsyncHandler(async (res, book, hasError = false) => {
  renderFormPage(res, book, "new", hasError);
});
//function for the edit route
const renderEditPage = expressAsyncHandler(async (res, book, hasError = false) => {
  renderFormPage(res, book, "edit", hasError);
});

const renderFormPage =expressAsyncHandler( async (res, book, form, hasError = false) => {
  try {
    const authors = await authorModel.find({});
    const params = { authors, book };
    if (hasError) {
      if ((form = "new")) {
        params.errorMessage = "Error in Creating Books";
      } else if ((form = "edit")) {
        params.errorMessage = "Error in Updating Books";
      }
    }
    res.render(`Books/${form}`, params);
  } catch {
    res.redirect("/Books");
  }
});


//checking if the cover if a valid cover and save it 
function saveCover(book, coverEncoded){
  if(coverEncoded == null) return 
  
  //we parse the string cover into a JSON object
  const cover = JSON.parse(coverEncoded)
  
  //saving a JSON object as a Buffer to the database
  if(cover != null && imageMimeTypes.includes(cover.type)){
    book.coverImage = new Buffer.from(cover.data,"base64")
    book.coverImageType = cover.type
  }
}

module.exports = router;