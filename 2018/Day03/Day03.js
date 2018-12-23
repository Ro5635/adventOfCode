/**
 * Advent of Code Day 3
 *
 * https://adventofcode.com/2018/day/3
 */

const fs = require('fs').promises;

const INPUT_TEXT_FILE = 'Day03Input.txt';

// Set up the data structures to hold the claims and claims map
let fabricAllocationMap = [];
// All of the claims within the allocation map that are in conflict
let claimsInConflict = new Map();                                       // NB: JS Perf with Map is a bit odd...

day03();

/**
 * day03
 *
 * Get the number of conflicts between the claims
 * @returns {Promise<void>}
 */
async function day03() {

    const fileContents = await getFileContents(INPUT_TEXT_FILE);

    // Split file into an array of each of the box ID's
    const claimsTextArray = fileContents.split('\r\n');

    // Convert text claims to Claims
    let claimsArray = claimsTextArray.map(getClaimFromClaimText);

    // Add each claim to the claims map
    for (let claim of claimsArray) {
        registerClaim(claim);

    }

    let claimConflicts = 0;

    // Need to find number of squares that are in two or more claims
    // So need to step through all of the occupied (it's a sparse array)
    // squares and get the number of claims competing for the position
    for (let mapRow of fabricAllocationMap) {

        mapRow.forEach((position) => {
            let claimsMadeForThisPosition = position.claimedByClaims;

            if (claimsMadeForThisPosition.length > 1) {
                // More than one ID claims this position
                // Increment the count of claim conflicts
                claimConflicts++;
            }

        });

    }

    console.log(`Number of found conflicts: ${claimConflicts}`);

    // Need to now find the number of claims that have zero conflicts

    // Step through each of the claims and check if it is in the claimsInConflict map, if it is not then it
    // is not in conflict and can be added to the unconflictedClaims Array

    // Array of un-conflicted claims
    let unconflictedClaims = [];

    for (let claim of claimsArray) {
        let claimHasConflict = claimsInConflict.has(claim.claimID);

        if (!claimHasConflict) {
            unconflictedClaims.push(claim);

        }
    }

    console.log('Un-conflicted Claims:');

    for (let claim of unconflictedClaims) {
        console.log(`   ${claim.claimID}`);
    }


}


/**
 * registerClaim
 *
 * Adds a claim to all of the positions on the map for which the passed claim relates
 *
 * @param claim example: {'claimID': '33EER','originPosition': {'x': 4, 'y': 7}, 'dimensions': {'height': 5, 'width': 5}}
 */
function registerClaim(claim) {

    // Get the claim origin positions
    let originX = claim.originPosition.x;
    let originY = claim.originPosition.y;

    let endPositionX = originX + claim.dimensions.width;
    let endPositionY = originY + claim.dimensions.height;

    // Need to add a claim to all of the positions included in the claim's rectangle
    // iterate over all X and Y positions
    for (let positionX = originX; positionX < endPositionX; positionX++) {

        for (let positionY = originY; positionY < endPositionY; positionY++) {
            addClaimToPosition(claim, positionX, positionY);

        }
    }

    // Helper Functions

    /**
     * Adds a claim to the passed position in the claims map
     *
     * @param claim
     * @param positionX
     * @param positionY
     */
    function addClaimToPosition(claim, positionX, positionY) {
        ensureFabricAllocationMapDataStructureExists(positionX, positionY);

        let claimPosition = fabricAllocationMap[positionX][positionY];

        // Add passed claim to claim list in claim position
        claimPosition.claimedByClaims.push(claim);

        // Is there multiple claims to this position
        if (claimPosition.claimedByClaims.length > 1) {
            // Is this the first conflicting claim to be added to this position
            if (claimPosition.claimedByClaims.length === 2) {

                // This is the first conflict found in this position so both claims need adding to claimsInConflict
                for (let claimInConflict of claimPosition.claimedByClaims) {
                    claimsInConflict.set(claimInConflict.claimID, {});

                }

            } else {
                // Add the additional conflict
                claimsInConflict.set(claim.claimID, {});

            }

        }

    }

    /**
     * ensureFabricAllocationMapDataStructureExists
     *
     * Create supporting data structure for multi dimensional array
     * if it does not yet exist
     *
     * @param posX
     * @param posY
     */
    function ensureFabricAllocationMapDataStructureExists(posX, posY) {

        if (!fabricAllocationMap[posX]) {
            fabricAllocationMap[posX] = [];
        }

        if (!fabricAllocationMap[posX][posY]) {
            // Create an empty position object
            fabricAllocationMap[posX][posY] = {'claimedByClaims': []};
        }
    }

}

/**
 *
 * @param claimText
 */
function getClaimFromClaimText(claimText) {
    // Example claim text representation: "#123 @ 3,2: 5x4"
    // Decodes to: {claimID: 123, originPosition: {x:3,y:2}, dimensions: {width: 5, height: 4}}

    const indexOfHash = claimText.indexOf('#');
    const indexOfAt = claimText.indexOf('@');
    const indexOfComma = claimText.indexOf(',');
    const indexOfColon = claimText.indexOf(':');
    const indexOfX = claimText.indexOf('x');
    const claimTextLength = claimText.length;

    let claim = {};

    try {
        const claimIDText = claimText.slice(indexOfHash + 1, indexOfAt);
        const claimID = parseInt(claimIDText, 10);

        // Extract the origin positions text segments
        const claimOriginTextX = claimText.slice(indexOfAt + 1, indexOfComma);
        const claimOriginTextY = claimText.slice(indexOfComma + 1, indexOfColon);

        // Parse origin positions
        const claimOriginX = parseInt(claimOriginTextX, 10);
        const claimOriginY = parseInt(claimOriginTextY, 10);

        // Extract dimensions
        const claimDimensionTextWidth = claimText.slice(indexOfColon + 1, indexOfX);
        const claimDimensionTextHeight = claimText.slice(indexOfX + 1, claimTextLength);

        // Parse Dimensions
        const claimDimensionWidth = parseInt(claimDimensionTextWidth, 10);
        const claimDimensionHeight = parseInt(claimDimensionTextHeight, 10);

        // Build claim
        claim = {'claimID': claimID,'originPosition': {'x': claimOriginX, 'y': claimOriginY}, 'dimensions': {'width': claimDimensionWidth, 'height': claimDimensionHeight}}

    } catch (err) {
        console.error('Failed to convert claim text to claim');
        console.error(`Failed with claim: ${claim}`);
        console.error(err);

    }

    // Validate the new claim
    if(claimIsValid(claim)) {
        return claim;

    } else {
        throw new Error('Invalid Claim');

    }

}

/**
 * claimIsValid
 *
 * Validates that the supplied claim is valid
 * returns TRUE if valid, else FALSE.
 *
 * @param claim
 * @returns {boolean}
 */
function claimIsValid(claim) {
    // TO DO: Implement validation
    return true;
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