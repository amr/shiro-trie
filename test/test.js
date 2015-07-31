'use strict';
var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;
var shiroTrie = require('../');

var trie;

describe('shiro-trie node module', function() {
  describe('basic check of testing library', function() {
    it('assert that JavaScript is still a little crazy', function() {
      expect([] + []).to.equal('');
    });
    it('undefined is not a function', function(done) {
      expect(typeof undefined).to.not.eql('function');
      done();
    });
  });

  describe('building permission trie', function() {
    beforeEach(function(done) {
      trie = shiroTrie.new();
      done();
    });
    it('single permission', function(done) {
      trie.add('a:b:c:d');
      expect(trie.get()).to.eql({a: {b: {c: {d: {'*': {}}}}}});
      done();
    });
    it('two single permissions', function(done) {
      trie.add('a:b:c:d');
      trie.add('a:c:c:d');
      expect(trie.get()).to.eql({a: {b: {c: {d: {'*': {}}}}, c: {c: {d: {'*': {}}}}}});
      done();
    });
    it('two permissions as args', function(done) {
      trie.add('a:b:c:d', 'a:c:c:d');
      expect(trie.get()).to.eql({a: {b: {c: {d: {'*': {}}}}, c: {c: {d: {'*': {}}}}}});
      done();
    });
    it('two permissions as array', function(done) {
      trie.add(['a:b:c:d', 'a:c:c:d']);
      expect(trie.get()).to.eql({a: {b: {c: {d: {'*': {}}}}, c: {c: {d: {'*': {}}}}}});
      done();
    });
    it('non-strings get ignored', function(done) {
      trie.add(['a:b:c:d', 'a:c:c:d']);
      var trie1 = shiroTrie.new().add(['a:b:c:d', 4, 'a:c:c:d']);
      expect(trie.get()).to.eql(trie1.get());
      done();
    });
    it('comma-separated permissions', function(done) {
      trie.add('a:b,c:d');
      expect(trie.get()).to.eql({
        a: {
          b: {d: {'*': {}}},
          c: {d: {'*': {}}}
        }
      });
      done();
    });
    it('multiple comma-separated permissions', function(done) {
      trie.add('a:b,c,d:e,f,g');
      expect(trie.get()).to.eql({
        a: {
          b: {
            e: {'*': {}},
            f: {'*': {}},
            g: {'*': {}}
          },
          c: {
            e: {'*': {}},
            f: {'*': {}},
            g: {'*': {}}
          },
          d: {
            e: {'*': {}},
            f: {'*': {}},
            g: {'*': {}}
          }
        }
      });
      done();
    });
    it('reset works', function(done) {
      expect(trie.add('a:b:c').reset().get()).to.eql({});
      done();
    });
  });

  describe('checking permissions', function() {
    beforeEach(function(done) {
      trie = shiroTrie.new();
      done();
    });
    it('simple permission', function(done) {
      trie.add('a:b:c:d');
      expect(trie.check('a:b:c:d')).to.eql(true);
      expect(trie.check('a:c:c:d')).to.eql(false);
      done();
    });
    it('star permission', function(done) {
      trie.add('a:*');
      expect(trie.check('a:b')).to.eql(true);
      expect(trie.check('a:b:c')).to.eql(true);
      expect(trie.check('b:c')).to.eql(false);
      done();
    });
    it('implicit star permission', function(done) {
      trie.add('a');
      expect(trie.check('a:b')).to.eql(true);
      expect(trie.check('a:b:c')).to.eql(true);
      expect(trie.check('b:c')).to.eql(false);
      done();
    });
    it('comma permission', function(done) {
      trie.add('a:b,c:d');
      expect(trie.check('a:b:d')).to.eql(true);
      expect(trie.check('a:c:d')).to.eql(true);
      done();
    });
  });

  describe('chaining works', function() {
    it('simple add.check', function(done) {
      expect(shiroTrie.new().add('a:b:c').check('a:b:c:d')).to.eql(true);
      done();
    });
  });

  describe('more complex wildcard permissions', function() {

    it('test0', function() {
      assert.equal(shiroTrie.new().add('*').check('l1:l2:l3:l4:l5'), true);
    });
    it('test1', function() {
      assert.equal(shiroTrie.new().add('*').check('l1'), true);
    });
    it('test2', function() {
      assert.equal(shiroTrie.new().add('*:*').check('l1:l2:l3:l4:l5'), true);
    });
    it('test3', function() {
      assert.equal(shiroTrie.new().add('*:*').check('l1:l2'), true);
    });
    it('test4', function() {
      assert.equal(shiroTrie.new().add('*:*').check('l1'), true);
    });
    it('test5', function() {
      assert.equal(shiroTrie.new().add('*:*:*').check('l1:l2:l3:l4:l5'), true);
    });
    it('test6', function() {
      assert.equal(shiroTrie.new().add('*:*:*').check('l1:l2:l3'), true);
    });
    it('test7', function() {
      assert.equal(shiroTrie.new().add('*:*:*').check('l1:l2'), true);
    });
    it('test8', function() {
      assert.equal(shiroTrie.new().add('*:*:*').check('l1'), true);
    });
    it('test9', function() {
      assert.equal(shiroTrie.new().add('newsletter:*:*').check('newsletter:edit'), true);
    });
    it('test10', function() {
      assert.equal(shiroTrie.new().add('newsletter:*:*').check('newsletter:edit:*'), true);
    });
    it('test11', function() {
      assert.equal(shiroTrie.new().add('newsletter:*:*').check('newsletter:edit:12'), true);
    });
  });

  describe('fine grained permissions', function() {
    it('test1', function() {
      assert.equal(shiroTrie.new().add('l1:l2:*').check('l1:l2:l3'), true);
    });
    it('test2', function() {
      assert.equal(shiroTrie.new().add('l1:l2:*').check('l1:l2'), true);
    });
    it('test3', function() {
      assert.equal(shiroTrie.new().add('l1:l2:*:*:*').check('l1:l2:l3:l4:l5'), true);
    });
    it('test4', function() {
      assert.equal(shiroTrie.new().add('l1').check('l1:l2:l3'), true);
    });
    it('test5', function() {
      assert.equal(shiroTrie.new().add('l1:l2').check('l1:l2:l3'), true);
    });
    it('test6', function() {
      assert.equal(shiroTrie.new().add('l1:l2').check('l1'), false);
    });
    it('test7', function() {
      assert.equal(shiroTrie.new().add('l1:a,b,c:l3').check('l1:a:l3'), true);
    });
    it('test8', function() {
      assert.equal(shiroTrie.new().add('l1:a,b,c:d,e,f').check('l1:a:l3'), false);
    });
    it('test9', function() {
      assert.equal(shiroTrie.new().add('l1:a,b,c:d,e,f').check('l1:a:f'), true);
    });
    it('test10', function() {
      assert.equal(shiroTrie.new().add('l1:*:l3').check('l1:l2:l3'), true);
    });
    it('test11', function() {
      assert.equal(shiroTrie.new().add('l1:*:l3').check('l1:l2:error'), false);
    });
    it('test12', function() {
      assert.equal(shiroTrie.new().add('l1:*:l3').check('l1:l2'), false);
    });
    it('test13', function() {
      assert.equal(shiroTrie.new().add('*:l2').check('l1:l2'), true);
    });
    it('test14', function() {
      assert.equal(shiroTrie.new().add('*:l2').check('l1:error'), false);
    });
    it('test15', function() {
      assert.equal(shiroTrie.new().add('*:l2:l3').check('l1:l2:l3'), true);
    });
    it('test16', function() {
      assert.equal(shiroTrie.new().add('*:l2:l3').check('l1:l2:l3:l4'), true);
    });
    it('test17', function() {
      assert.equal(shiroTrie.new().add('*:*:l3').check('l1:l2:l3'), true);
    });
    it('test18', function() {
      assert.equal(shiroTrie.new().add('*:*:l3').check('l1:l2:l3:l4'), true);
    });
    it('test19', function() {
      assert.equal(shiroTrie.new().add('*:*:l3').check('l1:l2:error:l4'), false);
    });
    it('test20', function() {
      assert.equal(shiroTrie.new().add('newsletter:view,create,edit,delete').check('newsletter:view,create,any,edit,delete'), false);
    });
  });

  describe('get Permissions', function() {
    var trie;
    before(function(done) {
      trie = shiroTrie.new().add('d:1,2,3:read,write', 'd:4:read', 'x', 'a:1:b:3,4', 'a:2:b:5,6');
      done();
    });
    it('simple id lookup', function(done) {
      expect(trie.permissions('d:?')).to.eql(['1','2','3','4']);
      done();
    });
    it('simple id lookup with explicit any', function(done) {
      expect(trie.permissions('d:?:$')).to.eql(['1','2','3','4']);
      done();
    });
    it('simple id lookup with specific sub-right', function(done) {
      expect(trie.permissions('d:?:write')).to.eql(['1','2','3']);
      done();
    });
    it('explicit lookup at end', function(done) {
      expect(trie.permissions('d:2:?')).to.eql(['read','write']);
      expect(trie.permissions('d:4:?')).to.eql(['read']);
      done();
    });
    it('wildcard lookup at end', function(done) {
      expect(trie.permissions('x:?')).to.eql(['*']);
      done();
    });
    it('any flag in middle', function(done) {
      expect(trie.permissions('a:$:b:?')).to.eql(['3','4','5','6']);
      done();
    });
    it('multiple any flags', function(done) {
      expect(trie.permissions('$:$:?')).to.eql(['read','write','b']);
      done();
    });
    it('wildcard', function(done) {
      expect(trie.permissions('x:$:b:?')).to.eql(['*']);
      done();
    });
  });

});
