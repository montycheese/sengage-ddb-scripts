const App = require('../app');

const app = new App();

(async () => {
    try {
        console.debug('Starting App...');
        const expId = process.env.EXPERIENCE_ID;
        const eventId = process.env.EVENT_ID;
        if (!expId || !eventId) {
            console.error('Did not pass exp or event id');
            throw new Error('Failed to pass args');
        }
        const cfg = {
            ExperienceId: expId,
            EventId: eventId
        };
        await app.start(cfg);
    } catch (error) {
        console.error(`Failed to start App due to: `, error);
    }
})();
