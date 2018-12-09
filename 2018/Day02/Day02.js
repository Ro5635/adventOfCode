/**
 * Advent of Code 2018 - Day 2
 *
 *
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