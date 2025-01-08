let currentSlide = 0;
const slides = document.querySelectorAll('.slide');
let chartInitialized = false; 

let labels = [];
let datasets = [];

let chartInstance = null;  

let apiData;
let visning2Entries;
let currentFlex3Index = 0;
let currentFlex4Index = 0;

let firstSix;
let lastSix;


function createChart(labels, datasets) {
    const ctx = document.getElementById('myChart');
    console.log("Trying to make a new chart")

    
    if (chartInstance) {
        chartInstance.destroy();
        console.log("Previous chart destroyed.");
        chartInstance = null;
    } else{
        console.log("no chart to destroy")
    }

    // datasets før chart creation
    if (!labels || labels.length === 0 || !datasets || datasets.length === 0) {
        console.error("Invalid data. Labels or datasets are empty.");
        return;
    }

    
    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,  
            datasets: datasets  
        },
        options: {
            elements:{
             bar:{
                borderRadius: 10,
                barThickness: 40,
             }   
            },
            scales: {
                x:{
                    grid: {
                        display: false
                    }
                },
                y: {
                    grid:{
                        display: false
                    },
                    ticks: {
                        display: false
                    },
                    border: {
                        display: false
                    },

                    beginAtZero: true
                }
            }
        },
        plugins: [
            {
                id: 'backgroundColor',
                beforeDraw: (chart) => {
                    const ctx = chart.canvas.getContext('2d');
                    ctx.save();
                    ctx.fillStyle = 'rgb(255, 255, 255)';
                    ctx.restore();
                }
            }
        ]
    });
    console.log("Chart successfully created.");
}

function showNextSlide() {
    slides[currentSlide].style.display = 'none';
    currentSlide = (currentSlide + 1) % slides.length;
    slides[currentSlide].style.display = 'flex';

    if (currentSlide === 0 && !chartInitialized) {
        createChart(labels, datasets); 
        chartInitialized = true;
    }    
}

// henter den nye dataen og oppdaterer de 3 slidesne og oppdaterer based on timer

async function refreshData() {
    try{
        await fetchData();
        
        drawslide1();
        drawslide2();
        drawslide3();
        
        console.log("Data has been deliverd -Jarvis");
        }catch (error){
        console.error("Sir there seems to be a problem with the data -Jarvis", error);
        }

    }
    


setInterval(refreshData, 10000);


async function fetchData() {

    // API DATA
    const response = await fetch('https://aat-api.altifiber.no/api/portal/?infoskjerm', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            'auth_token': '09650371-b367-428a-8fb1-37df1f62c440',
            'child_api_id': 'infoskjerm'
        })
    });

    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    
    apiData = await response.json();
    console.log('API Response:', apiData); 
}

function updateFlexContent() {
    const [key3, value3] = firstSix[currentFlex3Index];
    const cleanKey3 = key3.replace (/_/g, " ");
    document.getElementById("Flex3").textContent = `${cleanKey3}: ${value3}`;
    currentFlex3Index = (currentFlex3Index + 1) % firstSix.length;

    const [key4, value4] = lastSix[currentFlex4Index];
    const cleanKey4 = key4.replace(/_/g, " ");
    document.getElementById("Flex4").textContent = `${cleanKey4}: ${value4}`;
    currentFlex4Index = (currentFlex4Index + 1) % lastSix.length;
}

function drawslide1(){
    labels = Object.keys(apiData.visning1.historikk);  
    let leads_array = [];
    let signert_array = [];
    let totalLeads = 0;
    let totalSignert = 0;

    
    for (const date of labels) {
        const entry = apiData.visning1.historikk[date]; 
        
        console.log(`Processing date: ${date}`, entry); 
        leads_array.push(entry.leads);
        signert_array.push(entry.signert);

        totalLeads += entry.leads;
        totalSignert += entry.signert;
    }

    document.getElementById('numberBoxLeads').textContent = totalLeads;
    document.getElementById('numberBoxSignert').textContent = totalSignert;

    
    datasets = [
        {
            label: 'Leads',
            data: leads_array,
            backgroundColor: 'rgba(18, 107, 241, 0.7)', 
             
        },
        {
            label: 'Signert',
            data: signert_array,
            backgroundColor: 'rgba(17, 223, 17, 0.7)', 
            
        }
    ];

}

function drawslide2() {
    //Random display for flex3 og flex4
    visning2Entries = Object.entries(apiData.visning2).filter(
        ([key]) => key !== "Prosent_fulldokumentert"
    );

    firstSix = visning2Entries.slice(0,6);
    lastSix = visning2Entries.slice(6,12);

    // farge code live oppdatering for % dokumentert
    const prosentValue = apiData.visning2.Prosent_fulldokumentert;
    updateProsentBox(prosentValue);

    const prosentFulldokumentert = apiData.visning2.Prosent_fulldokumentert;
    document.getElementById('Flex2').textContent = prosentFulldokumentert;
    
    updateFlexContent();
}

// Data display for vising 3 slide 3
function drawslide3(){
    const message = apiData.visning3.message;
    const title = apiData.visning3.title;

    if (title) {
        document.getElementById("Flex6").textContent = title;
     }
     
     if(message){
        updateFlex5Content(message);
     }
     
     else {
        console.error("Message or Title is missing in visning3.");
    }

}


// venter til hele siden er updated før function skjer (kun 1 gang)
document.addEventListener("DOMContentLoaded", async function () {
    try {

        await fetchData();
        drawslide1();
        drawslide2();
        drawslide3();

        createChart(labels,datasets);

        setInterval(showNextSlide, 20000);
       
        showNextSlide();

        

        } catch (error) {
            console.error('Error fetching data:', error);
        }
});


// farge code function
function getDynamicColor(value) {
    const clampedValue = Math.min(100, Math.max(0, value));
    
   
    const red = Math.round(255 * (1 - clampedValue / 100)); 
    const green = Math.round(255 * (clampedValue / 100));  
    return `rgb(${red}, ${green}, 0)`; 
}

function updateProsentBox(value) {
    const prosentBox = document.getElementById("Flex2");
    prosentBox.textContent = value; 
    prosentBox.style.color = getDynamicColor(value); 
}

// text scaling for slide 3
function adjustTextSize(){
    const flex5 = document.getElementById("Flex5");
    const scalingText = document.getElementById("scaling-text")
    
    if (!flex5 || !scalingText){
        console.error("Flex 5 or scaling text element not found.");
        return;
    }
    
    scalingText.style.fontSize="10px";

    const flex5Width = flex5.offsetWidth;
    const flex5Height = flex5.offsetHeight;

    const newFontSize = Math.min(flex5Width, flex5Height) * 0.3;
    scalingText.style.fontSize = `${newFontSize}px`;

    console.log("Adjusting text to fit flex5");
}

 function updateFlex5Content(newText){
    const scalingText = document.getElementById("scaling-text");

    if(!scalingText){
        console.error("scaling-text element not found.");
        return;
    }

    scalingText.textContent = newText;
    adjustTextSize();
 }

 window.addEventListener("resize", adjustTextSize);
 
 document.addEventListener("DOMContentLoaded", () => {
    const exampleMessage = "hello, this is your API data!";
    updateFlex5Content(exampleMessage); 
});
 