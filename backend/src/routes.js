const express = require('express')
const routes = express.Router();
const crypto = require('crypto');
const connection = require('./database/connection')
const multer = require('multer')

const storage = multer.diskStorage({
    destination: function(req, file, cb ){
        cb(null, "public/uploads/");
    },
    filename: function(req, file, cb){
        cb(null, file.originalname)
    }
})

const upload = multer({storage})

/**
* @swagger
* /imagens:
*   get:
*     responses: 
*       200:
*         description: Receive back flavor and flavor Id.
*/



routes.get('/imagens', async(req, res) => {

    const imagens = await connection('images').select('*');

    return res.json(imagens);
})




routes.post('/imagens', upload.single("file"), async (req, res) => {
    const {name, processed, path} = req.body;

   const id = crypto.randomBytes(5).toString('HEX');

   await connection('images').insert({
        id,
        name,
        processed,
        path
    });

    return res.json({ id, name, processed, path });
});

routes.get('/next', async(req, res) =>{

    try {

        const [toProcess] = await connection('images')
        .select('*')
        .where('processed', 0)
        .limit(1);

        return res.json({
            id: toProcess.id,
            path:toProcess.path,

    })
        
    } catch (error) {
        res.send({error: "Nenhuma imagem para analisar."})
    }

    
})

routes.put('/processing', async(req, res) => {

    const id = req.body.id;

    const toProcess = await connection('images')
    .where('id', id)
    .update('processed', 1);

    return res.json(toProcess);

})

routes.post('/items', async(req, res) => {
    const { description, color } = req.body;

    const id = crypto.randomBytes(5).toString('HEX');


    const items = await connection('items')
    .insert({
        id,
        description,
        color
    })

    return res.json({
        items
    })
})

routes.get('/items', async(req, res) => {
    
    const items = await connection('items').select('*');

    return res.json(items);
})

routes.post('/imagemxitem', async(req, res) => {
    const { description, x, y, color, imagem_id } = req.body;

    const data = {
        description, x, y, color, imagem_id
    }
    
    const result = await connection('imagemxitem').insert({
        description,
        x,
        y,
        color,
        imagem_id
    })

    return res.json(result)

})

routes.get('/imagemxitem', async(req, res) => {
    
    const result = await connection('imagemxitem')
    .select('*');

    return res.json(result)

})


module.exports = routes;