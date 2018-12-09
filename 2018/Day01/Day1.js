/**
 * Advent of Code - Day 1
 *
 * REQUIRES NODE 10
 *
 *  Uses the experimental promises API from the built in node fs module
 */


const fs = require('fs').promises;

// Source text file, should look as below at any* length:
// -11
// -5
// -5
// -933
// -16
const INPUT_TEXT_FILE = 'Day1Data.txt';

// Data structures for the registerFrequency function
let frequenciesSeen = {};
// WRONG ---> Deleting keys from a standard JS object is VERY slow, so going to use the built in Map object
// Turns out JS Object is much faster, see MapTest.js for experimentation...
let repeatsOfFrequencies = {};

// Run the task
day1FrequenciesTask();




async function day1FrequenciesTask(){

    const fileContents = await getFileContents();

    const phaseAdjustmentsAsStrings = fileContents.split('\r\n');
    const phaseAdjustments = phaseAdjustmentsAsStrings.map(phaseManipulationString => parseInt(phaseManipulationString, 10));

    let finalPhase;
    const runAwayLimit = 1000;
    let loopsCompleted = 0;

    // Loop until there is an entry into the repeats of frequencies object, or the runaway limit is hit
    while (Object.keys(repeatsOfFrequencies).length < 1 && loopsCompleted < runAwayLimit) {
        // Need to apply each of the phase adjustments
        finalPhase = applyPhaseAdjustments(phaseAdjustments);

        if (loopsCompleted > 0) {
            phaseAdjustments.shift();
        }

        phaseAdjustments.unshift(finalPhase);
        loopsCompleted++;
    }

    console.log(finalPhase);

}


/**
 * Apply all of the passed frequency adjustments in succession and returns the final
 * frequency
 *
 * @param phaseAdjustments          Array of numeric phase alterations
 * @returns finalPhase              Numeric value of resulting frequency after all transformations are applied
 */
function applyPhaseAdjustments(phaseAdjustments) {

    const finalPhase = phaseAdjustments.reduce( (runningTotal, phaseAdjustment) =>  {

        let newRunningTotal = runningTotal + phaseAdjustment;

        registerFrequency(newRunningTotal);

        return newRunningTotal;

    });

    return finalPhase;
}


/**
 * registerFrequency
 *
 * Register an occurrence of a frequency, allows for the occurrence of frequencies to
 * be tracked.
 *
 * @param frequency           used as key
 */
function registerFrequency(frequency){

	// need to store frequency in a data structure that allows O(1) look up on the phase and
	// the counts of repeats, there are two separate JS objects being used to achieve this.
	// There is an inherent need to ensure that these two data structures are kept in sync for
	// the relationships between them to remain true.

	// Does the passed frequency exist in the store yet?
	if (frequenciesSeen[frequency]) {

		let countPassedFrequencySeen = frequenciesSeen[frequency];

		// Remove the frequency from the repeatsOfFrequencies Object for the current frequency count
		
		// If present in the repeatsOfFrequencies object already remove it
		if (repeatsOfFrequencies[countPassedFrequencySeen] && repeatsOfFrequencies[countPassedFrequencySeen][frequency]) {
			delete repeatsOfFrequencies[countPassedFrequencySeen][frequency]
		}

		// Increment the value for passed frequency in the store
		frequenciesSeen[frequency] = frequenciesSeen[frequency] + 1;


        // Create object for the current count if it does not exist
        if (!repeatsOfFrequencies[countPassedFrequencySeen]) {
            repeatsOfFrequencies[countPassedFrequencySeen] = {};
        }

        // Add to repeatsOfFrequencies object
		repeatsOfFrequencies[countPassedFrequencySeen][frequency] = {egg: true};

        console.log(`seen ${frequency} at least twice now...`)

	} else {
		// Add passed frequency to the store
		frequenciesSeen[frequency] = 1;

		

	}

}

/**
 * getFileContents
 *
 * gets the contents of the file
 *
 * @returns {Promise<void>}
 */
async function getFileContents() {

    try {
        return await fs.readFile(INPUT_TEXT_FILE, 'utf8');

    } catch (err) {
        console.error("failed ro read file");
        console.error(err);
        console.error("aborting");

    }

}