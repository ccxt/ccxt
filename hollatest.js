const hollaex = require('./js/hollaex');

const holla = new hollaex();

holla.apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOnsiaWQiOjEwMiwiZW1haWwiOiJicmFuZG9uQGJpdGhvbGxhLmNvbSJ9LCJzY29wZXMiOlsidXNlciIsImJvdCJdLCJpc3MiOiJob2xsYWV4LmNvbSIsImlhdCI6MTU1NTQ4MDczN30.kIHywB9dXc4eo904OVozEUUV9rS4_tIGuJT1p0tMfJo';

holla.fetchTickers().then((data) => {
    console.log(data);
})
