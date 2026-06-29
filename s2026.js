document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const sezon = params.get('season') || 2026;
    
    const header = document.querySelector("#main-race-table h2");
    if (header) header.textContent = `Sezon ${sezon}`;

    ladujMenu();
    ladujWyscigi(sezon);
    ladujRankingi(sezon);

    const searchInput = document.getElementById("search-input");
    const searchButton = document.getElementById("search-button");

    if (searchButton) {
        searchButton.addEventListener("click", () => {
            const wartosc = searchInput.value;
            szukajWBazie(wartosc);
        });
    }
});

function ladujMenu() {
    const menuContainer = document.getElementById("seasons-menu");
    if (!menuContainer) return;

    let menuHtml = "";
    for (let rok = 2026; rok >= 1950; rok--) {
        menuHtml += `
            <li>${rok}
                <ul>
                    <li><a href="#" onclick="pokazPodsumowanieSezonu(${rok})">Podsumowanie sezonu</a></li>
                    <li><a href="#" onclick="pokazKlasyfikacje('wdc', ${rok})">Klasyfikacja kierowców</a></li>
                    <li><a href="#" onclick="pokazKlasyfikacje('wcc', ${rok})">Klasyfikacja konstruktorów</a></li>
                </ul>
            </li>`;
    }
    menuContainer.innerHTML = menuHtml;
}

async function ladujWyscigi(sezon) {
    try {
        const res = await fetch(`api_results.php?season=${sezon}`);
        const data = await res.json(); 
        
        const output = document.getElementById("output");
        if (!output) return;
        
        output.innerHTML = "";
        data.forEach(r => {
            const formatujKierowce = (firstName, lastName, code) => {
                if (!firstName && !code) return "-";
                return (firstName && lastName) ? `${firstName} ${lastName}` : code;
            };

            const p1_name = formatujKierowce(r.p1_first_name, r.p1_last_name, r.p1_code);
            const p2_name = formatujKierowce(r.p2_first_name, r.p2_last_name, r.p2_code);
            const p3_name = formatujKierowce(r.p3_first_name, r.p3_last_name, r.p3_code);
            const fastest_name = formatujKierowce(r.fastest_first_name, r.fastest_last_name, r.fastest_code);

            output.innerHTML += `<tr>
                <td><strong>${r.circuit}</strong><br><small>${r.race_name}</small></td>
                <td>${r.type}</td>
                <td style="color: ${r.p1_color}"><strong>${p1_name}</strong></td>
                <td style="color: ${r.p2_color}"><strong>${p2_name}</strong></td>
                <td style="color: ${r.p3_color}"><strong>${p3_name}</strong></td>
                <td style="color: ${r.fastest_color}"><strong>${fastest_name}</strong></td>
            </tr>`;
        });
    } catch (e) { console.error("Błąd w api_results.php:", e); }
}

async function ladujRankingi(sezon) {
    try {
        const res = await fetch(`api_stats.php?season=${sezon}`);
        const dane = await res.json();
        
        // Render WDC
        const wdcBody = document.getElementById("wdc-output");
        wdcBody.innerHTML = "";
        dane.wdc.forEach((k, i) => {
            wdcBody.innerHTML += `<tr>
                <td>${i+1}</td>
                <td style="color: ${k.team_color}">${k.code}</td>
                <td>${k.points}</td>
                <td>${k.wins}</td>
            </tr>`;
        });

        // Render WCC
        const wccBody = document.getElementById("wcc-output");
        wccBody.innerHTML = "";
        dane.wcc.forEach((t, i) => {
            wccBody.innerHTML += `<tr>
                <td>${i+1}</td>
                <td style="color: ${t.team_color}">${t.team_name}</td>
                <td>${t.points}</td>
                <td>${t.wins}</td>
            </tr>`;
        });
    } catch (e) { console.error("Błąd w api_stats.php:", e); }
}