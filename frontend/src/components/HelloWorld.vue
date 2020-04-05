<template>
  <div class="hello">
  <form enctype="multipart/form-data">
      <input type="file" name="file" @change="onFileChanged" />
      <button type="submit" @click="onUpload">Enviar</button>
    </form>
  <button v-on:click="search">Buscar imagem</button>

  <button v-on:click="onAnalyze">analisar</button>
      <img id="image">
      <canvas id="canvas" width="600" height="399"></canvas>
    <h1>{{ titulo }}</h1>
    
  </div>
</template>

<script>
import * as cocoSsd from '@tensorflow-models/coco-ssd'
import * as tf from '@tensorflow/tfjs';
import api from '../services/api'
import colors from '../utils/colors.json'


 function predicoes(data) {
  console.log('numero de detectações: ' + data.length)
  render(data);
  imageProcessed();
}

async function imageProcessed(){

  const next = await api.get('/next');

  const processing = {
      id: next.data.id
    }
          
    await api.put('/processing', processing);

}

async function colorsFiltred() {

   const items = await api.get('/items')

  let newColor = []

  for (let i = 0; i < items.data.length; i++){
      let color = items.data[i].color;

      newColor.push(color)

  }

    return colors.colors.filter(function(color){
      return !newColor.includes(color)
    });

}

async function render(dados){

 const colors = await colorsFiltred();

 console.log(colors)

  const canvas = document.getElementById('canvas')
  const context = canvas.getContext('2d');
  context.drawImage(image, 0, 0);
  context.font = '10px Arial';


  for(let i = 0; i < dados.length; i++){

    context.beginPath();
    context.rect(...dados[i].bbox);
    console.log(dados[i])
    context.lineWidth = 1;

   context.strokeStyle = colors[i];
   context.fillStyle = colors[i];
  
    //context.fill()
    context.stroke();
    context.fillText(
      dados[i].class, dados[i].bbox[0],
      dados[i].bbox[1] > 10 ? dados[i].bbox[1] - 15 : 20);

       const items = {
          description: dados[i].class,
         color: colors[i]
        }
        
        await api.post('/items', items)

  }
}

export default {
  name: 'HelloWorld',
  methods: {
    async search(){

      try{
        const next = await api.get('/next');

        console.log(next.data)

        let pathImg = 'http://localhost:8081/uploads/'+next.data.path;

        image.src = pathImg + '?' + new Date().getTime();
        image.setAttribute('crossOrigin', '');

      }catch(err){
        console.log(err)
      }

    },
    async onAnalyze(){

        cocoSsd.load()
        .then(model => model.detect(image))
        .then(predictions => {
          predicoes(predictions)
        
        })
      },
      onFileChanged(e) {
        this.selectedFile = e.target.files[0];
        console.log(this.selectedFile)
      },

      async onUpload() {
       const formData = new FormData();
       
        formData.append('file', this.selectedFile)
        formData.append('name', this.selectedFile.name)
        formData.append('processed', 0)
        formData.append('path', this.selectedFile.name)

        try{
          const result = await api.post('/imagens', formData);
          console.log(result);

        }catch(err){
          console.log(err)
        }
        
      }
  },
  data () {
    return {
      titulo: 'Teste Labtrans',
      selectedFile: null
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
canvas{
  position:absolute;
  border: 1px solid #000;

}
h1, h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
