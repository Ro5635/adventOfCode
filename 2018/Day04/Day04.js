/**
 * Advent of Code 2018 Day 4
 *
 * https://adventofcode.com/2018/day/4
 *
 * Rushed attempt at day 4, the generated solution was accepted!
 *
 *
 * Event Object
 *
 *  Not using a standard time stamp
 *
 *      timeDate.Year
 *      timeDate.Month
 *      timeDate.Day
 *      timeDate.Hour
 *      timeDate.Minute
 *      timeDate.Date [JS Date Object]
 *
 *  Guard.ID
 *  EventType {e.g. ShiftStart}
 *
 */


const fs = require('fs').promises;

const INPUT_TEXT_FILE = 'Day04Input.txt';

day4();

// Main Function
async  function day4() {

    const inputFileContents = await getFileContents(INPUT_TEXT_FILE);

    // Split file into an unsorted array of each of events
    const eventsTextArray = inputFileContents.split('\r\n');

    // Convert the events text into Event objects
    const unorderedEventsArray = eventsTextArray.map(getEventFromEventText);

    let eventsByDate = new Map();

    // Place all of the events into the eventsByDate structure
    for(let event of unorderedEventsArray) {
        const eventTimeDate = event.timeDate;

        createNestedMap( eventsByDate, [eventTimeDate.year, eventTimeDate.month, eventTimeDate.day, eventTimeDate.hour, eventTimeDate.minute], event);

    }

    let currentActiveGuard;

    // Go through an update all of the guardIDs based on the shift changes
    for (let event of eventsByDateIndexIterator(eventsByDate)) {

        // Handle the setting of guardID
        if (event.guardID && event.EventType === "ShiftStart") {
            currentActiveGuard = event.guardID;

        } else {
            if (currentActiveGuard) {
                event.guardID = currentActiveGuard;

            } else {
                // The current guardID is undefined
                console.error('Cannot evaluate guardID for event');
                console.error(`Failed to on event ${JSON.stringify(event)}`);

            }
        }
    }



    // Need to get the number of hours sleep that each of the guards have
    let guardsHoursSleep = {};
    let currentActiveGuardID;
    let sleepStartDateTime;

    for (let event of eventsByDateIndexIterator(eventsByDate)) {

        // Handle changes to the active guard
        if (event.EventType === "ShiftStart") {
            currentActiveGuardID = event.guardID;

        }

        if (event.EventType === "FallAsleep") {
            sleepStartDateTime = event.timeDate.date;

        }

        if (event.EventType === "WakeUp") {
            // Calculate hours asleep
            const milliSecondsSleeping = (event.timeDate.date - sleepStartDateTime);
            const minutesSleeping = milliSecondsSleeping /1000 /60;

            if (!guardsHoursSleep[event.guardID]) {
                guardsHoursSleep[event.guardID] = {};
            }

            // Record all of the minutes that the guard was sleeping
            // All sleep/wake activity's are within the midnight hour
            for (let minute = sleepStartDateTime.getMinutes(); minute < event.timeDate.minute; minute++) {

                if (!guardsHoursSleep[event.guardID].sleepLog){
                    guardsHoursSleep[event.guardID].sleepLog = {};
                }

                if (!guardsHoursSleep[event.guardID].sleepLog[minute]) {
                    guardsHoursSleep[event.guardID].sleepLog[minute] = 1;
                } else {
                    guardsHoursSleep[event.guardID].sleepLog[minute] = guardsHoursSleep[event.guardID].sleepLog[minute] + 1;

                }
            }


            // Update guardsHoursSleep
            const existingMinutesSleeping = guardsHoursSleep[event.guardID].minutesSleeping;

            if (existingMinutesSleeping) {
                guardsHoursSleep[event.guardID].minutesSleeping = guardsHoursSleep[event.guardID].minutesSleeping + minutesSleeping;

            } else {
                guardsHoursSleep[event.guardID].minutesSleeping =  minutesSleeping;

            }

            // Sanity Check
            if (currentActiveGuardID !== event.guardID) {
                console.error('Data integrity error, guard changed whilst asleep!');
                console.error(`Error detected on event: ${JSON.stringify(event)}`);
            }


        }

    }


    // FInd the guard that slept for the longest
    let currentLongestSleeperLength = -1;
    let currentLongestSleeperID;

    for (let guardID in guardsHoursSleep) {
        let currentGuardSleepLength = guardsHoursSleep[guardID].minutesSleeping;

        if (currentGuardSleepLength > currentLongestSleeperLength) {

            // update to the new longest
            currentLongestSleeperID = guardID;
            currentLongestSleeperLength = currentGuardSleepLength;
        }
    }

    // Print out the result
    console.log(`The longest sleeping guard was GuardID: ${currentLongestSleeperID} who slept for ${currentLongestSleeperLength} minutes`);

    // Find the minute in the midnight hour that the guard slept the most often
    const sleepLog = guardsHoursSleep[currentLongestSleeperID].sleepLog;

    // Need to find the largest value in this object map
    let currentHighestCount = -1;
    let currentHighestCountIsAtMinute;

    for (let time in sleepLog) {
        if (sleepLog[time] > currentHighestCount) {
            currentHighestCount = sleepLog[time];
            currentHighestCountIsAtMinute = time;

        }
    }

    console.log(`The Guard falls asleep most commonly at time 00:${currentHighestCountIsAtMinute} and happens ${currentHighestCount} times during the sample period.`);

    // The problem set requests the product of these two values
    const finalResult = currentHighestCountIsAtMinute * currentLongestSleeperID;

    console.log(`So the product of the GuardID and time that this guard can most frequently be found asleep is: ${finalResult}`);


    // eventsArray.sort((a, b) => {
    //
    //     if (a.timeDate.date > b.timeDate.date) {
    //         return 1;
    //     } else if (a.timeDate.date === b.timeDate.date) {
    //         return 0;
    //     } else {
    //         return -1;
    //     }
    // });
    //
    // // Now that the events are ordered, need to step through and update the guard ID on the events where this is missing
    // let currentActiveGuardID = -1;
    // for (let event of eventsArray) {
    //     if (event.guardID) {
    //         currentActiveGuardID = event.guardID;
    //
    //     } else {
    //         // Add current active guard to this event
    //         if (!currentActiveGuardID) {
    //             console.error('Unable to determine guardID for event');
    //             console.error(`Failed for event: ${JSON.stringify(event)}`);
    //
    //         }
    //
    //         event.guardID = currentActiveGuardID;
    //     }
    //
    // }

}


/**
 * eventsByDateIndexIterator
 *
 * Returns a generator that will step through in chronological order all of the events in the events Map
 *
 * TO DO: This is a candidate for clean up...
 *
 * @param eventsIndexedByDate           Map of events by date
 * @return {IterableIterator<*>}
 */
function* eventsByDateIndexIterator(eventsIndexedByDate) {

    let integrityCheckComparisonDate = new Date("01-06-1020");  // Magic Number

    // Built in JS Sort does not handle numeric sort
    const numericCompare = (a, b) => {return a - b};

    for (let yearKey of [...eventsIndexedByDate.keys()].sort(numericCompare))  {//.forEach( yearKey => {

        let currentYear = eventsIndexedByDate.get(yearKey);

        for (let monthKey of [...currentYear.keys()].sort(numericCompare)){//.forEach(monthKey => {

            let currentMonth = currentYear.get(monthKey);

            for ( let dayKey of [...currentMonth.keys()].sort(numericCompare)){//.forEach(dayKey => {

                let currentDay = currentMonth.get(dayKey);

                for (let hourKey of [...currentDay.keys()].sort(numericCompare)){//.forEach(hourKey => {

                    let currentHour = currentDay.get(hourKey);

                    for (let minuteKey of [...currentHour.keys()].sort(numericCompare)){ //.forEach(minuteKey => {

                        let currentMinute = currentHour.get(minuteKey);

                        for (let eventMinuteKey of [...currentMinute.keys()]){//.forEach(eventMinuteKey => {

                            const currentEvent = currentMinute.get(eventMinuteKey);

                            if(integrityCheckComparisonDate > currentEvent.timeDate.date) {
                                console.error(`Data inconsistency detected`);
                                console.error('Event date is before the previous event');
                                console.error(`Inconsistency on event: ${JSON.stringify(currentEvent)}`);
                            }

                            // Update the integrity check date ready for the next round
                            integrityCheckComparisonDate = currentEvent.timeDate.date;

                            // yield the event
                            yield currentEvent;

                        }
                    }
                }
            }
        }
    }


}

/**
 * getEventFromEventText
 *
 * Creates an Event from the supplied event source text
 *
 * To DO: Error handling is a bit all over the place in this, needs clean up...
 *
 * @param eventText     example: [1518-04-12 00:03] Guard #677 begins shift
 */
function getEventFromEventText(eventText) {

    // Split into Time and event Detail section
    const closingSquareBraceIndex = eventText.indexOf(']');
    const eventTextLength = eventText.length;

    // Split into the two key sections and trim spaces
    const timeDateSection = eventText.slice(0, closingSquareBraceIndex + 1);
    const eventInfoSection = eventText.slice(closingSquareBraceIndex + 1, eventTextLength + 1).trim();

    const eventTimeDate = decodeEventTimeDateText(timeDateSection);
    const eventInfo = decodeEventInfo(eventInfoSection);

    return {'timeDate' : eventTimeDate, ...eventInfo};

    // Functions

    /**
     * decodeEventInfo
     *
     * Returns an eventInfo object based on the passed eventInfo text
     * source
     *
     * Currently there are 3 possible event types:
     *  "Guard #XX begins shift"
     *  "falls asleep"
     *  "Wakes up"
     *
     * @param eventInfoText     example: "Guard #677 begins shift"
     */
    function decodeEventInfo(eventInfoText) {

        let eventInfo = {};

        // Convert whole string to lowercase
        const eventInfoTextLower = eventInfoText.toLowerCase();

        // Get the location of the #, may not be in string in which case will get index -1
        const indexOfHash = eventInfoTextLower.indexOf('#');

        // if a '#' was found then it is "Guard #XX begins shift" event
        if (indexOfHash >= 0) {

            // Add Event type
            eventInfo.EventType = 'ShiftStart';

            // Extract the guard ID
            const rightHandSideOfGuardID = eventInfoTextLower.slice(indexOfHash + 1);
            const guardIDEndIndex = rightHandSideOfGuardID.indexOf(' ');

            const guardIDText = rightHandSideOfGuardID.slice(0, guardIDEndIndex);

            let guardID;

            try {
                guardID = parseInt(guardIDText, 10);

            } catch (err) {
                console.error('Failed to convert guard ID');
                console.error(`Failed at: ${rightHandSideOfGuardID}`);

                // Throw error
                throw new Error('Failed to convert Guard ID');

            }

            if (guardID > 0) {
                eventInfo.guardID = guardID;

            } else {
                console.error('Invalid Guard ID');
                console.error(`Found Guard ID: ${guardID}`);

                throw new Error('Invalid Guard ID');
            }

        } else {
            // The remaining Event types are FallAsleep or WakeUp
            // Deduce type by presence of key word in text block

            const indexOfFallsAsleep = eventInfoTextLower.indexOf('asleep');
            const indexOfWakes  = eventInfoTextLower.indexOf('wakes');

            if (indexOfFallsAsleep > -1) {
                // Event type is FallAsleep
                eventInfo.EventType = 'FallAsleep';

            } else if (indexOfWakes > -1) {
                // event type is WakeUp
                eventInfo.EventType = 'WakeUp';

            } else {
                // Unable to resolve the event type
                console.error('Unable to resolve event type');
                console.error(`Failed to resolve: ${eventInfoTextLower}`);


            }

            // Sanity check
            if (indexOfWakes > -1  && indexOfFallsAsleep > -1) {
                // Both event types match, cannot be

                // Clear misleading event type
                delete eventInfo.EventType;
            }

        }

        return eventInfo;

    }

    /**
     * decodeEventTimeDateText
     *
     * Returns an eventDateTime Object from the provided event date time
     * source text
     *
     * @param eventTimeDateText example "[1518-04-12 00:03]"
     * @return eventDateTime
     */
    function decodeEventTimeDateText (eventTimeDateText) {

        // Get locations of the key charactors
        const indexOfOpeningSquareBrace = eventTimeDateText.indexOf('[');
        const indexOfDash1 = eventTimeDateText.indexOf('-');
        const indexOfDash2 = eventTimeDateText.indexOf('-', indexOfDash1 + 1);
        const indexOfSpace = eventTimeDateText.indexOf(' ');
        const indexOfColon = eventTimeDateText.indexOf(':');
        const indexOfClosingSquareBrace = eventTimeDateText.indexOf(']');

        // Extract the values
        const year = eventTimeDateText.slice(indexOfOpeningSquareBrace + 1, indexOfDash1);
        const month = eventTimeDateText.slice(indexOfDash1 + 1, indexOfDash2);
        const day = eventTimeDateText.slice(indexOfDash2 + 1, indexOfSpace);

        const hour = eventTimeDateText.slice(indexOfSpace + 1, indexOfColon);
        const minute = eventTimeDateText.slice(indexOfColon + 1, indexOfClosingSquareBrace);

        // Create a Date Object
        const date = new Date(`${year}-${month}-${day}T${hour}:${minute}:00`);

        let eventTimeDate = {};

        // Convert the values and add to eventDateTime object
        try {

            eventTimeDate.year = parseInt(year);
            eventTimeDate.month = parseInt(month);
            eventTimeDate.day = parseInt(day);
            eventTimeDate.hour = parseInt(hour);
            eventTimeDate.minute = parseInt(minute);
            eventTimeDate.date = date

        } catch (err) {
            console.error('Failed to convert an event date time');
            console.error(`Failed on: ${eventTimeDateText}`);

            // return error
            return undefined;//new Error('Unable to convert event date time');

        }

        return eventTimeDate;
    }

}

/**
 * createNestedMap
 *
 * Helper function to create nested Map
 *
 * example usage: createNestedObject( eventsByDate, [eventTimeDate.year, eventTimeDate.month, eventTimeDate.day] );
 *
 * Pinched from: https://stackoverflow.com/questions/5484673/javascript-how-to-dynamically-create-nested-objects-using-object-names-given-by/32118406
 *
 * @param base      Target Map
 * @param names     Dimensions to be created
 * @param value     Value to be applied at the final name / deepest dimension
 */
function createNestedMap(base, names, value) {
    let currentBase = base;

    for(let name of names) {

        // Does key exist on map?
        if (!currentBase.has(name)){
            // Create key
            currentBase.set(name, new Map());
        }

        // Update the currentBase
        currentBase = currentBase.get(name);

    }

    // Set the value in the final position
    let finalName = names[names.length - 1];
    currentBase.set(finalName, value);

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