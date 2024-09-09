const express = require('express');
const app = express();

app.use(express.static(process.cwd()+"/dist/KUBiC"));

const port = 443;

app.get('/', (req,res) => {
	res.sendFile(process.swd()+"/dist/KUBiC/index.html")
});

app.listen(port, () => console.log(`Example app listing on port ${port}!`));

