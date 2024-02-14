const passport = require("passport");
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const GOOGLE_CLIENT_ID = "374377436091-mlmnoh9viae0h2r08fa5alb60ov6ui4d.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET = "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";

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5000/google/callback"
  },
  function(accessToken, refreshToken, profile, cb) {
     return cb(null, profile); // Corrected the callback signature and removed 'err'
  }
));

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user,done){
    done(null,user)
})