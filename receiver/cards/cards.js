window.onload = function() {
  var rows = document.getElementsByClassName('gameboard')[0].children;
  rows[0].children[0].children[0].appendChild(createCard('fuck off'));
}

function createCard(card) {
	var value = getValue(Math.floor(Math.random() * 13) + 2); // switch to get card value
	var suite = getSuite(getRandomSuite()); // switch to get card suite
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

function getRandomSuite() {
  var suites = ['hearts', 'clubs', "diamonds", "spades"];
  return suites[(Math.floor(Math.random() * 4))];
}