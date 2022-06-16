# Music Chamber

The application for users to create a chamber and invite people to listen music (and control/edit music) together.

## Setup Instructions

### 1. Install Required Python Modules

```bash
pip install -r requirements.txt
```

### 2. Compile the Front-End
### [Install Node.js](https://nodejs.org/en/)

### Install Node Modules
First cd into the ```frontend``` folder.
```bash
cd music_chamber\frontend
```
Next install all dependicies.
```bash
npm install
```

Run the production compile script
```bash
npm run build
```

### 3. Start Web Server

To start the web server you need to run the following sequence of commands.

First cd main folder music_chamber.
```bash 
cd music_chamber
```
Next run the django web server.
```bash
python manage.py runserver
```



