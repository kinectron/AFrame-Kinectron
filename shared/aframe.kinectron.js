/* 
  A-Frame Kinectron by Damian Dziwis - TH Köln / TU Berlin

  based on Or Fleishers 
  Three-Kinectron : https://github.com/kinectron/Three-Kinectron
  and Depthkit.js: https://github.com/juniorxsound/Depthkit.js
  projects and shaders.

*/



let fragShader = "  // Texture maps\n            uniform sampler2D depthMap;\n            \n            //State uniforms\n            uniform float colorDepthMix;\n            \n            //Material params\n            uniform float opacity;\n            uniform float brightness;\n            uniform float contrast;\n            uniform vec4 colorOffSet;\n            uniform float filterAmount;\n            uniform bool isDepth;\n\n            \n            //Interpolated per fragment values\n            varying vec2 vUv;\n            varying vec3 vNormal;\n            varying vec3 vPos;\n            varying float visibility;\n\n            \n            //Thanks to this excelent post - http://alaingalvan.tumblr.com/post/79864187609/glsl-color-correction-shaders\n            vec3 brightnessContrast(vec3 value, float brightness, float contrast){\n                return (value - 0.5) * contrast + 0.5 + brightness;\n            }\n            \n            void main(){\n            \n                //Read the all the texels\n                vec4 texelRead = texture2D(depthMap, vUv);\n            \n                //Blend beween the depth and the color based on a float uniform (for easy depth rendering just set colorDepthMix to 1.0)\n                vec3 colorMixer = mix(texelRead.rgb, vec3(texelRead.a), colorDepthMix);\n\n                if(isDepth == true){\n                    if(((texelRead.r + texelRead.g + texelRead.b )/3.0) < 0.1) discard;\n\n                }\n\n\n                if ( visibility < filterAmount) discard;\n\n\n                //Render the output\n                gl_FragColor = vec4(brightnessContrast(colorMixer, brightness, contrast), opacity) + colorOffSet;\n            \n            }\n";
let vertShader  = "\n\n        // Uniforms\n        \n        uniform vec2 focal;\n        uniform vec2 dim;\n        uniform vec2 meshDensity;\n        uniform bool isDepth;\n\n        \n        const float  _Epsilon = .03;\n\n        // Texture maps\n        \n        uniform sampler2D depthMap;\n        uniform float pointSize;\n        \n        //Per vertex interpolation passed to the fragment shader\n        \n        varying vec2 vUv;\n        varying vec3 vNormal;\n        varying vec3 vPos;\n        varying float visibility;\n\n    \n        \n        float depthForPoint(vec2 texturePoint){\n\n            vec4 depthsample = texture2D(depthMap, texturePoint);\n            \n            if(isDepth){\n                return ((depthsample.r + depthsample.g + depthsample.b )/3.0);  \n            }else{\n                return (depthsample.a);\n            }\n        }\n\n        void main(){\n\n                vec2 textureStep = 1.0 / meshDensity;\n\n                vUv = uv;\n\n                vPos = (modelMatrix * vec4(position, 1.0 )).xyz;\n                vNormal = normalMatrix * normal;\n                \n                vec4 texelRead = texture2D(depthMap, uv);    \n        \n                float depth = depthForPoint(vUv);\n\n                float neighborDepths[8];\n                neighborDepths[0] = depthForPoint(vUv + vec2(0.0,  textureStep.y));\n                neighborDepths[1] = depthForPoint(vUv + vec2(textureStep.x, 0.0));\n                neighborDepths[2] = depthForPoint(vUv + vec2(0.0, -textureStep.y));\n                neighborDepths[3] = depthForPoint(vUv + vec2(-textureStep.x, 0.0));\n                neighborDepths[4] = depthForPoint(vUv + vec2(-textureStep.x, -textureStep.y));\n                neighborDepths[5] = depthForPoint(vUv + vec2(textureStep.x,  textureStep.y));\n                neighborDepths[6] = depthForPoint(vUv + vec2(textureStep.x, -textureStep.y));\n                neighborDepths[7] = depthForPoint(vUv + vec2(-textureStep.x,  textureStep.y));\n            \n                visibility = 1.0;\n                int numDudNeighbors = 0;\n\n                //search neighbor verts in order to see if we are near an edge\n                //if so, clamp to the surface closest to us\n                if (depth < _Epsilon || (1.0 - depth) < _Epsilon){\n                    \n                    // float depthDif = 1.0;\n                    float nearestDepth = 1.0;\n\n                    for (int i = 0; i < 8; i++){\n\n                        float depthNeighbor = neighborDepths[i];\n                        \n                        if (depthNeighbor >= _Epsilon && (1.0 - depthNeighbor) > _Epsilon){\n                            // float thisDif = abs(nearestDepth - depthNeighbor);\n                            if (depthNeighbor < nearestDepth){\n                                // depthDif = thisDif;\n                                nearestDepth = depthNeighbor;\n                            }\n                        }else{\n                            numDudNeighbors++;\n                        }\n                    }\n\n                    depth = nearestDepth;\n                    visibility = 0.8;\n\n                    // blob filter\n                    if (numDudNeighbors > 6){\n                        visibility = 0.0;\n                    }\n                }\n\n                \n                 // internal edge filter\n                float maxDisparity = 0.0;\n                \n                for (int i = 0; i < 8; i++){\n\n                    float depthNeighbor = neighborDepths[i];\n                    if (depthNeighbor >= _Epsilon && (1.0 - depthNeighbor) > _Epsilon){\n                        maxDisparity = max(maxDisparity, abs(depth - depthNeighbor));\n                    }\n                }\n                \n\n                visibility *= 1.0 - maxDisparity;\n\n                float distance = depth;\n\n                vec4 pos = vec4(((position.xy * dim)) / focal * distance, -distance, 1.0);\n                \n            \n                gl_PointSize = pointSize;\n                \n                \n                gl_Position = projectionMatrix * modelViewMatrix * pos;\n}\n";



let ShaderParams = function(){
  
  this.isDepth = {
    type: "b",
    value: false
  },
  this.pointSize = {
    type: "f",
    value: 1.0
  },
  this.depthMap ={
    type: "t",
    value: null
  },
  this.colorDepthMix = {
    type: "f",
    value: 0.0
  },
  this.opacity = {
    type: "f",
    value: 1.0
  },
  this.brightness = {
    type: "f",
    value: 0.0
  },
  this.contrast = {
    type: "f",
    value: 1.0
  },
  this.focal = {
    type: "vec2",
    value: new THREE.Vector2(365.456, 365.456)
  },
  this.dim = {
    type: "vec2",
    value: new THREE.Vector2(512,424)
  },
  this.meshDensity = {
    value: new THREE.Vector2(424, 512)
  },
  this.colorOffSet = {
  value: new THREE.Vector4(0, 0, 0, 0)
  },
  this.filterAmount = {
    type: "f",
    value: 0.9
  }

}


function KinectGeometry(type, pointSize, color,brightness,contrast,opacity,filterAmount){

  this.pointSize = pointSize;
  this.width = 424;
  this.height = 512;
  this.toImage = null;
  this.material;
  this.texture;
  this.color = color;
  this.type = type;
  this.brightness = brightness;
  this.contrast = contrast;
  this.opacity = opacity;
  this.filterAmount = filterAmount;

  this.init = function(){
    //Load the shaders

    var kinectronFrag = fragShader;
    var kinectronVert = vertShader;

    //Build the geometry but only once! even for multipule instances
    this.geo = new THREE.PlaneBufferGeometry(5, 4, this.width, this.height);

    

    //Create the material
    this.material = new THREE.ShaderMaterial({
      uniforms: new ShaderParams(),
      vertexShader: kinectronVert,
      fragmentShader: kinectronFrag,
      transparent: true
    });

    //Make the shader material double sided
    this.material.side = THREE.DoubleSide;

    if(this.type == 'rgbd'){

      this.material.uniforms.isDepth.value =  false;

    }else{

      this.material.uniforms.isDepth.value =  true;

    }


    this.material.uniforms.dim.value =  new THREE.Vector2(this.height,this.width);
    this.material.uniforms.filterAmount.value =  this.filterAmount;

    this.setColorOffSet(this.color);
    this.setBrightness(this.brightness);
    this.setContrast(this.contrast);
    this.setOpacity(this.opacity);

    this.setPointSize(this.pointSize);



    //Switch a few things based on selected rendering type and create the mesh
    this.buildMesh();


    //States
    this.isRunning = true;

    //Setup a three clock in case we need time in our shaders - get's updated only if update() is called recursively
    this.clock = new THREE.Clock();

 

    //Return the THREE Object3D instance for the mesh so you can just 'scene.add()' it
    return this;
  };


   this.setColorOffSet = function(color){
     const colorVecs = color.split(" ");
     this.material.uniforms.colorOffSet.value =  new THREE.Vector4(colorVecs[0], colorVecs[1], colorVecs[2], colorVecs[3]);

   };

   this.setBrightness = function(amount){
     this.material.uniforms.brightness.value = amount;
   };

   this.setContrast = function(amount){
     this.material.uniforms.contrast.value = amount;
   };

   this.setOpacity = function(opacity){
     this.material.uniforms.opacity.value = opacity;
   };

   this.setPointSize = function(size){
       this.material.uniforms.pointSize.value = size;
   };

   this.pause = function(){
     if(this.isRunning){
       this.isRunning = false;
     } else {
       console.warn("The rendering is already paused");
     }
   };

   this.play = function(){
     if(!this.isRunning){
       this.isRunning = true;
     } else {
       console.warn("The rendering is already playing");
     }
   };

   //If time is needed in the shader this should be called in the render() loop
   this.update = function() {
     this.mesh.material.uniforms.time.value = this.clock.getElapsedTime();
   };

   this.createTexture = function(imageStream){

  //Create an image element
  this.toImage = new Image();
  this.toImage.src = imageStream.src;
  //Image has loaded
  this.toImage.onload = ()=>{

    //Create a three texture out of the image element
    const texture = new THREE.Texture(this.toImage);

    //Make sure to set update to true!
    texture.needsUpdate = true;

    //Filter the texture
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    //Format and type
    texture.format = THREE.RGBAFormat;

    //Assign it to the shader program
    if(this.isRunning){
      this.material.uniforms.depthMap.value = texture;
      //this.material.uniforms.texSize.value = new THREE.Vector2(texture.width, texture.height);
    }

    //Clear the element from memory
    //this.toImage = null;
  }

  }

 
  //Change rendering type
  this.buildMesh = function(type) {
    this.mesh = new THREE.Points(this.geo, this.material);
  };

  this.getMesh = function(){
    return this.mesh;

  };

}


AFRAME.registerComponent('kinectron', {
  kinectronGeo : null,
  kinectron : null,
  schema: {
    host: {type: 'string', default: '127.0.0.1'},
    type: {type: 'string', default: 'rgbd'},
    pointSize: {type: 'float', default: 1.0},
    colorOffSet: {type: 'string', default: '0 0 0 0'},
    brightness: {type: 'float', default: 0.0},
    contrast: {type: 'float', default: 1.0},
    opacity: {type: 'float', default: 1.0},
    filterAmount: {type: 'float', default: 0.9}


  },
  init: function () {
    var el = this.el;

    this.kinectronGeo = new KinectGeometry(this.data.type,this.data.pointSize,this.data.colorOffSet,this.data.brightness,this.data.contrast,this.data.opacity,this.data.filterAmount);
    this.kinectronGeo.init(); 

    this.kinectron = new Kinectron(this.data.host);
    this.kinectron.setKinectType('windows');
    this.kinectron.makeConnection();

    if(this.data.type == 'rgbd'){
      this.kinectron.startRGBD(this.kinectronGeo.createTexture.bind(this.kinectronGeo));
    }
    if(this.data.type == 'depth'){
      this.kinectron.startDepth(this.kinectronGeo.createTexture.bind(this.kinectronGeo));
    }


    el.setObject3D('kinectron',this.kinectronGeo.getMesh());

  },
  
  update: function () {},
  tick: function () {},
  remove: function () {},
  pause: function () {},
  play: function () {}
});