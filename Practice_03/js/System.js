random = function(v){
    v = v || 1;
    if (v.length) for (var i in v) v[i] = random(v[i]);
    else  v = v*(Math.random()<0.5?-Math.random():Math.random());
    return v;
};

function System(args){
    args = args || {};
    this.name = args.name || "System";
    this.time = 1000/60;
    this.container = args.container || this.setContainer();
    this.camera = args.camera || this.setCamera();
    this.scene = args.scene || this.setScene();
    this.renderer = args.renderer || this.setRenderer();
    this.container.appendChild( this.renderer.domElement );
    this.on_animate = function(){};
    this.P = [];
    this.S = [];
    this.G = [];

    this.gravitate = function(){
        for (var s in this.S){
            for (var p in this.P){
              var a = new THREE.Vector3(0,0,0),
                  gravity = this.S[s].getGravity(this.P[p].v1.clone());
              a.addSelf(gravity);
              this.P[p].a = a;
              this.P[p].update();
            }
        }
    };
    
}

System.prototype = {
    setContainer: function(){
        return document.getElementById( 'container' );
    },

    setCamera: function(){
        var camera = new THREE.QuakeCamera({
            fov: 50,
            aspect: window.innerWidth / window.innerHeight,
            near: 1,
            far: 2000,
            constrainVertical: true,
            verticalMin: 1.1,
            verticalMax: 3.3,
            movementSpeed: 80,
            lookSpeed: 0.05,
            noFly: false,
            lookVertical: true,
            autoForward: false
            });

        camera.position.x = -400;
        camera.position.y = 300;
        camera.position.z = 0;
        return camera;
    },
    setScene: function(){
        var scene = new THREE.Scene();
        return scene;
    },
    setRenderer: function(){
        var renderer = new THREE.CanvasRenderer();
        renderer.autoClear = false;
        renderer.setSize( window.innerWidth, window.innerHeight );
        return renderer;
    },

    // Planet
    Planet: function(args){
        args = ((typeof(args) != "string" && args) || {position: {}});
        this.diameter = args.diameter || 4;
        this.position = (args.position || {
                x: random(window.innerWidth),
                y: random(window.innerHeight),
                z: random(window.innerWidth)
            }
        );
        this.a = 0;
        this.v1 = args.v1 || new THREE.Vector3(
            this.position.x,this.position.y,this.position.z
        );
        this.v0 = args.v0 || new THREE.Vector3(
            this.position.x,this.position.y,this.position.z
        );
        this.image = args.image || "http://sadasant.com/d/three/Practice_03/img/o3.png";
        this.E = new THREE.Mesh(
                 new THREE.Sphere( this.diameter, 16, 8 ),
                 new THREE.MeshBasicMaterial({
                     map: THREE.ImageUtils.loadTexture(this.image),
                     blending: THREE.AdditiveBlending
                 }));
        this.E.overdraw = true;
        this.E.doubleSided = true;
        this.E.position = this.position;
        
        //update
        this.update = function(){
            var a = this.a.clone();
            var v1 = this.v1.clone();
            var time = 1; // 1/30? WTF
            // DECAY
            // DECAY
            // DECAY
//            a.multiplyScalar(time*time).addSelf(v1.multiplyScalar(2).subSelf(this.v0))
            a.multiplyScalar(time*time).addSelf(v1.multiplyScalar(1.99).subSelf(this.v0.clone().multiplyScalar(0.99)));
            // DECAY
            // DECAY
            // DECAY
            this.v0 = this.v1.clone();
            this.v1 = a.clone();
            this.position = {x:a.x,y:a.y,z:a.z};
//            console.debug(this.position);
            this.E.position = this.position;
        };
    },
    addPlanet: function(P){
        P = new this.Planet(P);
        this.scene.addObject(P.E);
        this.P.push(P);
    },

    //Star
    Star: function(args){
        args = typeof(args) != "string" && args || {position: {}};
        this.diameter = args.diameter || 20;
        this.position = (
            args.position
            || {
                x: random(window.innerWidth),
                y: random(window.innerHeight),
                z: random(window.innerWidth)
            }
        );
        this.v0 = args.v0 || new THREE.Vector3(
            this.position.x,this.position.y,this.position.z
        );
        this.image = args.image || "http://sadasant.com/d/three/Practice_03/img/o3.png";
        this.E = new THREE.Mesh(
                 new THREE.Sphere( this.diameter, 16, 8 ),
                 new THREE.MeshBasicMaterial({
                     map: THREE.ImageUtils.loadTexture(this.image),
                     blending: THREE.AdditiveBlending
                 }));
        this.E.overdraw = true;
        this.E.doubleSided = true;
        this.E.position = this.position;
        
        // gravity
	    this.getGravity = function(vector){
		    vector.subSelf(this.v0);
            norm = Math.pow(vector.x, 2);
            norm += Math.pow(vector.y, 2);
            norm += Math.pow(vector.z, 2);
            norm = Math.pow(norm, 1 / 2);
            norm = -this.diameter/(norm*norm/2);
		    vector.multiplyScalar(norm);
		    return vector;
	    };
	},
    addStar: function(S){
        S = new this.Star(S);
        this.scene.addObject(S.E);
        this.S.push(S);
    },

    //Glitter
    Glitter: function(args){
      this.number = args.number || 100;
      this.color = args.color || 0x96ff00;
      this.diameter = args.diameter || 1;
      this.far = args.far || 2;
      this.E = [];
      var PI2 = Math.PI * 2,
          program = function ( context ) {
			context.beginPath();
			context.arc( 0, 0, 1, 0, PI2, true );
			context.closePath();
			context.fill();
		};
    for (i = 0; i <= this.number; i++){
			E = new THREE.Particle(
			    new THREE.ParticleCanvasMaterial({color:this.color, program:program })
	    );
			E.scale.x = E.scale.y = E.scale.z = this.diameter;
            E.position.x = random(window.innerWidth)*this.far;
            E.position.y = random(window.innerHeight)*this.far;
            E.position.z = random(window.innerWidth)*this.far;
            this.E.push(E);
        }
    },
    addGlitter: function(G){
        G = new this.Glitter(G);
        for (var i in G.E) this.scene.addObject(G.E[i]);
        this.G.push(G);
    },

    Animate: function(){
        setTimeout(this.name+".Animate(\""+this.name+"\")",this.time);
        this.on_animate();
        this.renderer.clear();
        this.renderer.render( this.scene, this.camera );
    }

};