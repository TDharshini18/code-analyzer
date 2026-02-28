document.getElementById("analyze").addEventListener("click", async () => {
    const repo = document.getElementById("repo").value;
    if (!repo) return alert("Enter GitHub repo URL");

    document.getElementById("output").innerText = "Analyzing...";

    try {
        const response = await fetch("http://localhost:3000/github", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ repo })
        });

        const data = await response.json();
        display(data);

    } catch (err) {
        document.getElementById("output").innerText =
            "Backend server not running.\nStart server.js first.";
    }
});
document.getElementById("openPageBtn").addEventListener("click", () => {
  chrome.tabs.create({
    url: chrome.runtime.getURL("report.html")
  });
});

function display(data) {

    document.getElementById("output").innerText =
        "ARCHITECTURE:\n" + data.architecture + "\n\n" +
        "FRAMEWORKS:\n" + data.frameworks.join(", ") + "\n\n" +
        "ENTRY POINTS:\n" + data.structure.entryPoints.join(", ") + "\n\n" +
        "ROUTES:\n" + data.structure.routes.join(", ") + "\n\n" +
        "SERVICES:\n" + data.structure.services.join(", ") + "\n\n" +
        "MODELS:\n" + data.structure.models.join(", ") + "\n\n" +
        "FLOW:\n" + data.structure.flow.join("\n") + "\n\n" +
        "ONBOARDING GUIDE:\n" +
        "Start Here → " + data.onboardingGuide.startHere + "\n" +
        "Modify API → " + data.onboardingGuide.modifyAPI + "\n" +
        "Business Logic → " + data.onboardingGuide.businessLogic + "\n" +
        "Database → " + data.onboardingGuide.database;
}
