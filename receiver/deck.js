'use strict';

var Deck  = function() {
  this.cards = [];

  this.setCards = function() {
    var suits = ['spades ', 'hearts', 'diamonds', 'clubs'];
    var values = [ 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14 ];

    var i = 0;

    suits.forEach(function(suit) {
      values.forEach(function(value){
        var card = new Card( suit, value );
        this.cards[ i++ ] = card;
      }, this)
    }, this)
  }

  this.pickCard = function() {
    var max = this.cards.length;
    var min = 0;
    var index = Math.floor(Math.random() * (max - min) + min);

    var card = this.cards[ index ];

    this.cards.splice(index, 1);
    return card;
  }

  this.setCards();
}