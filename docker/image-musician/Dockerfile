FROM node:16.13.1
COPY src /opt/app/
WORKDIR /opt/app/
RUN npm install
ENTRYPOINT ["node", "/opt/app/app.js"]
