const hollaex = require('./js/hollaex');

const holla = new hollaex();

holla.apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOnsiaWQiOjEwMiwiZW1haWwiOiJicmFuZG9uQGJpdGhvbGxhLmNvbSJ9LCJzY29wZXMiOlsidXNlciIsImJvdCJdLCJpc3MiOiJiaXRob2xsYS5jb20iLCJpYXQiOjE1NjA4MzcyNzN9.x0tGRwX7u6pp6rzv2x3r_Tm1enQ7eG3mA6pHMSAWrC4';

holla.fetchMarkets().then((data) => {
    console.log(data);
}).catch((err) => {
    console.log(err);
})
