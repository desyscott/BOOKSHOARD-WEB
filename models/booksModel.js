const mongoose = require("mongoose");


const bookModel = new mongoose.Schema({
  title: {
    type: String,
    required:[true,"This field is required"],
  },
  description: {
    type: String,
  },
  publishDate: {
    type: Date,
    required: [true,"This field is required"],
  },
  pageCount: {
    type: Number,
    required: [true,"This field is required"],
  },
  createAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  
  //we storing the name of the image in the database and storing the image itself in a file system
  coverImage: {
    type: Buffer,
    required: true,
  },
  
  coverImageType: {
    type: String,
    required:true,
  },
  //referencing the author Model the same author id in the book model
  author: {
    type: mongoose.Schema.Types.ObjectId,
    required:true,
    ref: "Authors",
  },
});


//the virtual property will act as the any of the property in the model and it will derive it properties from the coverImageName property
//when coverImagePath is called, it is going to call the get function
//converting the buffer and type into an actual image cover
bookModel.virtual("coverImagePath").get(function () { 
  if (this.coverImage != null && this.coverImageType != null) {
  return `data:${this.coverImageType};charset=utf-8;base64,${this.coverImage.toString("base64")}`
  }
});

module.exports = mongoose.model("Book", bookModel);


