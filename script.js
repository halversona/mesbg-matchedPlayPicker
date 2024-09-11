document.addEventListener("DOMContentLoaded", function () {
  const scenarioLinks = document.querySelectorAll(".scenario-link");
  const scenarioContainer = document.getElementById("scenarioInfo");
  const generateButton = document.getElementById("genScenario");
  const scenarioTitle = document.getElementById("scenarioTitle");
  let generationMethod = document.getElementById("generationMethod");
  generationMethod.checked = false;
  let genMethodSwitch = false;

  scenarioContainer.style.display = "none";

  scenarioLinks.forEach((link) => {
    link.addEventListener("click", function (event) {
      event.preventDefault();
      let selectedScenario = this.getAttribute("data-scenario");
      loadScenario(selectedScenario);
    });
  });

  // CHecks for what generation method is being used

  generationMethod.addEventListener("change", function () {
    if (this.checked) {
      console.log("Veto Mode Activated"); // True
      genMethodSwitch = true;
      scenarioContainer.style.display = "none";
      document.getElementById("modeHeader").textContent = "Veto Method";
      document.getElementById("headerText").textContent =
        "The Veto method will randomly select a pool for the players to pick from. The player who loses the initiative roll in the scenario select phase will veto the first scenario. The winner will veto one of the two remaining scenarios, the scenario that was not veto'd is the scenario to be played.";
      document.getElementById("genScenario").textContent = "Generate";
      resetScenarios();
    } else {
      console.log("Random mode activated"); // False
      genMethodSwitch = false;
      scenarioContainer.style.display = "none";
      document.getElementById("modeHeader").textContent = "Random Method";
      document.getElementById("headerText").textContent =
        "The Random method will randomly select a pool and scenario to be played by the players.";
    }
    document.getElementById("genScenario").textContent = "Generate";
    resetScenarios();
  });

  // Listen for button blick and then generate the scenario.
  generateButton.addEventListener("click", function () {
    genScenario(generationMethod);
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
        scenarioTitle.scrollIntoView({ behavior: "smooth" });
      });
  }

  function genScenario() {
    console.log("Generating scenario");
    let scenarioPoolName = "";
    // Basic RNG for pools. I would like to move these to a function and have a better RNG system.
    let scenarioPool = Math.floor(Math.random() * (6 - 1 + 1) + 1);
    let scenarioNum = Math.floor(Math.random() * (3 - 1 + 1) + 1);
    // Using a Switch statement vs an If statement for getting the scenario information
    if (genMethodSwitch === false) {
      console.log("Random Generation");
      switch (scenarioPool) {
        case 1:
          scenarioPoolName = "Maelstrom of Battle";
          switch (scenarioNum) {
            case 1:
              selectedScenario = "heirlooms";
              break;
            case 2:
              selectedScenario = "hold_ground";
              break;
            case 3:
              selectedScenario = "command_battlefield";
              break;
          }
          break;
        case 2:
          scenarioPoolName = "Hold Objective";
          switch (scenarioNum) {
            case 1:
              selectedScenario = "domination";
              break;
            case 2:
              selectedScenario = "capture_control";
              break;
            case 3:
              selectedScenario = "breakthrough";
              break;
          }
          break;
        case 3:
          scenarioPoolName = "Object";
          switch (scenarioNum) {
            case 1:
              selectedScenario = "seize_prize";
              break;
            case 2:
              selectedScenario = "destroy_supplies";
              break;
            case 3:
              selectedScenario = "retrieval";
              break;
          }
          break;
        case 4:
          scenarioPoolName = "Kill the Enemy";
          switch (scenarioNum) {
            case 1:
              selectedScenario = "lords_battle";
              break;
            case 2:
              selectedScenario = "contest_champions";
              break;
            case 3:
              selectedScenario = "death";
              break;
          }
          break;
        case 5:
          scenarioPoolName = "Manoveuring";
          switch (scenarioNum) {
            case 1:
              selectedScenario = "storm_camp";
              break;
            case 2:
              selectedScenario = "reconnoitre";
              break;
            case 3:
              selectedScenario = "divide_conquer";
              break;
          }
          break;
        case 6:
          scenarioPoolName = "Unique";
          switch (scenarioNum) {
            case 1:
              selectedScenario = "fog_of_war";
              break;
            case 2:
              selectedScenario = "clash_moonlight";
              break;
            case 3:
              selectedScenario = "assassination";
              break;
          }
          break;
      }
      console.log(scenarioPoolName);
      console.log(selectedScenario);
      loadScenario(selectedScenario);
    } else if (genMethodSwitch === true) {
      console.log("Veto Mode generation");
      // This feels excessive to reset this. I need a better option.
      resetScenarios();
      switch (scenarioPool) {
        case 1:
          scenarioPoolName = "Maelstrom of Battle";
          console.log(scenarioPoolName);
          document.getElementById("poolTwo").style.display = "none";
          document.getElementById("poolThree").style.display = "none";
          document.getElementById("poolFour").style.display = "none";
          document.getElementById("poolFive").style.display = "none";
          document.getElementById("poolSix").style.display = "none";
          break;
        case 2:
          scenarioPoolName = "Hold Objective";
          console.log(scenarioPoolName);
          document.getElementById("poolOne").style.display = "none";
          document.getElementById("poolThree").style.display = "none";
          document.getElementById("poolFour").style.display = "none";
          document.getElementById("poolFive").style.display = "none";
          document.getElementById("poolSix").style.display = "none";
          break;
        case 3:
          scenarioPoolName = "Object";
          console.log(scenarioPoolName);
          document.getElementById("poolOne").style.display = "none";
          document.getElementById("poolTwo").style.display = "none";
          document.getElementById("poolFour").style.display = "none";
          document.getElementById("poolFive").style.display = "none";
          document.getElementById("poolSix").style.display = "none";
          break;
        case 4:
          scenarioPoolName = "Kill the Enemy";
          console.log(scenarioPoolName);
          document.getElementById("poolOne").style.display = "none";
          document.getElementById("poolTwo").style.display = "none";
          document.getElementById("poolThree").style.display = "none";
          document.getElementById("poolFive").style.display = "none";
          document.getElementById("poolSix").style.display = "none";
          break;
        case 5:
          scenarioPoolName = "Manoveuring";
          console.log(scenarioPoolName);
          document.getElementById("poolOne").style.display = "none";
          document.getElementById("poolTwo").style.display = "none";
          document.getElementById("poolThree").style.display = "none";
          document.getElementById("poolFour").style.display = "none";
          document.getElementById("poolSix").style.display = "none";
          break;
        case 6:
          scenarioPoolName = "Unique";
          console.log(scenarioPoolName);
          document.getElementById("poolOne").style.display = "none";
          document.getElementById("poolTwo").style.display = "none";
          document.getElementById("poolThree").style.display = "none";
          document.getElementById("poolFour").style.display = "none";
          document.getElementById("poolFive").style.display = "none";
          break;
      }
      document.getElementById("scenarioPools").style.gridTemplateColumns =
        "300px";
    }
  }
});

function resetScenarios() {
  document.getElementById("scenarioPools").style.gridTemplateColumns =
    "300px 300px 300px";
  document.getElementById("poolOne").style.display = "flex";
  document.getElementById("poolTwo").style.display = "flex";
  document.getElementById("poolThree").style.display = "flex";
  document.getElementById("poolFour").style.display = "flex";
  document.getElementById("poolFive").style.display = "flex";
  document.getElementById("poolSix").style.display = "flex";
}
