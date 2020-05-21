const express = require('express')

const { uuid, isUuid } = require('uuidv4');

const app = express()

app.use(express.json());

let db = [
    {
        id: uuid(),
        title: 'Bruno',
        idade: '21'
    }
]

//medir tempo e dar visibilidade no servidor de qual método de app foi disparado
function logRequests (request, response, next) {
    const { method, url } = request;
    const logLabel = `[${method.toUpperCase()}] ${url}`;


    //logLabel apenas conecta começo e fim do tempo medido
    console.time(logLabel);

    next();

    console.timeEnd(logLabel);
}

function validateProjectId (request, response, next) {
    const { id } = request.params;

    if( !isUuid(id) ){
        return response.status(400).json( { error: 'Id do usuário incorreto ou inexistente' } )
    } else {
        return next();
    }
}

//midware dispara depois de app.use(express.json()) em todos metodos - rotas
app.use(logRequests);

//quando houver um :id na rota este middleware será efetuado antes do callback
app.use('/teste/:id', validateProjectId);

app.get('/teste', (request, response) => {
    const { title } = request.query;

    const results = title
        ? db.filter(user => user.title.includes(title))
        : db;

    return response.json(results);
})

app.post('/teste', (request, response) => {
    const { title, idade } = request.body;
    
    const user = { id: uuid(), title, idade}

    db.push(user);

    return response.json(user);
})

app.put('/teste/:id', (request, response) => {
    const { id } = request.params;
    const { title, idade } = request.body;

    const userIndex = db.findIndex((user) => user.id == id)

    if(userIndex < 0){
        return response.status(400).json({ error: 'User not found!' })
    } else {
        const user = {
            id: uuid(),
            title,
            idade
        }

        db[userIndex] = user;

        return response.json(user);
    }
})

app.delete('/teste/:id', (request, response) => {
    const { id } = request.params;

    const userIndex = db.findIndex(user => user.id == id)

    if(userIndex < 0){
        return response.status(400).json({ error: 'User not found!' })
    } else {
        db.splice(userIndex, 1);

        return response.status(204).send()
    }
})

app.listen('3333', () => {
    console.log('servidor 2 ligadão!')
})