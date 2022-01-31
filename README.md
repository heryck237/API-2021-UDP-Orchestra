# Akoumba Erica Ludivine & Rodrigues Alves Dylan

# Teaching-HEIGVD-API-2022-Labo-Orchestra

## Admin

- **You can work in groups of 2 students**.
- It is up to you if you want to fork this repo, or if you prefer to work in a private repo. However, you have to **use exactly the same directory structure for the validation procedure to work**.
- We expect that you will have more issues and questions than with other labs (because we have a left some questions open on purpose). Please ask your questions on Teams, so that everyone in the class can benefit from the discussion.
- ⚠️ You will have to send your GitHub URL, answer the questions and send the output log of the `validate.sh` script, which prove that your project is working [in this Google Form](https://forms.gle/6SM7cu4cYhNsRvqX8).

## Objectives

This lab has 4 objectives:

- The first objective is to **design and implement a simple application protocol on top of UDP**. It will be very similar to the protocol presented during the lecture (where thermometers were publishing temperature events in a multicast group and where a station was listening for these events).

- The second objective is to get familiar with several tools from **the JavaScript ecosystem**. You will implement two simple **Node.js** applications. You will also have to search for and use a couple of **npm modules** (i.e. third-party libraries).

- The third objective is to continue practicing with **Docker**. You will have to create 2 Docker images (they will be very similar to the images presented in class). You will then have to run multiple containers based on these images.

- Last but not least, the fourth objective is to **work with a bit less upfront guidance**, as compared with previous labs. This time, we do not provide a complete webcast to get you started, because we want you to search for information (this is a very important skill that we will increasingly train). Don't worry, we have prepared a fairly detailed list of tasks that will put you on the right track. If you feel a bit overwhelmed at the beginning, make sure to read this document carefully and to find answers to the questions asked in the tables. You will see that the whole thing will become more and more approachable.

## Requirements

In this lab, you will **write 2 small NodeJS applications** and **package them in Docker images**:

- the first app, **Musician**, simulates someone who plays an instrument in an orchestra. When the app is started, it is assigned an instrument (piano, flute, etc.). As long as it is running, every second it will emit a sound (well... simulate the emission of a sound: we are talking about a communication protocol). Of course, the sound depends on the instrument.

- the second app, **Auditor**, simulates someone who listens to the orchestra. This application has two responsibilities. Firstly, it must listen to Musicians and keep track of **active** musicians. A musician is active if it has played a sound during the last 5 seconds. Secondly, it must make this information available to you. Concretely, this means that it should implement a very simple TCP-based protocol.

![image](images/joke.jpg)

### Instruments and sounds

The following table gives you the mapping between instruments and sounds. Please **use exactly the same string values** in your code, so that validation procedures can work.

| Instrument | Sound       |
| ---------- | ----------- |
| `piano`    | `ti-ta-ti`  |
| `trumpet`  | `pouet`     |
| `flute`    | `trulu`     |
| `violin`   | `gzi-gzi`   |
| `drum`     | `boum-boum` |

### TCP-based protocol to be implemented by the Auditor application

- The auditor should include a TCP server and accept connection requests on port 2205.
- After accepting a connection request, the auditor must send a JSON payload containing the list of <u>active</u> musicians, with the following format (it can be a single line, without indentation):

```
[
  {
  	"uuid" : "aa7d8cb3-a15f-4f06-a0eb-b8feb6244a60",
  	"instrument" : "piano",
  	"activeSince" : "2016-04-27T05:20:50.731Z"
  },
  {
  	"uuid" : "06dbcbeb-c4c8-49ed-ac2a-cd8716cbf2d3",
  	"instrument" : "flute",
  	"activeSince" : "2016-04-27T05:39:03.211Z"
  }
]
```

### What you should be able to do at the end of the lab

You should be able to start an **Auditor** container with the following command:

```
$ docker run -d -p 2205:2205 api/auditor
```

You should be able to connect to your **Auditor** container over TCP and see that there is no active musician.

```
$ telnet IP_ADDRESS_THAT_DEPENDS_ON_YOUR_SETUP 2205
[]
```

You should then be able to start a first **Musician** container with the following command:

```
$ docker run -d api/musician piano
```

After this, you should be able to verify two points. Firstly, if you connect to the TCP interface of your **Auditor** container, you should see that there is now one active musician (you should receive a JSON array with a single element). Secondly, you should be able to use `tcpdump` to monitor the UDP datagrams generated by the **Musician** container.

You should then be able to kill the **Musician** container, wait 5 seconds and connect to the TCP interface of the **Auditor** container. You should see that there is now no active musician (empty array).

You should then be able to start several **Musician** containers with the following commands:

```
$ docker run -d api/musician piano
$ docker run -d api/musician flute
$ docker run -d api/musician flute
$ docker run -d api/musician drum
```

When you connect to the TCP interface of the **Auditor**, you should receive an array of musicians that corresponds to your commands. You should also use `tcpdump` to monitor the UDP trafic in your system.

# Tasks and questions

Reminder: answer the following questions [here](https://forms.gle/6SM7cu4cYhNsRvqX8).

## Task 1: design the application architecture and protocols

| #                                                | Topic                                                                                                                                                                                                |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Question                                         | How can we represent the system in an **architecture diagram**, which gives information both about the Docker containers, the communication protocols and the commands?                              |
|                                                  |  ![tactac](images/tac.png)                                                                                                                                                                       |
| Question                                         | Who is going to **send UDP datagrams** and **when**?                                                                                                                                                 |
|                                                  | Les datagrammes UDP sont envoyés par chaque musicien toutes secondes.                                                                                                                                |
| Question                                         | Who is going to **listen for UDP datagrams** and what should happen when a datagram is received?                                                                                                     |
|                                                  | C’est l’auditeur qui va écouter sur le port 2205. Une fois les datagrammes reçus, il va envoyer les informations sur les musiciens actifs en format JSON.                                            |
| Question                                         | What **payload** should we put in the UDP datagrams?                                                                                                                                                 |
|  |Les playload contiennent {"instrument" ,"sound"}
| Question                                         | What **data structures** do we need in the UDP sender and receiver? When will we update these data structures? When will we query these data structures?                                             |
|                                                  | Le musicien(Emetteur) est représenté par son instrument et le son de celui ci\_ L’auditeur (recepteur) recupère le tableau des musiciens actifs avec les propriétés: uuid, instrument etactiveSince. |

## Task 2: implement a "musician" Node.js application

| #                                                                             | Topic                                                                                                                                           |
| ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Question                                                                      | In a JavaScript program, if we have an object, how can we **serialize it in JSON**?                                                             |
|                                                                               | On utilise JSON.stringify(object) pour serialiser un objet en JSON.\_                                                                           |
| Question                                                                      | What is **npm**?                                                                                                                                |
|                                                                               | npm est le gestionnaire de paquet officiel de NODE.js . il automatise toute la gestion des dépendances et des paquets des projets JavaScript. |
| Question                                                                      | What is the `npm install` command and what is the purpose of the `--save` flag?                                                                 |
|                                                                               | La commande est : `npm install [--save] nom_module ` .                                                                                                                 L’option `--save` sert à inclure cette dependance dans le fichier package.json .
| Question                                                                      | How can we use the `https://www.npmjs.com/` web site?                                                                                           |
|                                                                               | On peut y rechercher les packages js importants pour notre projet.\_                                                                            |
| Question                                                                      | In JavaScript, how can we **generate a UUID** compliant with RFC4122?                                                                           |
|                                                                               | Il faut au préalable installer le package UUID \_                                                                                               |
| Question                                                                      | In Node.js, how can we execute a function on a **periodic** basis?                                                                              |
|                                                                               | En utilisant la fonction setInterval(function, period) ; period en ms\_                                                                         |
| Question                                                                      | In Node.js, how can we **emit UDP datagrams**?                                                                                                  |
|                                                                               | On peut émettre des datagrammes UDP en utilisant la méthode send() sur un objet de type dgram.createSocket                                    |
| Question                                                                      | In Node.js, how can we **access the command line arguments**?                                                                                   |
|                                                                               | On peut le faire à travers les indices du tableau argv qui contient tous les arguments de la ligne de commande.                               |

## Task 3: package the "musician" app in a Docker image

| #                                                                                                                       | Topic                                                                                                                                                                                                                                                                                      |
| ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Question                                                                                                                | How do we **define and build our own Docker image**?                                                                                                                                                                                                                                       |
|                                                                                                                         | On commence par créer un fichier appelé Dockerfile dans lequel on défini toutes les applications les fichiers de configuration et les commandes à exécuter lors de la construction de l'image. Ensuite on crée l’image grâce à la commande docker build -t nom_de_limage chemin_Dockerfile |
| |Généralement si on est situé dans le même dossier que le Dockerfile on exécute juste : docker build -t nom*de_limage .*
| Question | How can we use the `ENTRYPOINT` statement in our Dockerfile?                  |
|          |  ENTRYPOINT[“executable”, “param1”, “param2”]       |
|          | (Forme Shell) ENTRYPOINT command param1 param2      |
| Question | After building our Docker image, how do we use it to **run containers**  |
|          | docker run [-option] nom*de_limage
|          |-d if we need to run our container on background
|          |-it pour le mode interactif avce nom_de_limage suivit de /bin/bash*              |
| Question | How do we get the list of all **running containers**? |
|          | docker ps* |
| Question | How do we **stop/kill** one running container? |
|          | Docker kill/stop nom_du_container* |
| Question | How can we check that our running containers are effectively sending UDP datagrams? |
|          | En utilisant un client postman avec filtre UDP |

## Task 4: implement an "auditor" Node.js application

| #                      | Topic                                                                                              |
| ---------------------- | -------------------------------------------------------------------------------------------------- |
| Question               | With Node.js, how can we listen for UDP datagrams in a multicast group?                            |
|                        | On peut le faire en utilisant la fonction bind() sur un socket UDP\_                               |
| Question               | How can we use the `Map` built-in object introduced in ECMAScript 6 to implement a **dictionary**? |
|                        | const map = new Map()                                                                              |
|                        | map.set(key, value);
| Question               | How can we use the `Moment.js` npm module to help us with **date manipulations** and formatting?   |
|                        | npm install moment                                                                                 |
|                        | var moment = require('moment'); // require
|                        | moment().format(); // pour le formatage
|                        | moment().subtract() ; //pour obtenir des intervalles de temps* |
| Question               | When and how do we **get rid of inactive players**? |
|                        | Après 5s d’inactivité on supprime la clé() de la Map* |
| Question               | How do I implement a **simple TCP server** in Node.js? |
|                        | Pour ce faire il faut au préalable inclure le module net avec :
|                        | const Net = require('net');
|                        | appeler la fonction createServer() sur cette variable. |

## Task 5: package the "auditor" app in a Docker image

| #        | Topic                                                                                |
| -------- | ------------------------------------------------------------------------------------ |
| Question | How do we validate that the whole system works, once we have built our Docker image? |
|          | On peut vérifier la validité de notre système en exécutant le script validate.sh     |

## Constraints

Please be careful to adhere to the specifications in this document, and in particular

- the Docker image names
- the names of instruments and their sounds
- the TCP PORT number

Also, we have prepared two directories, where you should place your two `Dockerfile` with their dependent files.

### Validation

Have a look at the `validate.sh` script located in the top-level directory. This script automates part of the validation process for your implementation (it will gradually be expanded with additional operations and assertions). As soon as you start creating your Docker images (i.e. creating your Dockerfiles), you should **try to run it** to see if your implementation is correct. When you submit your project in the [Google Form](https://forms.gle/6SM7cu4cYhNsRvqX8), the script will be used for grading, together with other criteria.
