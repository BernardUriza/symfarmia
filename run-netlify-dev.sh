#!/bin/bash

# Load NVM and use Node 18
export NVM_DIR="/usr/local/share/nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Switch to Node 18
nvm use 18.20.5

# Run netlify dev
npx netlify dev