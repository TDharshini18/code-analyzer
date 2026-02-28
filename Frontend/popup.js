document.getElementById("analyze").addEventListener("click", async () => {
    const repo = document.getElementById("repo").value;
    const output = document.getElementById("output");

    if (!repo) {
        alert("Enter GitHub URL");
        return;
    }

    output.innerText = "Analyzing... Please wait ⏳";

    try {
        const response = await fetch("http://localhost:3000/github", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ repo })
        });

        const data = await response.json();

        if (!response.ok) {
            output.innerText = "Error: " + (data.error || "Server error");
            return;
        }

        if (data.error) {
            output.innerText = "Error: " + data.error;
        } else {
            // ✅ Show full AI summary
            output.innerText = data.summary;
        }

    } catch (error) {
        output.innerText = "❌ Server not running or wrong route.";
        console.error(error);
    }
});