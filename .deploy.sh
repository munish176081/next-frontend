#!/bin/bash
cd /home/ec2-user/pups4sale/next-frontend
git pull origin main
npm install
npm run build
pm2 restart frontend