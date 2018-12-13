/**
 * Advent of Code 2018 - Day 2
 *
 * https://adventofcode.com/2018/day/2
 */

const fs = require('fs').promises;

const INPUT_TEXT_FILE = 'Day02Input.txt';

let globalLetterRepeats = {};

day2Task();

async function day2Task() {
    const fileContents = await getFileContents(INPUT_TEXT_FILE);

    // Split file into an array of each of the box ID's
    const boxIDsArray = fileContents.split('\r\n');

    for (let boxID of boxIDsArray) {

        const letterRepeatsForBoxID = getLetterFrequencies(boxID);

        updateGlobalLetterRepeats(letterRepeatsForBoxID);

    }

    const resultingCheckSum = calculateCheckSum(globalLetterRepeats);

    console.log(`Checksum resolved as: ${resultingCheckSum}`);


    // Day 2 task part 2
    let similarCodes = [];
    let similarCodesMap = {};

    for (let searchCode of boxIDsArray) {
        // Need to compare current search code against all other codes
        for (let comparisonCode of boxIDsArray) {
            // Now need to find the IDs that are similar, they will vary by 1 character in the same position to be deemed similar
            let foundInconsistencies = getInconsistencies(searchCode, comparisonCode );

            // To be deemed as similar the codes should have only a single Inconsistency
            if (foundInconsistencies.length === 1) {

                // Check this is not already in the duplicates array
                if (similarCodesMap[comparisonCode] !== searchCode) {
                    // Add the similar codes to the similarCodes array
                    similarCodes.push({codes: [searchCode, comparisonCode], 'inconsistencyAtIndex': foundInconsistencies[0].letterIndex});

                    // Add an entry to the comparisonCodeMap so no duplicates (same pairing reversed) are added
                    similarCodesMap[searchCode] = comparisonCode;

                }
            }
        }
    }

    // Get the common letters between the codes
    for (let similarCode of similarCodes) {
        let code = similarCode.codes[0];

        // This needs to be refactored so the conversion is not needed...
        let slice2Start = parseInt(similarCode.inconsistencyAtIndex, 10) + 1;

        let codeWithoutInconsistency = code.slice(0, similarCode.inconsistencyAtIndex) + code.slice(slice2Start, code.length);

        // Print results to console
        console.log(`Code Without Inconsistency: ${codeWithoutInconsistency}`);

    }



}


/**
 * getInconsistencies
 *
 * Gets an array containing inconsistencies between two codes
 *
 * @param code1     String code e.g: 'fghij'
 * @param code2     String code e.g: 'fguij'
 * @returns {Array} Array of Inconsistencies e.g: [ { letterIndex: '2', expectedLetter: 'h' } ]
 */
function getInconsistencies(code1, code2) {

    // Array to hold found inconsistencies
    let inconsistencies = [];

    for (let letterIndex in code1) {

        if(code1[letterIndex] !== code2[letterIndex]) {
            // Push found inconsistency to array
            inconsistencies.push({'letterIndex': letterIndex, 'expectedLetter' : code1[letterIndex]});

        }
    }

    // If code 2 is longer than code 1 then all of the additional letters need to be added to the inconsistencies
    if (code1.length < code2.length) {

        for(let index = code1.length; index < code2.length; index++) {
            inconsistencies.push({'letterIndex': index, 'expectedLetter': ''});

        }
    }


    // return the array of all found inconsistencies between the supplied codes
    return inconsistencies;
}


/**
 * calculateCheckSum
 *
 * Calculates the checksum given a map of letter repeat's counts
 *
 * @param letterRepeatsCount  frequency of counts at which letters where repeated e.g: { '1': 250, '2': 249, '3': 30, '4': 1 }
 * @returns {number}
 */
function calculateCheckSum(letterRepeatsCount) {

    let checkSumTotal = 1;

    for (let repeats of Object.keys(letterRepeatsCount)) {

        // Single instances are ignored
        if (repeats > 1) {
            checkSumTotal = checkSumTotal * letterRepeatsCount[repeats];

        }

    }

    return checkSumTotal;
}


/**
 * updateGlobalLetterRepeats
 *
 * Updates the global data structure holding the counts of the repeats
 *
 * @param newIDLetterFrequencies    Object mapping letter to its frequency e.g: { a: 2, b: 1, c: 1, d: 2 }
 */
function updateGlobalLetterRepeats(newIDLetterFrequencies) {

    let repeatCounts = {};

    // The repeats are only counted once per ID, so having two letters repeat twice counts as a single repeat
    // step through the letter frequencies and find the repeats
    for (let letter of Object.keys(newIDLetterFrequencies)) {

        const letterRepeats = newIDLetterFrequencies[letter];

        // Record that there is a repeat at this count
        repeatCounts[letterRepeats] = true;
    }

    // Update the globalLetterRepeats with the new repeats
    for (let repeatCount of Object.keys(repeatCounts)) {

        // If there is an entry at this count increment it, else create an entry
        if (globalLetterRepeats[repeatCount]) {
            globalLetterRepeats[repeatCount] = globalLetterRepeats[repeatCount] + 1;

        } else {
            globalLetterRepeats[repeatCount] = 1;

        }
    }

}


/**
 * getLetterFrequencies
 *
 * Returns a map containing the frequencies of each of the letters in the passed ID string
 *
 * Example input: "aabcdd" Response: { a: 2, b: 1, c: 1, d: 2 }
 *
 * @param boxID         String to aquire the letter frequencies for
 */
function getLetterFrequencies(boxID) {

    let letterFrequencies = {};

    // Need to get the frequency of each of the letters in the passed ID
    for (let letter of boxID){

        if (letterFrequencies[letter]) {
            letterFrequencies[letter] = letterFrequencies[letter] + 1;

        } else {
            // Add the letter to the letterFrequencies object
            letterFrequencies[letter] = 1;
        }

    }

    return letterFrequencies;

}

/**
 * getFileContents
 *
 * gets the contents of the file
 *
 * @returns {Promise<void>}
 */
async function getFileContents(filePath) {

    try {
        return await fs.readFile(filePath, 'utf8');

    } catch (err) {
        console.error("failed ro read file");
        console.error(err);
        console.error("aborting");

    }

}