function PartialVerse(Verse, FractionOfRevealedWords, Option) {
/*
Verse is string, FractionOfRevealedWords is a float between 0 and 1,
Option is an integer (see within the function for various options for
how to hide the words of the verse).

Returns: a list of two elements.
The first element is RevealedWordList, an the ordered list of words of the verse, but the
hidden words are replaced with HiddenWordLabel (a const, currently defined as a string of
4 question marks).
The second element is HiddenWordList. It is ordered such that
the first HiddenWordLabel in RevealedWordList corresponds to the first non-HiddenWordLabel in HiddenWordList.

Example: PartialVerse("In the beginning, God created the heavens and the earth.", .8, 3)
Returns [RevealedWordList, HiddenWordList]
RevealedWordList = [In,the,beginning,,God,created,????,heavens,????,the,earth.]
HiddenWordList = [????,????,????,????,????,the,????,and,????,????"]
*/
    console.log('Verse: ' + Verse);
    const HiddenWordLabel = '????';
    var RevealedWordList = Verse.split(" ");
    var NumberOfHiddenWords = RevealedWordList.length - (RevealedWordList.length * FractionOfRevealedWords);
    NumberOfHiddenWords = Math.ceil(NumberOfHiddenWords); /*
        If FractionOfRevealedWords is high but not 1 (such as .99), this guarantees that
        NumberOfHiddenWords > 0.
    */
    console.log('RevealedWordList.length: ' + RevealedWordList.length);
    console.log('NumberOfHiddenWords: ' + NumberOfHiddenWords);

    var HiddenWordList = [];
    /*
        Setting HiddenWordList to have RevealedWordList.length null entries.
    */
    const HiddenWordListNullEntry = HiddenWordLabel;
    for( var idx = 0; idx < RevealedWordList.length; idx++ ){
        HiddenWordList.push(HiddenWordListNullEntry);
    }

//     console.log('HiddenWordList: ' + HiddenWordList);



    if( Option == 1 ){ /*
        Hide the first NumberOfHiddenWords in RevealedWordList
    */
        for( var idx = 1; idx <= NumberOfHiddenWords; idx++ ){
            HiddenWordList.push( RevealedWordList.shift() );
        }
        for( var idx = 1; idx <= NumberOfHiddenWords; idx++ ){
            RevealedWordList.unshift(HiddenWordLabel);
        }
        console.log('HiddenWordList Option 1: ' + HiddenWordList);
    console.log('RevealedWordList Option 1: ' + RevealedWordList);
    }
    else if( Option == 2){ /*
        Hide the last NumberOfHiddenWords in RevealedWordList
    */
        for( var idx = 1; idx <= NumberOfHiddenWords; idx++ ){
            HiddenWordList.unshift( RevealedWordList.pop() );
        }
        for( var idx = 1; idx <= NumberOfHiddenWords; idx++ ){
            RevealedWordList.push(HiddenWordLabel);
        }
    }
    else if( Option == 3){ /*
        Hide a random assortment of words
    */
        var RandomIndex;
        var idx = 1;
        while (idx <= NumberOfHiddenWords){
            RandomIndex = Math.random() * (RevealedWordList.length - 1);
            console.log('RandomIndex: ' +RandomIndex);
            RandomIndex = Math.round( RandomIndex ); /*
            Note: The first and last words in RevealedWordList are less likely
            to be chosen by RandomIndex
            */
            if (RevealedWordList[RandomIndex] != HiddenWordLabel) {
                HiddenWordList[RandomIndex] = RevealedWordList[RandomIndex];
                RevealedWordList[RandomIndex] = HiddenWordLabel;
                idx++;
            }
        }
        console.log('HiddenWordList Option 3: ' + HiddenWordList);
        console.log('RevealedWordList Option 3: ' + RevealedWordList);
    }

    console.log(HiddenWordList);
    return [RevealedWordList, HiddenWordList];

}

function formGenerator(partialVerse) {
    console.log('formGenerator partialVerse: ' + partialVerse);
    var newPartialVerse = partialVerse;
    for (var i = 0; i < partialVerse.length; i++) {
        if (partialVerse[i] == '????') {
            newPartialVerse[i] = "<input type='text' class='check'></input>"
        }
    }
    return newPartialVerse;
}

function calculateCorrectness(partialVerse) {
    var toCheck = $('.check');
    var newPartialVerse = partialVerse.filter(function(value) {
        return value !== '????';
    });
    console.log('calculateCorrectness newPartialVerse: ' +newPartialVerse);
    var correctCount = 0;
    for (var i = 0; i < newPartialVerse.length; i++) {
        if (toCheck[i].value === newPartialVerse[i]) {
            correctCount += 1;
        }
    }
    $('#result_correctness').val(correctCount/newPartialVerse.length);
}

$(function() {
    $('#backButton').hide();
    var partialVerse = PartialVerse(body, 0.8, 3);
    console.log('partialVerse[0]: ' + partialVerse[0]);
    console.log('partialVerse[1]: ' + partialVerse[1]);
    $('#test').append(formGenerator(partialVerse[0]).join(' '))

    $("form").submit(function() {
        calculateCorrectness(partialVerse[1]);
    })

    $("#new_result").on("ajax:success", function(e, data) {
        if (data.correctness === 1.0) {
            $('#checkButton').hide();
            $('#backButton').show();
        } else {
            alert('Not fully correct.')
        }
    })

})
