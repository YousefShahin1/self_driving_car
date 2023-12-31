const carCanvas=document.getElementById("carCanvas");
carCanvas.width=200;
const networkCanvas=document.getElementById("networkCanvas");
networkCanvas.width=400;

const carCtx = carCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");




const road=new Road(carCanvas.width/2,carCanvas.width*0.9);
const N=700;
const cars= generateCars(N);
let bestCar = cars[0];
if(localStorage.getItem("bestBrain")){
    for(let i=0;i<cars.length;i++){
        cars[i].brain=JSON.parse(
            localStorage.getItem("bestBrain")
        );
        if(i!=0){
            NeuralNetwork.mutate(cars[i].brain,0.2);
        }
    }
    
}
const traffic = [];

let trafficPos = -100;
for(let i=0;i<50;i++){
    const trafficCar = new Car(road.getLaneCenter(Math.round(Math.random()*2)),trafficPos,30,50,"DUMMY", 2);
    trafficPos+= Math.random()*-100-70;
    traffic.push(trafficCar);
}


animate();

function save(){
    localStorage.setItem("bestBrain",
    JSON.stringify(bestCar.brain));
}
function discard(){
    localStorage.removeItem("bestBrain");
}


function generateCars(){
    const cars=[];
    for(let i=1;i<=N;i++){
        cars.push(new Car(road.getLaneCenter(1), 100, 30 ,50, "AI"));
    }
    return cars;
}

function animate(time){
    for(let i=0;i<traffic.length;i++){
        traffic[i].update(road.borders,[]);
    }
    for(let i =0;i<cars.length;i++){
        cars[i].update(road.borders, traffic);
    }
    //chooses the car the travells the most  as the best one
    bestCar=cars.find(
        c=>c.y==Math.min(
            ...cars.map(c=>c.y)
        )
    );
    
    carCanvas.height=window.innerHeight;
    networkCanvas.height=window.innerHeight;
    

    const mainCarImage = document.getElementById("mainCarImage");
    const dummyCarImage = document.getElementById("dummyCarImage");

    carCtx.save();
    carCtx.translate(0, -bestCar.y+carCanvas.height*0.7);
    road.draw(carCtx);
    for(let i=0;i<traffic.length;i++){
        traffic[i].draw(carCtx,dummyCarImage);
    }
    carCtx.globalAlpha=0.2;
    for(let i =0;i<cars.length;i++){
        cars[i].draw(carCtx, mainCarImage);
    }

    carCtx.globalAlpha=1;


    

    bestCar.draw(carCtx, mainCarImage, true);


    carCtx.restore();

    networkCtx.lineDashOffset=-time/50;
    Visualizer.drawNetwork(networkCtx,bestCar.brain);
    requestAnimationFrame(animate);

}