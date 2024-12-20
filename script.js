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

function showNextSlide() {
    slides[currentSlide].style.display = 'none';
    currentSlide = (currentSlide + 1) % slides.length;
    slides[currentSlide].style.display = 'flex';

    if (currentSlide === 0 && !chartInitialized) {
        createChart(labels, datasets); 
        chartInitialized = true;
    }    
}




function createChart(labels, datasets) {
    const ctx = document.getElementById('myChart');

    
    if (chartInstance) {
        chartInstance.destroy();
        console.log("Previous chart destroyed.");
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

// auto refreshing av side

function autoRefresh() {
   location.reload();

   /*
   await fetchData();

   drawslide1();
   drawslide2();
   drawslide3();
   */

}

setInterval(autoRefresh, 120000);


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


document.addEventListener("DOMContentLoaded", async function () {
    try {

        await fetchData();
        drawslide2();

        /*
        drawslide1();
        drawslide3();
        */

        setInterval(showNextSlide, 10000);
     



        // Data display for vising 3 slide 3
        const message = apiData.visning3.message;
        const title = apiData.visning3.title;

        if (message && title) {
            document.getElementById("Flex5").textContent = message;
            document.getElementById("Flex6").textContent = title;
        } else {
            console.error("Message or Title is missing in visning3.");
        }

        setInterval(updateFlexContent, 5000);


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

        
        createChart(labels, datasets);

        
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
