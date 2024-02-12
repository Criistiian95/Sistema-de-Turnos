require('dotenv').config();

module.exports = {
  "development": {
    "username":"root",
    "password": "-1-EegefG53E1h661gF1dbbb5B-56-CAh",
    "database": "railways",
    "host":"viaduct.proxy.rlwy.net",
    "port": 14890,
    "dialect": "mysql"
  },
  "test": {
    "username": "root",
    "password": null,
    "database": "sismed",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "production": {
    "username":"root",
    "password": "-1-EegefG53E1h661gF1dbbb5B-56-CAh",
    "database": "railways",
    "host":"viaduct.proxy.rlwy.net",
    "port": 14890,
    "dialect": "mysql"
  }
}
