const express = require('express');
const { verifyMessage } = require('ethers');
const path = require('path');

const app = express();
const port = 8080;

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/verify', (req, res) => {
    const { q } = req.query;

    if (!q) {
        return res.send('<h2>Error: Missing required parameters. Please provide message, address, and signedMessage in the URL.</h2>');
    }

    // q looks like this: 9a993bbd-171d-41fa-b88f-3e037a8172f2|0x75960Ef0B3325cCad2654FEf7eF096A9ED9A3FB8|0x75b6b1f74ae45ba9fce9033a9ad3f4389911755b9e204c6ac35c822648c96b71088472ae5f852f44d5d333e622f90fff8ac299d916dc2d49b6f4b55d7ccaaf491c
    const [message, address, signedMessage] = q.split('|');

    if (!message || !address || !signedMessage) {
        return res.send('<h2>Error: Missing required parameters. Please provide message, address, and signedMessage in the URL.</h2>');
    }

    try {
        // Recover the address from the signature
        const recoveredAddress = verifyMessage(message, signedMessage);

        // Verify if the recovered address matches the provided address
        if (recoveredAddress.toLowerCase() === address.toLowerCase()) {
            res.send(`<p>The signature is valid and was created by ${address}.</p>`);
        } else {
            res.send(`<h2>Verification failed!</h2><p>The signature does not match the provided address. </p> <p>Given: ${message} | ${address} | ${signedMessage}</p>`);
        }
    } catch (error) {
        res.send(`<h2>Error:</h2><p>${error.message}</p><p>Given: ${message} | ${address} | ${signedMessage}</p>`);
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
