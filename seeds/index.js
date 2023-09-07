//we run this file on its own separalety from our node any time we want to seed our database

const mongoose = require('mongoose');
const cities = require('./cities');
const {places,descriptors} = require('./seedhelpers')
const Campground = require("../models/Campground")

mongoose.connect('mongodb://localhost:27017/summmer-camp',{
    useNewUrlParser: true,
    // useCreateIndex: true, 
    useUnifiedTopology: true
});


const db = mongoose.connection; 
db.on('error',console.error.bind(console,"connection error:"));
db.once("open",()=>{
    console.log("Database connected");
});



const sample = array =>array[Math.floor(Math.random()*array.length)]
 


const seedDB = async() =>{
    await Campground.deleteMany({});
    //first we delete everything and then we make new campgrounds
    // const c = new Campground({title:'purple field'});
    // await c.save();

    for(let i =0 ; i<200 ; i++){
        const random1000 = Math.floor(Math.random()*1000);
        const price = Math.floor(Math.random()*20)+10;
        const camp = new Campground({
            author: '629f49f1ddfde61e22deae06',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image:'https://source.unsplash.com/collection/483251',
            description:'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quas sequi deleniti nisi, impedit, necessitatibus culpa ad rem labore ab quo provident maiores accusamus.',
            price,
            geometry: {
              type: "Point",
              coordinates: [
                  cities[random1000].longitude,
                  cities[random1000].latitude,
              ]
          },
            images: [
                {
                  url: 'https://res.cloudinary.com/dconct4l9/image/upload/v1654886357/YelpCamp/iwzynvjzqbd4wg3rs5ci.jpg',
                  filename: 'YelpCamp/iwzynvjzqbd4wg3rs5ci',
                //   _id: new ObjectId("62a38fd394035713182ab54b")
                },
                {
                  url: 'https://res.cloudinary.com/dconct4l9/image/upload/v1654886359/YelpCamp/d2yxadwgpb4movv4jyx6.jpg',
                  filename: 'YelpCamp/d2yxadwgpb4movv4jyx6',
                //   _id: new ObjectId("62a38fd394035713182ab54c")
                }
              ],

        })
        
        await camp.save();
    }
}

seedDB()
// .then(()=>{
//     mongoose.connecton.close();
// });
