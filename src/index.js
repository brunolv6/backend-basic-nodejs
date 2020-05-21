/* SERVIDOR HTTP BÁSICO */

//importando lib express
const express = require('express');

//identificador unico
const { uuid, isUuid } = require('uuidv4');

//variável referente ao pacote express
const app = express();

//para recebr infos JSON
//toda info passa aqui??
app.use(express.json())

/* 
    Métodos HTTP:
    -GET: buscar informações
    -POST: criar informação
    -PUT/PATCH: quando queremos alterar tudo/ou uma informação
    -DELETE: deletar informação  
*/

/* 
    Tipos de parâmetros: (receber info do front)

    Query Params: filtros e paginação ?
    Route Params: Identificar recursos (aualizar/delete), um valor identificador
    Request Body: conteúdo na hora de criar ou editar (JSON)
*/

/* 
    Middleware: interceptador de requisições
    
    -Interromper totalmente requisições ou alterar dados da requisição
    -Rotas .get, .pos.. são middlewares

*/

function logRequests(request, response, next) {
    //mesmos parametros do request dos metodos abaixos

    //METODO E ROTA
    const { method, url } = request;

    const logLabel = `[${method.toUpperCase()}] ${url}`

    //Entender sequencia no get e no middleware logRequest
    // console.log('1')

    console.time(logLabel)

    next(); //proximo midddleware, se não houver, travara completamente a requisicção (parede que bloqueio o qu evem em seguida)

    //RETIRANDO RETURN DO NEXT isto é executado APÓS a requisição
    //Entender sequencia no get e no middleware logRequest ^
    // console.log('2')

    console.timeEnd(logLabel)
}

function validateProjectId(request, response, next){
    const { id } = request.params;

    if(!isUuid(id)){
        return response.status(400).json({ error: 'Invalid project ID.'})
    }

    return next();
}

//cria um interceptador para toda requisição completamente s(UM MIDDLEWARE!!)
app.use(logRequests)

app.use('/projects/:id', validateProjectId)

const projects = [];

//CRIANDO uma ROTA
//express tem um método chamado get que recebe dois parâmetros ('a rota [um recurso]', callback function com dois parâmetros)
app.get('/projects', /* logRequest, middlewaare1, middleware2,  */ (request, response) => {

    //Entender sequencia no get e no middleware logRequest
    // console.log('3')

    //paramentros enviados 
    const { owner } = request.query;

    const results = owner
        ? projects.filter( project => project.owner.includes(owner))
        : projects;

    //reponse tem os métodos send, json [neste caso deve ser [] ou {}]
    return response.json(results)
})

app.post('/projects', (request, response) => {

    const { name, owner } = request.body;

    const project = { id: uuid(), name, owner}

    projects.push(project)

    return response.json(project)
})    

app.put('/projects/:id', (request, response) => {

    const { id } = request.params;

    const { name, owner } = request.body;

    const projectIndex = projects.findIndex( project => project.id == id);

    if(projectIndex < 0){
        return response.status(400).json({ error: 'Projeto não encontrado!'})
    } else {
        const project = {
            id,
            name,
            owner
        }

        projects[projectIndex] = project;

        return response.json(project)
    }
}) 

app.delete('/projects/:id', (request, response) => {
    
    const { id } = request.params;


    const projectIndex = projects.findIndex(project => project.id == id)

    if(projectIndex < 0){
        return response.status(400).json({ error: 'Projeto não encontrado para deletar' });
    } else {
        //qual o indice do que sairá e quantos junto dele serão deletados
        projects.splice(projectIndex, 1)

        return response.status(204).send()
    }
}) 

//por onde ouvirei a saida do express
app.listen(3333, () => {
    console.log("Server started! :)")
})

