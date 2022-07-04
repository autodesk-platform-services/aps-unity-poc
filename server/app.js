const express = require('express');
const { PORT } = require('./config.js');

let app = express();
app.use('/api/models', require('./routes/models.js'));
app.use('/api/jobs', require('./routes/jobs.js'));
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
