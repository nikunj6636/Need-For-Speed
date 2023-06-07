import * as THREE from 'three';

function createPerson(x, z){

    let angle = Math.PI / 2;

    const height = 5, radius = 1, breadth = 3;

    const box_geometry = new THREE.PlaneGeometry( breadth, height);
    const box_material = new THREE.MeshBasicMaterial( {color: 0xa020f0} );
    const box = new THREE.Mesh( box_geometry, box_material );
    box.position.set(x, 0, z);
    box.rotateY(angle);

    const circle_geometry = new THREE.CircleGeometry( radius, 32 );
    const circle_material = new THREE.MeshBasicMaterial( { color: 0xffcc99 } );
    const circle = new THREE.Mesh( circle_geometry, circle_material );
    circle.position.set(x, height/2 + radius, z);    // length/2 + radius
    circle.rotateY(angle);

    return [box, circle];   // add 2 things in the scene
}

export {createPerson};