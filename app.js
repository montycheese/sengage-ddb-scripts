const { PlayerSessionDataProvider,
    EventEntriesDataProvider, ExperienceDataProvider,
    EventDataProvider, EventStatus} = require('hypevision-data-providers');

const { Module, Submodule, PubsubMessageType, ExperienceType, SuffixShardSize, PrizingType } = require('hypevision-common-core');
const ObjectsToCsv = require('objects-to-csv');


const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' });
const dynamodb = new AWS.DynamoDB.DocumentClient({ convertEmptyValues: true });

const EVENTS_TABLE_NAME = 'Events';
const EXPERIENCES_TABLE_NAME = 'Experiences';
const PLAYERSESSIONS_TABLE_NAME = 'HypeVisionPlayerSessions';
const EVENT_ENTRIES_TABLE_NAME = 'EventEntries';

class App {
    constructor() {
        this._stage = 'prod';
        this._eventEntriesDataProvider = new EventEntriesDataProvider(dynamodb, `${EVENT_ENTRIES_TABLE_NAME}-${this._stage}`);
        this._eventDataProvider = new EventDataProvider(dynamodb, `${EVENTS_TABLE_NAME}-${this._stage}`);
        this._experienceDataProvider = new ExperienceDataProvider(dynamodb, `${EXPERIENCES_TABLE_NAME}-${this._stage}`);
        this._playerSessionDataProvider = new PlayerSessionDataProvider(dynamodb, `${PLAYERSESSIONS_TABLE_NAME}-${this._stage}`);
    }

    async start(options) {
        console.log('Hello World!');

        const entries = [];
        for (let i = 1; i <= SuffixShardSize; i++) {
            const shardedEventId = `${options.EventId}-${i}`;
            console.debug(`Creating EventEntries request for shard ${shardedEventId}`);
            const fetchedEntries = await this._eventEntriesDataProvider.listEntries(shardedEventId, Number.MAX_SAFE_INTEGER, true);
            entries.push(...fetchedEntries);
            console.debug(`Fetched ${fetchedEntries.length} EventEntries for shard ${shardedEventId}`);
        }
        // write to file
        const fn = `${options.ExperienceId}-${options.EventId}-${new Date().toISOString()}.csv`;
        const csv = new ObjectsToCsv(entries);
        await csv.toDisk(fn, { allColumns: true });
    }
}

module.exports = App;
