# Run the app

## Local Environment

1. Into the root directory, run the folling commands:

   ```sh
   npm install
   ```

2. Into the client directory, run the folling commands:

   ```sh
   npm install
   npm run build
   ```

3. Inside the client folder, add a .env file with the following texts if there isn't any:

   ```
   VITE_SERVER_URL="http://localhost:3000"
   ```

4. Now run the app from the root directory

   ```sh
   npm start
   ```

** Nodejs version 18.15.0 **

## Docker run

To run the dockerized version, install docker and docker-compose in your system. Then run the following command:

```sh
docker-compose up -d
```

## How to deploy to production

1. SSH to production server

```sh
ssh najish@mirspeech.ergov.com -p 9876
# Enter your password
cd /app/mirspeech.ergov.com/mirspeech/

# Pull latest changes
git pull

# install server dependencies
npm install

# go inside client directory
cd client

# install client dependencies
npm install

# the following command generates the frontend proction build. the latest changes in the frontend will not be shown if this step is skipped.
npm run build

# go to root folder of this project
cd ..

# to start/restart the production server login as root user
sudo su

# now run the following command to start/restart the server with changes
docker-compose up -d --build

# to check logs for this service, run the following command, this will show the running docker containers. just copy the container id of the docker instance named mirsheech
docker ps

# you will be greeted with something like the following:
root@supermicro:/app/mirspeech.ergov.com/mirspeech# docker ps
CONTAINER ID        IMAGE                 COMMAND                  CREATED             STATUS              PORTS                    NAMES
418f0528aaac        mirspeech_mirspeech   "docker-entrypoint.s…"   24 hours ago        Up 24 hours         0.0.0.0:5000->3000/tcp   mirspeech_mirspeech_1

# here 418f0528aaac is the container id

# run the following command to see logs

docker logs -f 418f0528aaac

# the -f flag follows latest changes in the logs, if -f is not used, latest logs won,t be shown. you have to stop the command and run it again.
```
