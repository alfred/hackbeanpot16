window.onload = function() {
  placeCards();
}

function createCard(card) {
	var value = getValue(Math.floor(Math.random() * 13) + 2); // card.value
	var suite = getSuite(getRandomSuite()); // card.suit
  var color = (suite == '&hearts;' || suite == '&diams') ? 'cardRed' : 'cardBlack';

  var cardDiv = document.createElement('div')
  cardDiv .setAttribute('class', 'outline rounded ' + color);
  cardDiv.innerHTML = '<div class="top"><span>'+value+'</span><span>'+suite+'</span></div><h1>'+suite+'</h1><div class="bottom"><span>'+suite+'</span><span>'+value+'</span></div>';
  
  return cardDiv;
}

function getSuite(suite) {
  if (suite == 'diamonds') { return '&diams;'; }
  else { return '&' + suite + ';'; }
}

function getValue(value) {
  switch(value) {
    case 11:
      return 'J';
    case 12:
      return 'Q';
    case 13:
      return 'K';
    case 14:
      return 'A';
    default:
      return value;
  }
}

// ----------------------------------------------------------------------------------------

function placeCards() {
  var rows = document.getElementsByClassName('gameboard')[0].children;
  for(i=0; i < rows.length; i++) {
    var slots = rows[i].children;
    for(j=0; j < slots.length; j++) {
      var cards = slots[j].children;
      for(k=0; k < cards.length; k++) {
        cards[k].appendChild(createCard('how does this work'));
      }
    }
  }
}

function getRandomSuite() {
  var suites = ['hearts', 'clubs', "diamonds", "spades"];
  return suites[(Math.floor(Math.random() * 4))];
}