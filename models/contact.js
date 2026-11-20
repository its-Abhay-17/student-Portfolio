const { default: mongoose } = require("mongoose");
const { Schema } = mongoose;

const contactSchema = new Schema({
    username:{
        type:"string",
        require:true
    },
    phone:{
        type:Number,
        require:true
    },
    email:{
        type:"string",
        require:true
    },
    message:{
        type:"string",
        require:true
    },
});

const serviceSchema = new Schema({
    title:{
        type:"string",
        require:true
    },
    price:{
        type:Number,
        require:true
    },
    img: {
  url: {
    type: String,
    trim: true,
    default: "https://images.unsplash.com/photo-1605379399642-870262d3d051?q=80&w=1206&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",
    set: (v) => (v === "" ? "https://images.unsplash.com/photo-1484417894907-623942c8ee29?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D" : v) 
  },
  name: {
    type: String,
    trim: true,
    default: "Service page"
  }
}

});
const contact = mongoose.model('contact', contactSchema);
const service = mongoose.model('service', serviceSchema);
module.exports = {contact,service}