'use strict';

var expect = require('chai').expect;
var request = require('supertest-as-promised');

var app = require('../server/server');

describe('/posts', function() {

  var userId;
  var accessToken;
  beforeEach(function() {
    return app.models.User.create({
      email: 'bboudreau@foko.co',
      password: '1234'
    }).then(function() {
      return request(app).post('/api/users/login')
        .send({
          email: 'bboudreau@foko.co',
          password: '1234'
        })
        .expect(200);
    }).then(function(res) {
      expect(res.body).to.have.property('id');
      expect(res.body).to.have.property('userId');
      userId = res.body.userId;
      accessToken = res.body.id;
    });
  });

  afterEach(function(done) {
    // Truncate database
    app.datasources.db.automigrate(function(err) {
      done(err);
    });
  });

  it('returns empty when there is no posts', function() {
    return request(app)
      .get('/api/posts')
      .set('Authorization', accessToken)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(function(res) {
        expect(res.body).to.be.instanceOf(Array);
        expect(res.body).to.be.of.length(0);
      });
  });

  it('returns created posts', function() {
    return request(app)
      .post('/api/posts')
      .set('Authorization', accessToken)
      .expect('Content-Type', /json/)
      .expect(200)
      .send({
        content: 'Post Content'
      })
      .then(function(res) {
        return request(app).get('/api/posts')
          .set('Authorization', accessToken)
          .expect(200);
      }).then(function(res) {
        expect(res.body).to.be.instanceOf(Array);
        expect(res.body).to.be.of.length(1);
        expect(res.body[0].content).to.equal('Post Content');
      });
  });
});
