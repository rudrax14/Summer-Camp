if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}


const express = require('express');
const path = require('path');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate')
const session = require('express-session')
const flash = require('connect-flash')
// const Joi = require('joi');
// const {campgroundSchema , reviewSchema} = require('./schemas.js');
// const catchAsync = require('./utils/catchAsync')
const ExpressError = require('./utils/ExpressError')
const passport = require('passport')
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const helmet = require('helmet');



const mongoSanitize = require('express-mongo-sanitize');
// const Campground = require("./models/campground");
// const Review = require('./models/review')
// const req = require('express/lib/request');

const userRoutes = require('./routes/users');
const campgroundsRoutes = require('./routes/campgrounds')
const reviewsRoutes = require('./routes/reviews')

const MongoStore = require('connect-mongo');

// const dbUrl = process.env.DB_URL
const dbUrl = process.env.DB_URL || 'mongodb://0.0.0.0:27017/summer-camp'
//dbUrl
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    // useCreateIndex: true, 
    useUnifiedTopology: true,
    // useFindAndModify: false
});


//error handlers
const db = mongoose.connection;
db.on('error', console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});


const app = express();
app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

//req to parse the body| middleware
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize({
    replaceWith: '_'
}))

const secret = process.env.SECRET || 'thisshouldbeabettersecret';

const store = MongoStore.create({
    mongoUrl: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60,
    // crypto: {
    //     secret: 'squirrel'
    // }
});

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})


app.use(session({
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7

    }
}))

app.use(flash())
// app.use(helmet());
// app.use(helmet.ContentSecurityPolicy());
// app.use(helmet({ crossOriginEmbedderPolicy: false }));


const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "dist/bs-custom-file-input.js",
    "https://cdn.jsdelivr.net",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css",
    "https://stackpath.bootstrapcdn.com/bootstrap/5.0.0-alpha1/css/bootstrap.min.css",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    `https://cdn.jsdelivr.net/npm/bs-custom-file-input/dist/bs-custom-file-input.js`,
    // "https://res.cloudinary.com/dconct4l9/",
    `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`, //SHOULD MATCH 

];
const styleSrcUrls = [
    'https://api.mapbox.com/mapbox-gl-js/v1.12.0/mapbox-gl.js',
    'https://api.mapbox.com/mapbox-gl-js/v1.12.0/mapbox-gl.css',
    "https://kit-free.fontawesome.com/",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.2.0/dist/css/bootstrap.min.css",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.2.0-beta1/dist/css/bootstrap.min.css",
    "https://cdn.jsdelivr.net",
    "https://stackpath.bootstrapcdn.com/bootstrap/5.0.0-alpha1/css/bootstrap.min.css",
    `https://cdn.jsdelivr.net/npm/bs-custom-file-input/dist/bs-custom-file-input.js`,
    "dist/bs-custom-file-input.js",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/",
    "https://use.fontawesome.com/",
    // "https://res.cloudinary.com/dconct4l9/",
    `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`, //SHOULD MATCH 

];
const connectSrcUrls = [
    "https://*.tiles.mapbox.com",
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
    // "https://res.cloudinary.com/dconct4l9/",
    `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`, //SHOULD MATCH 

];

const fontSrcUrls = [
    "https://fonts.gstatic.com/",
    "https://cdn.jsdelivr.net/",
    "https://use.fontawesome.com/",
    // "https://res.cloudinary.com/dconct4l9/" ,
    `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`, //SHOULD MATCH 

];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",

                `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`,
                "https://images.unsplash.com/",
                'https://source.unsplash.com/collection',
                'https://res.cloudinary.com/YOURACCOUNT/image/upload/',
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
            mediaSrc: [`https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`],
            childSrc: ["blob:"],
        },
        // crossOriginEmbedderPolicy: false
    })
);




app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())
app.use((req, res, next) => {
    console.log(req.session)
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error')
    next();
})

// app.get('/fakeUser',async(req,res)=>{
//    const user = new User({email: 'colttt@gmail.com',username:'colttt'})
//    const newUser = await User.register(user,'chicken');
//    res.send(newUser)
// })

app.use('/', userRoutes);
app.use('/campgrounds', campgroundsRoutes)
app.use('/campgrounds/:id/reviews', reviewsRoutes)


app.get('/', (req, res) => {
    // res.send('HELLO FROM SUMMER CAMP');
    res.render('home')
})




// app.get('/campgrounds',catchAsync(async (req,res)=>{
//    const campgrounds = await Campground.find({});
//    res.render('campgrounds/index',{campgrounds})
// }))

// app.get('/campgrounds/new',(req,res)=>{
//     res.render('campgrounds/new');
// })

// app.post('/campgrounds', validateCampground,catchAsync(async (req, res,next) => {
//    // // if(!req.body.campground) throw new ExpressError('Invalid Campground Data',400);  
//     const campground = new Campground(req.body.campground);
//     await campground.save();
//     res.redirect(`/campgrounds/${campground._id}`)

// }))

// app.get('/campgrounds/:id', catchAsync(async(req,res)=>{
//     const campground = await Campground.findById(req.params.id).populate('reviews')
//     res.render('campgrounds/show',{campground});
// }));

// app.get('/campgrounds/:id/edit',catchAsync(async(req,res)=>{
//     const campground = await Campground.findById(req.params.id);
//    console.log(campground);
//     res.render('campgrounds/edit',{campground});

// }))

// app.put('/campgrounds/:id',validateCampground,catchAsync(async(req,res)=>{
//     const {id} = req.params; 
//     const campground = await Campground.findByIdAndUpdate(id,{...req.body.campground});
//     res.redirect(`/campgrounds/${campground._id}`)
// }))

// app.delete('/campgrounds/:id',catchAsync(async(req,res)=>{
//     const {id} = req.params;
//     await Campground.findByIdAndDelete(id);
//     res.redirect('/campgrounds');
// }))




app.all('*', (req, res, next) => {
    next(new ExpressError('Page not Found', 404))
});


app.use((err, req, res, next) => {
    const { statusCode = 500, message = 'Something went wrong' } = err;
    if (!err.message) err.message = 'ohh no, something went wrong'
    res.status(statusCode).render('error', { err });
    // res.send("ohh!something went wrong")
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`serving on port ${port}`);
})




// post/campgrounds/:id/reviews


// npm install helmet@4.1.1 --save