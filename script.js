class HealthPredictor {
  constructor() {
    this.form = document.getElementById("healthForm");
    this.submitBtn = document.getElementById("submitBtn");
    this.result = document.getElementById("result");
    this.loadingSpinner = document.querySelector(".loading-spinner");
    this.btnText = document.querySelector(".btn-text");

    this.init();
  }

  init() {
    this.form.addEventListener("submit", this.handleSubmit.bind(this));
    this.addRealTimeValidation();
    this.addInputAnimations();
  }

  addRealTimeValidation() {
    const inputs = this.form.querySelectorAll("input, select");
    inputs.forEach((input) => {
      input.addEventListener("input", () => this.validateField(input));
      input.addEventListener("blur", () => this.validateField(input));
    });
  }

  addInputAnimations() {
    const inputs = this.form.querySelectorAll("input, select");
    inputs.forEach((input) => {
      input.addEventListener("focus", (e) => {
        const formGroup = e.target.closest(".form-group");
        formGroup.style.transform = "translateX(5px)";
        formGroup.style.transition = "transform 0.3s ease";
      });

      input.addEventListener("blur", (e) => {
        const formGroup = e.target.closest(".form-group");
        formGroup.style.transform = "translateX(0)";
      });
    });
  }

  validateField(field) {
    const formGroup = field.closest(".form-group");
    const errorMessage = formGroup.querySelector(".error-message");
    let isValid = true;

    // Clear previous error state
    formGroup.classList.remove("error");
    errorMessage.classList.remove("show");
    setTimeout(() => {
      errorMessage.style.display = "none";
    }, 300);

    // Check if field is empty
    if (!field.value.trim()) {
      if (field.hasAttribute("required")) {
        isValid = false;
        errorMessage.textContent = "This field is required";
      }
    } else {
      // Field-specific validation
      switch (field.id) {
        case "age":
          const age = parseInt(field.value);
          if (age < 0 || age > 120) {
            isValid = false;
            errorMessage.textContent = "Age must be between 0 and 120";
          }
          break;
        case "avg_glucose_level":
          const glucose = parseFloat(field.value);
          if (glucose < 0 || glucose > 300) {
            isValid = false;
            errorMessage.textContent =
              "Glucose level must be between 0 and 300";
          }
          break;
        case "bmi":
          const bmi = parseFloat(field.value);
          if (bmi < 0 || bmi > 100) {
            isValid = false;
            errorMessage.textContent = "BMI must be between 0 and 100";
          }
          break;
      }
    }

    if (!isValid) {
      formGroup.classList.add("error");
      errorMessage.style.display = "block";
      errorMessage.classList.add("show");
    }

    return isValid;
  }

  validateForm() {
    const fields = this.form.querySelectorAll("input, select");
    let isValid = true;

    fields.forEach((field) => {
      if (!this.validateField(field)) {
        isValid = false;
      }
    });

    return isValid;
  }

  async handleSubmit(e) {
    e.preventDefault();

    if (!this.validateForm()) {
      this.shakeForm();
      return;
    }

    this.setLoading(true);
    this.hideResult();

    try {
      const formData = new FormData(this.form);
      const data = {
        age: parseInt(formData.get("age")),
        hypertension: parseInt(formData.get("hypertension")),
        avg_glucose_level: parseFloat(formData.get("avg_glucose_level")),
        bmi: parseFloat(formData.get("bmi")),
        heart_disease: parseInt(formData.get("heart_disease")),
        gender: parseInt(formData.get("gender")),
      };

      const response = await fetch("http://localhost:8000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      this.displayResult(result.prediction);
    } catch (error) {
      console.error("Error:", error);
      this.displayError(
        "Failed to connect to the server. Please try again later."
      );
    } finally {
      this.setLoading(false);
    }
  }

  shakeForm() {
    const container = document.querySelector(".container");
    container.style.animation = "none";
    setTimeout(() => {
      container.style.animation = "shake 0.5s ease-in-out";
    }, 10);

    setTimeout(() => {
      container.style.animation = "none";
    }, 500);
  }

  setLoading(isLoading) {
    this.submitBtn.disabled = isLoading;
    this.loadingSpinner.style.display = isLoading ? "inline-block" : "none";
    this.btnText.textContent = isLoading
      ? "Analyzing..."
      : "Predict Health Risk";

    if (isLoading) {
      this.submitBtn.style.transform = "scale(0.98)";
    } else {
      this.submitBtn.style.transform = "scale(1)";
    }
  }

  displayResult(prediction) {
    const isRisk = prediction === 1;
    this.result.className = `result ${isRisk ? "risk" : "success"}`;
    this.result.textContent = isRisk
      ? "Prediction: Risk Detected"
      : "Prediction: No Risk";
    this.result.style.display = "block";
    this.result.classList.add("show");

    // Add confetti effect for successful predictions
    if (!isRisk) {
      this.createConfetti();
    }
  }

  displayError(message) {
    this.result.className = "result error";
    this.result.textContent = message;
    this.result.style.display = "block";
    this.result.classList.add("show");
  }

  hideResult() {
    this.result.classList.remove("show");
    setTimeout(() => {
      this.result.style.display = "none";
    }, 300);
  }

  createConfetti() {
    const colors = ["#667eea", "#764ba2", "#9ae6b4", "#feb2b2", "#f6ad55"];
    const confettiCount = 50;

    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement("div");
      confetti.style.position = "fixed";
      confetti.style.width = "10px";
      confetti.style.height = "10px";
      confetti.style.backgroundColor =
        colors[Math.floor(Math.random() * colors.length)];
      confetti.style.left = Math.random() * 100 + "vw";
      confetti.style.top = "-10px";
      confetti.style.borderRadius = "50%";
      confetti.style.pointerEvents = "none";
      confetti.style.zIndex = "1000";
      confetti.style.animation = `confettiFall ${
        Math.random() * 3 + 2
      }s linear forwards`;

      document.body.appendChild(confetti);

      setTimeout(() => {
        confetti.remove();
      }, 5000);
    }
  }
}

// Add shake animation to CSS dynamically
const style = document.createElement("style");
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    
    @keyframes confettiFall {
        0% {
            transform: translateY(-10px) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize the application when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new HealthPredictor();
});

// Add some interactive background effects
document.addEventListener("mousemove", (e) => {
  const shapes = document.querySelectorAll(".floating-shape");
  const mouseX = e.clientX / window.innerWidth;
  const mouseY = e.clientY / window.innerHeight;

  shapes.forEach((shape, index) => {
    const speed = (index + 1) * 0.5;
    const x = (mouseX - 0.5) * speed;
    const y = (mouseY - 0.5) * speed;

    shape.style.transform = `translate(${x}px, ${y}px)`;
  });
});

// Add pulse effect on form completion
document.addEventListener("DOMContentLoaded", () => {
  const inputs = document.querySelectorAll("input, select");
  let completedFields = 0;

  inputs.forEach((input) => {
    input.addEventListener("input", () => {
      const allInputs = document.querySelectorAll("input, select");
      const completed = Array.from(allInputs).filter(
        (inp) => inp.value.trim() !== ""
      ).length;

      if (
        completed === allInputs.length &&
        completedFields < allInputs.length
      ) {
        const container = document.querySelector(".container");
        container.style.animation = "pulse 0.6s ease-in-out";
        setTimeout(() => {
          container.style.animation = "none";
        }, 600);
      }

      completedFields = completed;
    });
  });
});

// Add pulse animation to CSS
const pulseStyle = document.createElement("style");
pulseStyle.textContent = `
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.02); }
        100% { transform: scale(1); }
    }
`;
document.head.appendChild(pulseStyle);
