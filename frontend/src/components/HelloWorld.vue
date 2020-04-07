<template>
<div>
  <header>
    {{titulo}}
</header>
<div class="container">

    <div class="menu">
      
            <div class="box">
              <span class="flag flag1">1</span>
              <p>Insira ou busque <br>uma nova imagem<br>( passo 2 )</p>
              
                <form enctype="multipart/form-data">
                    <label class="fileContainer">
                        > Clique aqui < para selecionar

                        <input type="file" name="file" @change="onFileChanged" />
                    </label>
                        <button class="btn btn1" type="submit" @click="onUpload">Agora envie</button>
                </form>
              </div>
            <div class="box">
                <span class="flag flag2">2</span>
                  <p>O sistema trata uma <br> imagem pendente<br> de analise</p>
                  <br>
                  <button class="btn btn2" v-on:click="search">Buscar imagem</button>
                </div>
            <div class="box">
            <span class="flag flag3">3</span>
                  <p>O sistema analisara <br>a imagem exibindo os <br> items da mesma</p>
                  <br>
                  <button class="btn btn3" v-on:click="onAnalyze">Analisar</button>
            </div>
    </div>

       <div class="processing">
          <img id="image" class="image" />

          <canvas id="canvas" class="canvas" width="1000" height="700" style="display:none" ></canvas>
    </div>

</div>

 


<div class="container-items" id="container-items">
        <ul>
          <li v-for="(item, index) in items">
            <form @submit="validar($event)">
            id: <input type="hidden" id="id"  name="id" :value="index"></input>

            Item: <input type="text" id="description"  name="description" :value="item.description"></input>
            Cor:<input type="text" id="color" name="color" :value="item.color"></input>
            X: <input type="text"  id="x" name="x" :value="item.x"></input>
            Y: <input type="text" id="y" name="y" :value="item.y"></input>
            <button  type="submit">Validar</button>
              </form>

          </li> 
      </ul> 
</div>

</div>
</template>
<script>
import * as cocoSsd from '@tensorflow-models/coco-ssd'
import * as tf from '@tensorflow/tfjs';
import api from '../services/api'
import colors from '../utils/colors.json'

const itemsAnalyzed = []

 async function predicoes(data) {
  console.log('numero de detectações: ' + data.length)
  render(data);
  imageProcessed();

}

async function addAndListItems(data){
  itemsAnalyzed.push(data)
  await api.post('/items', data)

  console.log('items para analisar', itemsAnalyzed)



  return itemsAnalyzed;
}

async function imageProcessed(){

  const next = await api.get('/next');

  const processing = {
      id: next.data.id
    }
    try{
      const result  = await api.put('/processing', processing);

      console.log('imageProcessed', result)
    }
    catch(err){
      console.log(err)
    }
    

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

async function render(data){

document.getElementById('canvas').style.display = "block";

 const colors = await colorsFiltred();

 console.log(colors)

  const canvas = document.getElementById('canvas')
  const context = canvas.getContext('2d');
  context.drawImage(image, 0, 0);
  context.font = '10px Arial';


  for(let i = 0; i < data.length; i++){

    context.beginPath();
    context.rect(...data[i].bbox);
    console.log(data[i])
    
    context.lineWidth = 1;

   context.strokeStyle = colors[i];
   context.fillStyle = colors[i];
  
    //context.fill()
    context.stroke();
    context.fillText(
      data[i].class, data[i].bbox[0],
      data[i].bbox[1] > 10 ? data[i].bbox[1] - 15 : 20);

       const items = {
          description: data[i].class,
          color: colors[i],
          x: data[i].bbox[0],
          y: data[i].bbox[1]
        }

      addAndListItems(items);
      console.log('items', items)

  }
}

export default {
   data () {
    return {
      titulo: 'Teste Labtrans - Lucas Amaral',
      selectedFile: null,
      items: [],
      imagem_id: ''
    }
  },
  name: 'HelloWorld',
  methods: {

 async listItems(data) {      

    console.log('numero de dados: ' + data.length)

     const colors = await colorsFiltred();

     for(let i = 0; i < data.length; i++){

       let items = {
          description: data[i].class,
          color: colors[i],
          x: data[i].bbox[0],
          y: data[i].bbox[1]
        }

      this.items.push(items);
    }
 },

 async validar(e){
   e.preventDefault(); 
   const data = {
     description: e.target.description.value,
     color: e.target.color.value,
     x: e.target.x.value,
     y: e.target.y.value,
     imagem_id: this.imagem_id
   }

   console.log(data)


    this.items.splice(e.target.id.value, 1);
  
  
    console.log('os items', this.items)


    try{

      const result = await api.post('/imagemxitem', data);
      console.log(result)

    }catch(err){
      console.log(err)
    }
 },

    async search(){

      try{
        const next = await api.get('/next');

        console.log(next.data)

        this.imagem_id = next.data.id;

        let pathImg = 'http://localhost:8081/uploads/'+next.data.path;

        image.src = pathImg + '?' + new Date().getTime();
        image.setAttribute('crossOrigin', '');

        document.getElementById("image").style.display = "block";
        document.getElementById("canvas").style.display = "none";
        
        this.items = [];



      }catch(err){
        console.log(err)
      }

    },
    async onAnalyze(){

        cocoSsd.load()
        .then(model => model.detect(image))
        .then(predictions => {
          predicoes(predictions)
          this.listItems(predictions)
          document.getElementById("image").style.display = "none";
          document.getElementById("canvas").style.display = "block";
          //this.items = [];

        })
      },
      onFileChanged(e) {
        this.selectedFile = e.target.files[0];
        console.log(this.selectedFile)
      },

      async onUpload(e) {
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
}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.container{
  max-width:1000px;
  margin: 0 auto;

}
.menu{
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  align-content: flex-end;
  text-align: right;
}

.flag{
  width: 101px;
  height: 70px;
  color: #ffffff;
  display: block;
  position:absolute;
  margin: -20px 10px 0px 15px;
  font-size: 50px;
  text-align: center;
  font-weight: bold;
}

.flag1{
  background: tomato;
}

.flag2{
  background: green;
}

.flag3{
  background: purple;
}

.processing{
  max-height: 900px;
  background:  #ffffff;
  border-radius: 8px;
  overflow:hidden;
  justify-content: center;
  align-items: center;
  margin-top: 50px;

}
.container-items{
  display:flex;
  background:  #ffffff;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.container-items li header{
  width: 100%;
  background: #17343f;
  margin-bottom: 30px;
  color: #fff;
  padding: 0px;
}

.container-items ul li p{
  padding-bottom: 10px;
}
.container-items ul{
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 20px;

}
.container-items li{
  border: 2px solid #6fc3df;
  background: #1c2b34;
  padding: 10px;
  color: #fff;
}


.canvas{
  border-radius: 8px;
  justify-content: center;
  align-items: center;
  text-align:center;
}


.box{
  height: 110px;
  width: 300px;
  position: relative;
  background:  #ffffff;
  border-radius: 5px;
  box-shadow: 2px 2px #f3f3f3;
}

.btn{
  height: 25px;
  width: 100%;
  border: 0px;
  color: #ffffff;
  font-size: 13px;
  cursor: pointer;
  padding: 5px;
}
.btn1{
   background: tomato;
}
.btn2{
   background: green;
}
.btn3{
  background: purple;
}
.fileContainer {
    overflow: hidden;
    position: relative;
}

.fileContainer [type=file] {
    cursor: pointer;
    display: block;

    filter: alpha(opacity=0);
    min-height: 100%;
    min-width: 100%;
    opacity: 0;
    position: absolute;
    right: 0;
    text-align: right;
    top: 0;
}


.box p{
  padding-right: 10px;
}
header{
  width: 100%;

  background: #17343f;
  margin-bottom: 30px;
  color: #fff;
  padding: 10px;

}

h1, h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
  font-size: 15px;
}


</style>
