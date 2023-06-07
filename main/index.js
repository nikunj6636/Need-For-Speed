import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import {createLight} from './lighting';
import { createTrack } from './track';
import { createPerson } from './person';

const scene = new THREE.Scene();
scene.background = new THREE.Color( 0xb9b8bf );	// background color

const renderer = new THREE.WebGLRenderer(); 
renderer.setSize( window.innerWidth, window.innerHeight );
// document.body.appendChild( renderer.domElement );

// bird's view here

const birdRenderer = new THREE.WebGLRenderer(); 
birdRenderer.setSize( window.innerWidth / 5, window.innerHeight / 5 );

birdRenderer.domElement.style.position = "absolute";
birdRenderer.domElement.style.bottom = "10px";
birdRenderer.domElement.style.left = "10px";
birdRenderer.domElement.style.border = "4px groove brown";

const birdCamera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 ); 

// To start the game

let startGame = false; // Press S to start the Game

// loading the scene in the x-y plane here

const r1 = 100, r2 = 160, r3 = 200;

const side = (r1+r2) / Math.sqrt(2); // side of the square

let track = createTrack(r1, r2, r3);

for(let i = 0; i<3 ;i++){	// load the track
	scene.add(track[i]);
}

function loadAudience(x, z) {
	let person = createPerson(x, z);
	scene.add(person[0]);	// rectangle add
	scene.add(person[1]);	// circle add
}

// load audience along 4 sides here

for(let i=0; i<5; i++) {
	loadAudience(r1 / Math.sqrt(2), Math.random() * r1 / Math.sqrt(2));
	loadAudience(r1 / Math.sqrt(2), -Math.random() * r1 / Math.sqrt(2));
}

for(let i=0; i<5; i++) {
	loadAudience( Math.random() * r1 / Math.sqrt(2), -r1 / Math.sqrt(2));
	loadAudience( -Math.random() * r1 / Math.sqrt(2), -r1 / Math.sqrt(2));
}

// scene loaded with audience

// loading the car

let car = '';	// loading th car on x-z plane

const loader = new GLTFLoader();

loader.load( '../dist/jeep/scene.gltf', function ( gltf ) {	// loading the car

	car = gltf.scene;
	scene.add( car );

	car.scale.set(1.5, 1.5, 1.5);
	car.position.set((r1+r2) / (2*sqrt2), 0, 0); // car at track
	car.rotateY( Math.PI );	// rotate about y axis of car
},
undefined, function ( error ) {

	console.error( error );

} );

const sqrt2 = Math.sqrt(2);

function caronRoad(x, y){	// on check whether the car is on road to reduce the health
	if (Math.abs(x) > r1 / sqrt2 || Math.abs(y) > r1 / sqrt2){
		if (Math.abs(x) < r2 / sqrt2 && Math.abs(y) < r2 / sqrt2){
			return true;
		}
	}
	return false;
}

// setting up the camera and creating light

const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 ); 
scene.add(createLight());

// motion of car

let max_velocity = 0.004, velocity = 0, a = 0.005 / 10; // parameters

let totalAngle = 0, rotateAngle = 0.02; // angle of rotation

let toogle = false;	// to toogle the camera view

let keyUp = false, keyLeft = false, keyRight = false; // to check whether the key is pressed or not

document.addEventListener("keydown", onDocumentKeyDown, false);	// on pressing the key
function onDocumentKeyDown(event) {
    var keyCode = event.which;

    // up
    if (keyCode == 38) {
        if (velocity + a <= max_velocity) velocity += a;
		keyUp = true;
	}

	// down
	else if (keyCode == 40) {
		if (velocity - a >= 0) velocity -= a;
    } 

    // left
	else if (keyCode == 37) {
		keyLeft = true;
        if (velocity > 0)
		{
			car.rotateY(rotateAngle);
			totalAngle += rotateAngle;	// rotate anticlockwise(+ve)
		}
    } 

    // right
	else if (keyCode == 39) {
		keyRight = true;
		if (velocity > 0) 
		{
			car.rotateY(-rotateAngle);
			totalAngle -= rotateAngle;	// rotate clockwise(-ve)
		}
    } 

	//T toogle button for different camera views
	else if (keyCode == 84){
		toogle = 1 - toogle;
	}

	// press S to start the game
	else if (keyCode == 83){
		if (startGame === false) 
		{
			startGame = true;	// start rendering and hide the start screen
			initial_date = new Date();	// set the new date

			document.body.appendChild( renderer.domElement );
			document.body.appendChild( birdRenderer.domElement );

			document.getElementById("labels").style.display = "flex";
			document.getElementById("start").style.display = "none";
		}
	}

    animate();
};

document.addEventListener("keyup", onDocumentKeyUp , false);	// on releasing the key
function onDocumentKeyUp(event) {
    var keyCode = event.which;
    // up
    if (keyCode == 38) {
		keyUp = false;
	}
	// left
	else if (keyCode == 37) {
		keyLeft = false;
    } 

    // right
	else if (keyCode == 39) {
		keyRight = false;
    } 
}


// car's properties, intial health is 100%

let health = 100, fuel = 100, score = 0, mileage = 2.7, distance_car = 0; // 3 units distance is covered in 1% of the fuel

let gameEnded = false;	// boolean variable to check whether game ends or not

let initial_date = new Date();

// setting up the opponent car

let rCar =  (r1+r2)/(2*sqrt2);

let opponent = [], opponentAngle = [0, 0, 0], r_opponent = [rCar - 7, rCar + 7, rCar + 14]; // array of opponents

function loadOpponent(i){
	loader.load( '../dist/opponent/scene.gltf', function ( gltf ) {	// loading the car
		
		let opp = gltf.scene;
		scene.add(opp);
		opponent.push(opp);

		opp.scale.set(0.015, 0.015, 0.015);
		opp.position.set(r_opponent[i], 1.0, 0); // car at track
		opp.rotateY(Math.PI / 2);	// rotate about y axis of car
	}, 
	undefined, function ( error ) {
		console.error( error );
	} );
}

for(let i=0; i<3; i++) loadOpponent(i);

let change_speed = true;	// decrement speed of oppeonent after start

let v_opponent = [0.1, 0.1, 0.1];

function changeOpponentSpeed(){
	let current_date = new Date();
	const diffTime = (current_date - initial_date) / 1e3; // time in seconds

	if (diffTime >= 1 && diffTime <= 2){ // set speed of the opponent
		for(let i=0; i<3; i++){
			v_opponent[i] = Math.random() * 0.002 + 0.002;	// random speed
		}
		change_speed = false;
	}
}

// rendering fuel cans here, 6 cans two cans on each side here

let fuels = []; // array to store fuel cans

function loadFuelcan(x, z){
	loader.load( '../dist/fuelCan/scene.gltf', function ( gltf ) {	// loading the car
		
		let fuel = gltf.scene;
		scene.add(fuel);

		fuels.push(fuel);	// add the fuel in the array

		fuel.scale.set(1.5, 1.5, 1.5);
		fuel.position.set(x, 0.1, z);
	}, 
	undefined, function ( error ) {
		console.error( error );
	} );
}

let random = [];	// generate 6 random numbers from [0, side/2]

for(let i=0; i < 6; i++) random.push(Math.random() * side/2);

// loading fuel cans, check collision with all

loadFuelcan(side/2 - random[0], -side/2 ); // -x
loadFuelcan(0 - random[1], -side/2 ); 

loadFuelcan(-side/2, -side/2 + random[2]); // +z
loadFuelcan(-side/2, 0 + random[3] ); 

loadFuelcan(-side/2 + random[4], side/2 ); // +x
loadFuelcan(0 + random[5], side/2 ); 

let distance_fuel = [], a_side = side / 2; 
// to store the distance of each fuelcan from starting point of race

for(let i=0; i<6; i++){
	distance_fuel.push(a_side + random[i]);
	a_side += side/2;
}

let ifuel = 0; // index of the fuel to start from

// render loop

function animate() {
	requestAnimationFrame( animate ); // to start animation

	// update the time, score, fuel and health

	let current_date = new Date();
	const time = (current_date - initial_date) / 1e3; // time spend in seconds

	document.getElementById("time").setAttribute("value", time.toFixed(2).toString() )
	document.getElementById("health").setAttribute("value", health.toFixed(2).toString() )
	document.getElementById("score").setAttribute("value", score.toFixed(2).toString() )
	document.getElementById("fuel").setAttribute("value", fuel.toFixed(2).toString() )

	// motion of own car

	car.position.x -= velocity * Math.sin(totalAngle);	// translate the car, +ve anticlockwise angle
	car.position.z -= velocity * Math.cos(totalAngle);
	distance_car += velocity;	// stores the total distance covered by car

	// To check the collisons of my car with opponent cars
	checkCollisions();

	// speed reduced due to friction
	if (keyUp === false) velocity = Math.max(velocity - 1 / 1e6, 0);

	// To check if the car is outside track or not

	if (caronRoad(car.position.x, car.position.z) == false){ // car is outside track

		if (health - 1 / 1e3 > 0) health -= 1 / 1e3;  // reduce the health
		else{
			// game over
			gameEnd("Health vanished, Your car is dead !");
		}
			
		if (score - 0.1 / 1e3 > 0) score -= 0.1 / 1e3;	// score cant be negative
		
		if (fuel - velocity/(mileage/2)  > 0) fuel -= velocity/(mileage/2);	// mileage reduces by half in grass
		else{
			// game over
			gameEnd("Player out of Fuel !");
		}
	}
	else { // car is on road
		if (velocity > 0 && score + 0.1 / 1e3 < 100) score += 0.1 / 1e3 ;	// increase the score with each render loop

		if (fuel - velocity/mileage > 0) fuel -= velocity/mileage; // reducing the mileage value here
		else{
			// game over
			gameEnd("Fuel Over !");
		}
	}

	// opponent's motion

	if (change_speed) changeOpponentSpeed(); // only one time change
	
	for(let i=0; i<3; i++){
		opponent[i].position.x -= v_opponent[i] *  Math.sin(opponentAngle[i]);
		opponent[i].position.z -= v_opponent[i] *  Math.cos(opponentAngle[i]);

		// to turn the opponent car

		let dist_opponent = Math.sqrt(Math.pow(opponent[i].position.x, 2) + Math.pow(opponent[i].position.z, 2)); //distance from center
		if (dist_opponent >= (r1+r2)/2 && dist_opponent <= (r1 + r2)/2 + 0.003)
		{
			v_opponent[i] = Math.min(v_opponent[i] + Math.random()*0.001, 0.004)	// randomly increase the spped at turn
			opponentAngle[i] += Math.PI/2;
			opponent[i].rotateY(Math.PI/2);
		}
	}

	// to toogle bw camera views

	if (toogle){ // third person camera view here
		const r = 4;
		camera.position.set( car.position.x + r * Math.sin(totalAngle), 5,  car.position.z + r*Math.cos(totalAngle) );	// typical coordinate system
		camera.lookAt( car.position.x, 2 , car.position.z );
	}

	else { // driver's view
		const r = 1;
		camera.position.set( car.position.x - r * Math.sin(totalAngle), 3,  car.position.z - r*Math.cos(totalAngle) );	// typical coordinate system
		camera.lookAt( car.position.x - 2*r*Math.sin(totalAngle), 2.5 , car.position.z - 2*r*Math.cos(totalAngle) );
	}

	// to setup the bird's camera

	birdCamera.position.set(car.position.x, 10, car.position.z);
	birdCamera.lookAt(car.position.x, 0, car.position.z);

	// render the view
	
    renderer.setSize(window.innerWidth, window.innerHeight); // to keep the size of the window fixed
	renderer.render( scene, camera );

	// birdRenderer.setSize(window.innerWidth / 5, window.innerHeight / 5); // to keep the size of the window fixed
	birdRenderer.render( scene, birdCamera );
};

animate();

function checkCollisions(){

	// collision bewteen opponent

	for(let i=0; i<3; i++){
		let collision_dist = Math.sqrt( Math.pow(opponent[i].position.x - car.position.x, 2) +  Math.pow(opponent[i].position.z - car.position.z, 2) );

		if (collision_dist <= 4){	// car collides
			if (health - 0.005 > 0) health -= 0.005;
			else {	// game over
				gameEnd("Health vansihed, your car is dead!");
			}
			score = Math.max(score - 0.004, 0);
		}
	}

	// collison with fuel cans

	let fuel_dist = Math.sqrt( Math.pow(fuels[ifuel].position.x - car.position.x, 2) +  Math.pow(fuels[ifuel].position.z - car.position.z, 2) );
	document.getElementById("nextFuel").setAttribute("value", Math.abs(distance_fuel[ifuel] - distance_car - 5).toFixed(2).toString())

	if (fuel_dist <= 4){	// collect the fuel when collided
		fuel = Math.min(fuel + 0.015, 100);
	}

	if (distance_car > distance_fuel[ifuel]) 
	{
		if (ifuel == 5){
			for(let i=0; i<6; i++){
				distance_fuel[i] += 4*side;	// add each time here
			}
		}
		ifuel = (ifuel+1)%6 ; // move to next fuel
	}
}

function gameEnd(message) {

	if (gameEnded == true) return;

	gameEnded = true;

	// renderer.dispose();
	document.body.removeChild( renderer.domElement );	// removing the DOM element
	document.body.removeChild( birdRenderer.domElement );	// removing the DOM element
	document.getElementById("labels").style.display = "none";	// remove the labels

	// update "Game over" message on screen
	document.body.style.backgroundColor = "#b3b3b3"
	document.getElementById("end").style.display = "block";
	document.getElementById("endScore").innerHTML = score.toFixed(2).toString(); // set the score
	document.getElementById("endMessage").innerHTML = message; // set the score
}