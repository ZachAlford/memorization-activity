function Data(correctWordsList, swappedWordsList) { // if necessary, can be refactored to be more explicit as to when to use a deep copy of a list, or to use the same list (for performance reasons)
    this.privateCorrectWordsList = correctWordsList;
    this.correctWordsList = function() {return this.privateCorrectWordsList.slice(0);} // this is to explicitly have a copy of correctWordsList (to make JS copy by value)
    this.privateSwappedWordsList = swappedWordsList;
    this.swappedWordsList = function() {return this.privateSwappedWordsList.slice(0);} // this is to explicitly have a copy of correctWordsList (to make JS copy by value)
    this.reviewTime = 0;
    this.reviewTimeIncrement = function(deciseconds) { // a tenth of a second
        this.reviewTime += deciseconds;
    }
    this.numberOfStrikes = 0;
    this.intervalID1 = null;
    this.endReview = function() { endReview(this); }
    this.timing = 0;
}

function initializeSwappedWordsList(correctWordsList) {
/*
Returns: a list of correctWordList's words, only swapped around
*/
    var swappedWordsList = correctWordsList;
        var poppedWord;
        var randomIndex;
        for( var idx = 1; idx <= swappedWordsList.length; idx++ ){ // upper limit of iterations just needs to not be too little, so ListOfWords.length seemes decent for this
                poppedWord = swappedWordsList.pop();
                randomIndex = Math.random() * (swappedWordsList.length - 2); // -2 to guarantee that the word does not end up in the same place it was, for a little more randomness
                swappedWordsList.splice(randomIndex, 0, poppedWord);
        }
    return swappedWordsList;
}

function initializeReviewHTML(data) {
    var wordSpacing = ' ';
    var labelType;
    $('#reviewWell').append('<ul id="swappedWordsList"></ul>');
    for (var index = 0; index < data.swappedWordsList().length; index++) {
        isPositionOfWordCorrect(data, index) ? labelType = "success" : labelType = "default";
        $('#swappedWordsList').append( '<li><span class="label label-' + labelType + '">' + data.swappedWordsList()[index] + '</span></li>' + wordSpacing );
    }

    /*
    set the default selectedWord, simply for convenience. selectedWord (as a class) identifies the word the user presently controls with keyboard commands
    */
    toggleSelectedWord( cssSelectorOfIndexedWord(indexOfAdjacentIncorrectWord(data, 0, true)) );

    /*
    set selectedWord as wordOfInterest, for convenience. wordOfInterest (as a class) is toggled when a user presses spacebar on selectedWord
    class wordOfInterest is present only if that word is selectedWord
    */
    toggleWordOfInterest(".selectedWord");
}

function isPositionOfWordCorrect(data, index) {
    return data.swappedWordsList()[index] == data.correctWordsList()[index] ;
}

function calculateCorrectness(data) {
    var correctnessCount = 0; //number of words correctly in place
    for (var index = 0; index < data.swappedWordsList().length; index++) {
         if (isPositionOfWordCorrect(data, index)) {correctnessCount++;}
    }
    console.log('calculateCorrectness returns: ' + (correctnessCount / data.swappedWordsList().length));
    return correctnessCount / data.swappedWordsList().length;
}

function cssSelectorOfIndexedWord(index) {
    index = index + 1; // must adjust from 0-indexed, to 1-indexed (what "li:nth-child" requires)
    return "#swappedWordsList li:nth-child(" + index + ") span";
}

function toggleSelectedWord(str) {
    //console.log("toggleSelctedWord str: " + str);
    $(str).toggleClass( "selectedWord" );
//     if ($(str).attr("tabindex") == 1) {$(str).removeAttr("tabindex");} else {$(str).attr("tabindex", 1);}
}

function toggleWordOfInterest(str) {
    $(str).toggleClass( "label-default label-primary wordOfInterest" );
}

function indexOfWordOfInterest(data) { // returns -1 if there is no wordOfInterest
    index = 0;
    while ( (index <= data.swappedWordsList().length - 1) && !($(cssSelectorOfIndexedWord(index)).hasClass("wordOfInterest")) ) { index += 1;}
    if (index > data.swappedWordsList().length - 1) {
        return -1;
    }
    else return index;
}

function setWordOfInterest(str) {
    $(str).toggleClass( "wordOfInterest" );
    //$(str).attr("tabindex", 1);
}

function indexOfAdjacentIncorrectWord(data, index, directionIsForwards) { // returns -1 if every word is correct
    newIndex = index;
    if (directionIsForwards) { // go forwards in list to find adjacent incorrect word
        while ( (newIndex < data.swappedWordsList().length - 1) && isPositionOfWordCorrect(data, newIndex) ) { newIndex += 1; }
        if ((newIndex == data.swappedWordsList().length - 1) && isPositionOfWordCorrect(data, newIndex)) {
            if (index != 0) {
                newIndex = indexOfAdjacentIncorrectWord(data, 0, true);
            } else newIndex = -1;
        }
    } else { // go backwards in list to find adjacent incorrect word
        while ( (newIndex > -1) && isPositionOfWordCorrect(data, newIndex) ) { newIndex -= 1; }
        if ((newIndex == -1) && isPositionOfWordCorrect(data, newIndex)) {
            if (index != data.swappedWordsList().length - 1) {
                newIndex = indexOfAdjacentIncorrectWord(data, data.swappedWordsList().length - 1, false);
            } else newIndex = -1;
        }
    }
    return newIndex;
}

function indexOfSelectedWord(data) {
    index = 0; // index according to the lists in data, not according to the HTML list
    while ( (index < data.swappedWordsList().length - 1) && !($(cssSelectorOfIndexedWord(index)).hasClass("selectedWord")) ) { index += 1; }
    return index;
}

function allWordsAreInCorrectPosition(data) {
//     console.log('allWordsAreInCorrectPosition: ' + (indexOfAdjacentIncorrectWord(data, 0, true) == -1));
    return indexOfAdjacentIncorrectWord(data, 0, true) == -1;
}

function allowActions(data) {
    /*
    This function is the hub of the review activity. Once the user takes one particular action, the effects are
    carried out, the results eventually are presented, control flows back to this function, and "data" is
    updated with relevant data.
    */
//     console.log("allActions: data.numberOfStrikes: " + data.numberOfStrikes)
    if (data.numberOfStrikes > Number($('#numberOfStrikes').html())) {
        $('#numberOfStrikes').html(data.numberOfStrikes.toString());
    }
    if (allWordsAreInCorrectPosition(data) || data.numberOfStrikes == 3) {
        data.endReview();
    } else {
        $("#swappedWordsList li span").one("click", {data: data}, Actions );
        $("body").one("keydown", {data: data}, Actions );
    }
}

function Actions(event) {
//     console.log("Action Number: " + event.which);
    $( "#swappedWordsList li span" ).off();
    $("body").off();
    switch(event.which) {
    case 1: //click
            // if the clicked on word is wordOfInterest, remove its wordOfInterest class
            if ($(this).hasClass("wordOfInterest")) {
//                 console.log("this span has wordOfInterest");
                $(this).toggleClass( "label-default label-primary wordOfInterest" );
                break;
            }
            // if the clicked on word is not selectedWord, add to it the wordOfInterest class
            if (! $(this).hasClass("selectedWord")) {
//                 console.log("this does not have class selectedWord");
                // there should be only one wordOfInterest at a time (remove the one other wordBlock's wordOfInterest class)
                for (var index = 0; index < event.data.data.swappedWordsList().length; index++) {
                    str = cssSelectorOfIndexedWord(index);
                    if ($(str).hasClass("selectedWord")) {toggleSelectedWord(str);}
                }
                $(this).toggleClass( "selectedWord" );
            }
    case 32: // spacebar
        indexOfWordOfInterest1 = indexOfWordOfInterest(event.data.data);
        if (indexOfWordOfInterest1 == -1) { // there is no previous wordOfInterest, so toggle the selected word, do no more in this case
            toggleWordOfInterest(".selectedWord");
        }
        else { // there is a previous wordOfInterest (with index indexOfWordOfInterest1)
            index2 = indexOfSelectedWord(event.data.data); //
            if (indexOfWordOfInterest1 != index2) { //if true, we are not merely turning off the wordOfInterest, we want to swap two words
                /*
                enter swapWords with indexOfWordOfInterest1 being the "blue word" (with class wordOfInterest but not selectedWord), and index2 being the "highlighted word" (selectedWord, but not wordOfInterest),the two words not being the same)
                */
                swapWords(event.data.data, indexOfWordOfInterest1, index2);
            } else { //we are are merely removing the wordOfInterest class
                toggleWordOfInterest(".selectedWord");
            }
        }
            //console.log("indexOfWordOfInterest: " + indexOfWordOfInterest(event.data.data));
        break;
    case 39: // right-arrow key
    case 37: // left-arrow key
        switchSelectedWord(event.which, event.data.data);
        break;
    default:
        //
    }
//     console.log("data.numberOfStrikes: " + event.data.data.numberOfStrikes)
    allowActions(event.data.data);
}

function switchSelectedWord(arrowKey, data) {
    selectedWordIndex = indexOfSelectedWord(data);
    selectedWordCSSSelector = cssSelectorOfIndexedWord(selectedWordIndex);
//     selectedWordisWordOfInterest = $(selectedWordCSSSelector).hasClass("wordOfInterest");
    //console.log("switchSelectedWord selectedWordIndex: " + selectedWordIndex);
    if (arrowKey == 39) { //the word is selectedWord, but not wordOfInterest
        selectedWordIndex = indexOfAdjacentIncorrectWord(data, (selectedWordIndex + 1) % data.privateCorrectWordsList.length, true);
    } else if (arrowKey == 37) { //the word is selectedWord, but not wordOfInterest
        if (selectedWordIndex == 0) {selectedWordIndex = data.privateCorrectWordsList.length;}
        selectedWordIndex = indexOfAdjacentIncorrectWord(data, (selectedWordIndex - 1), false);
    }
    toggleSelectedWord(selectedWordCSSSelector);
    toggleSelectedWord(cssSelectorOfIndexedWord(selectedWordIndex));
//     if (selectedWordisWordOfInterest) { swapWords(data, selectedWordIndex, newSelectedWordIndex); }
}

function indexOfAdjacentIncorrectWord(data, index, directionIsForwards) { // returns -1 if every word is correct
    newIndex = index;
    if (directionIsForwards) { // go forwards in list to find adjacent incorrect word
        while ( (newIndex < data.swappedWordsList().length - 1) && isPositionOfWordCorrect(data, newIndex) ) { newIndex += 1; }
        if ((newIndex == data.swappedWordsList().length - 1) && isPositionOfWordCorrect(data, newIndex)) {
            if (index != 0) {
                newIndex = indexOfAdjacentIncorrectWord(data, 0, true);
            } else newIndex = -1;
        }
    } else { // go backwards in list to find adjacent incorrect word
        while ( (newIndex > -1) && isPositionOfWordCorrect(data, newIndex) ) { newIndex -= 1; }
        if ((newIndex == -1) && isPositionOfWordCorrect(data, newIndex)) {
            if (index != data.swappedWordsList().length - 1) {
                newIndex = indexOfAdjacentIncorrectWord(data, data.swappedWordsList().length - 1, false);
            } else newIndex = -1;
        }
    }
    return newIndex;
}

function swapWords(data, indexOfWord1, indexOfWord2) {
//     console.log("begin swapWords indexOfWordOfInterest: " + indexOfWordOfInterest(data));
//     console.log("swapWords--- indexOfWord1: " + indexOfWord1 + " indexOfWord2: " + indexOfWord2);

    cssSelectorofWord1 = cssSelectorOfIndexedWord(indexOfWord1);
    cssSelectorofWord2 = cssSelectorOfIndexedWord(indexOfWord2);

    // remove wordOfInterest class for word at indexOfWord1 (now it is neither selectedWord nor wordOfInterest)
    toggleWordOfInterest(cssSelectorofWord1);

    // swap words in data
    word1 = data.privateSwappedWordsList[indexOfWord1];
    word2 = data.privateSwappedWordsList[indexOfWord2];
    data.privateSwappedWordsList[indexOfWord1] = word2;
    data.privateSwappedWordsList[indexOfWord2] = word1;

    // swap words in the displayed HTML
    $(cssSelectorofWord1).html(word2);
    $(cssSelectorofWord2).html(word1);

    toggleSelectedWord( cssSelectorofWord2 ); //remove selectedWord from word at indexOfWord2

//     console.log("data.privateSwappedWordsList= " + data.privateSwappedWordsList);
//     console.log("data.swappedWordsList()= " + data.swappedWordsList());
//     console.log("data.privateCorrectWordsList= " + data.privateCorrectWordsList);
//     console.log("data.correctWordsList()= " + data.correctWordsList());

    // toggle the correctness for a word, if the word is correct
//     console.log(isPositionOfWordCorrect(data, indexOfWord1));
//     console.log(isPositionOfWordCorrect(data, indexOfWord2));

    eitherWordIsCorrect = false;
    if (isPositionOfWordCorrect(data, indexOfWord1)) {
        $(cssSelectorofWord1).toggleClass( "label-default label-success" );
        eitherWordIsCorrect = true;
    }
    if (isPositionOfWordCorrect(data, indexOfWord2)) {
        $(cssSelectorofWord2).toggleClass( "label-default label-success" );
        eitherWordIsCorrect = true;
    }
    if (!eitherWordIsCorrect) {
        data.numberOfStrikes = data.numberOfStrikes + 1;
        toggleSelectedWord( cssSelectorofWord2 ); //change word at indexOfWord2 to be selectedWord
    } else { /* whichever of indexOfWordx is least, if the word there is incorrect, it becomes selectedWord.
                or, the right-hand adjacent incorrect word becomes selectedWord. Because the user probably
                prefers to have automatically selected closer to the beginning of the sentence.
    */
        indexOfWord1 < indexOfWord2 ? idx = indexOfWord1 : idx = indexOfWord2;
//         console.log("idx: " + idx);
        toggleSelectedWord( cssSelectorOfIndexedWord(indexOfAdjacentIncorrectWord(data, idx, true)) );
    }
    toggleWordOfInterest(".selectedWord"); //currently, no word is wordOfInterest, so we call toggleWordOfInterest here on the selectedWord for convenience

}

function endReview(data) {
    clearInterval(data.intervalID1);
    $('#stopButton').hide();
    var correctnessValue = calculateCorrectness(data);
    if (allWordsAreInCorrectPosition(data)) {
        data.timing = Number($('#timer').html());
//         console.log('data.timing: ' + data.timing);
        $('#result_correctness').val(calculateAndDisplayResults(data));
    } else {
        $('#result_correctness').val(0);
    }
    $('form').submit();
}

function beginReview(data) {
    $( "<br /><p id='stopButton' class='btn btn-primary'>Stop</p>" ).insertAfter( "#beginButton" );
    $( "<br /><p>Timer: <span id='timer'></span></p>" ).insertAfter( "#beginButton" );
    $( "<br /><p id='strikesParagraph'>Three strikes and you're out: <span id='numberOfStrikes'>0</span></p>" ).insertAfter( "#timer" );
    $('#beginButton').append( '<span id="reviewTiming"></span>');
    $('#beginButton').hide();

    //setting up the timer
    data.intervalID1 = setInterval(function(){
        data.reviewTimeIncrement(1);
        $('#timer').html((data.reviewTime / 10).toFixed(1));
    }, 100);

    // either the review stops by clicking the "Stop" button, or all the words are correctly in place
    $('#stopButton').one("click", function() { endReview(data); });

    initializeReviewHTML(data);

    allWordsAreInCorrectPosition(data) ? data.endReview() : allowActions(data);
}

function calculateAndDisplayResults(data){
    var grade = ['A: great job!', 'B: not bad!', 'C: not horrible', 'D: not failing'];
    var decimalGrade = [1, .85, .75, .65, 0];
    for(var index=0; index<4; index++) {
        if (data.timing < ((index+1) * data.swappedWordsList().length)) {
                $( "<p id='grade'>Your grade: " + grade[index] + "</p>" ).insertAfter( "#timer" );
                break;
            }
    }
    return decimalGrade[index]
}

$(function() {
    var correctWordsList = body.split(" ");
    var swappedWordsList = initializeSwappedWordsList(correctWordsList.slice(0));

    /*
    Rather than deal with global variables in JS, the "Data" data structure is an easy way to pass
    the data of this review activity through an associative array.
    */
    var data = new Data(correctWordsList, swappedWordsList);

    $( "<p id='beginButton' class='btn btn-primary'>Begin</p>" ).insertAfter( "#reviewWell" );
    $('#backButton').hide();
    $('#checkButton').hide();
    $('#beginButton').one("click", function() {beginReview(data);} );

    $("#new_result").on("ajax:success", function(e, data) {
        $('#backButton').show();
    })
})




    /* perhaps try implementing transitions
    $("#toggleWord").click(function(){
        $("#toggleWord").css("position", "relative");
        $("#toggleWord").animate({right: '+=20px'}, 100);
    });*/

    /*if ( !allWordsAreInCorrectPosition()) {
        ...
    }*/