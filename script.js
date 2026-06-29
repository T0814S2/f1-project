function pokazKlasyfikacje(typ, sezon) {
    if (typ === 'wdc') {
        pokazKlasyfikacjeKierowcow(sezon);
    } else if (typ === 'wcc') {
        pokazKlasyfikacjeKonstruktorow(sezon);
    }
}

async function pobierzDaneSezonu(sezon) {
    try {
        const res = await fetch(`api_stats.php?season=${sezon}`);
        if (!res.ok) throw new Error("Błąd sieci");
        return await res.json();
    } catch (e) {
        console.error("Nie udało się pobrać danych z API:", e);
        return null;
    }
}

function przygotujKontener() {
    const container = document.getElementById("subpage-container");
    container.innerHTML = "<p>Ładowanie danych...</p>";
    container.style.display = "block";

    const racesSection = document.getElementById("main-race-table"); 
    if (racesSection) {
        racesSection.style.display = "none";
    }

    const searchSection = document.getElementById("search-results-main");
    if (searchSection) {
        searchSection.style.display = "none";
    }
    
    return container;
}

async function pokazKlasyfikacjeKierowcow(sezon) {
    const container = przygotujKontener();
    const data = await pobierzDaneSezonu(sezon);

    if (!data || !data.wdc) {
        container.innerHTML = "<p style='color: red;'>Nie udało się załadować klasyfikacji kierowców.</p>";
        return;
    }

    let html = `<h2 class="h2_season">Klasyfikacja Kierowców - Sezon ${sezon}</h2>
                <table class="f1-table">
                    <thead>
                        <tr>
                            <th>Kierowca</th>
                            <th>Punkty</th>
                            <th>Wygrane</th>
                        </tr>
                    </thead>
                    <tbody>`;

    data.wdc.forEach(r => {
        const pelneNazwisko = r.first_name ? `${r.first_name} ${r.last_name}` : r.last_name;

        html += `<tr>
            <td style="color: ${r.team_color}; font-weight: bold;">${pelneNazwisko}</td>
            <td>${r.points}</td>
            <td>${r.wins}</td>
        </tr>`;
    });

    html += `</tbody></table>`;
    container.innerHTML = html;
}

async function pokazKlasyfikacjeKonstruktorow(sezon) {
    const container = przygotujKontener();
    const data = await pobierzDaneSezonu(sezon);

    if (!data || !data.wcc) {
        container.innerHTML = "<p style='color: red;'>Nie udało się załadować klasyfikacji konstruktorów.</p>";
        return;
    }

    let html = `<h2 class="h2_season">Klasyfikacja Konstruktorów - Sezon ${sezon}</h2>
                <table class="f1-table">
                    <thead>
                        <tr>
                            <th>Konstruktor</th>
                            <th>Punkty</th>
                            <th>Wygrane</th>
                        </tr>
                    </thead>
                    <tbody>`;

    data.wcc.forEach(r => {
        html += `<tr>
            <td style="color: ${r.team_color}; font-weight: bold;">${r.team_name}</td>
            <td>${r.points}</td>
            <td>${r.wins}</td>
        </tr>`;
    });

    html += `</tbody></table>`;
    container.innerHTML = html;
}

async function pokazPodsumowanieSezonu(sezon) {
    const container = przygotujKontener();

    try {
        const res = await fetch(`api_results.php?season=${sezon}`);
        if (!res.ok) throw new Error("Błąd sieci");
        const data = await res.json();

        if (!data || data.length === 0) {
            container.innerHTML = `<p style='color: gray;'>Brak danych wyścigów dla sezonu ${sezon}.</p>`;
            return;
        }

        let html = `<h2>Podsumowanie Sezonu ${sezon}</h2>
                    <table class="f1-table">
                        <thead>
                            <tr>
                                <th>Circuit</th>
                                <th>Type</th>
                                <th>Winner</th>
                                <th>Second Place</th>
                                <th>Third Place</th>
                                <th>Fastest Lap</th>
                            </tr>
                        </thead>
                        <tbody>`;

        data.forEach(r => {
            const formatujKierowce = (firstName, lastName, code) => {
                if (!firstName && !code) return "-";
                return (firstName && lastName) ? `${firstName} ${lastName}` : code;
            };

            html += `<tr>
                <td><strong>${r.circuit}</strong><br><small>${r.race_name}</small></td>
                <td>${r.type}</td>
                <td style="color: ${r.p1_color}"><strong>${formatujKierowce(r.p1_first_name, r.p1_last_name, r.p1_code)}</strong></td>
                <td style="color: ${r.p2_color}"><strong>${formatujKierowce(r.p2_first_name, r.p2_last_name, r.p2_code)}</strong></td>
                <td style="color: ${r.p3_color}"><strong>${formatujKierowce(r.p3_first_name, r.p3_last_name, r.p3_code)}</strong></td>
                <td style="color: ${r.fastest_color}"><strong>${formatujKierowce(r.fastest_first_name, r.fastest_last_name, r.fastest_code)}</strong></td>
            </tr>`;
        });

        html += `</tbody></table>`;
        container.innerHTML = html;

    } catch (e) {
        console.error("Błąd ładowania podsumowania sezonu:", e);
        container.innerHTML = "<p style='color: red;'>Nie udało się załadować podsumowania sezonu.</p>";
    }
}
async function szukajWBazie(fraza) {
    const searchSection = document.getElementById("search-results-main");
    const mainRaceTable = document.getElementById("main-race-table");
    const subpageContainer = document.getElementById("subpage-container");

    if (!searchSection) return;

    if (fraza.trim() === "") {
        searchSection.style.display = "none";
        searchSection.innerHTML = "";
        if (mainRaceTable) mainRaceTable.style.display = "block";
        return;
    }

    searchSection.innerHTML = "<p>Wyszukiwanie...</p>";
    searchSection.style.display = "block";

    if (mainRaceTable) mainRaceTable.style.display = "none";
    if (subpageContainer) subpageContainer.style.display = "none";

    try {
        const res = await fetch(`api_search.php?q=${encodeURIComponent(fraza)}`);
        const data = await res.json();

        let html = `<h2>Wyniki wyszukiwania dla: "${fraza}"</h2>`;

        if (data.drivers && data.drivers.length > 0) {
            html += `<h3>Kierowcy</h3>
                    <table class="f1-table">
                        <thead><tr><th>Kierowca</th><th>Zespół</th></tr></thead>
                        <tbody>`;
            data.drivers.forEach(d => {
                html += `<tr>
                    <td><strong>${d.first_name} ${d.last_name}</strong> (${d.driver_id})</td>
                    <td style="color: ${d.team_color}"><strong>${d.team_name || "-"}</strong></td>
                </tr>`;
            });
            html += `</tbody></table>`;
        }

        if (data.races && data.races.length > 0) {
            html += `<h3>Wyścigi</h3>
                    <table class="f1-table">
                        <thead><tr><th>Sezon / Runda</th><th>Nazwa wyścigu</th><th>Tor</th><th>Typ</th></tr></thead>
                        <tbody>`;
            data.races.forEach(r => {
                html += `<tr>
                    <td>Sezon ${r.season}, Runda ${r.round}</td>
                    <td><strong>${r.race_name}</strong></td>
                    <td>${r.circuit_name}</td>
                    <td>${r.race_type}</td>
                </tr>`;
            });
            html += `</tbody></table>`;
        }

        if ((!data.drivers || data.drivers.length === 0) && (!data.races || data.races.length === 0)) {
            html += "<p style='color: gray;'>Brak wyników spełniających kryteria.</p>";
        }

        searchSection.innerHTML = html;
    } catch (e) {
        console.error("Błąd wyszukiwania:", e);
        searchSection.innerHTML = "<p style='color: red;'>Wystąpił błąd podczas wyszukiwania.</p>";
    }
}