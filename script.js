document.addEventListener("DOMContentLoaded", function () {
  const scenarioLinks = document.querySelectorAll(".scenario-link");
  const scenarioContainer = document.getElementById("scenarioInfo");
  const generateButton = document.getElementById("genScenario");
  const scenarioTitle = document.getElementById("scenarioTitle");
  const chaosMode = document.getElementById("chaosMode");
  let generationMethod = document.getElementById("generationMethod");
  generationMethod.checked = false;
  editionChecker.checked = true;
  let genMethodSwitch = false;
  let editionScenarios = "scenarios2024.json";

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
      generationMethod.checked = true;
      scenarioContainer.style.display = "none";
      document.getElementById("modeHeader").textContent = "Veto Method";
      document.getElementById("headerText").textContent =
        "The Veto method will randomly select a pool for the players to pick from. The player who loses the initiative roll in the scenario select phase will veto the first scenario. The winner will veto one of the two remaining scenarios, the scenario that was not veto'd is the scenario to be played.";
      document.getElementById("genScenario").textContent = "Generate";
      resetScenarios();
    } else {
      console.log("Random mode activated"); // False
      generationMethod.checked = false;
      scenarioContainer.style.display = "none";
      document.getElementById("modeHeader").textContent = "Random Method";
      document.getElementById("headerText").textContent =
        "The Random method will randomly select a pool and scenario to be played by the players.";
      resetScenarios();
    }
    document.getElementById("genScenario").textContent = "Generate";
    resetScenarios();
  });

  // Checks for what edition is being played
  editionChecker.addEventListener("change", function () {
    if (this.checked) {
      console.log("2024 Edition Checked"); // True
      editionChecker.checked = true;
      editionScenarios = "scenarios2024.json";
      console.log(editionScenarios);
      document.getElementById("scenarioPools2024").classList.remove("hidden");
      document.getElementById("scenarioPools").classList.add("hidden");
      scenarioContainer.style.display = "none";
      resetScenarios();
    } else {
      console.log("Old Edition Checked"); // False
      editionChecker.checked = false;
      editionScenarios = "scenarios.json";
      console.log(editionScenarios);
      document.getElementById("scenarioPools2024").classList.add("hidden");
      document.getElementById("scenarioPools").classList.remove("hidden");
      scenarioContainer.style.display = "none";
      resetScenarios();
    }
    resetScenarios();
  });

  // Listen for button click and then generate the scenario.
  generateButton.addEventListener("click", function () {
    genScenario(generationMethod);
  });

  function loadScenario(scenarioKey) {
    console.log(editionScenarios);
    fetch(editionScenarios)
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
        document.getElementById("scenarioDeployment").src =
          scenario.scenario_image;

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
    if (generationMethod.checked) {
      console.log("Veto Mode generation");
      // This feels excessive to reset this. I need a better option.
      resetScenarios();
      console.log(editionChecker);
      if (editionChecker.checked) {
        console.log("Veto 2024 edition");
        // Hiding the scenarios and they will be revealed once the scenarios are selected by RNG.
        document.getElementById("2024_holdGround").classList.add("hidden");
        document.getElementById("2024_domination").classList.add("hidden");
        document.getElementById("2024_destroySupplies").classList.add("hidden");
        document.getElementById("2024_death").classList.add("hidden");
        document.getElementById("2024_recon").classList.add("hidden");
        document.getElementById("2024_fogOfWar").classList.add("hidden");
        let vetoScenario1 = Math.floor(Math.random() * (6 - 1 + 1) + 1);
        console.log(vetoScenario1);
        vetoSelection2024(vetoScenario1);
        let vetoScenario2 = Math.floor(Math.random() * (6 - 1 + 1) + 1);
        // Getting Scenario 2 while making sure it doesnt match scenario 1
        while (vetoScenario2 == vetoScenario1) {
          vetoScenario2 = Math.floor(Math.random() * (6 - 1 + 1) + 1);
        }
        console.log(vetoScenario2);
        vetoSelection2024(vetoScenario2);
        // Getting scenario 3 and making sure it doesnt match scenario 1 and 2
        let vetoScenario3 = Math.floor(Math.random() * (6 - 1 + 1) + 1);
        while (
          vetoScenario3 == vetoScenario2 ||
          vetoScenario3 == vetoScenario1
        ) {
          vetoScenario3 = Math.floor(Math.random() * (6 - 1 + 1) + 1);
        }
        console.log(vetoScenario3);
        vetoSelection2024(vetoScenario3);
      } else {
        // This is the veto method for the old edition
        console.log("Edition check 1");
        switch (scenarioPool) {
          case 1:
            scenarioPoolName = "Maelstrom of Battle";
            console.log(scenarioPoolName);
            document.getElementById("poolTwo").classList.add("hidden");
            document.getElementById("poolThree").classList.add("hidden");
            document.getElementById("poolFour").classList.add("hidden");
            document.getElementById("poolFive").classList.add("hidden");
            document.getElementById("poolSix").classList.add("hidden");
            break;
          case 2:
            scenarioPoolName = "Hold Objective";
            console.log(scenarioPoolName);
            document.getElementById("poolOne").classList.add("hidden");
            document.getElementById("poolThree").classList.add("hidden");
            document.getElementById("poolFour").classList.add("hidden");
            document.getElementById("poolFive").classList.add("hidden");
            document.getElementById("poolSix").classList.add("hidden");
            break;
          case 3:
            scenarioPoolName = "Object";
            console.log(scenarioPoolName);
            document.getElementById("poolOne").classList.add("hidden");
            document.getElementById("poolTwo").classList.add("hidden");
            document.getElementById("poolFour").classList.add("hidden");
            document.getElementById("poolFive").classList.add("hidden");
            document.getElementById("poolSix").classList.add("hidden");
            break;
          case 4:
            scenarioPoolName = "Kill the Enemy";
            console.log(scenarioPoolName);
            document.getElementById("poolOne").classList.add("hidden");
            document.getElementById("poolTwo").classList.add("hidden");
            document.getElementById("poolThree").classList.add("hidden");
            document.getElementById("poolFive").classList.add("hidden");
            document.getElementById("poolSix").classList.add("hidden");
            break;
          case 5:
            scenarioPoolName = "Manoveuring";
            console.log(scenarioPoolName);
            document.getElementById("poolOne").classList.add("hidden");
            document.getElementById("poolTwo").classList.add("hidden");
            document.getElementById("poolThree").classList.add("hidden");
            document.getElementById("poolFour").classList.add("hidden");
            document.getElementById("poolSix").classList.add("hidden");
            break;
          case 6:
            scenarioPoolName = "Unique";
            console.log(scenarioPoolName);
            document.getElementById("poolOne").classList.add("hidden");
            document.getElementById("poolTwo").classList.add("hidden");
            document.getElementById("poolThree").classList.add("hidden");
            document.getElementById("poolFour").classList.add("hidden");
            document.getElementById("poolFive").classList.add("hidden");
            break;
        }
      }
      // This needs to be adjusted.
      document.getElementById("scenarioPools").classList.add("selected");
    } else {
      console.log("Random Generation");
      if (editionChecker.checked) {
        console.log("Random mode for 2024.");
        scenarioNum = Math.floor(Math.random() * (24 - 1 + 1) + 1);
        switch (scenarioNum) {
          case 1:
            selectedScenario = "hold_ground";
            break;
          case 2:
            selectedScenario = "destroy_supplies";
            break;
          case 3:
            selectedScenario = "death";
            break;
          case 4:
            selectedScenario = "reconnoitre";
            break;
          case 5:
            selectedScenario = "fog_of_war";
            break;
          case 6:
            selectedScenario = "domination";
            break;
          case 7:
            selectedScenario = "capture_and_control";
            break;
          case 8:
            selectedScenario = "breakthrough";
            break;
          case 9:
            selectedScenario = "stake_a_claim";
            break;
          case 10:
            selectedScenario = "lords_of_battle";
            break;
          case 11:
            selectedScenario = "assassination";
            break;
          case 12:
            selectedScenario = "contest_of_champions";
            break;
          case 13:
            selectedScenario = "heirlooms";
            break;
          case 14:
            selectedScenario = "sites_of_power";
            break;
          case 15:
            selectedScenario = "command_the_battlefield";
            break;
          case 16:
            selectedScenario = "retrieval";
            break;
          case 17:
            selectedScenario = "seize_the_prizes";
            break;
          case 18:
            selectedScenario = "treasure_hoard";
            break;
          case 19:
            selectedScenario = "storm_the_camp";
            break;
          case 20:
            selectedScenario = "divide_and_conquer";
            break;
          case 21:
            selectedScenario = "escort_the_wounded";
            break;
          case 22:
            selectedScenario = "clash_by_moonlight";
            break;
          case 23:
            selectedScenario = "lead_from_the_front";
            break;
          case 24:
            selectedScenario = "convergence";
            break;
        }
      } else {
        console.log("Random mode for old.");
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
      }
      console.log(scenarioPoolName);
      console.log(selectedScenario);
      loadScenario(selectedScenario);
    }
  }
});

function resetScenarios() {
  console.log("Resetting scenarios");
  document.getElementById("scenarioPools").classList.remove("selected");
  document.getElementById("poolOne").classList.remove("hidden");
  document.getElementById("poolTwo").classList.remove("hidden");
  document.getElementById("poolThree").classList.remove("hidden");
  document.getElementById("poolFour").classList.remove("hidden");
  document.getElementById("poolFive").classList.remove("hidden");
  document.getElementById("poolSix").classList.remove("hidden");
  document.getElementById("scenarioPools2024").classList.remove("selected");
}

function vetoSelection2024(scenarioNumber) {
  switch (scenarioNumber) {
    case 1:
      document.getElementById("poolOne").classList.remove("hidden");
      break;
    case 2:
      document.getElementById("poolTwo").classList.remove("hidden");
      break;
    case 3:
      document.getElementById("poolThree").classList.remove("hidden");
      break;
    case 4:
      document.getElementById("poolFour").classList.remove("hidden");
      break;
    case 5:
      document.getElementById("poolFive").classList.remove("hidden");
      break;
    case 6:
      document.getElementById("poolSix").classList.remove("hidden");
      break;
  }
}
