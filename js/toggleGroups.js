document.getElementById("btn-group1").addEventListener("click", function () {
  toggleGroups("group1", this);
});
  
document.getElementById("btn-group2").addEventListener("click", function () {
  toggleGroups("group2", this);
});

document.getElementById("btn-group3").addEventListener("click", function () {
  toggleGroups("group3", this);
});

// Highlight Financial Measure button since it is the default group
document.getElementById("btn-group1").classList.add("active");

// Button has been clicked, hide the other groups and show the active group, also highlight the active button
function toggleGroups(activeGroupClass, activeButton) {
  // Get all groups
  const groups = document.querySelectorAll(".group");
  groups.forEach(group => {
    if (group.classList.contains(activeGroupClass)) {
      group.classList.remove("hidden");
    } else {
      group.classList.add("hidden");
    }
  });

  // Get all buttons
  const buttons = document.querySelectorAll(".bar-button-container button");
    buttons.forEach(button => {
      button.classList.remove("active");
  });

  // Highlight the active button
  activeButton.classList.add("active");
}
  