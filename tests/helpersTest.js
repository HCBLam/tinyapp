const { assert } = require('chai');
const helpers = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user if the email is valid', function() {
    const user = helpers.getUserByEmail("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    assert.equal(user.id, expectedOutput);
  });
  it('should return undefined if the email is not in the database', function() {
    const user = helpers.getUserByEmail("nonUser@example.com", testUsers);
    const expectedOutput = undefined;
    assert.equal(user.id, expectedOutput);
  });
  it('should return undefined if no email is entered', function() {
    const user = helpers.getUserByEmail("", testUsers);
    const expectedOutput = undefined;
    assert.equal(user.id, expectedOutput);
  });
});




