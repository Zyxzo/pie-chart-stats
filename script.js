         let currentSlide = 0;
        const slides = document.querySelectorAll('.slide');
        let chartInitialized = false; 

        let labels = [];
        let datasets = [];

       
        function showNextSlide() {
            slides[currentSlide].style.display = 'none';
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].style.display = 'flex';

            if (currentSlide ===0 && !chartInitialized){
                createChart(labels, datasets);
                chartInitialized = true;
            }    
        }
        
        setInterval(showNextSlide, 15000);
        
        let chartInstance = null;
        
        function createChart (labels, datasets) {

            const ctx = document.getElementById('myChart');

            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: datasets
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        };

         function autoRefresh(){
            location.reload();
         }

         setInterval(autoRefresh, 60000);

        // Waiting for the page to load
        document.addEventListener("DOMContentLoaded", async function() {
            try {
                // Fetch data from the API
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

                const apiData = await response.json();
                console.log('API Response:', apiData);

                // STATISK - må byttes ut med dynamisk i stedet
                //const labels = ['Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag', 'Søndag'];

                labels = Object.keys(apiData.visning1.historikk);
                let leads_array = [];
                let signert_array = [];

                let totalLeads = 0;
                let totalSignert = 0;

                // Extract leads counts
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

                const datasets = [
                        {
                            label: 'Leads',
                            data: leads_array, // First dataset values
                            borderWidth: 5,
                            backgroundColor: 'rgba(0, 0, 255, 0.5)', 
                            borderColor: 'rgba(0, 0, 255, 1)' 
                        },
                        {
                            label: 'Signert',
                            data: signert_array, // Second dataset values
                            borderWidth: 5,
                            backgroundColor: 'rgba(34, 197, 34, 0.5)', 
                            borderColor: 'rgba(34, 197, 34, 1)' 
                        }
                    ];

                createChart(labels, datasets);
                showNextSlide();

            } catch (error) {
                console.error('Error fetching data:', error);
            }
        });