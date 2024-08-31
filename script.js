document.addEventListener("DOMContentLoaded", function () {
  const scenarioLinks = document.querySelectorAll(".scenario-link");
  const scenarioContainer = document.getElementById("scenarioInfo");

  scenarioContainer.style.display = "none";

  scenarioLinks.forEach((link) => {
    link.addEventListener("click", function (event) {
      event.preventDefault();
      const selectedScenario = this.getAttribute("data-scenario");
      loadScenario(selectedScenario);
    });
  });

  function loadScenario(scenarioKey) {
    fetch("scenarios.json")
      .then((response) => response.json())
      .then((data) => {
        const scenario = data.scenarios[scenarioKey];
        const vpUl = document.getElementById("scenario-ScoringVPText");
        const specialRuleUL = document.getElementById("scenario-SpecialRules");

        //Showing Scenario Info now that a scenario has been selected
        scenarioContainer.style.display = "flex";
        document.getElementById("scenarioTitle").textContent =
          scenario.scenario;
        document.getElementById("scenario-FlavorText").textContent =
          scenario.scenario_flavor;
        document.getElementById("scenario-OutlineText").textContent =
          scenario.scenario_outline;
        document.getElementById("scenario-ArmiesText").textContent =
          scenario.scenario_armies;
        document.getElementById("scenario-LayoutText").textContent =
          scenario.scenario_layout;
        document.getElementById("scenario-StartingPositionsText").textContent =
          scenario.scenario_startingPOS;
        document.getElementById("scenario-InitialPriorityText").textContent =
          scenario.scenario_priority;
        document.getElementById("scenario-ObjectivesText").textContent =
          scenario.scenario_objectives;

        vpUl.innerHTML = "";
        specialRuleUL.innerHTML = "";

        // Getting Scoring VP and displaying
        scenario.scenario_scoringVP.forEach((vp) => {
          const li = document.createElement("li");
          li.textContent = vp;
          vpUl.appendChild(li);
        });

        // Fetching the special rules
        fetch("special_rules.json")
          .then((response) => response.json())
          .then((specialRulesData) => {
            scenario.scenario_specialRules.forEach((ref) => {
              const rule = specialRulesData.special_rules[ref];

              if (rule) {
                const li = document.createElement("li");
                const ruleText = document.createElement("p");
                ruleText.textContent = `${rule.rule}: ${rule.description}`;
                li.appendChild(ruleText);

                // This is where we check for the Maelstrom Table and add it.
                if (rule.maelstrom_table_ref) {
                  fetch(rule.maelstrom_table_ref)
                    .then((response) => response.json())
                    .then((maelstromData) => {
                      const table = document.createElement("table");
                      console.log("Creating Table.");

                      //Create the table headers
                      const headerRow = document.createElement("tr");
                      const header1 = document.createElement("th");
                      header1.textContent = "D6";
                      const header2 = document.createElement("th");
                      header2.textContent = "Outcome";
                      headerRow.appendChild(header1);
                      headerRow.appendChild(header2);
                      table.appendChild(headerRow);

                      // Creating Table Rows
                      maelstromData.maelstromResults.forEach((row) => {
                        const tr = document.createElement("tr");
                        const tdResult = document.createElement("td");
                        tdResult.textContent = row.result;
                        tr.appendChild(tdResult);
                        const tdOutcome = document.createElement("td");
                        tdOutcome.textContent = row.outcome;
                        tr.appendChild(tdOutcome);

                        table.appendChild(tr);
                      });
                      li.appendChild(table);
                    });
                }
                specialRuleUL.appendChild(li);
              }
            });
          });
      });
  }
});
